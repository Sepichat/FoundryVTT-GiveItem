export function receiveTrade(tradeData) {
    let d = new Dialog({
        title: "Incoming Trade Request",
        content: `<p>${tradeData.currentActor.name} is sending you ${offer(tradeData)}. Do you accept?</p>`,
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "Confirm",
                callback: () => tradeConfirmed(tradeData)
            },
            two: {
                icon: '<i class="fas fa-times"></i>',
                label: "Deny",
                callback: () => tradeDenied(tradeData)
            }
        },
        default: "two",
    });
    d.render(true);
}

export function completeTrade(tradeData) {
    if (!!tradeData.currentItem) {
        giveItem(tradeData);
    } else {
        giveCurrency(tradeData);
    }
    ui.notifications.notify(`${tradeData.actor.name} accepted your trade request.`);
}

export function denyTrade(tradeData) {
    ui.notifications.notify(`${tradeData.currentActor.name} rejected your trade request.`);
}

function giveItem({currentItem, quantity, actor}) {
    currentItem = actor.items.get(currentItem._id);
    const updateItem = {
        "data.quantity": currentItem.data.data.quantity - quantity
    }
    currentItem.update(updateItem).then(res => {
        if (currentItem.data.data.quantity === 0) {
            currentItem.delete();
        }
    });
}


function giveCurrency({quantity, actor}) {
    const currentCurrency = actor.data.data.currency;
    const updateTargetGold = {
        "data.currency.pp": currentCurrency.pp- quantity.pp,
        "data.currency.gp": currentCurrency.gp- quantity.gp,
        "data.currency.ep": currentCurrency.ep- quantity.ep,
        "data.currency.sp": currentCurrency.sp- quantity.sp,
        "data.currency.cp": currentCurrency.cp- quantity.cp,
    };
    actor.update(updateTargetGold);
}

function receiveItem({currentItem, quantity, actor}) {
    const duplicatedItem = duplicate(currentItem);
    duplicatedItem.data.quantity = quantity;
    const existingItem = getItemFromInvoByName(actor, duplicatedItem.name);
    if (existingItem) {
        const updateItem = {
        "data.quantity": existingItem.data.data.quantity + quantity
        }
        existingItem.update(updateItem);
    } else {
        actor.createEmbeddedEntity("OwnedItem", duplicatedItem);
    }
    console.log(`Giving item: ${currentItem.id} to actor ${actor.id}`);
}

function receiveCurrency({actor, quantity}) {
    const currentCurrency = actor.data.data.currency;
    const updateGold = {
        "data.currency.pp": currentCurrency.pp + quantity.pp,
        "data.currency.gp": currentCurrency.gp + quantity.gp,
        "data.currency.ep": currentCurrency.ep + quantity.ep,
        "data.currency.sp": currentCurrency.sp + quantity.sp,
        "data.currency.cp": currentCurrency.cp + quantity.cp,
    };
    actor.update(updateGold);
    console.log(`Giving currency: pp:${quantity.pp}, gp:${quantity.gp}, ep:${quantity.ep}, sp:${quantity.sp}, cp:${quantity.cp}, to actor ${actor.id}`);
}

function offer(data) {
    if (!!data.currentItem) {
        return `${data.quantity} ${data.currentItem.name}`;
    }
    return `${data.quantity.pp} pp, ${data.quantity.gp} gp, ${data.quantity.ep} ep, ${data.quantity.sp} sp, ${data.quantity.cp} cp`;
}

function tradeConfirmed(tradeData) {
    if (!!tradeData.currentItem) { 
        receiveItem(tradeData);
    } else {
        receiveCurrency(tradeData)
    }
    sendMessageToGM(tradeData);
    game.socket.emit('module.give-item', {
        data: tradeData,
        actorId: tradeData.currentActor.id,
        currentActorId: tradeData.actor.id,
        type: "accepted"
    });
}

function tradeDenied(tradeData) {
    game.socket.emit('module.give-item', {
        data: tradeData,
        actorId: tradeData.currentActor.id,
        currentActorId: tradeData.actor.id,
        type: "denied"
    });
}

function sendMessageToGM(tradeData) {
    let chatMessage = {
        user: game.userId,
        speaker: ChatMessage.getSpeaker(),
        content: `${tradeData.currentActor.name} has sent ${tradeData.actor.name} ${offer(tradeData)}`,
        whisper: game.users.entities.filter(u => u.isGM).map(u => u._id)
    };

    chatMessage.whisper.push(tradeData.currentActor.id);

    ChatMessage.create(chatMessage);
}

function getItemFromInvoByName(actor, name) {
  return actor.items.find(t => t.data.name === name);
}
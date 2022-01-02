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
    ui.notifications.notify(`${tradeData.currentActor.name} accepted your trade request.`);
}

export function denyTrade(tradeData) {
    ui.notifications.notify(`${tradeData.currentActor.name} rejected your trade request.`);
}

function giveItem({currentItem, quantity, actor}) {
    currentItem = actor.items.get(currentItem._id);
    let updatedQuantity, updateItem;
    if (isNaN(currentItem.data.data.quantity)) {
        updatedQuantity = currentItem.data.data.quantity.value - quantity;
        updateItem = {
            "data.quantity.value": updatedQuantity
        }
    } else {
        updatedQuantity = currentItem.data.data.quantity - quantity;
        updateItem = {
            "data.quantity": updatedQuantity
        }
    }
    currentItem.update(updateItem).then(res => {
        if ((isNaN(currentItem.data.data.quantity) && currentItem.data.data.quantity.value === 0) ||
            currentItem.data.data.quantity === 0) {
            currentItem.delete();
        }
    });
}

function giveCurrency({quantity, actor, alt}) {
    if (game.system.id === "wfrp4e") {
        const currentCurrency = actor.data.items.filter(item => item.type === "money");
        const currentGC = currentCurrency.find(currency => currency.data.name === "Gold Crown");
        const currentSS = currentCurrency.find(currency => currency.data.name === "Silver Shilling");
        const currentBP = currentCurrency.find(currency => currency.data.name === "Brass Penny");
        const updateGC = {
            "data.quantity.value": currentGC.data.data.quantity.value - quantity.gc
        };
        currentGC.update(updateGC);
        const updateSS = {
            "data.quantity.value": currentSS.data.data.quantity.value - quantity.ss
        };
        currentSS.update(updateSS);
        const updateBP = {
            "data.quantity.value": currentBP.data.data.quantity.value - quantity.bp
        };
        currentBP.update(updateBP);
    } else {
        let currentCurrency = actor.data.data.currency;
        let updateTargetGold = {};
        if (alt) {
            currentCurrency = actor.data.data.altCurrency;
            updateTargetGold = {
                "data.altCurrency.pp": currentCurrency.pp - quantity.pp,
                "data.altCurrency.gp": currentCurrency.gp - quantity.gp,
                "data.altCurrency.sp": currentCurrency.sp - quantity.sp,
                "data.altCurrency.cp": currentCurrency.cp - quantity.cp,
            };
        } else {
            updateTargetGold = {
                "data.currency.pp": currentCurrency.pp - quantity.pp,
                "data.currency.gp": currentCurrency.gp - quantity.gp,
                "data.currency.sp": currentCurrency.sp - quantity.sp,
                "data.currency.cp": currentCurrency.cp - quantity.cp,
            };
        }

        if (quantity.ep) {
            if (alt) {
                updateTargetGold["data.altCurrency.ep"] = currentCurrency.ep - quantity.ep;
            } else {
                updateTargetGold["data.currency.ep"] = currentCurrency.ep - quantity.ep;
            }
        }
        actor.update(updateTargetGold);
    }
}

function receiveItem({currentItem, quantity, actor}) {
    const duplicatedItem = duplicate(currentItem);
    if (isNaN(duplicatedItem.data.quantity)) {
        duplicatedItem.data.quantity.value = quantity;
    } else {
        duplicatedItem.data.quantity = quantity;
    }
    const existingItem = getItemFromInvoByName(actor, duplicatedItem.name);
    if (existingItem) {
        let updatedQuantity, updateItem;
        if (isNaN(duplicatedItem.data.quantity)) {
            updatedQuantity = existingItem.data.data.quantity.value + quantity;
            updateItem = {
                "data.quantity.value": updatedQuantity
            };
        } else {
            updatedQuantity = existingItem.data.data.quantity + quantity;
            updateItem = {
                "data.quantity": updatedQuantity
            };
        }
        existingItem.update(updateItem);
    } else {
        Item.create(duplicatedItem, {parent: actor});
    }
    console.log(`Giving item: ${currentItem.id} to actor ${actor.id}`);
}

function receiveCurrency({actor, quantity, alt}) {
    if (game.system.id === "wfrp4e") {
        const currentCurrency = actor.data.items.filter(item => item.type === "money");
        const currentGC = currentCurrency.find(currency => currency.data.name === "Gold Crown");
        const currentSS = currentCurrency.find(currency => currency.data.name === "Silver Shilling");
        const currentBP = currentCurrency.find(currency => currency.data.name === "Brass Penny");
        const updateGC = {
            "data.quantity.value": currentGC.data.data.quantity.value + quantity.gc
        };
        currentGC.update(updateGC);
        const updateSS = {
            "data.quantity.value": currentSS.data.data.quantity.value + quantity.ss
        };
        currentSS.update(updateSS);
        const updateBP = {
            "data.quantity.value": currentBP.data.data.quantity.value + quantity.bp
        };
        currentBP.update(updateBP);
        console.log(`Giving currency: GC:${quantity.gc}, SS:${quantity.ss}, BP:${quantity.bp}, to actor ${actor.id}`);
    } else {
        let currentCurrency = actor.data.data.currency;
        let updateGold = {};
        if (alt) {
            currentCurrency = actor.data.data.altCurrency;
            updateGold = {
                "data.altCurrency.pp": currentCurrency.pp + quantity.pp,
                "data.altCurrency.gp": currentCurrency.gp + quantity.gp,
                "data.altCurrency.sp": currentCurrency.sp + quantity.sp,
                "data.altCurrency.cp": currentCurrency.cp + quantity.cp,
            };
        } else {
            updateGold = {
                "data.currency.pp": currentCurrency.pp + quantity.pp,
                "data.currency.gp": currentCurrency.gp + quantity.gp,
                "data.currency.sp": currentCurrency.sp + quantity.sp,
                "data.currency.cp": currentCurrency.cp + quantity.cp,
            };
        }
        if (quantity.ep) {
            updateGold["data.currency.ep"] = currentCurrency.ep + quantity.ep;
        }
        console.log(`Giving ${alt ? "Weightless currency: " : ""} currency: pp:${quantity.pp}, gp:${quantity.gp}, ep:${quantity.ep}, sp:${quantity.sp}, cp:${quantity.cp}, to actor ${actor.id}`);
        actor.update(updateGold);
    }
}

function offer(data) {
    if (!!data.currentItem) {
        return `${data.quantity} ${data.currentItem.name}`;
    }
    if (game.system.id === "wfrp4e") {
        return `${data.quantity.gc} GC, ${data.quantity.ss} SS, ${data.quantity.bp} BP`;
    }
    return `${data.alt ? "Weightless currency: ": ""} ${data.quantity.pp} pp, ${data.quantity.gp} gp, ${data.quantity.ep ? `${data.quantity.ep}  ep, ` : ""}${data.quantity.sp} sp, ${data.quantity.cp} cp`;
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
        whisper: game.users.filter(u => u.isGM).map(u => u._id)
    };

    chatMessage.whisper.push(tradeData.currentActor.id);

    ChatMessage.create(chatMessage);
}

function getItemFromInvoByName(actor, name) {
  return actor.items.find(t => t.data.name === name);
}
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
    if (game.user.isGM === false) {
        d.render(true);
    }
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
    if (isNaN(currentItem.system.quantity)) {
        updatedQuantity = currentItem.system.quantity.value - quantity;
        updateItem = {
            "system.quantity.value": updatedQuantity
        }
    } else {
        updatedQuantity = currentItem.system.quantity - quantity;
        updateItem = {
            "system.quantity": updatedQuantity
        }
    }
    currentItem.update(updateItem).then(res => {
        if ((isNaN(currentItem.system.quantity) && currentItem.system.quantity.value === 0) ||
            currentItem.system.quantity === 0) {
            currentItem.delete();
        }
    });
}

function giveCurrency({quantity, actor, alt}) {
    if (game.system.id === "wfrp4e") {
        const currentCurrency = actor.items.filter(item => item.type === "money");
        const currentGC = currentCurrency.find(currency => currency.name === "Gold Crown");
        const currentSS = currentCurrency.find(currency => currency.name === "Silver Shilling");
        const currentBP = currentCurrency.find(currency => currency.name === "Brass Penny");
        const updateGC = {
            "data.quantity.value": currentGC.system.quantity.value - quantity.gc
        };
        currentGC.update(updateGC);
        const updateSS = {
            "data.quantity.value": currentSS.system.quantity.value - quantity.ss
        };
        currentSS.update(updateSS);
        const updateBP = {
            "data.quantity.value": currentBP.system.quantity.value - quantity.bp
        };
        currentBP.update(updateBP);
    } else if (game.system.id === "pf2e") {
        actor.inventory.removeCoins(quantity);
    } else {
        let currentCurrency = actor.system.currency;
        let updateTargetGold = {};
        if (alt) {
            currentCurrency = actor.system.altCurrency;
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
    if (isNaN(duplicatedItem.system.quantity)) {
        duplicatedItem.system.quantity.value = quantity;
    } else {
        duplicatedItem.system.quantity = quantity;
    }
    const existingItem = getItemFromInvoByName(actor, duplicatedItem.name);
    if (existingItem) {
        let updatedQuantity, updateItem;
        if (isNaN(duplicatedItem.system.quantity)) {
            updatedQuantity = existingItem.system.quantity.value + quantity;
            updateItem = {
                "system.quantity.value": updatedQuantity
            };
        } else {
            updatedQuantity = existingItem.system.quantity + quantity;
            updateItem = {
                "system.quantity": updatedQuantity
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
        const currentCurrency = actor.items.filter(item => item.type === "money");
        const currentGC = currentCurrency.find(currency => currency.name === "Gold Crown");
        const currentSS = currentCurrency.find(currency => currency.name === "Silver Shilling");
        const currentBP = currentCurrency.find(currency => currency.name === "Brass Penny");
        const updateGC = {
            "data.quantity.value": currentGC.system.quantity.value + quantity.gc
        };
        currentGC.update(updateGC);
        const updateSS = {
            "data.quantity.value": currentSS.system.quantity.value + quantity.ss
        };
        currentSS.update(updateSS);
        const updateBP = {
            "data.quantity.value": currentBP.system.quantity.value + quantity.bp
        };
        currentBP.update(updateBP);
        console.log(`Giving currency: GC:${quantity.gc}, SS:${quantity.ss}, BP:${quantity.bp}, to actor ${actor.id}`);
    } else if (game.system.id === "pf2e") {
        console.log(`Giving currency: pp:${quantity.pp}, gp:${quantity.gp}, sp:${quantity.sp}, cp:${quantity.cp}, to actor ${actor.id}`);
        actor.inventory.addCoins(quantity);
    } else {
        let currentCurrency = actor.system.currency;
        let updateGold = {};
        if (alt) {
            currentCurrency = actor.system.altCurrency;
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
  return actor.items.find(t => t.name === name);
}
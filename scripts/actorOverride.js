import { PlayerDialog } from "./dialog.js";

function activateListeners(html) {
  this.giveItemModuleActivateListeners(html);
  addGiveItemButton.bind(this)(html);
  addGiveCurrency.bind(this)(html);
}

function addGiveItemButton(html) {
  $(`
    <a class="item-control item-give" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".item-control.item-delete"));
  html.find(".item-control.item-give").on("click", (e) => {
    e.preventDefault();
    const currentItemId = e.currentTarget.closest(".item").dataset.itemId;
    giveItem.bind(this)(currentItemId);
  });
}

function addGiveCurrency(html) {
  $(`
    <a class="currency-control currency-give" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".currency-convert.rollable"));
  html.find(".currency-control.currency-give").on("click", (e) => {
    e.preventDefault();
    giveCurrency.bind(this)();
  });
}

function getItemFromInvoByName(actor, name) {
  return actor.items.find(t => t.data.name === name);
}

function giveItem(currentItemId) {
  const currentActor = this.actor;
  const listPC = game.actors.entities.filter(a => a.hasPlayerOwner);
  const filteredPCList = listPC.filter(a => a.id !== this.actor.id);
  const d = new PlayerDialog(({playerId, quantity}) => {
    const actor = game.actors.get(playerId);
    const currentItem = currentActor.items.find(item => item.id === currentItemId);
    const currentItemQuantity = currentItem.data.data.quantity;
    if (quantity > currentItemQuantity) {
      return ui.notifications.error(`You cannot offer more items than you posses`);
    } else {
      const updateItem = {
        "data.quantity": currentItem.data.data.quantity - quantity
      }
      currentItem.update(updateItem).then(res => {
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
        if (currentItem.data.data.quantity === 0) {
          currentItem.delete();
        }
      }
      );
    }
  },
    {acceptLabel: "Offer Item", filteredPCList}
  );
  d.render(true);
}

function giveCurrency() {
  const currentActor = this.actor;
  const listPC = game.actors.entities.filter(a => a.hasPlayerOwner);
  const filteredPCList = listPC.filter(a => a.id !== this.actor.id);
  const d = new PlayerDialog(({playerId, pp, gp, ep, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.data.data.currency;
    const currentTargetCurrency = actor.data.data.currency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || ep > currentCurrency.ep || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you posses`);
    } else {
      const updateGold = {
        "data.currency.pp": currentCurrency.pp - pp,
        "data.currency.gp": currentCurrency.gp - gp,
        "data.currency.ep": currentCurrency.ep - ep,
        "data.currency.sp": currentCurrency.sp - sp,
        "data.currency.cp": currentCurrency.cp - cp,
      };
      currentActor.update(updateGold).then(res => {
        const updateTargetGold = {
          "data.currency.pp": currentTargetCurrency.pp + pp,
          "data.currency.gp": currentTargetCurrency.gp + gp,
          "data.currency.ep": currentTargetCurrency.ep + ep,
          "data.currency.sp": currentTargetCurrency.sp + sp,
          "data.currency.cp": currentTargetCurrency.cp + cp,
        };
        console.log(`Giving currency: pp:${pp}, gp:${gp}, ep:${ep}, sp:${sp}, cp:${cp}, to actor ${actor.id}`);
        actor.update(updateTargetGold);
      });
    }
  },
    {acceptLabel: "Offer Currency", filteredPCList, currency: true}
  );
  d.render(true);
}

export const overrideActorSheet = () => {
  Object.values(CONFIG.Actor.sheetClasses).forEach((type) => Object.values(type).forEach((sheet) => {
    if (sheet.id.includes('dnd5e.ActorSheet5eCharacter')) {
      sheet.cls.prototype.giveItemModuleActivateListeners = sheet.cls.prototype.activateListeners;
      sheet.cls.prototype.activateListeners = activateListeners;
    }
  }));
};

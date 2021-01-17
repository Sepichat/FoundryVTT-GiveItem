import { PlayerDialog } from "./dialog.js";

function activateListeners(html) {
  this.giveItemModuleActivateListeners(html);
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

export const overrideActorSheet = () => {
  Object.values(CONFIG.Actor.sheetClasses).forEach((type) => Object.values(type).forEach((sheet) => {
    if (sheet.id.includes('dnd5e.ActorSheet5eCharacter')) {
      sheet.cls.prototype.giveItemModuleActivateListeners = sheet.cls.prototype.activateListeners;
      sheet.cls.prototype.activateListeners = activateListeners;
    }
  }));
};

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


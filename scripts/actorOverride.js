import { PlayerDialog } from "./dialog.js";

function activateListeners(html) {
  this.originalActivateListeners(html);
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
      sheet.cls.prototype.originalActivateListeners = sheet.cls.prototype.activateListeners;
      sheet.cls.prototype.activateListeners = activateListeners;
    }
  }));
};

function giveItem(currentItemId) {
  console.log(currentItemId, this, 654654);
  const currentActor = this.actor;
  const listPC = game.actors.entities.filter(a => a.hasPlayerOwner);
  const filteredPCList = listPC.filter(a => a.id !== this.actor.id);
  const d = new PlayerDialog((playerId) => {
      const actor = game.actors.get(playerId);
      const currentItem = currentActor.items.find(item => item.id === currentItemId);
      actor.createEmbeddedEntity("OwnedItem", currentItem);
      console.log(`Giving item: ${currentItem.id} to actor ${actor.id}`);
      currentActor.deleteOwnedItem(currentItemId);
    },
    {acceptLabel: "Offer Item", filteredPCList}
  );
  d.render(true);
}


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
  `).insertAfter(html.find(".inventory .item-control.item-delete"));
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

function giveItem(currentItemId) {
  const currentActor = this.actor;
  const filteredPCList = [];
  game.users.players.forEach(player => {
    if (!!player.character && game.user.character.id !== player.character.id) {
      filteredPCList.push(player.character);
    }
  });
  const d = new PlayerDialog(({playerId, quantity}) => {
    const actor = game.actors.get(playerId);
    const currentItem = currentActor.items.find(item => item.id === currentItemId);
    const currentItemQuantity = currentItem.data.data.quantity;
    if (quantity > currentItemQuantity) {
      return ui.notifications.error(`You cannot offer more items than you posses`);
    } else {
      game.socket.emit('module.give-item', {
        data: {currentItem, quantity},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Item", filteredPCList}
  );
  d.render(true);
}

function giveCurrency() {
  const currentActor = this.actor;
  const filteredPCList = [];
  game.users.players.forEach(player => {
    if (!!player.character && game.user.character.id !== player.character.id) {
      filteredPCList.push(player.character);
    }
  });
  const d = new PlayerDialog(({playerId, pp, gp, ep, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.data.data.currency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || ep > currentCurrency.ep || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you posses`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, ep, sp, cp}},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
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

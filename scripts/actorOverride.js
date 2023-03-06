import { PlayerDialog } from "./dialog.js";

export function addGiveItemButton(html, actor) {
  $(`
    <a class="item-control item-give-module" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory ol:not(.currency-list)  .item-control.item-edit"));
  html.find(".item-control.item-give-module").on("click", giveItemHandler.bind(actor));
}

export function addGiveItemButtonTidy(html, actor) {
  $(`
    <a class="item-control item-give-module" title="Give item">
      <i class="fas fa-hands-helping"></i>
      <span class="control-label">Give Item</span>
    </a>
  `).insertAfter(html.find(".inventory .item-control.item-edit"));
  html.find(".item-control.item-give-module").on("click", giveItemHandler.bind(actor));
}

function giveItemHandler(e) {
  e.preventDefault();
  const currentItemId = e.currentTarget.closest(".item").dataset.itemId;
  giveItem.bind(this)(currentItemId);
}

export function addGiveCurrency(html, actor) {
  $(`
    <a class="currency-control currency-give" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".currency-convert.rollable"));
  html.find(".currency-control.currency-give").on("click", (e) => {
    e.preventDefault();
    giveCurrency.bind(actor)();
  });
}

export function addGiveCurrencyPF1E(html, actor) {
  $(`
    <a class="currency-control currency-give main" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find("ol.currency:nth-of-type(1) h3"));
  html.find(".currency-control.currency-give.main").on("click", (e) => {
    e.preventDefault();
    giveMainCurrencyPF1E.bind(actor)();
  });
  $(`
    <a class="currency-control currency-give alt" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find("ol.currency:nth-of-type(2) h3"));
  html.find(".currency-control.currency-give.alt").on("click", (e) => {
    e.preventDefault();
    giveAltCurrencyPF1E.bind(actor)();
  });
}

export function addGiveCurrencyWFRP4E(html, actor) {
  $(`
    <a class="currency-control combat-icon currency-give" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find("#currency-header .dollar-icon.combat-icon"));
  html.find(".currency-control.combat-icon.currency-give").on("click", (e) => {
    e.preventDefault();
    giveCurrencyWFRP4E.bind(actor)();
  });
}

function fetchPCList() {
  const filteredPCList = [];
  game.users.players.forEach(player => {
    if (!!player.character && game.user.character?.id !== player.character.id) {
      filteredPCList.push(player.character);
    }
  });
  return filteredPCList;
}

function giveItem(currentItemId) {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, quantity}) => {
    const actor = game.actors.get(playerId);
    const currentItem = currentActor.items.find(item => item.id === currentItemId);
    let currentItemQuantity;
    if (isNaN(currentItem.system.quantity)) {
      currentItemQuantity = currentItem.system.quantity.value
    } else {
      currentItemQuantity = currentItem.system.quantity
    }
    if (quantity > currentItemQuantity) {
      return ui.notifications.error(`You cannot offer more items than you have`);
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
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, ep, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.currency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || ep > currentCurrency.ep || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
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


function giveMainCurrencyPF1E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.currency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, sp, cp}},
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


function giveAltCurrencyPF1E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.altCurrency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, sp, cp}, alt: true},
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


function giveCurrencyWFRP4E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, gc, ss, bp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.items.filter(item => item.type === "money");
    const currentGC = currentCurrency.find(currency => currency.name === "Gold Crown");
    const currentSS = currentCurrency.find(currency => currency.name === "Silver Shilling");
    const currentBP = currentCurrency.find(currency => currency.name === "Brass Penny");
    if (gc > currentGC.quantity.value || ss > currentSS.quantity.value || bp > currentBP.quantity.value) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {gc, ss, bp}},
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

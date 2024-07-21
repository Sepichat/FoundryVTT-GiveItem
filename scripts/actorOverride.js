import { PlayerDialog } from "./dialog.js";

export function addGiveItemButton(html, actor) {
  $(`
    <a class="item-control item-give-module" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory ol:not(.currency-list) .item-control[data-action='equip']"));
  html.find(".item-control.item-give-module").on("click", giveItemHandler.bind(actor));
}

export function addGiveItemButton5E(html, actor) {
  $(`
    <a class="item-control item-give-module give-item" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory ol:not(.currency-list) .item-control[data-action='equip']"));
  html.find(".item-control.item-give-module.give-item").on("click", giveItemHandler.bind(actor));
}

export function addGiveItemButtonTidy5E(html, actor) {
  $(`
    <button type="button" class="item-list-button give-item" title="Give item" tabindex="-1">
      <i class="fas fa-hands-helping"></i>
    </button>
  `).insertAfter(html.find(".inventory .item-table-cell .tidy5e-classic-controls .item-list-button:first"));
  html.find(".item-table-cell .tidy5e-classic-controls .give-item").on("click", giveItemTidyHandler.bind(actor));
}

export function addGiveItemButtonPF2E(html, actor) {
  $(`
    <a class="item-control item-give-module give-item" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory .items .item-controls .item-carry-type"));
  html.find(".item-control.item-give-module.give-item").on("click", giveItemHandlerPF2E.bind(actor));
}

function giveItemHandler(e) {
  e.preventDefault();
  const currentItemId = e.currentTarget.closest(".item").dataset.itemId;
  giveItem.bind(this)(currentItemId);
}

function giveItemTidyHandler(e) {
  e.preventDefault();
  const currentItemId = e.currentTarget.closest(".item-table-row-container").dataset.itemId;
  giveItem.bind(this)(currentItemId);
}

function giveItemHandlerPF2E(e) {
  e.preventDefault();
  const currentItemId = e.currentTarget.closest(".data").parentNode.dataset.itemId;
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

export function addGiveCurrency5E(html, actor) {
  $(`
    <a class="item-control item-give-module give-currency" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory .currency .item-action"));
  html.find(".item-control.item-give-module.give-currency").on("click", giveCurrency5E.bind(actor));
}

export function addGiveCurrency5E2(html, actor) {
  $(`
    <button type="button" title="Give item" class="item-action unbutton item-give-module give-currency" data-action="give-currency" aria-label="Give Currency">
      <i class="fas fa-hands-helping"></i>
    </button>
  `).insertAfter(html.find(".inventory .currency .item-action"));
  html.find(".item-action.unbutton.item-give-module.give-currency").on("click", giveCurrency5E.bind(actor));
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

export function addGiveCurrencyPF2E(html, actor) {
  $(`
    <li>
      <button type="button" class="item-control item-give-module give-currency" title="Give item">
        <i class="fas fa-hands-helping"></i>
      </button>
    </li>
  `).insertAfter(html.find(".denomination.cp"));
  html.find(".item-control.item-give-module.give-currency").on("click", giveMainCurrencyPF2E.bind(actor));
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

function giveCurrency5E() {
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

function giveMainCurrencyPF2E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.inventory.coins;
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

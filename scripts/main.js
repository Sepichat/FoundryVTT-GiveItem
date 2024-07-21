import { addGiveItemButton, addGiveItemButton5E, addGiveItemButtonTidy5E, addGiveItemButtonPF2E, addGiveCurrency5E, addGiveCurrency5E2, addGiveCurrencyPF1E, addGiveCurrencyPF2E, addGiveCurrencyWFRP4E } from './actorOverride.js';
import { completeTrade, denyTrade, receiveTrade } from './trading.js';

Hooks.on('renderActorSheet5eCharacter', (sheet, html, character) => {
  let sheetClasses = sheet.options.classes;
  if (sheetClasses[0] === "dnd5e2"){
    addGiveItemButton5E(html, sheet.actor);
    addGiveCurrency5E2(html, sheet.actor);
  } else if (sheetClasses[0] === "tidy5e-sheet") {
    addGiveItemButtonTidy5E(html, sheet.actor);
    addGiveCurrency5E(html, sheet.actor);
  } else {
    addGiveItemButton5E(html, sheet.actor);
    addGiveCurrency5E(html, sheet.actor);
  }
});

Hooks.on('renderActorSheetPF2e', (sheet, html, character) => {
  addGiveItemButtonPF2E(html, sheet.actor);
  addGiveCurrencyPF2E(html, sheet.actor);
});

Hooks.on('renderActorSheetPFCharacter', (sheet, html, character) => {
  addGiveItemButton(html, sheet.actor);
  addGiveCurrencyPF1E(html, sheet.actor);
});

Hooks.on('renderActorSheetWfrp4eCharacter', (sheet, html, character) => {
  addGiveItemButton(html, sheet.actor);
  addGiveCurrencyWFRP4E(html, sheet.actor);
});

Hooks.on('init', function () {
  game.settings.register('give-item', 'give-item', {
    name: 'Activate giving item',
    hint: 'Allows an actor to give an item to a different actor',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
});

Hooks.once('setup', async function () {
  game.socket.on('module.give-item', packet => {
      let data = packet.data;
      let type = packet.type;
      const actorId = packet.actorId;
      const currentActorId = packet.currentActorId;
      data.actor = game.actors.get(actorId);
      data.currentActor = game.actors.get(currentActorId);
      if (data.actor.isOwner) {
          if (type === 'request') {
              receiveTrade(data);
          }
          if (type === 'accepted') {
              completeTrade(data);
          }
          if (type === 'denied') {
              denyTrade(data);
          }
      }
  });
});
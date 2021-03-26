import { overrideActorSheet } from './actorOverride.js';
import { completeTrade, denyTrade, receiveTrade } from './trading.js';

Hooks.on('ready', () => {
  overrideActorSheet();
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
      if (data.actor.owner) {
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
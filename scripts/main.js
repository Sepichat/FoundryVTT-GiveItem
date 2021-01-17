import { overrideActorSheet } from "./actorOverride.js";

Hooks.on('ready', () => {
  overrideActorSheet();
});

Hooks.on("init", function () {
  game.settings.register("giveItem", "giveItem", {
    name: "Activate giving item",
    hint: "Allows an actor to give an item to a different actor",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
});

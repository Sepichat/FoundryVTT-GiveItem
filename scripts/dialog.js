export class PlayerDialog extends Dialog {
    constructor(callback, options) {
      if (typeof (options) !== "object") {
        options = {};
      }
      let applyChanges = false;
      super({
        title: "Offer item to someone",
        content: `
        <form>
          <div class="form-group">
            <label>Quantity:</label>
            <input type=number min="1" id="quantity" name="quantity" value="1">
            <label>Players:</label>
            <select name="type" id="player">
              ${options.filteredPCList.reduce((acc, currentActor) => {
                return acc + `<option value="${currentActor.id}">${currentActor.name}</option>`
              }, '')}
            </select>
          </div>
        </form>`,
        buttons: {
          yes: {
            icon: "<i class='fas fa-check'></i>",
            label: options.acceptLabel ? options.acceptLabel : "Accept",
            callback: () => applyChanges = true
          },
          no: {
            icon: "<i class='fas fa-times'></i>",
            label: "Cancel"
          },
        },
        default: "yes",
        close: () => {
          if (applyChanges) {
            const playerId = document.getElementById('player').value;
            const quantity = document.getElementById('quantity').value;
            if (isNaN(quantity)) {
              console.log("Item quantity invalid");
              return ui.notifications.error(`Item quantity invalid.`);
            }
            callback({playerId, Number(quantity)});
          }
        }
      });
    }
}

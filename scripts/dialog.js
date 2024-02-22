export class PlayerDialog extends Dialog {
  constructor(callback, options) {
    if (typeof (options) !== "object") {
      options = {};
    }
    const giveItemTemplate = `
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
    </form>`;

    const currencyDnD5ETemplate = `
    <div class="give-item-dialog currency">
      <label>Platinium:</label>
      <input type=number id="pp" name="pp" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Gold:</label>
      <input type=number id="gp" name="gp" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Electrum:</label>
      <input type=number id="ep" name="ep" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Silver:</label>
      <input type=number id="sp" name="sp" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Copper:</label>
      <input type=number id="cp" name="cp" value="">
    </div>`;

    const currencyPFTemplate = `
    <div class="give-item-dialog currency">
      <label>Platinium:</label>
      <input type=number id="pp" name="pp" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Gold:</label>
      <input type=number id="gp" name="gp" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Silver:</label>
      <input type=number id="sp" name="sp" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Copper:</label>
      <input type=number id="cp" name="cp" value="">
    </div>`;

    const currencyWFRP4ETemplate = `
    <div class="give-item-dialog currency">
      <label>Gold Crown:</label>
      <input type=number id="gc" name="gc" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Silver Shilling:</label>
      <input type=number id="ss" name="ss" value="">
    </div>
    <div class="give-item-dialog currency">
      <label>Brass Penny:</label>
      <input type=number id="bp" name="bp" value="">
    </div>`;

    const giveCurrencyTemplate = `
    <form>
      <div class="form-group">
        <div class="give-item-dialog player">
          <label>Players:</label>
          <select name="type" id="player">
            ${options.filteredPCList.reduce((acc, currentActor) => {
              return acc + `<option value="${currentActor.id}">${currentActor.name}</option>`
            }, '')}
          </select>
        </div>
        ${getTemplatePerSystem()}
      </div>
    </form>`;

    function getTemplatePerSystem() {
      switch (game.system.id) {
        case "dnd5e":
          return currencyDnD5ETemplate;
        case "pf1":
        case "pf2e":
          return currencyPFTemplate;
        case "wfrp4e":
          return currencyWFRP4ETemplate;
      
        default:
          return currencyDnD5ETemplate;
      }
    }
    
    let applyChanges = false;
    super({
      title: !options.currency ? "Offer item to someone" : "Offer currency to someone",
      content: options.currency ? giveCurrencyTemplate : giveItemTemplate,
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
          if (options.currency) {
            const playerId = document.getElementById('player').value;
            if (game.system.id === "wfrp4e") {
              let gc = document.getElementById('gc').value;
              let ss = document.getElementById('ss').value;
              let bp = document.getElementById('bp')?.value;
              if (isNaN(gc) || isNaN(ss) || isNaN(bp)) {
                console.log("Currency quantity invalid");
                return ui.notifications.error(`Currency quantity invalid.`);
              }
              gc = Number(gc);
              ss = Number(ss);
              bp = Number(bp);
              callback({playerId, gc, ss, bp});
            } else {
              let pp = document.getElementById('pp').value;
              let gp = document.getElementById('gp').value;
              let ep = document.getElementById('ep')?.value;
              let sp = document.getElementById('sp').value;
              let cp = document.getElementById('cp').value;
              if (isNaN(pp) || isNaN(gp) || (ep !== undefined && isNaN(ep)) || isNaN(sp) || isNaN(cp)) {
                console.log("Currency quantity invalid");
                return ui.notifications.error(`Currency quantity invalid.`);
              }
              pp = Number(pp);
              gp = Number(gp);
              ep = Number(ep);
              sp = Number(sp);
              cp = Number(cp);
              callback({playerId, pp, gp, ep, sp, cp});
            }
          } else {
            const playerId = document.getElementById('player').value;
            let quantity = document.getElementById('quantity').value;
            if (isNaN(quantity)) {
              console.log("Item quantity invalid");
              return ui.notifications.error(`Item quantity invalid.`);
            }
            quantity = Number(quantity);
            callback({playerId, quantity});
          }
        }
      }
    });
  }
}

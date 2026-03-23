var r = Object.defineProperty;
var u = (o, t, e) => t in o ? r(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var s = (o, t, e) => u(o, typeof t != "symbol" ? t + "" : t, e);
import { c as d, A as h, T as p } from "../component-BplwVDE8.js";
function g(o) {
  return Object.assign({}, o);
}
const n = [], c = class c extends h {
  constructor() {
    super();
    s(this, "hasOuterBucket", !0);
    s(this, "hasConfig", !0);
    s(this, "getCloseRx", () => this.newRxEventFromBucketByIndex(this.outerBucket, this.id, "closeModal"));
    s(this, "closeEvents$");
  }
  getHTML() {
    return `<div class="cruzo-ui-component_modal-backdrop" onclick="{{this.closeModal(false)}}">
        <div class="cruzo-ui-component_modal" onclick="{{event.stopPropagation()}}">${this.config.bodyContent}</div>
      </div>`;
  }
  static attach(e, a) {
    const l = p.stringToNode(`<modal-component component-id="${e}" bucket-id="${a}"></modal-component>`);
    document.body.appendChild(l), d.connectBySelector(c.selector, n, document.body);
  }
  closeModal(e) {
    this.outerBucket.emitEvent(this.id, "closeModal", { data: { isOK: e } });
  }
  destroyModal() {
    const e = n.indexOf(this);
    e > -1 && n.splice(e, 1), this.disconnectedCallback();
  }
  connectedCallback() {
    super.connectedCallback(), this.closeEvents$ = this.getCloseRx(), this.newRxFunc((e) => {
      e && e[this.index] && (e[this.index] = null, this.destroyModal());
    }, this.closeEvents$), this.config.dependencies && (this.dependencies = this.config.dependencies, this.updateDependencies());
  }
};
s(c, "selector", "modal-component");
let i = c;
d.define(i);
export {
  i as ModalComponent,
  g as ModalConfig
};
//# sourceMappingURL=modal.js.map

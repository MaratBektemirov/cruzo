var h = Object.defineProperty;
var p = (o, t, e) => t in o ? h(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var s = (o, t, e) => p(o, typeof t != "symbol" ? t + "" : t, e);
import { c as l, A as u, T as m } from "../component-DUmooULT.js";
import { UI_KIT as n } from "./const.js";
function g(o) {
  return Object.assign({}, o);
}
const d = [], c = class c extends u {
  constructor() {
    super();
    s(this, "hasOuterBucket", !0);
    s(this, "hasConfig", !0);
    s(this, "backdropEl");
    s(this, "getCloseRx", () => this.newRxEventFromBucketByIndex(this.outerBucket, this.id, "closeModal"));
    s(this, "closeEvents$");
  }
  getHTML() {
    return `<div class="${n}_modal-backdrop" onpointerdown="{{this.closeModal(false, event)}}">
        <div class="${n}_modal">${this.config.bodyContent}</div>
      </div>`;
  }
  static attach(e, i) {
    const r = m.stringToNode(`<modal-component component-id="${e}" bucket-id="${i}"></modal-component>`);
    document.body.appendChild(r), l.connectBySelector(c.selector, d, document.body);
  }
  closeModal(e, i) {
    i.target === this.backdropEl && this.outerBucket.emitEvent(this.id, "closeModal", { data: { isOK: e } });
  }
  destroyModal() {
    const e = d.indexOf(this);
    e > -1 && d.splice(e, 1), this.disconnectedCallback(!0);
  }
  connectedCallback() {
    super.connectedCallback(), this.closeEvents$ = this.getCloseRx(), this.backdropEl = this.node.querySelector(`.${n}_modal-backdrop`), this.newRxFunc((e) => {
      e && e[this.index] && (e[this.index] = null, this.destroyModal());
    }, this.closeEvents$), this.config.dependencies && (this.dependencies = this.config.dependencies, this.updateDependencies());
  }
};
s(c, "selector", "modal-component");
let a = c;
l.define(a);
export {
  a as ModalComponent,
  g as ModalConfig
};
//# sourceMappingURL=modal.js.map

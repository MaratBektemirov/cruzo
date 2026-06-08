var h = Object.defineProperty;
var p = (o, t, e) => t in o ? h(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var s = (o, t, e) => p(o, typeof t != "symbol" ? t + "" : t, e);
import { componentsRegistryService as r, AbstractComponent as u, Template as m } from "cruzo";
import { UI_KIT as c } from "./const.js";
function g(o) {
  return Object.assign({}, o);
}
const d = [], n = class n extends u {
  constructor() {
    super();
    s(this, "hasOuterBucket", !0);
    s(this, "hasConfig", !0);
    s(this, "backdropEl");
    s(this, "getCloseRx", () => this.newRxEventFromBucketByIndex(this.outerBucket, this.id, "closeModal"));
    s(this, "closeEvents$");
  }
  getHTML() {
    return `<div class="${c}_modal-backdrop" onpointerdown="{{this.closeModal(false, event)}}">
        <div class="${c}_modal" inner-html="{{root.config$::rx.bodyContent}}"></div>
      </div>`;
  }
  static attach(e, i) {
    const a = m.stringToNode(`<modal-component component-id="${e}" bucket-id="${i}"></modal-component>`);
    document.body.appendChild(a), r.connectBySelector(n.selector, d, document.body);
  }
  closeModal(e, i) {
    i.target === this.backdropEl && this.outerBucket.emitEvent(this.id, "closeModal", { data: { isOK: e } });
  }
  destroyModal() {
    const e = d.indexOf(this);
    e > -1 && d.splice(e, 1), this.disconnectedCallback(!0);
  }
  connectedCallback() {
    super.connectedCallback(), this.closeEvents$ = this.getCloseRx(), this.backdropEl = this.node.querySelector(`.${c}_modal-backdrop`), this.newRxFunc((e) => {
      e && e[this.index] && (e[this.index] = null, this.destroyModal());
    }, this.closeEvents$), this.config.dependencies && (this.dependencies = this.config.dependencies, this.updateDependencies());
  }
};
s(n, "selector", "modal-component");
let l = n;
r.define(l);
export {
  l as ModalComponent,
  g as ModalConfig
};
//# sourceMappingURL=modal.js.map

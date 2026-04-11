var h = Object.defineProperty;
var p = (o, t, e) => t in o ? h(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var s = (o, t, e) => p(o, typeof t != "symbol" ? t + "" : t, e);
import { c as a, A as u, T as m } from "../component-DBoFvGq8.js";
import { UI_KIT as d } from "./vars.js";
function x(o) {
  return Object.assign({}, o);
}
const i = [], c = class c extends u {
  constructor() {
    super();
    s(this, "hasOuterBucket", !0);
    s(this, "hasConfig", !0);
    s(this, "getCloseRx", () => this.newRxEventFromBucketByIndex(this.outerBucket, this.id, "closeModal"));
    s(this, "closeEvents$");
  }
  getHTML() {
    return `<div class="${d}_modal-backdrop" onclick="{{this.closeModal(false)}}">
        <div class="${d}_modal" onclick="{{event.stopPropagation()}}">${this.config.bodyContent}</div>
      </div>`;
  }
  static attach(e, l) {
    const r = m.stringToNode(`<modal-component component-id="${e}" bucket-id="${l}"></modal-component>`);
    document.body.appendChild(r), a.connectBySelector(c.selector, i, document.body);
  }
  closeModal(e) {
    this.outerBucket.emitEvent(this.id, "closeModal", { data: { isOK: e } });
  }
  destroyModal() {
    const e = i.indexOf(this);
    e > -1 && i.splice(e, 1), this.disconnectedCallback();
  }
  connectedCallback() {
    super.connectedCallback(), this.closeEvents$ = this.getCloseRx(), this.newRxFunc((e) => {
      e && e[this.index] && (e[this.index] = null, this.destroyModal());
    }, this.closeEvents$), this.config.dependencies && (this.dependencies = this.config.dependencies, this.updateDependencies());
  }
};
s(c, "selector", "modal-component");
let n = c;
a.define(n);
export {
  n as ModalComponent,
  x as ModalConfig
};
//# sourceMappingURL=modal.js.map

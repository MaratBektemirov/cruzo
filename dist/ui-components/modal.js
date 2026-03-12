var r = Object.defineProperty;
var p = (t, o, e) => o in t ? r(t, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[o] = e;
var s = (t, o, e) => p(t, typeof o != "symbol" ? o + "" : o, e);
import { c as d, A as h, T as m } from "../component-CH-TJ5VF.js";
function g(t) {
  return Object.assign({}, t);
}
const n = [], c = class c extends h {
  constructor() {
    super();
    s(this, "hasOuterScope", !0);
    s(this, "hasConfig", !0);
    s(this, "getCloseRx", () => this.newRxEventFromScopeByIndex(this.outerScope, this.id, "closeModal"));
    s(this, "closeEvents$");
  }
  getHTML() {
    return `<div class="cruzo-ui-component_modal-backdrop" onclick="{{this.closeModal(false)}}">
        <div class="cruzo-ui-component_modal" onclick="{{event.stopPropagation()}}">${this.config.bodyContent}</div>
      </div>`;
  }
  static attach(e, a) {
    const l = m.stringToNode(`<modal-component component-id="${e}" scope-id="${a}"></modal-component>`);
    document.body.appendChild(l), d.connectBySelector(c.selector, n, document.body);
  }
  closeModal(e) {
    this.outerScope.emitEvent(this.id, "closeModal", { data: { isOK: e } });
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

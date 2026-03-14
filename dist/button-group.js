var s = Object.defineProperty;
var c = (t, o, e) => o in t ? s(t, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[o] = e;
var u = (t, o, e) => c(t, typeof o != "symbol" ? o + "" : o, e);
import { componentsRegistryService as p, AbstractComponent as i } from "cruzo";
const b = "button-group-component-module__buttonGroup___aG1eD", m = "button-group-component-module__buttonGroupItem___c6W9p", l = "button-group-component-module__buttonGroupItemActive___bZIZn", n = {
  buttonGroup: b,
  buttonGroupItem: m,
  buttonGroupItemActive: l
};
function G(t) {
  return Object.assign({}, t);
}
class r extends i {
  constructor() {
    super(...arguments);
    u(this, "hasConfig", !0);
    u(this, "hasOuterScope", !0);
  }
  getHTML() {
    return `<div class="${n.buttonGroup}">
      <button
        repeat="root.config?.items"
        class="${n.buttonGroupItem} {{this.value === root.value$::rx ? '${n.buttonGroupItemActive}' : ''}}"
        onclick="root.select(this.value)"
      >
        {{this.label}}
      </button>
    </div>`;
  }
  select(e) {
    this.outerScope.setValue(this.id, e, this.index, !0);
  }
}
u(r, "selector", "button-group-component");
p.define(r);
export {
  r as ButtonGroupComponent,
  G as ButtonGroupConfig
};
//# sourceMappingURL=button-group.js.map

var r = Object.defineProperty;
var i = (t, o, e) => o in t ? r(t, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[o] = e;
var n = (t, o, e) => i(t, typeof o != "symbol" ? o + "" : o, e);
import { c as s, A as c } from "../component-CH-TJ5VF.js";
function l(t) {
  return Object.assign({}, t);
}
class u extends c {
  constructor() {
    super(...arguments);
    n(this, "hasConfig", !0);
    n(this, "hasOuterScope", !0);
  }
  getHTML() {
    return `<div class="cruzo-ui-component_button-group">
        <button
          repeat="{{root.config?.items}}"
          class="cruzo-ui-component_button-group-item {{this.value === root.value$::rx ? 'cruzo-ui-component_button-group-item-active' : ''}}"
          onclick="{{root.select(this.value)}}"
          >
          {{this.label}}
        </button>
      </div>`;
  }
  select(e) {
    this.outerScope.setValue(this.id, e, this.index, !0);
  }
}
n(u, "selector", "button-group-component");
s.define(u);
export {
  u as ButtonGroupComponent,
  l as ButtonGroupConfig
};
//# sourceMappingURL=button-group.js.map

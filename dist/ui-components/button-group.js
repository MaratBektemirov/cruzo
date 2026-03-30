var r = Object.defineProperty;
var i = (t, e, o) => e in t ? r(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var u = (t, e, o) => i(t, typeof e != "symbol" ? e + "" : e, o);
import { c as s, A as c } from "../component-CK41B9Gk.js";
function l(t) {
  return Object.assign({}, t);
}
class n extends c {
  constructor() {
    super(...arguments);
    u(this, "hasConfig", !0);
    u(this, "hasOuterBucket", !0);
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
  select(o) {
    this.outerBucket.setValue(this.id, o, this.index, !0);
  }
}
u(n, "selector", "button-group-component");
s.define(n);
export {
  n as ButtonGroupComponent,
  l as ButtonGroupConfig
};
//# sourceMappingURL=button-group.js.map

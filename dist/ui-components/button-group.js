var u = Object.defineProperty;
var n = (t, e, o) => e in t ? u(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var r = (t, e, o) => n(t, typeof e != "symbol" ? e + "" : e, o);
import { c, A as a } from "../component-DBoFvGq8.js";
import { UI_KIT as s } from "./const.js";
function m(t) {
  return Object.assign({}, t);
}
class i extends a {
  constructor() {
    super(...arguments);
    r(this, "hasConfig", !0);
    r(this, "hasOuterBucket", !0);
  }
  getHTML() {
    return `<div class="${s}_button-group">
        <button
          repeat="{{root.config?.items}}"
          class="${s}_button-group-item {{this.value === root.value$::rx ? '${s}_button-group-item-active' : ''}}"
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
r(i, "selector", "button-group-component");
c.define(i);
export {
  i as ButtonGroupComponent,
  m as ButtonGroupConfig
};
//# sourceMappingURL=button-group.js.map

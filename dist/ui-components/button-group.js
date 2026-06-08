var u = Object.defineProperty;
var n = (t, e, o) => e in t ? u(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var r = (t, e, o) => n(t, typeof e != "symbol" ? e + "" : e, o);
import { componentsRegistryService as c, AbstractComponent as a } from "cruzo";
import { UI_KIT as i } from "./const.js";
function m(t) {
  return Object.assign({}, t);
}
class s extends a {
  constructor() {
    super(...arguments);
    r(this, "hasConfig", !0);
    r(this, "hasOuterBucket", !0);
  }
  getHTML() {
    return `<div class="${i}_button-group">
        <button
          repeat="{{root.config$::rx.items}}"
          class="${i}_button-group-item {{this.value === root.value$::rx ? '${i}_button-group-item-active' : ''}}"
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
r(s, "selector", "button-group-component");
c.define(s);
export {
  s as ButtonGroupComponent,
  m as ButtonGroupConfig
};
//# sourceMappingURL=button-group.js.map

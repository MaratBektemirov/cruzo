var u = Object.defineProperty;
var h = (o, i, e) => i in o ? u(o, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[i] = e;
var s = (o, i, e) => h(o, typeof i != "symbol" ? i + "" : i, e);
import { componentsRegistryService as p, AbstractComponent as $ } from "cruzo";
import { UI_KIT as t } from "./const.js";
function b(o) {
  return Object.assign({}, o);
}
class d extends $ {
  constructor() {
    super();
    s(this, "hasConfig", !0);
    s(this, "hasOuterBucket", !0);
    s(this, "open$", this.newRx(!1));
    s(this, "items$", this.newRx(null));
    s(this, "selectedLabel$", this.newRx(""));
    s(this, "itemsLoadToken", Symbol());
    s(this, "handleOutsideClick", (e) => {
      this.node && !this.node.contains(e.target) && this.open$.update(!1);
    });
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("click", this.handleOutsideClick), this.newRxFunc(async (e, n) => {
      const l = Symbol();
      this.itemsLoadToken = l;
      const c = await n.getItems(e, this.open$.actual);
      if (this.itemsLoadToken !== l) return;
      this.items$.update(c || []);
      const r = e ? c.filter((a) => e[a.value]).map((a) => a.label) : [];
      r.length ? this.selectedLabel$.update(r.join(", ")) : this.selectedLabel$.update(this.config$.actual.placeholder);
    }, this.value$, this.config$);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick), super.disconnectedCallback();
  }
  toggle() {
    this.open$.update(!this.open$.actual);
  }
  toggleItem(e) {
    const n = this.value || {}, l = this.config.multi ? Object.assign({}, n) : { [e.value]: n[e.value] };
    l[e.value] = !l[e.value], this.outerBucket.setValue(this.id, l, this.index, !0), this.config.multi || this.open$.update(!1);
  }
  getHTML() {
    return `<div class="${t}_select">
        <button type="button" class="${t}_trigger" onclick="{{root.toggle()}}">
          <span class="${t}_value">{{root.selectedLabel$::rx}}</span>
          <span class="${t}_caret {{root.open$::rx ? '${t}_caret-open' : ''}}">▴</span>
        </button>
        <div class="${t}_dropdown" style="{{root.open$::rx ? '' : 'display:none'}}">
          <div class="${t}_list" style="{{root.items$::rx && root.items$::rx.length ? '' : 'display:none'}}">
            <div
              repeat="{{root.items$::rx}}"
              class="${t}_option {{root.value$::rx?.[this.value] ? '${t}_option-selected' : ''}}"
              onclick="{{root.toggleItem(this)}}">
              <label class="${t}_checkbox" attached="{{root.config$::rx.multi}}">
                <input
                  type="checkbox"
                  class="${t}_checkbox-input"
                  checked="{{root.value$::rx?.[this.value]}}"
                  />
              </label>
              <span class="${t}_option-label">{{this.label}}</span>
            </div>
          </div>
          <div class="${t}_empty" style="{{root.items$::rx && root.items$::rx.length ? 'display:none' : ''}}">Нет вариантов</div>
        </div>
      </div>`;
  }
}
s(d, "selector", "select-component");
p.define(d);
export {
  d as SelectComponent,
  b as SelectConfig
};
//# sourceMappingURL=select.js.map

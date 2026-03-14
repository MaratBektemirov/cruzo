var r = Object.defineProperty;
var d = (s, n, e) => n in s ? r(s, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[n] = e;
var o = (s, n, e) => d(s, typeof n != "symbol" ? n + "" : n, e);
import { componentsRegistryService as p, AbstractComponent as u } from "cruzo";
const m = "select-component-module__select___ZMQLW", _ = "select-component-module__trigger___5kPX3", h = "select-component-module__value___lvXXC", g = "select-component-module__caret___n8rbc", $ = "select-component-module__caretOpen___msG44", v = "select-component-module__dropdown___sA55J", b = "select-component-module__list___Dafaa", x = "select-component-module__option___FEiEv", f = "select-component-module__optionSelected___QQxmK", k = "select-component-module__empty___WwIFF", t = {
  select: m,
  trigger: _,
  value: h,
  caret: g,
  caretOpen: $,
  dropdown: v,
  list: b,
  option: x,
  optionSelected: f,
  empty: k
};
function w(s) {
  return Object.assign({}, s);
}
class a extends u {
  constructor() {
    super();
    o(this, "hasConfig", !0);
    o(this, "hasOuterScope", !0);
    o(this, "open$", this.newRx(!1));
    o(this, "items$", this.newRx(null));
    o(this, "selectedLabel$", this.newRx(""));
    o(this, "getItems$", this.newRxFunc(async (e, c) => {
      if (!e || !(c != null && c.length)) return;
      const i = c.filter((l) => e[l.value]).map((l) => l.label);
      i.length ? this.selectedLabel$.update(i.join(", ")) : this.config && this.selectedLabel$.update(this.config.placeholder);
    }, this.value$, this.items$));
    o(this, "handleOutsideClick", (e) => {
      this.node && !this.node.contains(e.target) && this.open$.update(!1);
    });
    this.value$.update({});
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("click", this.handleOutsideClick), this.getItems();
  }
  async getItems() {
    const e = await this.config.getItems();
    this.items$.update(e);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick), super.disconnectedCallback();
  }
  toggle() {
    this.open$.update(!this.open$.value);
  }
  toggleItem(e) {
    const c = this.config.multi ? Object.assign({}, this.value) : {};
    c[e.value] = !c[e.value], this.outerScope.setValue(this.id, c, this.index, !0), this.config.multi || this.open$.update(!1);
  }
  getItemContent() {
    return `${this.config.multi ? `<label class="checkbox">
        <input
          type="checkbox"
          checked="{{root.value$::rx[this.value]}}"
        />
     </label>` : ""} <span>{{this.label}}</span>`;
  }
  getHTML() {
    return `<div class="${t.select}">
    <button type="button" class="${t.trigger}" onclick="root.toggle()">
      <span class="${t.value}">{{root.selectedLabel$::rx}}</span>
      <span class="${t.caret} {{root.open$::rx ? '${t.caretOpen}' : ''}}">▴</span>
    </button>
    <div class="${t.dropdown}" style="{{root.open$::rx ? '' : 'display:none'}}">
      <div class="${t.list}" style="{{root.items$::rx && root.items$::rx.length ? '' : 'display:none'}}">
        <div
          repeat="root.items$::rx" 
          class="${t.option} {{root.value$::rx[this.value] ? '${t.optionSelected}' : ''}}" 
          onclick="root.toggleItem(this)">
          ${this.getItemContent()}
        </div>
      </div>
      <div class="${t.empty}" style="{{root.items$::rx && root.items$::rx.length ? 'display:none' : ''}}">Нет вариантов</div>
    </div>
  </div>`;
  }
}
o(a, "selector", "select-component");
p.define(a);
export {
  a as SelectComponent,
  w as SelectConfig
};
//# sourceMappingURL=select.js.map

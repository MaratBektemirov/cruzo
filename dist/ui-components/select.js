var r = Object.defineProperty;
var u = (n, o, e) => o in n ? r(n, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[o] = e;
var s = (n, o, e) => u(n, typeof o != "symbol" ? o + "" : o, e);
import { c as d, A as h } from "../component-DBoFvGq8.js";
import { UI_KIT as t } from "./const.js";
function v(n) {
  return Object.assign({}, n);
}
class a extends h {
  constructor() {
    super();
    s(this, "hasConfig", !0);
    s(this, "hasOuterBucket", !0);
    s(this, "open$", this.newRx(!1));
    s(this, "items$", this.newRx(null));
    s(this, "selectedLabel$", this.newRx(""));
    s(this, "getItems$", this.newRxFunc(async (e, i) => {
      if (!e || !(i != null && i.length)) return;
      const l = i.filter((c) => e[c.value]).map((c) => c.label);
      l.length ? this.selectedLabel$.update(l.join(", ")) : this.config && this.selectedLabel$.update(this.config.placeholder);
    }, this.value$, this.items$));
    s(this, "handleOutsideClick", (e) => {
      this.node && !this.node.contains(e.target) && this.open$.update(!1);
    });
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
    this.open$.update(!this.open$.actual);
  }
  toggleItem(e) {
    const i = this.value || {}, l = this.config.multi ? Object.assign({}, i) : { [e.value]: i[e.value] };
    l[e.value] = !l[e.value], this.outerBucket.setValue(this.id, l, this.index, !0), this.config.multi || this.open$.update(!1);
  }
  getItemContent() {
    return `${this.config.multi ? `<label class="${t}_checkbox">
        <input
          type="checkbox"
          class="${t}_checkbox-input"
          checked="{{root.value$::rx?.[this.value]}}"
          />
      </label>` : ""}<span class="${t}_option-label">{{this.label}}</span>`;
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
              ${this.getItemContent()}
            </div>
          </div>
          <div class="${t}_empty" style="{{root.items$::rx && root.items$::rx.length ? 'display:none' : ''}}">Нет вариантов</div>
        </div>
      </div>`;
  }
}
s(a, "selector", "select-component");
d.define(a);
export {
  a as SelectComponent,
  v as SelectConfig
};
//# sourceMappingURL=select.js.map

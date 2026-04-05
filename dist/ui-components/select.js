var a = Object.defineProperty;
var u = (o, n, e) => n in o ? a(o, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[n] = e;
var t = (o, n, e) => u(o, typeof n != "symbol" ? n + "" : n, e);
import { c as r, A as p } from "../component-CK41B9Gk.js";
function m(o) {
  return Object.assign({}, o);
}
class l extends p {
  constructor() {
    super();
    t(this, "hasConfig", !0);
    t(this, "hasOuterBucket", !0);
    t(this, "open$", this.newRx(!1));
    t(this, "items$", this.newRx(null));
    t(this, "selectedLabel$", this.newRx(""));
    t(this, "getItems$", this.newRxFunc(async (e, s) => {
      if (!e || !(s != null && s.length)) return;
      const c = s.filter((i) => e[i.value]).map((i) => i.label);
      c.length ? this.selectedLabel$.update(c.join(", ")) : this.config && this.selectedLabel$.update(this.config.placeholder);
    }, this.value$, this.items$));
    t(this, "handleOutsideClick", (e) => {
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
    const s = this.value || {}, c = this.config.multi ? Object.assign({}, s) : { [e.value]: s[e.value] };
    c[e.value] = !c[e.value], this.outerBucket.setValue(this.id, c, this.index, !0), this.config.multi || this.open$.update(!1);
  }
  getItemContent() {
    return `${this.config.multi ? `<label class="cruzo-ui-component_checkbox">
        <input
          type="checkbox"
          class="cruzo-ui-component_checkbox-input"
          checked="{{root.value$::rx?.[this.value]}}"
          />
      </label>` : ""}<span class="cruzo-ui-component_option-label">{{this.label}}</span>`;
  }
  getHTML() {
    return `<div class="cruzo-ui-component_select">
        <button type="button" class="cruzo-ui-component_trigger" onclick="{{root.toggle()}}">
          <span class="cruzo-ui-component_value">{{root.selectedLabel$::rx}}</span>
          <span class="cruzo-ui-component_caret {{root.open$::rx ? 'cruzo-ui-component_caret-open' : ''}}">▴</span>
        </button>
        <div class="cruzo-ui-component_dropdown" style="{{root.open$::rx ? '' : 'display:none'}}">
          <div class="cruzo-ui-component_list" style="{{root.items$::rx && root.items$::rx.length ? '' : 'display:none'}}">
            <div
              repeat="{{root.items$::rx}}"
              class="cruzo-ui-component_option {{root.value$::rx?.[this.value] ? 'cruzo-ui-component_option-selected' : ''}}"
              onclick="{{root.toggleItem(this)}}">
              ${this.getItemContent()}
            </div>
          </div>
          <div class="cruzo-ui-component_empty" style="{{root.items$::rx && root.items$::rx.length ? 'display:none' : ''}}">Нет вариантов</div>
        </div>
      </div>`;
  }
}
t(l, "selector", "select-component");
r.define(l);
export {
  l as SelectComponent,
  m as SelectConfig
};
//# sourceMappingURL=select.js.map

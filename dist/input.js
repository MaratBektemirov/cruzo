var h = Object.defineProperty;
var p = (i, s, t) => s in i ? h(i, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[s] = t;
var o = (i, s, t) => p(i, typeof s != "symbol" ? s + "" : s, t);
import { componentsRegistryService as a, AbstractComponent as c, Template as d } from "cruzo";
import { roundValue as f } from "cruzo/utils";
const v = "input-component-module__inputTooltip___wsO1N", g = {
  inputTooltip: v
};
function b(i) {
  return Object.assign({}, i);
}
class r extends c {
  constructor() {
    super(...arguments);
    o(this, "hasConfig", !0);
    o(this, "hasOuterScope", !0);
    o(this, "tooltipNode", null);
    o(this, "hasFocus", !1);
    o(this, "hasMouseEnter", !1);
    o(this, "showTooltipIfOverflow", () => {
      const t = this.hasFocus || this.hasMouseEnter;
      let e = !1, n = !1, l = !1;
      if (t) {
        const u = this.getInput();
        u && (l = u.scrollWidth > u.offsetWidth, e = !this.tooltipNode && l);
      }
      n = this.tooltipNode && !l, e ? (this.tooltipNode = d.stringToNode(`<div class="${g.inputTooltip}"></div>`), document.body.appendChild(this.tooltipNode), this.updateTooltipCoords(), window.addEventListener("resize", this.updateTooltipCoords), window.addEventListener("scroll", this.updateTooltipCoords)) : n && (this.tooltipNode.remove(), this.tooltipNode = null, window.removeEventListener("resize", this.updateTooltipCoords), window.removeEventListener("scroll", this.updateTooltipCoords)), this.tooltipNode && this.updateTooltipText();
    });
    o(this, "updateTooltipCoords", () => {
      if (!this.tooltipNode) return;
      const t = this.getInput();
      if (!t) return;
      const e = t.getBoundingClientRect();
      this.tooltipNode.style.left = e.left + "px", this.tooltipNode.style.top = e.top - 43 + "px";
    });
  }
  getHTML() {
    var t;
    return `<input 
      class="input"
      placeholder="${((t = this.config) == null ? void 0 : t.label) || ""}"
      oninput="root.onEvent()"
      onfocus="root.onFocus()"
      onblur="root.onBlur()"
      onmouseenter="root.onMouseEnter()"
      onmouseleave="root.onMouseLeave()"
    />`;
  }
  isCheckbox() {
    const t = this.getInput();
    return (t == null ? void 0 : t.getAttribute("type")) === "checkbox";
  }
  isNumber() {
    const t = this.getInput();
    return (t == null ? void 0 : t.getAttribute("type")) === "number";
  }
  getInput() {
    return this.node.querySelector("input") || this.node.firstElementChild;
  }
  updateTooltipText() {
    const t = this.getInput();
    this.tooltipNode.innerHTML = t.value;
  }
  recalc() {
    if (this.isCheckbox())
      return;
    if ((this.config || {}).enableContentWidth) {
      const e = this.getInput();
      e.value.length ? (e.style.minWidth = "100%", e.style.width = e.value.length + 0.75 + "ch") : (e.style.minWidth = "", e.style.width = "");
    } else
      this.showTooltipIfOverflow();
  }
  setValue(t = !1) {
    const e = this.config || {};
    this.value = this.outerScope.getValue(this.id, this.index);
    const n = this.getInput();
    this.value && typeof e.roundValue == "number" && (this.value = f(this.value, e.roundValue) + ""), t || (this.isCheckbox() ? n.checked = this.value || !1 : this.isNumber() ? n.value = this.value === 0 ? "0" : this.value || "" : n.value = this.value || ""), this.value$.update(this.value), this.recalc();
  }
  onEvent() {
    const t = this.getInput();
    let e;
    this.isCheckbox() ? e = t.checked : this.isNumber() ? e = +t.value : e = t.value, this.value !== e && this.outerScope.setValue(this.id, e, this.index, !0);
  }
  onFocus() {
    this.hasFocus = !0, this.recalc();
  }
  onBlur() {
    this.hasFocus = !1, this.recalc();
  }
  onMouseEnter() {
    this.hasMouseEnter = !0, this.recalc();
  }
  onMouseLeave() {
    this.hasMouseEnter = !1, this.recalc();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.tooltipNode && (this.tooltipNode.remove(), this.tooltipNode = null, window.removeEventListener("resize", this.updateTooltipCoords), window.removeEventListener("scroll", this.updateTooltipCoords));
  }
}
o(r, "selector", "input-component");
a.define(r);
export {
  r as InputComponent,
  b as InputConfig
};
//# sourceMappingURL=input.js.map

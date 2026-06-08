var d = Object.defineProperty;
var c = (e, i, t) => i in e ? d(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var s = (e, i, t) => c(e, typeof i != "symbol" ? i + "" : i, t);
import { componentsRegistryService as a, AbstractComponent as h, Template as f } from "cruzo";
import { UI_KIT as u } from "./const.js";
function x(e) {
  return Object.assign({}, e);
}
class p extends h {
  constructor() {
    super(...arguments);
    s(this, "hasConfig", !0);
    s(this, "hasOuterBucket", !0);
    s(this, "tooltipNode", null);
    s(this, "hasFocus", !1);
    s(this, "hasMouseEnter", !1);
    s(this, "updateTooltipCoords", () => {
      if (!this.tooltipNode) return;
      const t = this.getInput();
      if (!t) return;
      const o = t.getBoundingClientRect(), r = 6, n = this.tooltipNode.offsetHeight || 28;
      this.tooltipNode.style.left = `${o.left}px`, this.tooltipNode.style.top = `${o.top - n - r}px`;
    });
  }
  getHTML() {
    return `<input
        class="${u}_input {{root.state$::rx?.cls}}"
        type="{{root.config$::rx?.type || 'text'}}"
        name="{{root.config$::rx?.name}}"
        id="{{root.config$::rx?.id}}"
        required="{{root.config$::rx?.required}}"
        placeholder="{{root.config$::rx?.placeholder}}"
        maxlength="{{root.config$::rx?.maxlength}}"
        autocomplete="{{root.config$::rx?.autocomplete}}"
        inputmode="{{root.config$::rx?.inputmode}}"
        oninput="{{root.onEvent()}}"
        onfocus="{{root.onFocus()}}"
        onblur="{{root.onBlur()}}"
        onmouseenter="{{root.onMouseEnter()}}"
        onmouseleave="{{root.onMouseLeave()}}"
        />`;
  }
  isNumber() {
    var t;
    return ((t = this.getInput()) == null ? void 0 : t.getAttribute("type")) === "number";
  }
  getInput() {
    return this.node.firstElementChild;
  }
  recalc() {
    const t = this.hasFocus || this.hasMouseEnter;
    let o = !1, r = !1, n = !1;
    if (t) {
      const l = this.getInput();
      l && (n = l.scrollWidth > l.offsetWidth, o = !this.tooltipNode && n);
    }
    r = this.tooltipNode && !n, o ? (this.tooltipNode = f.stringToNode(`<div class="${u}_input-tooltip"></div>`), document.body.appendChild(this.tooltipNode), window.addEventListener("resize", this.updateTooltipCoords), window.addEventListener("scroll", this.updateTooltipCoords)) : r && (this.tooltipNode.remove(), this.tooltipNode = null, window.removeEventListener("resize", this.updateTooltipCoords), window.removeEventListener("scroll", this.updateTooltipCoords)), this.tooltipNode && (this.updateTooltipText(), this.updateTooltipCoords());
  }
  updateTooltipText() {
    if (!this.tooltipNode) return;
    const t = this.getInput();
    this.tooltipNode.textContent = (t == null ? void 0 : t.value) ?? "";
  }
  onEvent() {
    const t = this.getInput(), o = this.isNumber() ? +t.value : t.value;
    this.value !== o && this.outerBucket.setValue(this.id, o, this.index, !0);
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
  connectedCallback() {
    super.connectedCallback(), this.state == null && this.outerBucket.setState(this.id, { cls: "" }, this.index), this.newRxFunc((t) => {
      const o = this.getInput();
      !o || t === o.value || (o.value = t ?? "");
    }, this.value$);
  }
}
s(p, "selector", "input-component");
a.define(p);
export {
  p as InputComponent,
  x as InputConfig
};
//# sourceMappingURL=input.js.map

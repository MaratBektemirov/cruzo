var d = Object.defineProperty;
var h = (o, i, t) => i in o ? d(o, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[i] = t;
var n = (o, i, t) => h(o, typeof i != "symbol" ? i + "" : i, t);
import { c as p, A as c, T as f } from "../component-DUmooULT.js";
import { UI_KIT as a } from "./const.js";
function N(o) {
  return Object.assign({}, o);
}
class u extends c {
  constructor() {
    super(...arguments);
    n(this, "hasConfig", !0);
    n(this, "hasOuterBucket", !0);
    n(this, "tooltipNode", null);
    n(this, "hasFocus", !1);
    n(this, "hasMouseEnter", !1);
    n(this, "updateTooltipCoords", () => {
      if (!this.tooltipNode) return;
      const t = this.getInput();
      if (!t) return;
      const e = t.getBoundingClientRect(), s = 6, l = this.tooltipNode.offsetHeight || 28;
      this.tooltipNode.style.left = `${e.left}px`, this.tooltipNode.style.top = `${e.top - l - s}px`;
    });
  }
  getHTML() {
    return `<input
        let-state="{{this.state$::rx}}"
        attached="{{state}}"
        name="{{state.name}}"
        id="{{state.id}}"
        required="{{state.required}}"
        inputmode="{{state.inputmode}}"
        maxlength="{{state.maxlength}}"
        class="${a}_input {{state.cls}}"
        autocomplete="{{state.autocomplete}}"
        type="${this.config.type || "text"}"
        placeholder="{{state.placeholder}}"
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
    let e = !1, s = !1, l = !1;
    if (t) {
      const r = this.getInput();
      r && (l = r.scrollWidth > r.offsetWidth, e = !this.tooltipNode && l);
    }
    s = this.tooltipNode && !l, e ? (this.tooltipNode = f.stringToNode(`<div class="${a}_input-tooltip"></div>`), document.body.appendChild(this.tooltipNode), window.addEventListener("resize", this.updateTooltipCoords), window.addEventListener("scroll", this.updateTooltipCoords)) : s && (this.tooltipNode.remove(), this.tooltipNode = null, window.removeEventListener("resize", this.updateTooltipCoords), window.removeEventListener("scroll", this.updateTooltipCoords)), this.tooltipNode && (this.updateTooltipText(), this.updateTooltipCoords());
  }
  updateTooltipText() {
    if (!this.tooltipNode) return;
    const t = this.getInput();
    this.tooltipNode.textContent = (t == null ? void 0 : t.value) ?? "";
  }
  onEvent() {
    const t = this.getInput();
    let e;
    this.isNumber() ? e = +t.value : e = t.value, this.value !== e && this.outerBucket.setValue(this.id, e, this.index, !0);
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
    super.connectedCallback();
    const t = this.outerBucket.getState(this.id, this.index) || {};
    this.outerBucket.setState(this.id, {
      required: t.required || this.config.required || !1,
      placeholder: t.placeholder || this.config.placeholder || "",
      cls: t.cls || "",
      maxlength: t.maxlength || this.config.maxlength || "",
      autocomplete: t.autocomplete || this.config.autocomplete || "",
      inputmode: t.inputmode || this.config.inputmode || "",
      id: t.id || this.config.id || "",
      name: t.name || this.config.name || ""
    }, this.index), this.newRxFunc((e) => {
      const s = this.getInput();
      !s || e === s.value || (s.value = e ?? "");
    }, this.value$);
  }
}
n(u, "selector", "input-component");
p.define(u);
export {
  u as InputComponent,
  N as InputConfig
};
//# sourceMappingURL=input.js.map

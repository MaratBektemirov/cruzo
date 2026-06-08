import { AbstractComponent, componentsRegistryService, Template } from "cruzo";
import { UI_KIT } from "../const";

export interface InputConfig {
  type?: "text" | "password" | "email" | "url" | "tel" | "search" | "number";
  maxlength?: number;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  inputmode?: string;
  name?: string;
  id?: string;
}

export function InputConfig(params: InputConfig) {
  return Object.assign({}, params);
}

export interface InputState {
  cls?: string;
}

export class InputComponent extends AbstractComponent<InputConfig, any, InputState> {
  static selector = "input-component";
  hasConfig = true;
  hasOuterBucket = true;

  tooltipNode: HTMLElement = null;
  hasFocus = false;
  hasMouseEnter = false;

  getHTML() {
    return `<input
        class="${UI_KIT}_input {{root.state$::rx?.cls}}"
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
    return this.getInput()?.getAttribute("type") === "number";
  }

  getInput() {
    return this.node.firstElementChild as HTMLInputElement;
  }

  recalc() {
    const isActiveInput = this.hasFocus || this.hasMouseEnter;

    let addTooltip = false;
    let removeTooltip = false;
    let hasOverflow = false;

    if (isActiveInput) {
      const input = this.getInput();
      if (input) {
        hasOverflow = input.scrollWidth > input.offsetWidth;
        addTooltip = !this.tooltipNode && hasOverflow;
      }
    }

    removeTooltip = this.tooltipNode && !hasOverflow;

    if (addTooltip) {
      this.tooltipNode = Template.stringToNode(`<div class="${UI_KIT}_input-tooltip"></div>`) as HTMLElement;
      document.body.appendChild(this.tooltipNode);
      window.addEventListener("resize", this.updateTooltipCoords);
      window.addEventListener("scroll", this.updateTooltipCoords);
    } else if (removeTooltip) {
      this.tooltipNode.remove();
      this.tooltipNode = null;
      window.removeEventListener("resize", this.updateTooltipCoords);
      window.removeEventListener("scroll", this.updateTooltipCoords);
    }

    if (this.tooltipNode) {
      this.updateTooltipText();
      this.updateTooltipCoords();
    }
  }

  updateTooltipText() {
    if (!this.tooltipNode) return;
    const input = this.getInput();
    this.tooltipNode.textContent = input?.value ?? "";
  }

  updateTooltipCoords = () => {
    if (!this.tooltipNode) return;
    const input = this.getInput();
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const gap = 6;
    const th = this.tooltipNode.offsetHeight || 28;

    this.tooltipNode.style.left = `${rect.left}px`;
    this.tooltipNode.style.top = `${rect.top - th - gap}px`;
  };

  onEvent() {
    const input = this.getInput();

    const value = this.isNumber() ? +input.value : input.value;

    if (this.value !== value) {
      this.outerBucket.setValue(this.id, value, this.index, true);
    }
  }

  onFocus() {
    this.hasFocus = true;
    this.recalc();
  }

  onBlur() {
    this.hasFocus = false;
    this.recalc();
  }

  onMouseEnter() {
    this.hasMouseEnter = true;
    this.recalc();
  }

  onMouseLeave() {
    this.hasMouseEnter = false;
    this.recalc();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.tooltipNode) {
      this.tooltipNode.remove();
      this.tooltipNode = null;
      window.removeEventListener("resize", this.updateTooltipCoords);
      window.removeEventListener("scroll", this.updateTooltipCoords);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.state == null) {
      this.outerBucket.setState(this.id, { cls: "" }, this.index);
    }

    this.newRxFunc((value) => {
      const input = this.getInput();
      if (!input || value === input.value) return;
      input.value = value ?? "";
    }, this.value$);
  }
}

componentsRegistryService.define(InputComponent);

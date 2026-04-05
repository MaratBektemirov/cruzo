import { AbstractComponent, componentsRegistryService, Template } from "../../lib";

interface InputConfigParams {
  type?: 'text' | 'password' | 'email' | 'url' | 'tel' | 'search' | 'number';
  maxlength?: number;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  inputmode?: string;
}

export function InputConfig(params: InputConfigParams) {
  return Object.assign({}, params);
}

interface InputConfigState {
  required: boolean;
  placeholder: string;
  cls: string;
  maxlength: number;
  autocomplete: string;
  inputmode: string;
}

export class InputComponent extends AbstractComponent<InputConfigParams, any, InputConfigState> {
  static selector = "input-component";
  hasConfig = true;
  hasOuterBucket = true;

  tooltipNode: HTMLElement = null;
  hasFocus = false;
  hasMouseEnter = false;

  getHTML() {
    return `<input
        let-state="{{this.state$::rx}}"
        attached="{{state}}"
        required="{{state.required}}"
        inputmode="{{state.inputmode}}"
        maxlength="{{state.maxlength}}"
        class="cruzo-ui-component_input {{state.cls}}"
        autocomplete="{{state.autocomplete}}"
        type="${this.config.type || 'text'}"
        placeholder="{{state.placeholder}}"
        oninput="{{root.onEvent()}}"
        onfocus="{{root.onFocus()}}"
        onblur="{{root.onBlur()}}"
        onmouseenter="{{root.onMouseEnter()}}"
        onmouseleave="{{root.onMouseLeave()}}"
        />`;
  }

  isNumber() {
    return this.getInput()?.getAttribute('type') === 'number';
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

    removeTooltip = (this.tooltipNode && !hasOverflow);

    if (addTooltip) {
      this.tooltipNode = Template.stringToNode(`<div class="cruzo-ui-component_input-tooltip"></div>`) as HTMLElement;
      document.body.appendChild(this.tooltipNode);
      window.addEventListener('resize', this.updateTooltipCoords);
      window.addEventListener('scroll', this.updateTooltipCoords);
    } else if (removeTooltip) {
      this.tooltipNode.remove();
      this.tooltipNode = null;
      window.removeEventListener('resize', this.updateTooltipCoords);
      window.removeEventListener('scroll', this.updateTooltipCoords);
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
  }

  onEvent() {
    const input = this.getInput();

    let value;

    if (this.isNumber()) {
      value = +input.value;
    } else {
      value = input.value;
    }

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
      window.removeEventListener('resize', this.updateTooltipCoords);
      window.removeEventListener('scroll', this.updateTooltipCoords);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    const state: InputConfigState = this.outerBucket.getState(this.id, this.index) || {};

    this.outerBucket.setState(this.id, {
      required: state.required || this.config.required || false,
      placeholder: state.placeholder || this.config.placeholder || '',
      cls: state.cls || '',
      maxlength: state.maxlength || this.config.maxlength || '',
      autocomplete: state.autocomplete || this.config.autocomplete || '',
      inputmode: state.inputmode || this.config.inputmode || '',
    }, this.index);

    this.newRxFunc((value) => {
      const input = this.getInput()
      if (!input || value === input.value) return
      input.value = value ?? ''
    }, this.value$)
  }
}

componentsRegistryService.define(InputComponent);

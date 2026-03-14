import { AbstractComponent, componentsRegistryService, Template } from "cruzo";
import { roundValue } from "cruzo/utils";
import styles from "./input.component.module.css";

interface InputConfigParams {
  label?: string;
  enableContentWidth?: boolean;
  roundValue?: number;
}

export function InputConfig(params: InputConfigParams) {
  return Object.assign({}, params);
}

export class InputComponent extends AbstractComponent<InputConfigParams> {
  static selector = "input-component";
  hasConfig = true;
  hasOuterScope = true;

  tooltipNode: HTMLElement = null;
  hasFocus = false;
  hasMouseEnter = false;

  getHTML() {
    return `<input 
      class="input"
      placeholder="${this.config?.label || ''}"
      oninput="root.onEvent()"
      onfocus="root.onFocus()"
      onblur="root.onBlur()"
      onmouseenter="root.onMouseEnter()"
      onmouseleave="root.onMouseLeave()"
    />`;
  }

  isCheckbox() {
    const input = this.getInput();
    return input?.getAttribute('type') === 'checkbox';
  }

  isNumber() {
    const input = this.getInput();
    return input?.getAttribute('type') === 'number';
  }

  getInput() {
    return this.node.querySelector('input') as HTMLInputElement || this.node.firstElementChild as HTMLInputElement;
  }

  showTooltipIfOverflow = () => {
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
      this.tooltipNode = Template.stringToNode(`<div class="${styles.inputTooltip}"></div>`) as HTMLElement;
      document.body.appendChild(this.tooltipNode);
      this.updateTooltipCoords();
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
    }
  }

  updateTooltipText() {
    const input = this.getInput();
    this.tooltipNode.innerHTML = input.value;
  }

  updateTooltipCoords = () => {
    if (!this.tooltipNode) return;
    const input = this.getInput();
    if (!input) return;
    const rect = input.getBoundingClientRect();

    this.tooltipNode.style.left = rect.left + 'px';
    this.tooltipNode.style.top = (rect.top - 43) + 'px';
  }

  recalc() {
    if (this.isCheckbox()) {
      return;
    }

    const config = this.config || {};

    if (config.enableContentWidth) {
      const input = this.getInput();

      if (input.value.length) {
        input.style.minWidth = '100%';
        input.style.width = (input.value.length + 0.75) + "ch";
      } else {
        input.style.minWidth = '';
        input.style.width = '';
      }
    } else {
      this.showTooltipIfOverflow();
    }
  }

  protected setValue(byUser = false) {
    const config = this.config || {};
    this.value = this.outerScope.getValue(this.id, this.index);
    const input = this.getInput();

    if (this.value && typeof config.roundValue === 'number') {
      this.value = roundValue(this.value, config.roundValue) + '';
    }

    if (!byUser) {
      if (this.isCheckbox()) {
        input.checked = this.value || false;
      } else if (this.isNumber()) {
        input.value = this.value === 0 ? '0' : (this.value || '');
      } else {
        input.value = this.value || '';
      }
    }

    this.value$.update(this.value);
    this.recalc();
  }

  onEvent() {
    const input = this.getInput();

    let value;

    if (this.isCheckbox()) {
      value = input.checked;
    } else if (this.isNumber()) {
      value = +input.value;
    } else {
      value = input.value;
    }

    if (this.value !== value) {
      this.outerScope.setValue(this.id, value, this.index, true);
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
}

componentsRegistryService.define(InputComponent);

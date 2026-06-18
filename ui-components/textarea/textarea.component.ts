import { AbstractComponent, componentsRegistryService } from "cruzo";
import { UI_KIT } from "../const";

export interface TextareaConfig {
  maxlength?: number;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  inputmode?: string;
  name?: string;
  id?: string;
  rows?: number;
}

export function TextareaConfig(params: TextareaConfig) {
  return Object.assign({}, params);
}

export interface TextareaState {
  cls?: string;
}

export class TextareaComponent extends AbstractComponent<TextareaConfig, any, TextareaState> {
  static selector = "textarea-component";
  hasConfig = true;
  hasOuterBucket = true;

  getHTML() {
    return `<textarea
        class="${UI_KIT}_textarea {{root.state$::rx?.cls}}"
        name="{{root.config$::rx?.name}}"
        id="{{root.config$::rx?.id}}"
        required="{{root.config$::rx?.required}}"
        placeholder="{{root.config$::rx?.placeholder}}"
        maxlength="{{root.config$::rx?.maxlength}}"
        autocomplete="{{root.config$::rx?.autocomplete}}"
        inputmode="{{root.config$::rx?.inputmode}}"
        rows="{{root.config$::rx?.rows || 3}}"
        oninput="{{root.onEvent()}}"
        ></textarea>`;
  }

  getTextarea() {
    return this.node.firstElementChild as HTMLTextAreaElement;
  }

  onEvent() {
    const input = this.getTextarea();
    const value = input.value;

    if (this.value !== value) {
      this.outerBucket.setValue(this.id, value, this.index, true);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.state == null) {
      this.outerBucket.setState(this.id, { cls: "" }, this.index);
    }

    this.newRxFunc((value) => {
      const input = this.getTextarea();
      if (!input || value === input.value) return;
      input.value = value ?? "";
    }, this.value$);
  }
}

componentsRegistryService.define(TextareaComponent);

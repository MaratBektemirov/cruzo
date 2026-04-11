import { AbstractComponent, componentsRegistryService } from "../../lib";
import { UI_KIT } from "../vars";

interface ButtonGroupConfigParams {
  items: Array<{ label: string; value: string }>;
}

export function ButtonGroupConfig(params: ButtonGroupConfigParams) {
  return Object.assign({}, params);
}

export class ButtonGroupComponent extends AbstractComponent<ButtonGroupConfigParams> {
  static selector = "button-group-component";
  hasConfig = true;
  hasOuterBucket = true;

  getHTML() {
    return `<div class="${UI_KIT}_button-group">
        <button
          repeat="{{root.config?.items}}"
          class="${UI_KIT}_button-group-item {{this.value === root.value$::rx ? '${UI_KIT}_button-group-item-active' : ''}}"
          onclick="{{root.select(this.value)}}"
          >
          {{this.label}}
        </button>
      </div>`;
  }

  select(value: string) {
    this.outerBucket.setValue(this.id, value, this.index, true);
  }
}

componentsRegistryService.define(ButtonGroupComponent);

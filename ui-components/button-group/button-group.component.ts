import { AbstractComponent, componentsRegistryService } from "cruzo";
import styles from "./button-group.component.module.css";

interface ButtonGroupConfigParams {
  items: Array<{ label: string; value: string }>;
}

export function ButtonGroupConfig(params: ButtonGroupConfigParams) {
  return Object.assign({}, params);
}

export class ButtonGroupComponent extends AbstractComponent<ButtonGroupConfigParams> {
  static selector = "button-group-component";
  hasConfig = true;
  hasOuterScope = true;

  getHTML() {
    return `<div class="${styles.buttonGroup}">
      <button
        repeat="root.config?.items"
        class="${styles.buttonGroupItem} {{this.value === root.value$::rx ? '${styles.buttonGroupItemActive}' : ''}}"
        onclick="root.select(this.value)"
      >
        {{this.label}}
      </button>
    </div>`;
  }

  select(value: string) {
    this.outerScope.setValue(this.id, value, this.index, true);
  }
}

componentsRegistryService.define(ButtonGroupComponent);

import { AbstractComponent, componentsRegistryService } from "cruzo";
import { UI_KIT } from "../const";

export interface SelectItem {
  label: string;
  value: any;
}

export interface SelectConfigParams {
  placeholder: string;
  multi?: boolean;
  getItems: (...args: any[]) => Promise<SelectItem[]>;
}

export function SelectConfig(params: SelectConfigParams) {
  return Object.assign({}, params);
}

export class SelectComponent extends AbstractComponent<SelectConfigParams, Record<string, boolean>> {
  static selector = "select-component";
  hasConfig = true;
  hasOuterBucket = true;

  open$ = this.newRx(false);
  items$ = this.newRx<SelectItem[]>(null);
  selectedLabel$ = this.newRx("");

  private itemsLoadToken: symbol = Symbol();

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.handleOutsideClick);

    this.newRxFunc(async (value, cfg) => {
      const token = Symbol();
      this.itemsLoadToken = token;

      const items = await cfg.getItems(value, this.open$.actual);
      if (this.itemsLoadToken !== token) return;

      this.items$.update(items || []);

      const selectedItems = value ? items.filter((item) => value[item.value]).map((item) => item.label) : [];

      if (selectedItems.length) {
        this.selectedLabel$.update(selectedItems.join(', '));
      } else {
        this.selectedLabel$.update(this.config$.actual.placeholder);
      }
    }, this.value$, this.config$);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick);
    super.disconnectedCallback();
  }

  private handleOutsideClick = (e: MouseEvent) => {
    if (this.node && !this.node.contains(e.target as Node)) {
      this.open$.update(false);
    }
  };

  toggle() {
    this.open$.update(!this.open$.actual);
  }

  toggleItem(item: SelectItem) {
    const curValue = this.value || {};

    const value = this.config.multi
      ? Object.assign({}, curValue)
      : { [item.value]: curValue[item.value] };

    value[item.value] = !value[item.value];

    this.outerBucket.setValue(this.id, value, this.index, true);

    if (!this.config.multi) this.open$.update(false);
  }

  getHTML() {
    return `<div class="${UI_KIT}_select">
        <button type="button" class="${UI_KIT}_trigger" onclick="{{root.toggle()}}">
          <span class="${UI_KIT}_value">{{root.selectedLabel$::rx}}</span>
          <span class="${UI_KIT}_caret {{root.open$::rx ? '${UI_KIT}_caret-open' : ''}}">▴</span>
        </button>
        <div class="${UI_KIT}_dropdown" style="{{root.open$::rx ? '' : 'display:none'}}">
          <div class="${UI_KIT}_list" style="{{root.items$::rx && root.items$::rx.length ? '' : 'display:none'}}">
            <div
              repeat="{{root.items$::rx}}"
              class="${UI_KIT}_option {{root.value$::rx?.[this.value] ? '${UI_KIT}_option-selected' : ''}}"
              onclick="{{root.toggleItem(this)}}">
              <label class="${UI_KIT}_checkbox" attached="{{root.config$::rx.multi}}">
                <input
                  type="checkbox"
                  class="${UI_KIT}_checkbox-input"
                  checked="{{root.value$::rx?.[this.value]}}"
                  />
              </label>
              <span class="${UI_KIT}_option-label">{{this.label}}</span>
            </div>
          </div>
          <div class="${UI_KIT}_empty" style="{{root.items$::rx && root.items$::rx.length ? 'display:none' : ''}}">Нет вариантов</div>
        </div>
      </div>`;
  }
}

componentsRegistryService.define(SelectComponent);

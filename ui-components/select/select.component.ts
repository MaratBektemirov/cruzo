import { AbstractComponent, componentsRegistryService } from "../../lib";

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
  hasOuterScope = true;

  open$ = this.newRx(false);

  items$ = this.newRx<SelectItem[]>(null);

  selectedLabel$ = this.newRx("");

  getItems$ = this.newRxFunc(async (val, items) => {
    if (!val || !items?.length) return;

    const selectedItems = items.filter((item) => val[item.value]).map((item) => item.label);

    if (selectedItems.length) {
      this.selectedLabel$.update(selectedItems.join(', '));
    } else if (this.config) {
      this.selectedLabel$.update(this.config.placeholder);
    }
  }, this.value$, this.items$)

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.handleOutsideClick);
    this.getItems();
  }

  async getItems() {
    const items = await this.config.getItems();
    this.items$.update(items);
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
      : {[item.value]: curValue[item.value]};

    value[item.value] = !value[item.value];

    this.outerScope.setValue(this.id, value, this.index, true);

    if (!this.config.multi) this.open$.update(false);
  }

  getItemContent() {
    let checkbox = this.config.multi ? `<label class="checkbox">
        <input
          type="checkbox"
          checked="{{root.value$::rx?.[this.value]}}"
          />
      </label>`: '';

    return `${checkbox} <span>{{this.label}}</span>`;
  }

  getHTML() {
    return `<div class="cruzo-ui-component_select">
        <button type="button" class="cruzo-ui-component_trigger" onclick="{{root.toggle()}}">
          <span class="cruzo-ui-component_value">{{root.selectedLabel$::rx}}</span>
          <span class="cruzo-ui-component_caret {{root.open$::rx ? 'cruzo-ui-component_caret-open' : ''}}">▴</span>
        </button>
        <div class="cruzo-ui-component_dropdown" style="{{root.open$::rx ? '' : 'display:none'}}">
          <div class="cruzo-ui-component_list" style="{{root.items$::rx && root.items$::rx.length ? '' : 'display:none'}}">
            <div
              repeat="{{root.items$::rx}}"
              class="cruzo-ui-component_option {{root.value$::rx?.[this.value] ? 'cruzo-ui-component_option-selected' : ''}}"
              onclick="{{root.toggleItem(this)}}">
              ${this.getItemContent()}
            </div>
          </div>
          <div class="cruzo-ui-component_empty" style="{{root.items$::rx && root.items$::rx.length ? 'display:none' : ''}}">Нет вариантов</div>
        </div>
      </div>`;
  }
}

componentsRegistryService.define(SelectComponent);

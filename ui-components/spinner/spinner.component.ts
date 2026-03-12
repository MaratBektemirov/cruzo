import { AbstractComponent, componentsRegistryService, Template } from "../../lib";

export enum SpinnerValue {
  "inactive" = "inactive",
  "active" = "active",
}

export interface SpinnerConfigParams {
  color?: string;
  size?: string;
}

export function SpinnerConfig(params: SpinnerConfigParams) {
  return Object.assign({}, params);
}

const DESTROY_STATES: SpinnerValue[] = [
  SpinnerValue.inactive,
];

export class SpinnerComponent extends AbstractComponent<SpinnerConfigParams, SpinnerValue> {
  static selector = '[is="spinner"]';
  hasConfig = true;
  hasOuterScope = true;
  isDirective = true;

  private contentNode: HTMLElement = null;
  private hostPositionWasPatched = false;
  private hostPrevPosition = "";

  getSpinnerStyle(): string {
    const parts: string[] = [];
    if (this.config.color) parts.push(`--spinner-color:${this.config.color}`);
    if (this.config.size) parts.push(`--spinner-size:${this.config.size}`);
    return parts.join(";");
  }

  getHTML() {
    return `<div let-value="{{root.value$::rx}}"
        class="cruzo-ui-component_spinner {{root.getCls(value)}}"
        style="{{root.getSpinnerStyle()}}">
        <div class="cruzo-ui-component_spinner-dot cruzo-ui-component_spinner-dot-1"></div>
        <div class="cruzo-ui-component_spinner-dot cruzo-ui-component_spinner-dot-2"></div>
        <div class="cruzo-ui-component_spinner-dot cruzo-ui-component_spinner-dot-3"></div>
      </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.syncContentFromState();
  }

  getCls(value: SpinnerValue): string {
    switch (value) {
      case SpinnerValue.inactive:
        return "cruzo-ui-component--inactive";
      case SpinnerValue.active:
        return "cruzo-ui-component--active";
      default:
        return "cruzo-ui-component--inactive";
    }
  }

  private syncContentFromState() {
    if (DESTROY_STATES.includes(this.value) || !this.value) {
      this.destroyContent();
    } else {
      this.ensureContent();
    }
  }

  private ensureContent() {
    if (this.contentNode) return;
    this.contentNode = document.createElement("div");
    this.contentNode.innerHTML = this.getHTML();

    this.contentNode.classList.add('cruzo-ui-component_spinner-wrapper');

    const styles = getComputedStyle(this.node)
    const bgImage = styles.backgroundImage

    if (bgImage.includes('gradient')) {
      this.contentNode.style.backgroundImage = bgImage
    } else {
      this.contentNode.style.backgroundColor = styles.backgroundColor
    }

    this.contentNode.style.borderRadius = styles.borderRadius

    this.ensureHostPositionForOverlay();

    this.template = new Template({
      node: this.contentNode,
      self: () => this,
      selector: this.selector,
      __tplFile: this.__tplFile,
    });

    this.template.detectChanges();
    this.node.appendChild(this.contentNode);
  }

  private ensureHostPositionForOverlay() {
    const position = getComputedStyle(this.node).position;

    if (position !== "static") return;

    this.hostPositionWasPatched = true;
    this.hostPrevPosition = this.node.style.position || "";
    this.node.style.position = "relative";
  }

  private destroyContent() {
    if (this.template) {
      this.template.fullDestroy();
      this.template = null;
    }

    if (this.contentNode) {
      this.contentNode.remove();
      this.contentNode = null;
    }

    if (this.hostPositionWasPatched) {
      this.node.style.position = this.hostPrevPosition;
      this.hostPositionWasPatched = false;
      this.hostPrevPosition = "";
    }
  }

  protected setValue(byUser = false) {
    this.value = this.outerScope.getValue(this.id, this.index) ?? SpinnerValue.inactive;
    this.value$.update(this.value);
    this.syncContentFromState();
  }

  disconnectedCallback() {
    this.destroyContent();
    super.disconnectedCallback();
  }
}

componentsRegistryService.define(SpinnerComponent);

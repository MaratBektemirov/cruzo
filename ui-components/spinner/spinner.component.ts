import { AbstractComponent, componentsRegistryService, Template } from "../../lib";
import { UI_KIT } from "../vars";

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
  hasOuterBucket = true;
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
        class="${UI_KIT}_spinner {{root.getCls(value)}}"
        style="{{root.getSpinnerStyle()}}">
        <div class="${UI_KIT}_spinner-dot ${UI_KIT}_spinner-dot-1"></div>
        <div class="${UI_KIT}_spinner-dot ${UI_KIT}_spinner-dot-2"></div>
        <div class="${UI_KIT}_spinner-dot ${UI_KIT}_spinner-dot-3"></div>
      </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.syncContentFromState();
  }

  getCls(value: SpinnerValue): string {
    switch (value) {
      case SpinnerValue.inactive:
        return `${UI_KIT}--inactive`;
      case SpinnerValue.active:
        return `${UI_KIT}--active`;
      default:
        return `${UI_KIT}--inactive`;
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

    this.contentNode.classList.add(`${UI_KIT}_spinner-wrapper`);

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
    this.value = this.outerBucket.getValue(this.id, this.index) ?? SpinnerValue.inactive;
    this.value$.update(this.value);
    this.syncContentFromState();
  }

  disconnectedCallback() {
    this.destroyContent();
    super.disconnectedCallback();
  }
}

componentsRegistryService.define(SpinnerComponent);

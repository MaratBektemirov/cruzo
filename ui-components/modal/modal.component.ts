import { ComponentsList } from "../../lib/interfaces";
import { AbstractComponent, componentsRegistryService, Template } from "../../lib";

declare global {
  interface ScopeEventMap {
    closeModal: { isOK: boolean };
  }
}

interface ModalConfigParams {
  bodyContent: string;
  dependencies?: Set<string>;
}

export function ModalConfig(params: ModalConfigParams) {
  return Object.assign({}, params);
}

const modalList: ComponentsList = [];

export class ModalComponent extends AbstractComponent<ModalConfigParams> {
  static selector = "modal-component";
  hasOuterScope = true;
  hasConfig = true;

  getCloseRx = () => this.newRxEventFromScopeByIndex(this.outerScope, this.id, 'closeModal');
  closeEvents$: ReturnType<typeof this.getCloseRx>;

  getHTML() {
    return `<div class="cruzo-ui-component_modal-backdrop" onclick="{{this.closeModal(false)}}">
        <div class="cruzo-ui-component_modal" onclick="{{event.stopPropagation()}}">${this.config.bodyContent}</div>
      </div>`;
  }

  constructor() {
    super();
  }

  static attach(componentId: string, scopeId: number | string) {
    const modalNode = Template.stringToNode(`<modal-component component-id="${componentId}" scope-id="${scopeId}"></modal-component>`);
    document.body.appendChild(modalNode);

    componentsRegistryService.connectBySelector(ModalComponent.selector, modalList, document.body);
  }

  closeModal(isOK: boolean) {
    this.outerScope.emitEvent(this.id, 'closeModal', { data: { isOK } });
  }

  destroyModal() {
    const index = modalList.indexOf(this);
    if (index > -1) modalList.splice(index, 1);

    this.disconnectedCallback();
  }

  public connectedCallback() {
    super.connectedCallback();

    this.closeEvents$ = this.getCloseRx();

    this.newRxFunc((events) => {
      if (events && events[this.index]) {
        events[this.index] = null
        this.destroyModal()
      }
    }, this.closeEvents$)

    if (this.config.dependencies) {
      this.dependencies = this.config.dependencies;
      this.updateDependencies();
    }
  }
}

componentsRegistryService.define(ModalComponent);
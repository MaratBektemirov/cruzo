import { ComponentsList } from "../../lib/interfaces";
import { AbstractComponent, componentsRegistryService, Template } from "../../lib";
import { UI_KIT } from "../vars";

declare global {
  interface BucketEventMap {
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
  hasOuterBucket = true;
  hasConfig = true;

  getCloseRx = () => this.newRxEventFromBucketByIndex(this.outerBucket, this.id, 'closeModal');
  closeEvents$: ReturnType<typeof this.getCloseRx>;

  getHTML() {
    return `<div class="${UI_KIT}_modal-backdrop" onclick="{{this.closeModal(false)}}">
        <div class="${UI_KIT}_modal" onclick="{{event.stopPropagation()}}">${this.config.bodyContent}</div>
      </div>`;
  }

  constructor() {
    super();
  }

  static attach(componentId: string, bucketId: number | string) {
    const modalNode = Template.stringToNode(`<modal-component component-id="${componentId}" bucket-id="${bucketId}"></modal-component>`);
    document.body.appendChild(modalNode);

    componentsRegistryService.connectBySelector(ModalComponent.selector, modalList, document.body);
  }

  closeModal(isOK: boolean) {
    this.outerBucket.emitEvent(this.id, 'closeModal', { data: { isOK } });
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
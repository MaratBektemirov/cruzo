import { AbstractComponent, componentsRegistryService, type Rx } from "cruzo";

interface UploadConfigParams {
  accept: string
}

export function UploadConfig(params: UploadConfigParams) {
  return Object.assign({}, params);
}

export class UploadComponent extends AbstractComponent<UploadConfigParams> {
  static selector = "upload-component";
  hasOuterScope = true;
  hasConfig = true;
  reset$: Rx<any>;

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();

    this.reset$ = this.outerScope.newRxValue(this.id, (value) => {
      if (!value) {
        if (this.template) this.template.fullDestroy();
        this.initTemplate();
      }
    }, this.rxList);
  }

  disconnectedCallback(): void {
    this.reset$.unsubscribe();
    super.disconnectedCallback();
  }

  getHTML() {
    return `<input accept="${this.config.accept}" type="file" onchange="this.upload(event)"/>`
  }

  upload = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    this.outerScope.setValue(this.id, files, this.index, true);
  }
}

componentsRegistryService.define(UploadComponent);
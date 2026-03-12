import { AbstractComponent, componentsRegistryService } from "../../lib";

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

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  getHTML() {
    return `<input class="cruzo-ui-component_upload" accept="${this.config.accept}" type="file" onchange="{{this.upload(event)}}"/>`
  }

  upload = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    this.outerScope.setValue(this.id, files, this.index, true);
  }
}

componentsRegistryService.define(UploadComponent);
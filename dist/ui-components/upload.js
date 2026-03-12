var a = Object.defineProperty;
var i = (e, t, c) => t in e ? a(e, t, { enumerable: !0, configurable: !0, writable: !0, value: c }) : e[t] = c;
var n = (e, t, c) => i(e, typeof t != "symbol" ? t + "" : t, c);
import { c as r, A as l } from "../component-CH-TJ5VF.js";
function d(e) {
  return Object.assign({}, e);
}
class o extends l {
  constructor() {
    super();
    n(this, "hasOuterScope", !0);
    n(this, "hasConfig", !0);
    n(this, "upload", (c) => {
      const s = c.target.files;
      this.outerScope.setValue(this.id, s, this.index, !0);
    });
  }
  async connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  getHTML() {
    return `<input class="cruzo-ui-component_upload" accept="${this.config.accept}" type="file" onchange="{{this.upload(event)}}"/>`;
  }
}
n(o, "selector", "upload-component");
r.define(o);
export {
  o as UploadComponent,
  d as UploadConfig
};
//# sourceMappingURL=upload.js.map

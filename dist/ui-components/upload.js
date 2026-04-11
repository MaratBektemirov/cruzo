var a = Object.defineProperty;
var i = (e, t, c) => t in e ? a(e, t, { enumerable: !0, configurable: !0, writable: !0, value: c }) : e[t] = c;
var n = (e, t, c) => i(e, typeof t != "symbol" ? t + "" : t, c);
import { c as r, A as l } from "../component-DBoFvGq8.js";
import { UI_KIT as u } from "./const.js";
function g(e) {
  return Object.assign({}, e);
}
class s extends l {
  constructor() {
    super();
    n(this, "hasOuterBucket", !0);
    n(this, "hasConfig", !0);
    n(this, "upload", (c) => {
      const o = c.target.files;
      this.outerBucket.setValue(this.id, o, this.index, !0);
    });
  }
  async connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  getHTML() {
    return `<input class="${u}_upload" accept="${this.config.accept}" type="file" onchange="{{this.upload(event)}}"/>`;
  }
}
n(s, "selector", "upload-component");
r.define(s);
export {
  s as UploadComponent,
  g as UploadConfig
};
//# sourceMappingURL=upload.js.map

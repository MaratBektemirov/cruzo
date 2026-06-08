var a = Object.defineProperty;
var r = (e, t, c) => t in e ? a(e, t, { enumerable: !0, configurable: !0, writable: !0, value: c }) : e[t] = c;
var n = (e, t, c) => r(e, typeof t != "symbol" ? t + "" : t, c);
import { componentsRegistryService as i, AbstractComponent as l } from "cruzo";
import { UI_KIT as u } from "./const.js";
function g(e) {
  return Object.assign({}, e);
}
class o extends l {
  constructor() {
    super();
    n(this, "hasOuterBucket", !0);
    n(this, "hasConfig", !0);
    n(this, "upload", (c) => {
      const s = c.target.files;
      this.outerBucket.setValue(this.id, s, this.index, !0);
    });
  }
  async connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  getHTML() {
    return `<input class="${u}_upload" accept="{{root.config$::rx.accept}}" type="file" onchange="{{this.upload(event)}}"/>`;
  }
}
n(o, "selector", "upload-component");
i.define(o);
export {
  o as UploadComponent,
  g as UploadConfig
};
//# sourceMappingURL=upload.js.map

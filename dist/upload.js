var o = Object.defineProperty;
var r = (e, t, s) => t in e ? o(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var i = (e, t, s) => r(e, typeof t != "symbol" ? t + "" : t, s);
import { componentsRegistryService as a, AbstractComponent as l } from "cruzo";
function h(e) {
  return Object.assign({}, e);
}
class c extends l {
  constructor() {
    super();
    i(this, "hasOuterScope", !0);
    i(this, "hasConfig", !0);
    i(this, "reset$");
    i(this, "upload", (s) => {
      const n = s.target.files;
      this.outerScope.setValue(this.id, n, this.index, !0);
    });
  }
  async connectedCallback() {
    super.connectedCallback(), this.reset$ = this.outerScope.newRxValue(this.id, (s) => {
      s || (this.template && this.template.fullDestroy(), this.initTemplate());
    }, this.rxList);
  }
  disconnectedCallback() {
    this.reset$.unsubscribe(), super.disconnectedCallback();
  }
  getHTML() {
    return `<input accept="${this.config.accept}" type="file" onchange="this.upload(event)"/>`;
  }
}
i(c, "selector", "upload-component");
a.define(c);
export {
  c as UploadComponent,
  h as UploadConfig
};
//# sourceMappingURL=upload.js.map

var n = Object.defineProperty;
var u = (s, t, r) => t in s ? n(s, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : s[t] = r;
var e = (s, t, r) => u(s, typeof t != "symbol" ? t + "" : t, r);
import { Rx as x, RxFunc as c } from "./rx.js";
class L {
  constructor() {
    e(this, "rxList", null);
  }
  newRx(t = null) {
    this.rxList ?? (this.rxList = []);
    const r = new x(this.rxList, (i) => i);
    return r.update(t), r;
  }
  newRxFunc(t, ...r) {
    return this.rxList ?? (this.rxList = []), new c(this.rxList, t, { immediate: !0 }, ...r);
  }
}
export {
  L as AbstractService
};
//# sourceMappingURL=service.js.map

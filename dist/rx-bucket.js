var l = Object.defineProperty;
var x = (u, t, e) => t in u ? l(u, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : u[t] = e;
var i = (u, t, e) => x(u, typeof t != "symbol" ? t + "" : t, e);
import { Rx as f } from "./rx.js";
const a = class a {
  constructor(t) {
    i(this, "id");
    i(this, "values", /* @__PURE__ */ Object.create(null));
    i(this, "states", /* @__PURE__ */ Object.create(null));
    i(this, "rx", {
      eventsByNames: {},
      valuesByIndex: {},
      statesByIndex: {},
      configs: {}
    });
    i(this, "_ids", []);
    this.descriptors = t, this.id = a.lastId++, this._ids = a.idsArr(t);
    for (let e = 0; e < this._ids.length; e++) {
      const s = this._ids[e];
      this.initId(s);
    }
  }
  initId(t) {
    var s;
    this.rx.valuesByIndex[t] = {}, this.rx.statesByIndex[t] = {}, this.rx.eventsByNames[t] = /* @__PURE__ */ Object.create(null), this.values[t] = /* @__PURE__ */ Object.create(null), this.states[t] = /* @__PURE__ */ Object.create(null);
    const e = (s = this.descriptors[t]) == null ? void 0 : s.config;
    e && (this.rx.configs[t] = new f([], (r) => r, e));
  }
  getValue(t, e = "0") {
    const s = this.values[t];
    if (!s) throw new Error(`Bucket value for id:"${String(t)}" not found`);
    return s[e];
  }
  getState(t, e = "0") {
    const s = this.states[t];
    if (!s) throw new Error(`Bucket state for id:"${String(t)}" not found`);
    return s[e];
  }
  getConfigRx(t) {
    if (!this.rx.configs[t]) throw new Error(`Bucket config rx for id:"${String(t)}" not found`);
    return this.rx.configs[t];
  }
  setValue(t, e, s = "0", r = !1) {
    if (!this.values[t])
      throw new Error(
        `Cannot set for unknown id "${t}" (descriptor not found)`
      );
    this.values[t][s] = e, this.execRxs(this.rx.valuesByIndex[t][s], e, s + "", r);
  }
  setState(t, e, s = "0", r = !1) {
    if (!this.states[t])
      throw new Error(
        `Cannot set state for unknown id "${t}" (descriptor not found)`
      );
    this.states[t][s] = e, this.execRxs(this.rx.statesByIndex[t][s], e, s + "", r);
  }
  setConfig(t, e) {
    if (!this.descriptors[t])
      throw new Error(
        `Cannot set config for unknown id "${t}" (descriptor not found)`
      );
    this.descriptors[t].config = e, this.rx.configs[t].update(e);
  }
  setValues(t, e = !1) {
    return this._setValues(t, e);
  }
  setValuesAtIndex(t, e = "0", s = !1) {
    return this._setValues(a.wrapAtIndex(t, e), s);
  }
  setStates(t, e = !1) {
    return this._setStates(t, e);
  }
  setStatesAtIndex(t, e = "0", s = !1) {
    return this._setStates(a.wrapAtIndex(t, e), s);
  }
  newRxEvent(t, e, s, r) {
    if (!this.values[t])
      throw new Error(
        `Cannot create event rx for unknown id "${t}" (descriptor not found)`
      );
    const n = this.rx.eventsByNames[t];
    n[e] = n[e] || [];
    const o = new f(n[e], s);
    return r.push(o), o;
  }
  newRxValue(t, e, s, r = null, n = "0") {
    if (!this.values[t])
      throw new Error(
        `Cannot create value rx for unknown id "${t}" (descriptor not found)`
      );
    const o = this.rx.valuesByIndex[t];
    o[n] || (o[n] = []);
    const c = new f(o[n], e, r);
    return s.push(c), c;
  }
  newRxState(t, e, s, r = null, n = "0") {
    if (!this.states[t])
      throw new Error(
        `Cannot create state rx for unknown id "${t}" (descriptor not found)`
      );
    const o = this.rx.statesByIndex[t];
    o[n] || (o[n] = []);
    const c = new f(o[n], e, r);
    return s.push(c), c;
  }
  emitEvent(t, e, s, r = "0") {
    if (!this.values[t])
      throw new Error(
        `Cannot emit event for unknown id "${t}" (descriptor not found)`
      );
    if (this.rx.eventsByNames[t] && this.rx.eventsByNames[t][e])
      for (const n of this.rx.eventsByNames[t][e]) n.update(s, r);
  }
  _setValues(t, e) {
    for (let s in t) {
      const r = t[s];
      if (!this.values[s])
        throw new Error(
          `Cannot set for unknown id "${String(s)}" (descriptor not found)`
        );
      for (let n in r)
        this.values[s][n] = r[n], this.execRxs(this.rx.valuesByIndex[s][n], r, n + "", e);
    }
  }
  _setStates(t, e) {
    for (let s in t) {
      const r = t[s];
      if (!this.states[s])
        throw new Error(
          `Cannot set state for unknown id "${String(s)}" (descriptor not found)`
        );
      for (let n in r)
        this.states[s][n] = r[n], this.execRxs(this.rx.statesByIndex[s][n], r[n], n, e);
    }
  }
  execRxs(t, e, s, r) {
    if (t)
      for (let n = 0; n < t.length; n++) t[n].update(e, s, r);
  }
  static idsArr(t) {
    return Object.keys(t);
  }
  static wrapAtIndex(t, e = "0") {
    const s = /* @__PURE__ */ Object.create(null);
    for (let r in t) s[r] = { [e]: t[r] };
    return s;
  }
};
i(a, "lastId", 0);
let h = a;
export {
  h as RxBucket
};
//# sourceMappingURL=rx-bucket.js.map

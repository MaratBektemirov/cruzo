var O = Object.defineProperty;
var k = (h, t, r) => t in h ? O(h, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : h[t] = r;
var i = (h, t, r) => k(h, typeof t != "symbol" ? t + "" : t, r);
import { R as x } from "./component-CK41B9Gk.js";
import { A as V, a as N, T as b, c as I } from "./component-CK41B9Gk.js";
import { A as P, R as z, r as H } from "./router.service-7rnmEkH3.js";
import { arrayToHash as J, debounce as Q, delay as _ } from "./utils.js";
const l = class l {
  constructor(t) {
    i(this, "id");
    i(this, "values", /* @__PURE__ */ Object.create(null));
    i(this, "states", /* @__PURE__ */ Object.create(null));
    i(this, "rx", {
      eventsByNames: {},
      values: {},
      states: {},
      allValues: [],
      allStates: []
    });
    i(this, "_ids", []);
    this.descriptors = t, this.id = l.lastId++, this._ids = l.idsArr(t);
    for (let r = 0; r < this._ids.length; r++) {
      const e = this._ids[r];
      this.initId(e);
    }
  }
  initId(t) {
    this.rx.values[t] = [], this.rx.states[t] = [], this.rx.eventsByNames[t] = /* @__PURE__ */ Object.create(null), this.values[t] = /* @__PURE__ */ Object.create(null), this.states[t] = /* @__PURE__ */ Object.create(null);
  }
  addDescriptor(t, r) {
    if (this.descriptors[t])
      throw new Error(`Descriptor "${String(t)}" already exists`);
    this._ids.push(t), this.descriptors[t] = r, this.initId(t);
  }
  removeDescriptor(t) {
    const r = this._ids.indexOf(t);
    if (r === -1) throw new Error(`Descriptor "${String(t)}" not found`);
    this._ids.splice(r, 1), delete this.values[t], delete this.states[t], delete this.descriptors[t], delete this.rx.values[t], delete this.rx.states[t], delete this.rx.eventsByNames[t];
  }
  getValue(t, r = "0") {
    const e = this.values[t];
    if (!e)
      throw new Error(`Bucket value bucket "${String(t)}" not found`);
    return e[r];
  }
  getState(t, r = "0") {
    const e = this.states[t];
    if (!e)
      throw new Error(`Bucket state bucket "${String(t)}" not found`);
    return e[r];
  }
  setValue(t, r, e = "0", s = !1) {
    if (!this.values[t])
      throw new Error(
        `Cannot set for unknown id "${t}" (descriptor not found)`
      );
    this.values[t][e] = r, this.execRxs(this.rx.values[t], r, e + "", s), this.updateAllValues();
  }
  setState(t, r, e = "0", s = !1) {
    if (!this.states[t])
      throw new Error(
        `Cannot set state for unknown id "${t}" (descriptor not found)`
      );
    this.states[t][e] = r, this.execRxs(this.rx.states[t], r, e + "", s), this.updateAllStates();
  }
  setValues(t, r = !1) {
    return this._set(t, r);
  }
  setValuesAtIndex(t, r = "0", e = !1) {
    return this._set(l.wrapAtIndex(t, r), e);
  }
  setStates(t, r = !1) {
    return this._setStates(t, r);
  }
  setStatesAtIndex(t, r = "0", e = !1) {
    return this._setStates(l.wrapAtIndex(t, r), e);
  }
  newRxEvent(t, r, e, s) {
    if (!this.values[t])
      throw new Error(
        `Cannot create event rx for unknown id "${t}" (descriptor not found)`
      );
    const n = this.rx.eventsByNames[t];
    n[r] = n[r] || [];
    const a = new x(n[r], e);
    return s.push(a), a;
  }
  newRxAllValues(t) {
    return new x(this.rx.allValues, t);
  }
  newRxAllStates(t) {
    return new x(this.rx.allStates, t);
  }
  newRxValue(t, r, e) {
    if (!this.values[t])
      throw new Error(
        `Cannot create value rx for unknown id "${t}" (descriptor not found)`
      );
    const s = new x(this.rx.values[t], r);
    return e.push(s), s;
  }
  newRxState(t, r, e) {
    if (!this.states[t])
      throw new Error(
        `Cannot create state rx for unknown id "${t}" (descriptor not found)`
      );
    const s = new x(this.rx.states[t], r);
    return e.push(s), s;
  }
  emitEvent(t, r, e, s = "0") {
    if (!this.values[t])
      throw new Error(
        `Cannot emit event for unknown id "${t}" (descriptor not found)`
      );
    if (this.rx.eventsByNames[t] && this.rx.eventsByNames[t][r])
      for (const n of this.rx.eventsByNames[t][r]) n.update(e, s);
  }
  _set(t, r) {
    for (let e in t) {
      const s = t[e];
      if (!this.values[e])
        throw new Error(
          `Cannot set for unknown id "${String(e)}" (descriptor not found)`
        );
      for (let n in s)
        this.values[e][n] = s[n], this.execRxs(this.rx.values[e], s[n], n, r);
    }
    this.updateAllValues();
  }
  _setStates(t, r) {
    for (let e in t) {
      const s = t[e];
      if (!this.states[e])
        throw new Error(
          `Cannot set state for unknown id "${String(e)}" (descriptor not found)`
        );
      for (let n in s)
        this.states[e][n] = s[n], this.execRxs(this.rx.states[e], s[n], n, r);
    }
    this.updateAllStates();
  }
  updateAllValues() {
    let t = 0;
    for (; t < this.rx.allValues.length; )
      this.rx.allValues[t].update(this.values), t++;
  }
  updateAllStates() {
    let t = 0;
    for (; t < this.rx.allStates.length; )
      this.rx.allStates[t].update(this.states), t++;
  }
  execRxs(t, r, e, s) {
    for (let n = 0; n < t.length; n++)
      t[n].update(r, e, s);
  }
  static idsArr(t) {
    return Object.keys(t);
  }
  static ids(t) {
    const r = /* @__PURE__ */ Object.create(null), e = l.idsArr(t);
    for (let s = 0; s < e.length; s++) {
      const n = e[s];
      r[n] = n;
    }
    return r;
  }
  static wrapAtIndex(t, r = "0") {
    const e = /* @__PURE__ */ Object.create(null);
    for (let s in t)
      e[s] = { [r]: t[s] };
    return e;
  }
  ids() {
    return l.ids(this.descriptors);
  }
  idsArr() {
    return l.idsArr(this.descriptors);
  }
};
i(l, "lastId", 0);
let B = l;
class g extends Error {
  constructor(r, e, s, n) {
    super(r);
    i(this, "name", "HttpError");
    this.message = r, this.status = e, this.url = s, this.data = n;
  }
}
const w = class w {
  constructor(t, r = {}, e = !1, s = 0) {
    i(this, "cache", {});
    i(this, "factory", (t) => {
      const r = this, e = (n) => ({
        ...n || {},
        signal: t
      });
      return {
        request: (n, a, o) => r.request(n, a, e(o)),
        clearCache: (n, a, o) => r.clearCache(n, a, e(o)),
        get: (n, a) => r.get(n, e(a)),
        post: (n, a) => r.post(n, e(a)),
        put: (n, a) => r.put(n, e(a)),
        patch: (n, a) => r.patch(n, e(a)),
        delete: (n, a) => r.delete(n, e(a))
      };
    });
    this.rootUrl = t, this.interceptors = r, this.withCredentials = e, this.cacheTime = s;
  }
  normalizeHeaders(t) {
    const r = {};
    if (!t) return r;
    for (const [e, s] of Object.entries(t))
      s != null && (r[e.toLowerCase()] = String(s));
    return r;
  }
  static getQueryString(t) {
    if (!t) return "";
    const r = new URLSearchParams();
    for (const [s, n] of Object.entries(t))
      n != null && r.append(s, String(n));
    const e = r.toString();
    return e ? `?${e}` : "";
  }
  stable(t) {
    return t == null ? "" : typeof t != "object" ? String(t) : Array.isArray(t) ? `[${t.map((e) => this.stable(e)).join(",")}]` : `{${Object.keys(t).sort().map((e) => `${e}:${this.stable(t[e])}`).join(",")}}`;
  }
  getKeyForCache(t, r, e) {
    let s = "";
    return e == null ? s = "" : typeof e == "string" ? s = e : e instanceof URLSearchParams ? s = e.toString() : e instanceof FormData ? s = "[formdata]" : e instanceof Blob ? s = `[blob:${e.type || ""}:${e.size}]` : e instanceof ArrayBuffer ? s = `[arraybuffer:${e.byteLength}]` : s = this.stable(e), `${t}:${r}|${s}`;
  }
  getBodyForForm(t) {
    if (t == null) return "";
    const r = new URLSearchParams();
    for (const [e, s] of Object.entries(t))
      if (s != null) {
        if (Array.isArray(s)) {
          for (const n of s)
            n != null && r.append(e, String(n));
          continue;
        }
        if (typeof s == "object")
          throw new Error(
            `x-www-form-urlencoded does not support nested objects: "${e}"`
          );
        r.append(e, String(s));
      }
    return r.toString();
  }
  inferContentType(t) {
    if (t != null && !(t instanceof FormData))
      return t instanceof URLSearchParams ? "application/x-www-form-urlencoded;charset=UTF-8" : typeof t == "string" ? "text/plain;charset=UTF-8" : t instanceof Blob ? t.type || void 0 : t instanceof ArrayBuffer ? "application/octet-stream" : typeof t == "object" ? "application/json;charset=UTF-8" : "text/plain;charset=UTF-8";
  }
  normalizeBody(t, r) {
    if (t == null) return;
    if (ArrayBuffer.isView(t) || typeof t == "string" || t instanceof FormData || t instanceof URLSearchParams || t instanceof Blob || t instanceof ArrayBuffer)
      return t;
    const e = (r || "").toLowerCase();
    return e.includes("application/x-www-form-urlencoded") ? this.getBodyForForm(t ?? {}) : e.includes("application/json") ? JSON.stringify(t) : e.includes("text/plain") ? String(t) : typeof t == "object" ? JSON.stringify(t) : String(t);
  }
  async readResponseData(t) {
    if (t.status === 204) return null;
    const r = (t.headers.get("content-type") || "").toLowerCase(), e = await t.text();
    if (!e) return null;
    if (r.includes("application/json"))
      try {
        return JSON.parse(e);
      } catch {
        return e;
      }
    return e;
  }
  async clearCache(t, r, e = {}) {
    const s = e.query ?? {}, n = this.rootUrl + r + w.getQueryString(s), a = this.normalizeHeaders(e.headers), o = { ...e, query: s, headers: a };
    this.interceptors.params && await this.interceptors.params(t, n, o);
    const c = this.getKeyForCache(t, n, e.body);
    delete this.cache[c];
  }
  async request(t, r, e = {}) {
    const s = e.query ?? {}, n = this.rootUrl + r + w.getQueryString(s), a = this.normalizeHeaders(e.headers), o = { ...e, query: s, headers: a };
    this.interceptors.params && await this.interceptors.params(t, n, o);
    const c = t.toUpperCase(), m = c !== "GET" && c !== "HEAD";
    if (e.body != null && !m)
      throw new g(`Body is not allowed for ${c}`, 0, n);
    const f = !!((e.useCache ?? !1) || this.cacheTime), p = f ? this.getKeyForCache(c, n, e.body) : "";
    if (f && this.cache[p])
      return this.cache[p];
    const y = (async () => {
      var v, A, E, $, R, C;
      let u = null;
      try {
        const d = {
          method: c,
          credentials: this.withCredentials ? "include" : "same-origin",
          signal: e.signal,
          headers: a
        };
        if (m && e.body != null) {
          if (!a["content-type"]) {
            const j = this.inferContentType(e.body);
            j && (a["content-type"] = j);
          }
          d.body = this.normalizeBody(e.body, a["content-type"]);
        }
        u = await fetch(n, d);
      } catch (d) {
        throw f && (this.cache[p] = null), (d == null ? void 0 : d.name) === "AbortError" ? new g("Request aborted", 0, n) : (await ((A = (v = this.interceptors).error) == null ? void 0 : A.call(v, c, n, o, 0, null, null)), new g(w.REFUSED, 0, n));
      }
      const S = await this.readResponseData(u);
      if (u.ok)
        return await (($ = (E = this.interceptors).success) == null ? void 0 : $.call(E, c, n, o, S, u)), f && this.cacheTime && setTimeout(() => delete this.cache[p], this.cacheTime), S;
      throw f && (this.cache[p] = null), await ((C = (R = this.interceptors).error) == null ? void 0 : C.call(
        R,
        c,
        n,
        o,
        u.status,
        S,
        u
      )), new g(`${t} ${n} ${u.status}`, u.status, n, S);
    })();
    return f && (this.cache[p] = y), y;
  }
  get(t, r = {}) {
    return this.request("GET", t, r);
  }
  post(t, r = {}) {
    return this.request("POST", t, r);
  }
  put(t, r = {}) {
    return this.request("PUT", t, r);
  }
  patch(t, r = {}) {
    return this.request("PATCH", t, r);
  }
  delete(t, r = {}) {
    return this.request("DELETE", t, r);
  }
};
i(w, "REFUSED", "net::ERR_CONNECTION_REFUSED");
let T = w;
export {
  V as AbstractComponent,
  P as AbstractService,
  T as HttpClient,
  g as HttpError,
  z as RouteUrlBucket,
  x as Rx,
  B as RxBucket,
  N as RxFunc,
  b as Template,
  J as arrayToHash,
  I as componentsRegistryService,
  Q as debounce,
  _ as delay,
  H as routerService
};
//# sourceMappingURL=index.js.map

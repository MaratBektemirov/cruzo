var T = Object.defineProperty;
var O = (h, t, r) => t in h ? T(h, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : h[t] = r;
var o = (h, t, r) => O(h, typeof t != "symbol" ? t + "" : t, r);
import { R as m } from "./component-DBoFvGq8.js";
import { A as D, a as N, T as b, c as L } from "./component-DBoFvGq8.js";
import { A as P, R as z, r as H } from "./router.service-B1-tdKy4.js";
import { arrayToHash as J, debounce as Q, delay as _ } from "./utils.js";
const u = class u {
  constructor(t) {
    o(this, "id");
    o(this, "values", /* @__PURE__ */ Object.create(null));
    o(this, "states", /* @__PURE__ */ Object.create(null));
    o(this, "rx", {
      eventsByNames: {},
      valuesByIndex: {},
      statesByIndex: {}
    });
    o(this, "_ids", []);
    this.descriptors = t, this.id = u.lastId++, this._ids = u.idsArr(t);
    for (let r = 0; r < this._ids.length; r++) {
      const e = this._ids[r];
      this.initId(e);
    }
  }
  initId(t) {
    this.rx.valuesByIndex[t] = {}, this.rx.statesByIndex[t] = {}, this.rx.eventsByNames[t] = /* @__PURE__ */ Object.create(null), this.values[t] = /* @__PURE__ */ Object.create(null), this.states[t] = /* @__PURE__ */ Object.create(null);
  }
  addDescriptor(t, r) {
    if (this.descriptors[t]) throw new Error(`Descriptor "${String(t)}" already exists`);
    this._ids.push(t), this.descriptors[t] = r, this.initId(t);
  }
  removeDescriptor(t) {
    const r = this._ids.indexOf(t);
    if (r === -1) throw new Error(`Descriptor "${String(t)}" not found`);
    this._ids.splice(r, 1), delete this.values[t], delete this.states[t], delete this.descriptors[t], delete this.rx.valuesByIndex[t], delete this.rx.statesByIndex[t], delete this.rx.eventsByNames[t];
  }
  getValue(t, r = "0") {
    const e = this.values[t];
    if (!e) throw new Error(`Bucket value bucket "${String(t)}" not found`);
    return e[r];
  }
  getState(t, r = "0") {
    const e = this.states[t];
    if (!e) throw new Error(`Bucket state bucket "${String(t)}" not found`);
    return e[r];
  }
  setValue(t, r, e = "0", n = !1) {
    if (!this.values[t])
      throw new Error(
        `Cannot set for unknown id "${t}" (descriptor not found)`
      );
    this.values[t][e] = r, this.execRxs(this.rx.valuesByIndex[t][e], r, e + "", n);
  }
  setState(t, r, e = "0", n = !1) {
    if (!this.states[t])
      throw new Error(
        `Cannot set state for unknown id "${t}" (descriptor not found)`
      );
    this.states[t][e] = r, this.execRxs(this.rx.statesByIndex[t][e], r, e + "", n);
  }
  setValues(t, r = !1) {
    return this._setValues(t, r);
  }
  setValuesAtIndex(t, r = "0", e = !1) {
    return this._setValues(u.wrapAtIndex(t, r), e);
  }
  setStates(t, r = !1) {
    return this._setStates(t, r);
  }
  setStatesAtIndex(t, r = "0", e = !1) {
    return this._setStates(u.wrapAtIndex(t, r), e);
  }
  newRxEvent(t, r, e, n) {
    if (!this.values[t])
      throw new Error(
        `Cannot create event rx for unknown id "${t}" (descriptor not found)`
      );
    const s = this.rx.eventsByNames[t];
    s[r] = s[r] || [];
    const i = new m(s[r], e);
    return n.push(i), i;
  }
  newRxValue(t, r, e, n = null, s = "0") {
    if (!this.values[t])
      throw new Error(
        `Cannot create value rx for unknown id "${t}" (descriptor not found)`
      );
    const i = this.rx.valuesByIndex[t];
    i[s] || (i[s] = []);
    const a = new m(i[s], r, n);
    return e.push(a), a;
  }
  newRxState(t, r, e, n = null, s = "0") {
    if (!this.states[t])
      throw new Error(
        `Cannot create state rx for unknown id "${t}" (descriptor not found)`
      );
    const i = this.rx.statesByIndex[t];
    i[s] || (i[s] = []);
    const a = new m(i[s], r, n);
    return e.push(a), a;
  }
  emitEvent(t, r, e, n = "0") {
    if (!this.values[t])
      throw new Error(
        `Cannot emit event for unknown id "${t}" (descriptor not found)`
      );
    if (this.rx.eventsByNames[t] && this.rx.eventsByNames[t][r])
      for (const s of this.rx.eventsByNames[t][r]) s.update(e, n);
  }
  _setValues(t, r) {
    for (let e in t) {
      const n = t[e];
      if (!this.values[e])
        throw new Error(
          `Cannot set for unknown id "${String(e)}" (descriptor not found)`
        );
      for (let s in n)
        this.values[e][s] = n[s], this.execRxs(this.rx.valuesByIndex[e][s], n, s + "", r);
    }
  }
  _setStates(t, r) {
    for (let e in t) {
      const n = t[e];
      if (!this.states[e])
        throw new Error(
          `Cannot set state for unknown id "${String(e)}" (descriptor not found)`
        );
      for (let s in n)
        this.states[e][s] = n[s], this.execRxs(this.rx.statesByIndex[e][s], n[s], s, r);
    }
  }
  execRxs(t, r, e, n) {
    if (t)
      for (let s = 0; s < t.length; s++) t[s].update(r, e, n);
  }
  static idsArr(t) {
    return Object.keys(t);
  }
  static ids(t) {
    const r = /* @__PURE__ */ Object.create(null), e = u.idsArr(t);
    for (let n = 0; n < e.length; n++) {
      const s = e[n];
      r[s] = s;
    }
    return r;
  }
  static wrapAtIndex(t, r = "0") {
    const e = /* @__PURE__ */ Object.create(null);
    for (let n in t) e[n] = { [r]: t[n] };
    return e;
  }
  ids() {
    return u.ids(this.descriptors);
  }
  idsArr() {
    return u.idsArr(this.descriptors);
  }
};
o(u, "lastId", 0);
let R = u;
class y extends Error {
  constructor(r, e, n, s) {
    super(r);
    o(this, "name", "HttpError");
    this.message = r, this.status = e, this.url = n, this.data = s;
  }
}
const w = class w {
  constructor(t, r = {}, e = !1, n = 0) {
    o(this, "cache", {});
    o(this, "factory", (t) => {
      const r = this, e = (s) => ({
        ...s || {},
        signal: t
      });
      return {
        request: (s, i, a) => r.request(s, i, e(a)),
        clearCache: (s, i, a) => r.clearCache(s, i, e(a)),
        get: (s, i) => r.get(s, e(i)),
        post: (s, i) => r.post(s, e(i)),
        put: (s, i) => r.put(s, e(i)),
        patch: (s, i) => r.patch(s, e(i)),
        delete: (s, i) => r.delete(s, e(i))
      };
    });
    this.rootUrl = t, this.interceptors = r, this.withCredentials = e, this.cacheTime = n;
  }
  normalizeHeaders(t) {
    const r = {};
    if (!t) return r;
    for (const [e, n] of Object.entries(t))
      n != null && (r[e.toLowerCase()] = String(n));
    return r;
  }
  static getQueryString(t) {
    if (!t) return "";
    const r = new URLSearchParams();
    for (const [n, s] of Object.entries(t))
      s != null && r.append(n, String(s));
    const e = r.toString();
    return e ? `?${e}` : "";
  }
  stable(t) {
    return t == null ? "" : typeof t != "object" ? String(t) : Array.isArray(t) ? `[${t.map((e) => this.stable(e)).join(",")}]` : `{${Object.keys(t).sort().map((e) => `${e}:${this.stable(t[e])}`).join(",")}}`;
  }
  getKeyForCache(t, r, e) {
    let n = "";
    return e == null ? n = "" : typeof e == "string" ? n = e : e instanceof URLSearchParams ? n = e.toString() : e instanceof FormData ? n = "[formdata]" : e instanceof Blob ? n = `[blob:${e.type || ""}:${e.size}]` : e instanceof ArrayBuffer ? n = `[arraybuffer:${e.byteLength}]` : n = this.stable(e), `${t}:${r}|${n}`;
  }
  getBodyForForm(t) {
    if (t == null) return "";
    const r = new URLSearchParams();
    for (const [e, n] of Object.entries(t))
      if (n != null) {
        if (Array.isArray(n)) {
          for (const s of n)
            s != null && r.append(e, String(s));
          continue;
        }
        if (typeof n == "object")
          throw new Error(
            `x-www-form-urlencoded does not support nested objects: "${e}"`
          );
        r.append(e, String(n));
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
    const n = e.query ?? {}, s = this.rootUrl + r + w.getQueryString(n), i = this.normalizeHeaders(e.headers), a = { ...e, query: n, headers: i };
    this.interceptors.params && await this.interceptors.params(t, s, a);
    const c = this.getKeyForCache(t, s, e.body);
    delete this.cache[c];
  }
  async request(t, r, e = {}) {
    const n = e.query ?? {}, s = this.rootUrl + r + w.getQueryString(n), i = this.normalizeHeaders(e.headers), a = { ...e, query: n, headers: i };
    this.interceptors.params && await this.interceptors.params(t, s, a);
    const c = t.toUpperCase(), g = c !== "GET" && c !== "HEAD";
    if (e.body != null && !g)
      throw new y(`Body is not allowed for ${c}`, 0, s);
    const f = !!((e.useCache ?? !1) || this.cacheTime), p = f ? this.getKeyForCache(c, s, e.body) : "";
    if (f && this.cache[p])
      return this.cache[p];
    const S = (async () => {
      var v, B, E, $, A, I;
      let l = null;
      try {
        const d = {
          method: c,
          credentials: this.withCredentials ? "include" : "same-origin",
          signal: e.signal,
          headers: i
        };
        if (g && e.body != null) {
          if (!i["content-type"]) {
            const C = this.inferContentType(e.body);
            C && (i["content-type"] = C);
          }
          d.body = this.normalizeBody(e.body, i["content-type"]);
        }
        l = await fetch(s, d);
      } catch (d) {
        throw f && (this.cache[p] = null), (d == null ? void 0 : d.name) === "AbortError" ? new y("Request aborted", 0, s) : (await ((B = (v = this.interceptors).error) == null ? void 0 : B.call(v, c, s, a, 0, null, null)), new y(w.REFUSED, 0, s));
      }
      const x = await this.readResponseData(l);
      if (l.ok)
        return await (($ = (E = this.interceptors).success) == null ? void 0 : $.call(E, c, s, a, x, l)), f && this.cacheTime && setTimeout(() => delete this.cache[p], this.cacheTime), x;
      throw f && (this.cache[p] = null), await ((I = (A = this.interceptors).error) == null ? void 0 : I.call(
        A,
        c,
        s,
        a,
        l.status,
        x,
        l
      )), new y(`${t} ${s} ${l.status}`, l.status, s, x);
    })();
    return f && (this.cache[p] = S), S;
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
o(w, "REFUSED", "net::ERR_CONNECTION_REFUSED");
let j = w;
export {
  D as AbstractComponent,
  P as AbstractService,
  j as HttpClient,
  y as HttpError,
  z as RouteUrlBucket,
  m as Rx,
  R as RxBucket,
  N as RxFunc,
  b as Template,
  J as arrayToHash,
  L as componentsRegistryService,
  Q as debounce,
  _ as delay,
  H as routerService
};
//# sourceMappingURL=index.js.map

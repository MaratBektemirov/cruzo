var q = Object.defineProperty;
var B = (u, e, r) => e in u ? q(u, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : u[e] = r;
var w = (u, e, r) => B(u, typeof e != "symbol" ? e + "" : e, r);
class m extends Error {
  constructor(r, t, s, n) {
    super(r);
    w(this, "name", "HttpError");
    this.message = r, this.status = t, this.url = s, this.data = n;
  }
}
const p = class p {
  constructor(e, r = {}, t = !1, s = 0) {
    w(this, "cache", {});
    w(this, "factory", (e) => {
      const r = this, t = (n) => ({
        ...n || {},
        signal: e
      });
      return {
        request: (n, i, a) => r.request(n, i, t(a)),
        clearCache: (n, i, a) => r.clearCache(n, i, t(a)),
        get: (n, i) => r.get(n, t(i)),
        post: (n, i) => r.post(n, t(i)),
        put: (n, i) => r.put(n, t(i)),
        patch: (n, i) => r.patch(n, t(i)),
        delete: (n, i) => r.delete(n, t(i))
      };
    });
    this.rootUrl = e, this.interceptors = r, this.withCredentials = t, this.cacheTime = s;
  }
  normalizeHeaders(e) {
    const r = {};
    if (!e) return r;
    for (const [t, s] of Object.entries(e))
      s != null && (r[t.toLowerCase()] = String(s));
    return r;
  }
  static getQueryString(e) {
    if (!e) return "";
    const r = new URLSearchParams();
    for (const [s, n] of Object.entries(e))
      n != null && r.append(s, String(n));
    const t = r.toString();
    return t ? `?${t}` : "";
  }
  stable(e) {
    return e == null ? "" : typeof e != "object" ? String(e) : Array.isArray(e) ? `[${e.map((t) => this.stable(t)).join(",")}]` : `{${Object.keys(e).sort().map((t) => `${t}:${this.stable(e[t])}`).join(",")}}`;
  }
  getKeyForCache(e, r, t) {
    let s = "";
    return t == null ? s = "" : typeof t == "string" ? s = t : t instanceof URLSearchParams ? s = t.toString() : t instanceof FormData ? s = "[formdata]" : t instanceof Blob ? s = `[blob:${t.type || ""}:${t.size}]` : t instanceof ArrayBuffer ? s = `[arraybuffer:${t.byteLength}]` : s = this.stable(t), `${e}:${r}|${s}`;
  }
  getBodyForForm(e) {
    if (e == null) return "";
    const r = new URLSearchParams();
    for (const [t, s] of Object.entries(e))
      if (s != null) {
        if (Array.isArray(s)) {
          for (const n of s)
            n != null && r.append(t, String(n));
          continue;
        }
        if (typeof s == "object")
          throw new Error(
            `x-www-form-urlencoded does not support nested objects: "${t}"`
          );
        r.append(t, String(s));
      }
    return r.toString();
  }
  inferContentType(e) {
    if (e != null && !(e instanceof FormData))
      return e instanceof URLSearchParams ? "application/x-www-form-urlencoded;charset=UTF-8" : typeof e == "string" ? "text/plain;charset=UTF-8" : e instanceof Blob ? e.type || void 0 : e instanceof ArrayBuffer ? "application/octet-stream" : typeof e == "object" ? "application/json;charset=UTF-8" : "text/plain;charset=UTF-8";
  }
  normalizeBody(e, r) {
    if (e == null) return;
    if (ArrayBuffer.isView(e) || typeof e == "string" || e instanceof FormData || e instanceof URLSearchParams || e instanceof Blob || e instanceof ArrayBuffer)
      return e;
    const t = (r || "").toLowerCase();
    return t.includes("application/x-www-form-urlencoded") ? this.getBodyForForm(e ?? {}) : t.includes("application/json") ? JSON.stringify(e) : t.includes("text/plain") ? String(e) : typeof e == "object" ? JSON.stringify(e) : String(e);
  }
  async readResponseData(e) {
    if (e.status === 204) return null;
    const r = (e.headers.get("content-type") || "").toLowerCase(), t = await e.text();
    if (!t) return null;
    if (r.includes("application/json"))
      try {
        return JSON.parse(t);
      } catch {
        return t;
      }
    return t;
  }
  async clearCache(e, r, t = {}) {
    const s = t.query ?? {}, n = this.rootUrl + r + p.getQueryString(s), i = this.normalizeHeaders(t.headers), a = { ...t, query: s, headers: i };
    this.interceptors.params && await this.interceptors.params(e, n, a);
    const c = this.getKeyForCache(e, n, t.body);
    delete this.cache[c];
  }
  async request(e, r, t = {}) {
    const s = t.query ?? {}, n = this.rootUrl + r + p.getQueryString(s), i = this.normalizeHeaders(t.headers), a = { ...t, query: s, headers: i };
    this.interceptors.params && await this.interceptors.params(e, n, a);
    const c = e.toUpperCase(), y = c !== "GET" && c !== "HEAD";
    if (t.body != null && !y)
      throw new m(`Body is not allowed for ${c}`, 0, n);
    const l = !!((t.useCache ?? !1) || this.cacheTime), f = l ? this.getKeyForCache(c, n, t.body) : "";
    if (l && this.cache[f])
      return this.cache[f];
    const d = (async () => {
      var S, E, T, F, U, C;
      let o = null;
      try {
        const h = {
          method: c,
          credentials: this.withCredentials ? "include" : "same-origin",
          signal: t.signal,
          headers: i
        };
        if (y && t.body != null) {
          if (!i["content-type"]) {
            const $ = this.inferContentType(t.body);
            $ && (i["content-type"] = $);
          }
          h.body = this.normalizeBody(t.body, i["content-type"]);
        }
        o = await fetch(n, h);
      } catch (h) {
        throw l && (this.cache[f] = null), (h == null ? void 0 : h.name) === "AbortError" ? new m("Request aborted", 0, n) : (await ((E = (S = this.interceptors).error) == null ? void 0 : E.call(S, c, n, a, 0, null, null)), new m(p.REFUSED, 0, n));
      }
      const g = await this.readResponseData(o);
      if (o.ok)
        return await ((F = (T = this.interceptors).success) == null ? void 0 : F.call(T, c, n, a, g, o)), l && this.cacheTime && setTimeout(() => delete this.cache[f], this.cacheTime), g;
      throw l && (this.cache[f] = null), await ((C = (U = this.interceptors).error) == null ? void 0 : C.call(
        U,
        c,
        n,
        a,
        o.status,
        g,
        o
      )), new m(`${e} ${n} ${o.status}`, o.status, n, g);
    })();
    return l && (this.cache[f] = d), d;
  }
  get(e, r = {}) {
    return this.request("GET", e, r);
  }
  post(e, r = {}) {
    return this.request("POST", e, r);
  }
  put(e, r = {}) {
    return this.request("PUT", e, r);
  }
  patch(e, r = {}) {
    return this.request("PATCH", e, r);
  }
  delete(e, r = {}) {
    return this.request("DELETE", e, r);
  }
};
w(p, "REFUSED", "net::ERR_CONNECTION_REFUSED");
let j = p;
export {
  j as HttpClient,
  m as HttpError
};
//# sourceMappingURL=http.js.map

var a = Object.defineProperty;
var o = (e, t, s) => t in e ? a(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var p = (e, t, s) => o(e, typeof t != "symbol" ? t + "" : t, s);
class h {
  constructor(t, s = null, d = null) {
    p(this, "actual", null);
    p(this, "groupIndex", null);
    p(this, "postUpdateFns", null);
    this.group = t, this.fn = s, this.groupIndex = this.group.length, this.group.push(this), this.actual = d;
  }
  update(...t) {
    if (this.actual = typeof this.fn == "function" ? this.fn(...t) : null, !!this.postUpdateFns)
      for (const s of this.postUpdateFns) s(this);
  }
  setPostUpdate(t) {
    this.postUpdateFns ?? (this.postUpdateFns = /* @__PURE__ */ new Set()), this.postUpdateFns.add(t);
  }
  unsubscribe() {
    const t = this.groupIndex, s = this.group.pop();
    t < this.group.length && (this.group[t] = s, s.groupIndex = t);
  }
}
class r extends h {
  constructor(s, d, u, ...i) {
    super(s, d);
    p(this, "deps");
    p(this, "updateScheduled", !1);
    p(this, "update", () => {
      this.updateScheduled || (this.updateScheduled = !0, queueMicrotask(() => {
        super.update(...this.deps.map((s) => s.actual)), this.updateScheduled = !1;
      }));
    });
    this.deps = i;
    for (const n of i) n.setPostUpdate(this.update);
    u != null && u.immediate && this.update();
  }
  unsubscribe() {
    var s, d;
    for (const u of this.deps)
      (s = u.postUpdateFns) == null || s.delete(this.update), ((d = u.postUpdateFns) == null ? void 0 : d.size) === 0 && (u.postUpdateFns = null);
    super.unsubscribe();
  }
}
export {
  h as Rx,
  r as RxFunc
};
//# sourceMappingURL=rx.js.map

var rt = Object.defineProperty;
var ot = (o, t, e) => t in o ? rt(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var l = (o, t, e) => ot(o, typeof t != "symbol" ? t + "" : t, e);
import { debounce as at } from "./utils.js";
const ht = (o) => o === " " || o === `
` || o === "	" || o === "\r", $ = (o) => o >= "0" && o <= "9", ct = /[A-Za-z_$]/, lt = /[A-Za-z0-9_$]/, ut = (o) => ct.test(o), pt = (o) => lt.test(o), dt = [
  "===",
  "!==",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "??",
  "?.",
  "::",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "!",
  "?",
  ":",
  ".",
  ",",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}"
];
function ft(o, t) {
  for (const e of dt)
    if (o.startsWith(e, t)) return e;
  return null;
}
function mt(o) {
  o = o.trim();
  const t = [];
  let e = 0;
  for (; e < o.length; ) {
    const s = o[e];
    if (ht(s)) {
      e++;
      continue;
    }
    if (s === "'" || s === '"') {
      const n = s;
      e++;
      let h = "";
      for (; e < o.length; ) {
        const c = o[e++];
        if (c === "\\") {
          const p = o[e++];
          h += p === "n" ? `
` : p === "t" ? "	" : p;
          continue;
        }
        if (c === n) break;
        h += c;
      }
      t.push({ t: "str", v: h });
      continue;
    }
    if ($(s) || s === "." && $(o[e + 1] || "")) {
      let n = "";
      for (; e < o.length && ($(o[e]) || o[e] === "."); )
        n += o[e++];
      t.push({ t: "num", v: Number(n) });
      continue;
    }
    if (ut(s)) {
      let n = "";
      for (; e < o.length && pt(o[e]); ) n += o[e++];
      t.push({ t: "id", v: n });
      continue;
    }
    const i = ft(o, e);
    if (i) {
      e += i.length, "()[]{},".includes(i) ? t.push({ t: "punc", v: i }) : t.push({ t: "op", v: i });
      continue;
    }
    throw new Error(`Unexpected char "${s}" at ${e}`);
  }
  return t.push({ t: "eof" }), t;
}
const S = {
  ip: "color:#777",
  hex: "color:#999",
  op: "color:#4fc1ff;font-weight:600",
  jump: "color:#ff5370;font-weight:600",
  arg: "color:#c3e88d",
  com: "color:#777;font-style:italic"
}, P = (o) => "0x" + (o >>> 0).toString(16).padStart(8, "0"), G = (o) => {
  if (typeof o == "string") return JSON.stringify(o);
  if (o == null || typeof o == "number" || typeof o == "boolean") return String(o);
  try {
    const t = JSON.stringify(o);
    return t && t.length > 60 ? t.slice(0, 57) + "…" : t;
  } catch {
    return Object.prototype.toString.call(o);
  }
};
class gt {
  constructor(t, e, s, i, n) {
    this.code = t, this.consts = e, this.idNames = s, this.exprCount = i, this.onceCount = n;
  }
  onlyOnce() {
    return this.exprCount === 1 && this.onceCount === 1;
  }
  fmtArg(t, e, s) {
    switch (t) {
      case 1:
        return [`const[${e}]`, G(this.consts[e])];
      case 2:
        return [`id[${e}]`, this.idNames[e] ?? "<bad id>"];
      case 4:
      case 5:
        return [`prop[${e}]`, G(this.consts[e])];
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
        return [`-> ${e}`, ""];
      case 26:
      case 27:
        return [`argc=${e}`, ""];
      case 34:
        return [`count=${e}`, ""];
      case 35:
        return [`pairs=${e}`, ""];
      case 36:
        return [`slot=${e} -> ${s ?? "?"}`, ""];
      case 37:
        return [`slot=${e}`, ""];
      default:
        return e ? [`a=${e}`, ""] : ["", ""];
    }
  }
  log() {
    for (let t = 0; t < this.code.length; t++) {
      const e = this.code[t] >>> 0, s = J(e), i = Q(e);
      let n;
      s === 36 && (n = (this.code[t + 1] ?? 0) >>> 0);
      const h = et[s] ?? `OP_${s}`, [c, p] = this.fmtArg(s, i, n), m = `%c${String(t).padStart(4)} %c${P(e)}  %c${h.padEnd(18)} %c${c}` + (p ? ` %c; ${p}` : ""), f = [
        S.ip,
        S.hex,
        xt(s) ? S.jump : S.op,
        S.arg,
        ...p ? [S.com] : []
      ];
      if (console.log(m, ...f), s === 36) {
        t++;
        const d = (this.code[t] ?? 0) >>> 0, a = `%c${String(t).padStart(4)} %c${P(d)}  %c${"WIDE".padEnd(18)} %c${`-> ${d}`}`;
        console.log(a, S.ip, S.hex, S.jump, S.arg);
      }
    }
  }
  noRunNeeded(t) {
    var e;
    return this.onlyOnce() && ((e = t.onceMap) == null ? void 0 : e.has(this));
  }
  setOnceSlotValue(t, e, s) {
    if (t.onceMap ?? (t.onceMap = /* @__PURE__ */ new Map()), this.onlyOnce()) {
      t.onceMap.set(this, s);
      return;
    }
    let i = t.onceMap.get(this);
    for (i || (i = [], t.onceMap.set(this, i)); i.length <= e; ) i.push(F);
    i[e] = s;
  }
  getOnceSlotValue(t, e) {
    if (t.onceMap ?? (t.onceMap = /* @__PURE__ */ new Map()), this.onlyOnce())
      return t.onceMap.has(this) ? t.onceMap.get(this) : (t.onceMap.set(this, F), F);
    let s = t.onceMap.get(this);
    for (s || (s = [], t.onceMap.set(this, s)); s.length <= e; ) s.push(F);
    return s[e];
  }
  run(t, e, s, i, n, h) {
    const c = this.code, p = this.consts, m = this.idNames;
    let f, d;
    const a = [];
    let r = 0, w = 0, U = 0;
    for (; w < c.length; ) {
      const C = c[w++], _ = J(C), b = Q(C);
      switch (_) {
        case 1:
          a[r++] = p[b];
          break;
        case 2: {
          const u = m[b];
          switch (u) {
            case "root":
              f ?? (f = t.root.self()), a[r++] = f;
              break;
            case "app":
              a[r++] = i;
              break;
            case "index":
              a[r++] = t.cloneIndex;
              break;
            case "$element":
              a[r++] = t.node;
              break;
            case "event":
              a[r++] = h;
              break;
            default:
              a[r++] = t.getVarFromLexicalEnv(u);
              break;
          }
          break;
        }
        case 3:
          d ?? (d = t.getThisArg()), a[r++] = d;
          break;
        case 4: {
          const u = p[b], g = a[--r];
          a[r++] = g == null ? void 0 : g[u];
          break;
        }
        case 5: {
          const u = p[b], g = a[--r], x = g == null ? void 0 : g[u];
          a[r++] = g, a[r++] = x;
          break;
        }
        case 6: {
          const u = a[--r], g = a[--r];
          a[r++] = g == null ? void 0 : g[u];
          break;
        }
        case 7: {
          const u = a[--r], g = a[--r], x = g == null ? void 0 : g[u];
          a[r++] = g, a[r++] = x;
          break;
        }
        case 8:
          r--;
          break;
        case 9: {
          const u = a[--r];
          r--, a[r++] = u;
          break;
        }
        case 10:
          a[r - 1] = !a[r - 1];
          break;
        case 11:
          a[r - 1] = +a[r - 1];
          break;
        case 12:
          a[r - 1] = -a[r - 1];
          break;
        case 13: {
          const u = a[--r];
          a[r - 1] = a[r - 1] + u;
          break;
        }
        case 14: {
          const u = a[--r];
          a[r - 1] = a[r - 1] - u;
          break;
        }
        case 15: {
          const u = a[--r];
          a[r - 1] = a[r - 1] * u;
          break;
        }
        case 16: {
          const u = a[--r];
          a[r - 1] = a[r - 1] / u;
          break;
        }
        case 17: {
          const u = a[--r];
          a[r - 1] = a[r - 1] % u;
          break;
        }
        case 18: {
          const u = a[--r];
          a[r - 1] = a[r - 1] == u;
          break;
        }
        case 19: {
          const u = a[--r];
          a[r - 1] = a[r - 1] != u;
          break;
        }
        case 20: {
          const u = a[--r];
          a[r - 1] = a[r - 1] === u;
          break;
        }
        case 21: {
          const u = a[--r];
          a[r - 1] = a[r - 1] !== u;
          break;
        }
        case 22: {
          const u = a[--r];
          a[r - 1] = a[r - 1] < u;
          break;
        }
        case 23: {
          const u = a[--r];
          a[r - 1] = a[r - 1] <= u;
          break;
        }
        case 24: {
          const u = a[--r];
          a[r - 1] = a[r - 1] > u;
          break;
        }
        case 25: {
          const u = a[--r];
          a[r - 1] = a[r - 1] >= u;
          break;
        }
        case 26: {
          const u = b, g = r - u - 1, x = a[g];
          if (typeof x != "function") {
            r = g, a[r++] = void 0;
            break;
          }
          switch (d ?? (d = t.getThisArg()), u) {
            case 0:
              r = g, a[r++] = x.call(d);
              break;
            case 1: {
              const v = a[r - 1];
              r = g, a[r++] = x.call(d, v);
              break;
            }
            case 2: {
              const v = a[r - 2], y = a[r - 1];
              r = g, a[r++] = x.call(d, v, y);
              break;
            }
            case 3: {
              const v = a[r - 3], y = a[r - 2], E = a[r - 1];
              r = g, a[r++] = x.call(d, v, y, E);
              break;
            }
            case 4: {
              const v = a[r - 4], y = a[r - 3], E = a[r - 2], A = a[r - 1];
              r = g, a[r++] = x.call(d, v, y, E, A);
              break;
            }
            default: {
              const v = new Array(u);
              for (let y = 0; y < u; y++) v[y] = a[r - u + y];
              r = g, a[r++] = x.apply(d, v);
              break;
            }
          }
          break;
        }
        case 27: {
          const u = b, g = r - u - 1, x = r - u - 2, v = a[g], y = a[x];
          if (typeof v != "function") {
            r = x, a[r++] = void 0;
            break;
          }
          switch (u) {
            case 0:
              r = x, a[r++] = v.call(y);
              break;
            case 1: {
              const E = a[r - 1];
              r = x, a[r++] = v.call(y, E);
              break;
            }
            case 2: {
              const E = a[r - 2], A = a[r - 1];
              r = x, a[r++] = v.call(y, E, A);
              break;
            }
            case 3: {
              const E = a[r - 3], A = a[r - 2], M = a[r - 1];
              r = x, a[r++] = v.call(y, E, A, M);
              break;
            }
            case 4: {
              const E = a[r - 4], A = a[r - 3], M = a[r - 2], nt = a[r - 1];
              r = x, a[r++] = v.call(y, E, A, M, nt);
              break;
            }
            default: {
              const E = new Array(u);
              for (let A = 0; A < u; A++) E[A] = a[r - u + A];
              r = x, a[r++] = v.apply(y, E);
              break;
            }
          }
          break;
        }
        case 28: {
          const u = a[--r];
          if (u == null) throw new Error(`::rx is invalid on ${u}`);
          a[r++] = t.getRxValue(e, u, s, n, U > 0);
          break;
        }
        case 36: {
          const u = b, g = c[w++] >>> 0, x = this.getOnceSlotValue(t, u);
          x !== F ? (a[r++] = x, w = g) : U++;
          break;
        }
        case 37: {
          const u = b;
          this.setOnceSlotValue(t, u, a[r - 1]), U--;
          break;
        }
        case 29:
          w = b;
          break;
        case 30: {
          a[--r] || (w = b);
          break;
        }
        case 31: {
          a[r - 1] ? r-- : w = b;
          break;
        }
        case 32: {
          a[r - 1] ? w = b : r--;
          break;
        }
        case 33: {
          a[r - 1] == null && (w = b);
          break;
        }
        case 34: {
          const u = b, g = new Array(u);
          for (let x = u - 1; x >= 0; x--) g[x] = a[--r];
          a[r++] = g;
          break;
        }
        case 35: {
          const u = b, g = {};
          for (let x = 0; x < u; x++) {
            const v = a[--r], y = a[--r];
            g[y] = v;
          }
          a[r++] = g;
          break;
        }
        default:
          throw new Error(`Unknown op ${_} at ip=${w - 1}`);
      }
    }
    return r ? a[r - 1] : void 0;
  }
}
const F = {}, Z = 255, tt = 8;
var et = /* @__PURE__ */ ((o) => (o[o.PUSH_CONST = 1] = "PUSH_CONST", o[o.LOAD_ID = 2] = "LOAD_ID", o[o.LOAD_THIS = 3] = "LOAD_THIS", o[o.GET_PROP = 4] = "GET_PROP", o[o.GET_PROP_KEEP = 5] = "GET_PROP_KEEP", o[o.GET_INDEX = 6] = "GET_INDEX", o[o.GET_INDEX_KEEP = 7] = "GET_INDEX_KEEP", o[o.POP = 8] = "POP", o[o.POP_BELOW = 9] = "POP_BELOW", o[o.UNARY_NOT = 10] = "UNARY_NOT", o[o.UNARY_POS = 11] = "UNARY_POS", o[o.UNARY_NEG = 12] = "UNARY_NEG", o[o.BIN_ADD = 13] = "BIN_ADD", o[o.BIN_SUB = 14] = "BIN_SUB", o[o.BIN_MUL = 15] = "BIN_MUL", o[o.BIN_DIV = 16] = "BIN_DIV", o[o.BIN_MOD = 17] = "BIN_MOD", o[o.BIN_EQ = 18] = "BIN_EQ", o[o.BIN_NEQ = 19] = "BIN_NEQ", o[o.BIN_SEQ = 20] = "BIN_SEQ", o[o.BIN_SNEQ = 21] = "BIN_SNEQ", o[o.BIN_LT = 22] = "BIN_LT", o[o.BIN_LTE = 23] = "BIN_LTE", o[o.BIN_GT = 24] = "BIN_GT", o[o.BIN_GTE = 25] = "BIN_GTE", o[o.CALL_FN = 26] = "CALL_FN", o[o.CALL_METHOD = 27] = "CALL_METHOD", o[o.RX_UI = 28] = "RX_UI", o[o.JMP = 29] = "JMP", o[o.JMP_IF_FALSE = 30] = "JMP_IF_FALSE", o[o.JMP_IF_FALSE_KEEP = 31] = "JMP_IF_FALSE_KEEP", o[o.JMP_IF_TRUE_KEEP = 32] = "JMP_IF_TRUE_KEEP", o[o.JMP_IF_NULLISH = 33] = "JMP_IF_NULLISH", o[o.MAKE_ARRAY = 34] = "MAKE_ARRAY", o[o.MAKE_OBJECT = 35] = "MAKE_OBJECT", o[o.ONCE_ENTER = 36] = "ONCE_ENTER", o[o.ONCE_STORE = 37] = "ONCE_STORE", o))(et || {});
function xt(o) {
  return o === 29 || o === 30 || o === 31 || o === 32 || o === 33 || o === 36;
}
function D(o, t = 0) {
  return t << tt | o & Z;
}
function J(o) {
  return o & Z;
}
function Q(o) {
  return o >>> tt;
}
class vt {
  constructor(t) {
    l(this, "pos", 0);
    l(this, "code", []);
    l(this, "consts", null);
    l(this, "constMap");
    l(this, "idNames", null);
    l(this, "idMap");
    l(this, "onceSlot", 0);
    l(this, "exprDepth", 0);
    l(this, "exprCount", 0);
    this.tokens = t;
  }
  withNestedExpr(t) {
    this.exprDepth++;
    try {
      return t();
    } finally {
      this.exprDepth--;
    }
  }
  allocOnceSlot() {
    return this.onceSlot++;
  }
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    return this.tokens[this.pos++];
  }
  expectPunc(t) {
    const e = this.next();
    if (e.t !== "punc" || e.v !== t) throw new Error(`Expected "${t}"`);
  }
  expectOp(t) {
    const e = this.next();
    if (e.t !== "op" || e.v !== t) throw new Error(`Expected "${t}"`);
  }
  c(t) {
    if (this.consts ?? (this.consts = []), typeof t == "string") {
      const s = "s:" + t;
      this.constMap ?? (this.constMap = /* @__PURE__ */ new Map());
      const i = this.constMap.get(s);
      if (i != null) return i;
      const n = this.consts.length;
      return this.consts.push(t), this.constMap.set(s, n), n;
    }
    const e = this.consts.length;
    return this.consts.push(t), e;
  }
  id(t) {
    this.idMap ?? (this.idMap = /* @__PURE__ */ new Map());
    const e = this.idMap.get(t);
    if (e != null) return e;
    this.idNames ?? (this.idNames = []);
    const s = this.idNames.length;
    return this.idNames.push(t), this.idMap.set(t, s), s;
  }
  emit(t, e = 0) {
    this.code.push(D(t, e));
  }
  emitJump(t) {
    const e = this.code.length;
    return this.code.push(D(t, 0)), e;
  }
  patch(t, e) {
    const s = this.code[t];
    this.code[t] = D(J(s), e);
  }
  getBytecode(t) {
    if (this.peek().t === "eof") throw new Error("Empty template expression is not allowed");
    if (this.parseExpression(), this.peek().t !== "eof") throw new Error("Unexpected token after expression");
    return new gt(
      new Uint32Array(this.code),
      this.consts,
      this.idNames,
      this.exprCount || 1,
      this.onceSlot
    );
  }
  parseExpression() {
    this.parseTernary();
  }
  parseTernary() {
    this.parseNullish();
    const t = this.peek();
    if (t.t === "op" && t.v === "?") {
      this.exprDepth === 0 && this.exprCount === 0 && (this.exprCount = 3), this.next();
      const e = this.emitJump(
        30
        /* JMP_IF_FALSE */
      );
      this.withNestedExpr(() => this.parseExpression());
      const s = this.emitJump(
        29
        /* JMP */
      );
      this.expectOp(":"), this.patch(e, this.code.length), this.withNestedExpr(() => this.parseExpression()), this.patch(s, this.code.length);
    }
  }
  parseNullish() {
    this.parseOr();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && t.v === "??") {
      let e = 1;
      for (; t.t === "op" && t.v === "??"; ) {
        this.next();
        const s = this.emitJump(
          33
          /* JMP_IF_NULLISH */
        ), i = this.emitJump(
          29
          /* JMP */
        );
        this.patch(s, this.code.length), this.emit(
          8
          /* POP */
        ), this.parseOr(), this.patch(i, this.code.length), e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && t.v === "??"; ) {
      this.next();
      const e = this.emitJump(
        33
        /* JMP_IF_NULLISH */
      ), s = this.emitJump(
        29
        /* JMP */
      );
      this.patch(e, this.code.length), this.emit(
        8
        /* POP */
      ), this.parseOr(), this.patch(s, this.code.length), t = this.peek();
    }
  }
  parseOr() {
    this.parseAnd();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && t.v === "||") {
      let e = 1;
      for (; t.t === "op" && t.v === "||"; ) {
        this.next();
        const s = this.emitJump(
          32
          /* JMP_IF_TRUE_KEEP */
        );
        this.parseAnd(), this.patch(s, this.code.length), e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && t.v === "||"; ) {
      this.next();
      const e = this.emitJump(
        32
        /* JMP_IF_TRUE_KEEP */
      );
      this.parseAnd(), this.patch(e, this.code.length), t = this.peek();
    }
  }
  parseAnd() {
    this.parseEq();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && t.v === "&&") {
      let e = 1;
      for (; t.t === "op" && t.v === "&&"; ) {
        this.next();
        const s = this.emitJump(
          31
          /* JMP_IF_FALSE_KEEP */
        );
        this.parseEq(), this.patch(s, this.code.length), e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && t.v === "&&"; ) {
      this.next();
      const e = this.emitJump(
        31
        /* JMP_IF_FALSE_KEEP */
      );
      this.parseEq(), this.patch(e, this.code.length), t = this.peek();
    }
  }
  parseEq() {
    this.parseRel();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && ["===", "!==", "==", "!="].includes(t.v)) {
      let e = 1;
      for (; t.t === "op" && ["===", "!==", "==", "!="].includes(t.v); ) {
        const s = this.next().v;
        switch (this.parseRel(), s) {
          case "===":
            this.emit(
              20
              /* BIN_SEQ */
            );
            break;
          case "!==":
            this.emit(
              21
              /* BIN_SNEQ */
            );
            break;
          case "==":
            this.emit(
              18
              /* BIN_EQ */
            );
            break;
          case "!=":
            this.emit(
              19
              /* BIN_NEQ */
            );
            break;
        }
        e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && ["===", "!==", "==", "!="].includes(t.v); ) {
      const e = this.next().v;
      switch (this.parseRel(), e) {
        case "===":
          this.emit(
            20
            /* BIN_SEQ */
          );
          break;
        case "!==":
          this.emit(
            21
            /* BIN_SNEQ */
          );
          break;
        case "==":
          this.emit(
            18
            /* BIN_EQ */
          );
          break;
        case "!=":
          this.emit(
            19
            /* BIN_NEQ */
          );
          break;
      }
      t = this.peek();
    }
  }
  parseRel() {
    this.parseAdd();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && ["<", "<=", ">", ">="].includes(t.v)) {
      let e = 1;
      for (; t.t === "op" && ["<", "<=", ">", ">="].includes(t.v); ) {
        const s = this.next().v;
        switch (this.parseAdd(), s) {
          case "<":
            this.emit(
              22
              /* BIN_LT */
            );
            break;
          case "<=":
            this.emit(
              23
              /* BIN_LTE */
            );
            break;
          case ">":
            this.emit(
              24
              /* BIN_GT */
            );
            break;
          case ">=":
            this.emit(
              25
              /* BIN_GTE */
            );
            break;
        }
        e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && ["<", "<=", ">", ">="].includes(t.v); ) {
      const e = this.next().v;
      switch (this.parseAdd(), e) {
        case "<":
          this.emit(
            22
            /* BIN_LT */
          );
          break;
        case "<=":
          this.emit(
            23
            /* BIN_LTE */
          );
          break;
        case ">":
          this.emit(
            24
            /* BIN_GT */
          );
          break;
        case ">=":
          this.emit(
            25
            /* BIN_GTE */
          );
          break;
      }
      t = this.peek();
    }
  }
  parseAdd() {
    this.parseMul();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && ["+", "-"].includes(t.v)) {
      let e = 1;
      for (; t.t === "op" && ["+", "-"].includes(t.v); ) {
        const s = this.next().v;
        this.parseMul(), this.emit(
          s === "+" ? 13 : 14
          /* BIN_SUB */
        ), e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && ["+", "-"].includes(t.v); ) {
      const e = this.next().v;
      this.parseMul(), this.emit(
        e === "+" ? 13 : 14
        /* BIN_SUB */
      ), t = this.peek();
    }
  }
  parseMul() {
    this.parseUnary();
    let t = this.peek();
    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && ["*", "/", "%"].includes(t.v)) {
      let e = 1;
      for (; t.t === "op" && ["*", "/", "%"].includes(t.v); ) {
        const s = this.next().v;
        this.parseUnary(), this.emit(
          s === "*" ? 15 : s === "/" ? 16 : 17
          /* BIN_MOD */
        ), e++, t = this.peek();
      }
      this.exprCount = e;
      return;
    }
    for (; t.t === "op" && ["*", "/", "%"].includes(t.v); ) {
      const e = this.next().v;
      this.parseUnary(), this.emit(
        e === "*" ? 15 : e === "/" ? 16 : 17
        /* BIN_MOD */
      ), t = this.peek();
    }
  }
  parseUnary() {
    const t = this.peek();
    if (t.t === "id" && t.v === "once") {
      const e = this.tokens[this.pos + 1];
      if ((e == null ? void 0 : e.t) === "op" && e.v === "::") {
        this.next(), this.next();
        const s = this.allocOnceSlot();
        this.emit(36, s);
        const i = this.code.length;
        this.code.push(0), this.parsePostfix(), this.emit(37, s), this.code[i] = this.code.length;
        return;
      }
    }
    if (t.t === "op" && ["!", "+", "-"].includes(t.v)) {
      this.next(), this.parseUnary(), this.emit(
        t.v === "!" ? 10 : t.v === "+" ? 11 : 12
        /* UNARY_NEG */
      );
      return;
    }
    this.parsePostfix();
  }
  parsePostfix() {
    this.parsePrimary();
    let t = !1;
    const e = [], s = () => {
      e.push(this.emitJump(
        33
        /* JMP_IF_NULLISH */
      ));
    };
    for (; ; ) {
      const i = this.peek();
      if (i.t === "op" && i.v === ".") {
        t && (this.emit(
          9
          /* POP_BELOW */
        ), t = !1), this.next();
        const n = this.next();
        if (n.t !== "id") throw new Error('Expected identifier after "."');
        const h = this.c(n.v), c = this.peek();
        c.t === "punc" && c.v === "(" ? (this.emit(5, h), t = !0) : (this.emit(4, h), t = !1);
        continue;
      }
      if (i.t === "op" && i.v === "?.") {
        const n = this.tokens[this.pos + 1];
        if ((n == null ? void 0 : n.t) === "punc" && n.v === "(") {
          t && (this.emit(
            9
            /* POP_BELOW */
          ), t = !1), this.next(), s();
          continue;
        }
        if ((n == null ? void 0 : n.t) === "punc" && n.v === "[") {
          t && (this.emit(
            9
            /* POP_BELOW */
          ), t = !1), this.next(), this.next(), s(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]");
          const m = this.peek();
          m.t === "punc" && m.v === "(" ? (this.emit(
            7
            /* GET_INDEX_KEEP */
          ), t = !0) : (this.emit(
            6
            /* GET_INDEX */
          ), t = !1);
          continue;
        }
        t && (this.emit(
          9
          /* POP_BELOW */
        ), t = !1), this.next(), s();
        const h = this.next();
        if (h.t !== "id") throw new Error('Expected identifier after "?."');
        const c = this.c(h.v), p = this.peek();
        p.t === "punc" && p.v === "(" ? (this.emit(5, c), t = !0) : (this.emit(4, c), t = !1);
        continue;
      }
      if (i.t === "punc" && i.v === "[") {
        t && (this.emit(
          9
          /* POP_BELOW */
        ), t = !1), this.next(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]");
        const n = this.peek();
        n.t === "punc" && n.v === "(" ? (this.emit(
          7
          /* GET_INDEX_KEEP */
        ), t = !0) : (this.emit(
          6
          /* GET_INDEX */
        ), t = !1);
        continue;
      }
      if (i.t === "punc" && i.v === "(") {
        this.next();
        const n = this.parseArgsAndCount();
        this.expectPunc(")"), t ? (this.emit(27, n), t = !1) : this.emit(26, n);
        continue;
      }
      if (i.t === "op" && i.v === "::") {
        this.next();
        const n = this.next();
        if (n.t !== "id") throw new Error('Expected modifier after "::"');
        if (n.v === "rx") {
          t && (this.emit(
            9
            /* POP_BELOW */
          ), t = !1), this.emit(
            28
            /* RX_UI */
          );
          continue;
        }
        throw new Error(`Unknown modifier: ${n.v}`);
      }
      break;
    }
    if (t && this.emit(
      9
      /* POP_BELOW */
    ), e.length) {
      const i = this.code.length;
      for (const n of e) this.patch(n, i);
    }
  }
  parseArgsAndCount() {
    let t = 0, e = this.peek();
    if (e.t === "punc" && e.v === ")") return 0;
    for (; ; ) {
      if (this.withNestedExpr(() => this.parseExpression()), t++, e = this.peek(), e.t === "punc" && e.v === ",") {
        this.next();
        continue;
      }
      break;
    }
    return t;
  }
  parsePrimary() {
    const t = this.next();
    if (t.t === "num") {
      this.emit(1, this.c(t.v));
      return;
    }
    if (t.t === "str") {
      this.emit(1, this.c(t.v));
      return;
    }
    if (t.t === "id") {
      if (t.v === "this") {
        this.emit(
          3
          /* LOAD_THIS */
        );
        return;
      }
      if (t.v === "true") {
        this.emit(1, this.c(!0));
        return;
      }
      if (t.v === "false") {
        this.emit(1, this.c(!1));
        return;
      }
      if (t.v === "null") {
        this.emit(1, this.c(null));
        return;
      }
      if (t.v === "undefined") {
        this.emit(1, this.c(void 0));
        return;
      }
      this.emit(2, this.id(t.v));
      return;
    }
    if (t.t === "punc" && t.v === "(") {
      this.withNestedExpr(() => this.parseExpression()), this.expectPunc(")");
      return;
    }
    if (t.t === "punc" && t.v === "[") {
      let e = 0, s = this.peek();
      if (s.t === "punc" && s.v === "]") {
        this.next(), this.emit(34, 0);
        return;
      }
      for (; ; ) {
        if (this.withNestedExpr(() => this.parseExpression()), e++, s = this.peek(), s.t === "punc" && s.v === ",") {
          this.next();
          continue;
        }
        break;
      }
      this.expectPunc("]"), this.emit(34, e);
      return;
    }
    if (t.t === "punc" && t.v === "{") {
      let e = 0, s = this.peek();
      if (s.t === "punc" && s.v === "}") {
        this.next(), this.emit(35, 0);
        return;
      }
      for (; ; ) {
        const i = this.next();
        if (i.t !== "id" && i.t !== "str")
          throw new Error("Expected object key");
        const n = this.peek();
        if (n.t === "op" && n.v === ":")
          this.emit(1, this.c(i.v)), this.next(), this.withNestedExpr(() => this.parseExpression());
        else {
          if (i.t !== "id")
            throw new Error("Shorthand requires identifier");
          this.emit(1, this.c(i.v)), this.emit(2, this.id(i.v));
        }
        if (e++, s = this.peek(), s.t === "punc" && s.v === ",") {
          this.next();
          continue;
        }
        break;
      }
      this.expectPunc("}"), this.emit(35, e);
      return;
    }
    throw new Error(`Unexpected token in expression: ${JSON.stringify(t, null, 2)}`);
  }
}
const V = "{{", j = "}}";
class st {
  constructor(t = 5e3) {
    l(this, "map", /* @__PURE__ */ new Map());
    this.limit = t;
  }
  get(t) {
    return this.map.get(t);
  }
  set(t, e) {
    if (!this.map.has(t) && (this.map.set(t, e), this.map.size > this.limit)) {
      const s = this.map.keys().next().value;
      this.map.delete(s);
    }
  }
}
const z = new st(5e3), Y = new st(5e3), yt = /* @__PURE__ */ new Set(["component-id", "scope-id"]), H = /* @__PURE__ */ new Set([
  "checked",
  "selected",
  "disabled",
  "hidden",
  "readonly",
  "required",
  "open"
]);
let L = null;
const wt = { bubbles: !1 }, I = class I {
  constructor(t) {
    l(this, "root", null);
    l(this, "debug", null);
    l(this, "area", null);
    l(this, "areas", null);
    l(this, "parent", null);
    l(this, "self", null);
    l(this, "rxAccIsFillingLocally", !1);
    l(this, "lexicalEnv", null);
    l(this, "selector", "");
    l(this, "children", null);
    l(this, "clones", null);
    l(this, "rxAcc", null);
    l(this, "rxAccIsFilling", !1);
    l(this, "pointer", null);
    l(this, "cloneIndex", null);
    l(this, "parentNode", null);
    l(this, "attached", !0);
    l(this, "detecting", !1);
    l(this, "repeatBC", null);
    l(this, "attachedBC", null);
    l(this, "nodeByIndex", null);
    l(this, "nodeValueByIndex", null);
    l(this, "attrValueByIndex", null);
    l(this, "innerHTMLValue", "");
    l(this, "events", null);
    l(this, "onRxUpdate", null);
    l(this, "rxUpdated", null);
    l(this, "rxUpdatedScheduled", !1);
    l(this, "domStructureChanged", null);
    l(this, "domChangedScheduled", !1);
    l(this, "onceMap", null);
    l(this, "node", null);
    if (Object.assign(this, t), typeof this.self != "function")
      throw new Error("Invalid self param");
    this.root || (this.root = this, this.areas = [], this.debug = {
      selector: t.selector,
      __tplFile: t.__tplFile
    }, this.createAreas(this.node), this.onRxUpdate = this.getRxUpdate());
    const e = +this.node.getAttribute("area-index");
    this.area = this.root.areas[e];
    const s = this.node.getAttribute("repeat");
    s && (this.setPointer(), this.repeatBC = this.getVMProgram(s), this.area.filled || (this.area.templateNodeForClone = this.node.cloneNode(
      !0
    ), this.area.templateNodeForClone.removeAttribute("repeat")), this.node.remove(), this.clones = []), this.area.filled ? this.handleAttributesFilledArea() : this.handleAttributes(), this.area.innerHtmlTemplateBC || this.handleChildrens(this.node), this.setEvents(), this.area.attrNameByIndex && (this.attrValueByIndex = []), this.area.varNameByIndex && (this.lexicalEnv = /* @__PURE__ */ Object.create(null)), this.area.filled = !0;
  }
  static getChangeAttrEvent(t, e, s) {
    return new CustomEvent(
      "onchangeattr",
      Object.assign({ detail: { name: t, prev: e, next: s } }, wt)
    );
  }
  static allowAttributeEvent(t, e) {
    L ?? (L = /* @__PURE__ */ new WeakMap()), L.set(t, e);
  }
  static stringToNode(t) {
    const e = document.createElement("template");
    e.innerHTML = t.trim();
    const s = e.content.firstElementChild;
    if (!s)
      throw new Error("Template.stringToNode(): empty template HTML");
    return s;
  }
  static setAppVariables(t) {
    I.appVariables = t;
  }
  detectChanges() {
    this.root.completelyClearRxAcc(), this.root.rxAcc = /* @__PURE__ */ new Map(), this.root.rxAccIsFilling = !0, this.root.internalDetectChanges(), this.root.rxAccIsFilling = !1;
  }
  internalDetectChanges() {
    if (this.detecting) {
      const t = ["Template error: detectChanges() called during detectChanges()"];
      throw this.root.selector && t.push(this.root.selector), new Error(
        t.join(" at ")
      );
    }
    if (this.detecting = !0, this.updateVars(), this.attachedBC && this.handleAttachedAttr(), !this.attached) {
      this.detecting = !1;
      return;
    }
    this.repeatBC ? this.updateRepeat() : (this.updateAllTextNodes(), this.updateAllChildren(), this.updateAttributes(), this.updateInnerHtml()), this.detecting = !1, this.rxAccIsFillingLocally = !1;
  }
  completelyClearRxAcc() {
    if (this.root.rxAcc) {
      for (const t of this.root.rxAcc) {
        const e = t[0], s = t[1];
        for (const i of s) {
          const n = i[0];
          e.postUpdateFns.delete(n.root.onRxUpdate);
        }
      }
      this.root.rxAcc = null, this.root.rxUpdated = null;
    }
  }
  clearRxAccLocally() {
    if (this.root.rxAcc)
      for (const t of this.root.rxAcc) {
        const e = t[0], s = t[1];
        s.delete(this), s.size === 0 && e.postUpdateFns.delete(this.root.onRxUpdate);
      }
  }
  fullDestroy() {
    this.completelyClearRxAcc(), this.removeEvents(), this.node && (this.node.innerHTML = ""), this.removePointer();
  }
  destroyAllClones() {
    if (this.clones) {
      for (; this.clones.length; )
        this.destroyLastClone();
      this.markDomStructureChanged();
    }
  }
  locallyDestroyAllChildren() {
    if (this.children)
      for (let t = 0; t < this.children.length; t++)
        this.children[t].locallyDestroy();
  }
  destroyLastClone() {
    const t = this.clones.pop();
    t.node && t.node.remove(), t.locallyDestroy(), t.removePointer();
  }
  locallyDestroy() {
    this.clearRxAccLocally(), this.removeEvents(), this.attachedBC && this.runVMProgramForContext(
      5,
      this.attachedBC,
      0,
      !0
    ), this.children && this.locallyDestroyAllChildren(), this.repeatBC && this.destroyAllClones();
  }
  attach() {
    const e = this.getPointer().nextSibling;
    e ? this.parentNode.insertBefore(this.node, e) : this.parentNode.appendChild(this.node), this.attached = !0, this.setEvents(), this.rxAccIsFillingLocally = !0, this.parentNode = null, this.markDomStructureChanged();
  }
  detach() {
    this.locallyDestroy(), this.parentNode = this.node.parentNode, this.node.remove(), this.attached = !1, this.markDomStructureChanged();
  }
  static kebabToCamel(t) {
    return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
  }
  execRepeatExpr(t) {
    const e = this.runVMProgramForContext(1, this.repeatBC, 0, t) ?? [], s = typeof e;
    if (s === "number")
      try {
        const i = new Array(e);
        for (let n = 0; n < e; n++) i[n] = n;
        return i;
      } catch (i) {
        this.handleError(i, "vm run", this.repeatBC);
      }
    else Array.isArray(e) || this.handleError(
      new Error(
        `Repeat expression must return array or number, got ${s}`
      ),
      "vm run",
      this.repeatBC
    );
    return e;
  }
  rebuildClones() {
    const t = this.execRepeatExpr(this.root.rxAccIsFilling || this.rxAccIsFillingLocally), e = t.length - this.clones.length;
    if (e !== 0)
      if (e > 0) {
        const s = this.clones.length, i = s === 0 ? this.getPointer() : this.clones[s - 1].node, n = document.createDocumentFragment(), h = (c) => this.execRepeatExpr(c);
        for (let c = 0; c < e; c++) {
          const p = this.area.templateNodeForClone.cloneNode(!0);
          n.appendChild(p), this.addClone(p, h, s + c);
        }
        this.insertFragmentAfter(i, n), this.markDomStructureChanged();
      } else {
        for (; this.clones.length > t.length; )
          this.destroyLastClone();
        this.markDomStructureChanged();
      }
  }
  updateAttributes() {
    if (this.area.contentAttributes)
      for (let t = 0; t < this.area.contentAttributes.length; t++)
        this.updateAttr(this.area.contentAttributes[t]);
  }
  updateVars() {
    if (this.area.varAttributes)
      for (let t = 0; t < this.area.varAttributes.length; t++) {
        const e = this.area.varAttributes[t];
        this.updateVar(e);
      }
  }
  removeEvents() {
    if (this.events)
      for (const t in this.events)
        this.node.removeEventListener(t, this.events[t]);
  }
  setEvents() {
    this.events ?? (this.events = /* @__PURE__ */ Object.create(null));
    for (const t in this.area.events) {
      const e = (s) => {
        this.runVMProgramForContext(
          2,
          this.area.events[t],
          0,
          !1,
          s
        );
      };
      this.events[t] = e, this.node.addEventListener(t, e);
    }
  }
  handleAttachedAttr() {
    const t = this.runVMProgramForContext(
      5,
      this.attachedBC,
      0,
      this.root.rxAccIsFilling || this.rxAccIsFillingLocally
    );
    t && !this.attached ? this.attach() : !t && this.attached && this.detach();
  }
  updateRepeat() {
    this.rebuildClones(), this.updateAllClones();
  }
  reactiveUpdateAttachedAttr() {
    const t = this.attached;
    this.handleAttachedAttr();
    const e = this.attached;
    !t && e && this.internalDetectChanges();
  }
  reactiveUpdateLexicalEnv() {
    this.attached && this.internalDetectChanges();
  }
  reactiveUpdateRepeat() {
    this.attached && this.updateRepeat();
  }
  reactiveUpdateNode(t) {
    this.attached && this.updateTextNode(t);
  }
  reactiveUpdateAttr(t) {
    this.attached && this.updateAttr(t);
  }
  reactiveUpdateInnerHtml() {
    this.attached && this.updateInnerHtml();
  }
  updateTextNode(t) {
    const e = this.nodeByIndex[t], s = this.area.nodeTemplateByIndex[t], i = this.execTemplateArray(
      3,
      s,
      t
    );
    this.nodeValueByIndex[t] !== i && (e.textContent = i, this.nodeValueByIndex[t] = i);
  }
  updateAttr(t) {
    var n;
    const e = this.execTemplateArray(
      4,
      this.area.attrTemplateByIndex[t],
      t
    );
    let s = this.area.attrNameByIndex[t];
    s === "data-src" && (s = "src");
    const i = this.attrValueByIndex[t];
    i !== e && (H.has(s) ? this.node[s] = !!e : this.node.setAttribute(s, e), this.attrValueByIndex[t] = e, (n = L == null ? void 0 : L.get(this.node)) != null && n.has(s) && this.node.dispatchEvent(I.getChangeAttrEvent(s, i, e)));
  }
  updateInnerHtml() {
    if (!this.area.innerHtmlTemplateBC) return;
    const t = this.runVMProgramForContext(
      7,
      this.area.innerHtmlTemplateBC,
      0,
      this.root.rxAccIsFilling || this.rxAccIsFillingLocally
    );
    this.innerHTMLValue !== t && (this.node.innerHTML = t, this.innerHTMLValue = t);
  }
  updateVar(t) {
    this.lexicalEnv[this.area.varNameByIndex[t]] = this.runVMProgramForContext(
      6,
      this.area.varBytecodeByIndex[t],
      t,
      this.root.rxAccIsFilling || this.rxAccIsFillingLocally
    );
  }
  updateAllTextNodes() {
    if (this.area.textNodes)
      for (let t = 0; t < this.area.textNodes.length; t++)
        this.updateTextNode(this.area.textNodes[t]);
  }
  updateAllClones() {
    if (this.clones)
      for (let t = 0; t < this.clones.length; t++)
        this.clones[t].internalDetectChanges();
  }
  updateAllChildren() {
    if (this.children)
      for (let t = 0; t < this.children.length; t++)
        this.children[t].internalDetectChanges();
  }
  isTemplate(t) {
    if (!t) return !1;
    const e = t.indexOf(V);
    return e === -1 ? !1 : t.indexOf(j, e + 2) !== -1;
  }
  getQuoteMap(t) {
    const e = new Uint8Array(t.length);
    let s = 0, i = !1;
    for (let n = 0; n < t.length; n++) {
      const h = t.charCodeAt(n);
      if (e[n] = s ? 1 : 0, !s) {
        (h === 39 || h === 34) && (s = h);
        continue;
      }
      if (i) {
        i = !1;
        continue;
      }
      if (h === 92) {
        i = !0;
        continue;
      }
      h === s && (s = 0);
    }
    return e;
  }
  getTemplateArray(t) {
    const e = Y.get(t);
    if (e) return e;
    const i = t.indexOf('"') !== -1 || t.indexOf("'") !== -1 ? this.getQuoteMap(t) : null, n = [], h = t.length;
    let c = 0;
    for (; c < h; ) {
      let p = t.indexOf(V, c);
      if (i)
        for (; p !== -1 && i[p]; )
          p = t.indexOf(V, p + 1);
      if (p === -1) {
        n.push(t.slice(c));
        break;
      }
      p > c && n.push(t.slice(c, p));
      const m = p + 2;
      let f = t.indexOf(j, m);
      if (i)
        for (; f !== -1 && i[f]; )
          f = t.indexOf(j, f + 1);
      if (f === -1) {
        n.push(t.slice(m));
        break;
      }
      n.push(
        this.getVMProgram(t.slice(m, f), t)
      ), c = f + 2;
    }
    return Y.set(t, n), n;
  }
  getItem(t, e, s, i) {
    return typeof t == "string" ? t : this.runVMProgramForContext(e, t, s, i);
  }
  execTemplateArray(t, e, s) {
    const i = e.length;
    if (i === 0) return "";
    const n = this.root.rxAccIsFilling || this.rxAccIsFillingLocally;
    if (i === 1) return this.getItem(e[0], t, s, n);
    if (i === 2) return this.getItem(e[0], t, s, n) + this.getItem(e[1], t, s, n);
    if (i === 3) return this.getItem(e[0], t, s, n) + this.getItem(e[1], t, s, n) + this.getItem(e[2], t, s, n);
    if (i === 4) return this.getItem(e[0], t, s, n) + this.getItem(e[1], t, s, n) + this.getItem(e[2], t, s, n) + this.getItem(e[3], t, s, n);
    let h = "";
    for (let c = 0; c < i; c++) h += this.getItem(e[c], t, s, n);
    return h;
  }
  childNodeIsDynamic(t) {
    return t.hasAttribute("repeat") || t.hasAttribute("attached") ? !0 : this.root.areas[+t.getAttribute("area-index")].hasBindings;
  }
  addClone(t, e, s) {
    const i = new I({
      parent: this.parent,
      node: t,
      self: e,
      root: this.root,
      cloneIndex: s,
      rxAccIsFillingLocally: !0
    });
    return this.clones.push(i), i;
  }
  addChildren(t) {
    return new I({
      node: t,
      self: this.self,
      root: this.root,
      cloneIndex: this.cloneIndex,
      rxAccIsFillingLocally: this.rxAccIsFillingLocally
    });
  }
  areaFactory() {
    return {
      hasBindings: !1,
      nodeTemplateByIndex: null,
      attrNameByIndex: null,
      attrTemplateByIndex: null,
      varNameByIndex: null,
      varBytecodeByIndex: null,
      textNodes: null,
      contentAttributes: null,
      varAttributes: null,
      eventAttributes: null,
      events: null,
      templateNodeForClone: null,
      filled: !1,
      innerHtmlTemplateBC: null
    };
  }
  createAreas(t) {
    t.setAttribute("area-index", String(this.root.areas.length));
    const e = this.areaFactory();
    this.root.areas.push(e);
    const s = t.hasAttribute("inner-html");
    if (e.hasBindings = this.hasBindingAttributes(t) || this.hasTemplateTextChild(t), !s)
      for (let i = t.firstElementChild; i; i = i.nextElementSibling)
        this.createAreas(i);
  }
  hasBindingAttributes(t) {
    for (const e of Array.from(t.attributes)) {
      const { name: s, value: i } = e;
      if (s === "repeat" || s === "attached" || s === "inner-html" || s.startsWith("let-") || s.startsWith("on") && this.isBindingHandler(i) || this.isTemplate(i)) return !0;
    }
    return !1;
  }
  isBindingHandler(t) {
    return t.includes("root") || t.includes("this") || t.includes("app");
  }
  hasTemplateTextChild(t) {
    for (let e = t.firstChild; e; e = e.nextSibling)
      if (e.nodeType === Node.TEXT_NODE && this.isTemplate(e.textContent ?? ""))
        return !0;
    return !1;
  }
  handleChildrens(t) {
    var s, i;
    let e = t.firstChild;
    for (; e; ) {
      const n = e.nextSibling;
      if (e.nodeType === 1) {
        const h = e;
        if (this.childNodeIsDynamic(h)) {
          const c = this.addChildren(h);
          c.parent = this, this.children ?? (this.children = []), this.children.push(c);
        } else
          this.handleChildrens(h);
      } else if (e.nodeType === 3) {
        const h = e.textContent;
        if (this.isTemplate(h)) {
          const c = this.getTemplateArray(h);
          this.nodeByIndex ?? (this.nodeByIndex = []), this.nodeValueByIndex ?? (this.nodeValueByIndex = []);
          const p = this.nodeByIndex.push(e) - 1;
          this.area.filled || ((s = this.area).nodeTemplateByIndex ?? (s.nodeTemplateByIndex = []), this.area.nodeTemplateByIndex.push(c), (i = this.area).textNodes ?? (i.textNodes = []), this.area.textNodes.push(p));
        }
      }
      e = n;
    }
  }
  resetDetectingUpTree() {
    let t = this;
    for (; t; )
      t.detecting = !1, t = t.parent;
  }
  handleError(t, e, s = null, i = "", n = "") {
    const h = n ? [n] : [];
    i && h.push(i), this.root.selector && h.push(this.root.selector);
    let c = h.join(" at ");
    throw this.root.debug.__tplFile && (c += ` (${this.root.debug.__tplFile})`), t.message = `${e}: ${t.message} in ${c}`, s && (console.log(c), s.log()), t;
  }
  getVMProgram(t, e) {
    t = t.trim();
    let s = z.get(t);
    if (!s)
      try {
        const i = mt(t);
        s = new vt(i).getBytecode(t), z.set(t, s);
      } catch (i) {
        this.handleError(i, "vm compile", s, e, t);
      }
    return s;
  }
  linkRxToTemplate(t, e, s) {
    if (t === 4) {
      const h = this.area.attrNameByIndex[s];
      if (h && yt.has(h))
        throw new Error(
          `::rx is not allowed in "${h}".`
        );
    }
    let i = this.root.rxAcc.get(e);
    i || (i = /* @__PURE__ */ new Map(), this.root.rxAcc.set(e, i));
    let n = i.get(this);
    n || (n = [null, null, 0, 0, 0, 0], i.set(this, n)), t === 3 ? (n[0] ?? (n[0] = []), n[0].push(s)) : t === 4 ? (n[1] ?? (n[1] = []), n[1].push(s)) : t === 5 ? n[2] = 1 : t === 1 ? n[3] = 1 : t === 6 ? n[4] = 1 : t === 7 && (n[5] = 1), e.setPostUpdate(this.root.onRxUpdate);
  }
  getRxValue(t, e, s, i, n) {
    return t === 2 || n || i && this.linkRxToTemplate(t, e, s), e.value;
  }
  getVarFromLexicalEnv(t) {
    return this.lexicalEnv && t in this.lexicalEnv ? this.lexicalEnv[t] : this.parent ? this.parent.getVarFromLexicalEnv(t) : void 0;
  }
  getThisArg() {
    return typeof this.cloneIndex == "number" ? this.self(this.root.rxAccIsFilling || this.rxAccIsFillingLocally)[this.cloneIndex] : this.self();
  }
  runVMProgramForContext(t, e, s, i, n = null) {
    try {
      return this.repeatBC && t !== 1 ? void 0 : e.noRunNeeded(this) ? this.onceMap.get(e) : e.run(
        this,
        t,
        s,
        I.appVariables,
        i,
        n
      );
    } catch (h) {
      this.resetDetectingUpTree(), this.handleError(h, "vm run", e);
    }
  }
  handleAttributesFilledArea() {
    const t = this.node.attributes;
    for (let e = 0; e < t.length; e++) {
      const s = t[e];
      s.name === "attached" && !this.repeatBC && (this.setPointer(), this.attachedBC = this.getVMProgram(s.value)), s.name === "inner-html" && this.node.removeAttribute("inner-html"), H.has(s.name) && this.node.removeAttribute(s.name);
    }
    if (this.area.eventAttributes)
      for (let e = 0; e < this.area.eventAttributes.length; e++)
        this.node.removeAttribute(this.area.eventAttributes[e]);
  }
  handleAttributes() {
    var e, s, i, n, h, c, p, m;
    const t = this.node.attributes;
    for (let f = 0; f < t.length; f++) {
      const d = t[f];
      if (d.name !== "repeat") {
        if (d.name.indexOf("on") === 0 && this.isBindingHandler(d.value))
          (e = this.area).eventAttributes ?? (e.eventAttributes = []), this.area.eventAttributes.push(d.name), (s = this.area).events ?? (s.events = /* @__PURE__ */ Object.create(null)), this.area.events[d.name.slice(2)] = this.getVMProgram(d.value);
        else if (d.name === "attached" && !this.repeatBC)
          this.setPointer(), this.attachedBC = this.getVMProgram(d.value);
        else if (d.name === "inner-html")
          this.area.innerHtmlTemplateBC = this.getVMProgram(d.value), this.node.removeAttribute("inner-html");
        else if (d.name.indexOf("let-") === 0) {
          (i = this.area).varNameByIndex ?? (i.varNameByIndex = []);
          const a = this.area.varNameByIndex.push(
            I.kebabToCamel(d.name.slice(4))
          ) - 1;
          (n = this.area).varBytecodeByIndex ?? (n.varBytecodeByIndex = []), this.area.varBytecodeByIndex.push(this.getVMProgram(d.value)), (h = this.area).varAttributes ?? (h.varAttributes = []), this.area.varAttributes.push(a);
        } else if (this.isTemplate(d.value)) {
          const a = this.getTemplateArray(d.value);
          (c = this.area).attrNameByIndex ?? (c.attrNameByIndex = []);
          const r = this.area.attrNameByIndex.push(d.name) - 1;
          (p = this.area).attrTemplateByIndex ?? (p.attrTemplateByIndex = []), this.area.attrTemplateByIndex.push(a), (m = this.area).contentAttributes ?? (m.contentAttributes = []), this.area.contentAttributes.push(r), H.has(d.name) && this.node.removeAttribute(d.name);
        }
      }
    }
    if (this.area.eventAttributes)
      for (let f = 0; f < this.area.eventAttributes.length; f++)
        this.node.removeAttribute(this.area.eventAttributes[f]);
  }
  markDomStructureChanged() {
    typeof this.root.domStructureChanged == "function" && (this.root.domChangedScheduled || (this.root.domChangedScheduled = !0, queueMicrotask(() => {
      this.root.domChangedScheduled = !1, this.root.domStructureChanged();
    })));
  }
  getRxUpdate() {
    return (t) => {
      var e;
      (e = this.root).rxUpdated ?? (e.rxUpdated = /* @__PURE__ */ new Set()), this.root.rxUpdated.add(t), !this.root.rxUpdatedScheduled && (this.root.rxUpdatedScheduled = !0, queueMicrotask(() => {
        if (this.root.rxUpdatedScheduled = !1, !!this.root.rxUpdated) {
          for (const s of this.root.rxUpdated) {
            const i = this.root.rxAcc.get(s);
            for (const n of i) {
              const h = n[0], c = n[1];
              if (c[2]) {
                h.reactiveUpdateAttachedAttr();
                continue;
              }
              if (c[4]) {
                h.reactiveUpdateLexicalEnv();
                continue;
              }
              if (c[0])
                for (const p of c[0])
                  h.reactiveUpdateNode(p);
              if (c[1])
                for (const p of c[1])
                  h.reactiveUpdateAttr(p);
              c[3] && h.reactiveUpdateRepeat(), c[5] && h.reactiveUpdateInnerHtml();
            }
          }
          this.root.rxUpdated = null;
        }
      }));
    };
  }
  insertFragmentAfter(t, e) {
    const s = t.parentNode, i = t.nextSibling;
    i ? s.insertBefore(e, i) : s.appendChild(e);
  }
  removePointer() {
    this.pointer && this.pointer.remove();
  }
  getPointer() {
    if (!this.pointer)
      throw new Error(
        [
          'Template initialization error: "pointer" is missing.',
          "This usually means the Template was created when its node was not in the DOM.",
          "You need to call setPointer() after inserting the node into the DOM.",
          `Node: ${this.node.tagName || this.node}`
        ].join(`
`)
      );
    return this.pointer;
  }
  setPointer() {
    this.node.parentNode && (this.pointer = this.node.parentNode.insertBefore(
      document.createComment("p"),
      this.node
    ));
  }
};
l(I, "appVariables", {});
let O = I;
class bt {
  constructor() {
    l(this, "instancesBySelector", {});
    l(this, "componentsRoot", []);
    l(this, "scopes", {});
    l(this, "listBySelector", /* @__PURE__ */ new Map());
  }
  removeComponents(t) {
    for (; t.length; ) {
      const e = t.pop();
      e.disconnectedCallback(), N.instancesBySelector[e.selector].delete(
        e.node
      );
    }
  }
  define(t) {
    this.listBySelector.set(t.selector, t);
  }
  connectBySelector(t, e, s = document, i = null) {
    const n = s.querySelectorAll(t), h = Array.from(n), c = [];
    if (h.length) {
      const p = this.listBySelector.get(t);
      if (!p)
        throw new Error(
          `${t} component is not defined. Call componentsRegistryService.define(...)`
        );
      for (const m of h) {
        this.instancesBySelector[t] = this.instancesBySelector[t] || /* @__PURE__ */ new Map();
        let f = this.instancesBySelector[t].get(m);
        if (!f) {
          f = new p(), f.selector = t, f.node = m;
          let d = null;
          i != null && i.httpFactory && (d ?? (d = {}), d.httpFactory = i.httpFactory), i != null && i.params$ && (d ?? (d = {}), d.routeParams$ = i.params$);
          try {
            f.connectedCallback(d), e.push(f), this.instancesBySelector[t].set(m, f), c.push(f);
          } catch (a) {
            throw a;
          }
        }
      }
    }
    return c;
  }
  initApp() {
    for (const t of this.listBySelector.keys())
      this.connectBySelector(t, this.componentsRoot);
  }
  connectScope(t) {
    this.scopes[t.id] = t;
  }
  disconnectScope(t) {
    delete this.scopes[t.id];
  }
}
const N = new bt();
class T {
  constructor(t, e = null) {
    l(this, "value", null);
    l(this, "groupIndex", null);
    l(this, "postUpdateFns", null);
    this.group = t, this.fn = e, this.groupIndex = this.group.length, this.group.push(this);
  }
  update(...t) {
    if (this.value = typeof this.fn == "function" ? this.fn(...t) : null, !!this.postUpdateFns)
      for (const e of this.postUpdateFns)
        e(this);
  }
  setPostUpdate(t) {
    this.postUpdateFns ?? (this.postUpdateFns = /* @__PURE__ */ new Set()), this.postUpdateFns.add(t);
  }
  unsubscribe() {
    const t = this.groupIndex, e = this.group.pop();
    t < this.group.length && (this.group[t] = e, e.groupIndex = t);
  }
}
class it extends T {
  constructor(e, s, i, ...n) {
    super(e, s);
    l(this, "deps");
    l(this, "updateScheduled", !1);
    l(this, "update", () => {
      this.updateScheduled || (this.updateScheduled = !0, queueMicrotask(() => {
        super.update(...this.deps.map((e) => e.value)), this.updateScheduled = !1;
      }));
    });
    this.deps = n;
    for (const h of n)
      h.setPostUpdate(this.update);
    i != null && i.immediate && this.update();
  }
  unsubscribe() {
    var e, s;
    for (const i of this.deps)
      (e = i.postUpdateFns) == null || e.delete(this.update), ((s = i.postUpdateFns) == null ? void 0 : s.size) === 0 && (i.postUpdateFns = null);
    super.unsubscribe();
  }
}
class kt {
  constructor() {
    l(this, "id", "");
    l(this, "index", "");
    l(this, "selector", "");
    l(this, "node", null);
    l(this, "http", null);
    l(this, "config", null);
    l(this, "outerScope", null);
    l(this, "innerScope", null);
    l(this, "destroyed", !1);
    l(this, "ac", null);
    l(this, "dependencies", null);
    l(this, "connectedDependencies", null);
    l(this, "hasOuterScope", !1);
    l(this, "hasConfig", !1);
    l(this, "isDirective", !1);
    l(this, "template", null);
    l(this, "rxList", null);
    l(this, "value$", this.newRx());
    l(this, "value", null);
    l(this, "__tplFile", "");
    l(this, "onUpdateValue", (t, e, s) => (t !== this.value && (this.value = t, this.setValue(e)), t));
  }
  disconnectedCallback() {
    if (this.destroyed = !0, this.ac && this.ac.abort(), this.template && this.template.fullDestroy(), this.node && !this.isDirective && this.node.remove(), this.value$ && this.value$.unsubscribe(), this.connectedDependencies && N.removeComponents(this.connectedDependencies), this.rxList)
      for (; this.rxList.length; )
        this.rxList.pop().unsubscribe();
    this.innerScope && N.disconnectScope(this.innerScope);
  }
  getScope() {
    const t = this.getScopeId(), e = N.scopes[t];
    if (t && !e)
      throw new Error(
        `Scope "${t}" not found for selector "${this.selector}" (component-id="${this.getId()}")`
      );
    return e;
  }
  connectedCallback(t = null) {
    if (this.syncId(), this.setIndex(), this.outerScope = this.getScope(), this.outerScope) {
      const e = this.outerScope.descriptors[this.id];
      if (this.hasConfig) {
        if (!e)
          throw new Error(
            `Descriptor not found for selector "${this.selector}" id "${this.id}" in scope "${this.getScopeId()}"`
          );
        this.config = e.config, this.config || (this.config = {});
      }
      this.hasOuterScope && (this.rxList ?? (this.rxList = []), this.outerScope.newRxValue(
        this.id,
        this.onUpdateValue,
        this.rxList
      ));
    }
    if (this.innerScope && N.connectScope(this.innerScope), !this.isDirective && !(t != null && t.disableTemplate) && this.initTemplate(), t != null && t.httpFactory) {
      this.ac = new AbortController();
      const e = Object.keys(t.httpFactory);
      this.http = /* @__PURE__ */ Object.create(null);
      for (const s of e)
        this.http[s] = t.httpFactory[s](this.ac.signal);
    }
  }
  setScopeId(t) {
    return this.node.setAttribute("scope-id", t);
  }
  getScopeId() {
    return this.node.getAttribute("scope-id");
  }
  setId(t) {
    this.node.setAttribute("component-id", t), this.syncId();
  }
  getId() {
    return this.node.getAttribute("component-id");
  }
  getIndex() {
    return this.node.getAttribute("component-index");
  }
  syncId() {
    this.id = this.getId();
  }
  setIndex() {
    this.index = this.getIndex() || "0";
  }
  getHTML() {
    return "";
  }
  setValue(t = !1) {
    this.value = this.outerScope.getValue(this.id, this.index), this.value$.update(this.value);
  }
  updateDependencies() {
    if (!(!this.dependencies || !this.dependencies.size)) {
      if (this.connectedDependencies) {
        let t = null;
        this.connectedDependencies.length = 0;
        for (const e of this.connectedDependencies)
          document.contains(e.node) ? this.connectedDependencies.push(e) : (t ?? (t = []), t.push(e));
        t && N.removeComponents(t);
      }
      for (const t of this.dependencies) this.connectDependency(t);
    }
  }
  connectDependency(t) {
    return this.connectedDependencies ?? (this.connectedDependencies = []), N.connectBySelector(
      t,
      this.connectedDependencies,
      this.node
    );
  }
  addDependencies(t) {
    for (const e of t)
      this.dependencies.add(e);
  }
  initTemplate() {
    const t = this.getHTML();
    t && (this.node.innerHTML = t, this.template = new O({
      node: this.node,
      self: () => this,
      selector: this.selector,
      __tplFile: this.__tplFile,
      domStructureChanged: () => {
        this.domStructureChanged();
      }
    }), this.template.detectChanges(), this.updateDependencies());
  }
  domStructureChanged() {
    this.updateDependencies();
  }
  newRx(t = null) {
    this.rxList ?? (this.rxList = []);
    const e = new T(this.rxList, (s) => s);
    return e.update(t), e;
  }
  newRxFunc(t, ...e) {
    return this.rxList ?? (this.rxList = []), new it(this.rxList, t, { immediate: !0 }, ...e);
  }
  newRxValueFromScope(t, e) {
    return this.rxList ?? (this.rxList = []), t.newRxValue(e, (s) => s, this.rxList);
  }
  newRxEventFromScope(t, e, s) {
    return this.rxList ?? (this.rxList = []), t.newRxEvent(e, s, (i) => i, this.rxList);
  }
  newRxValueFromScopeByIndex(t, e) {
    this.rxList ?? (this.rxList = []);
    const s = {};
    return t.newRxValue(e, (i, n, h) => (s[h] = i, s), this.rxList);
  }
  newRxEventFromScopeByIndex(t, e, s) {
    this.rxList ?? (this.rxList = []);
    const i = {};
    return t.newRxEvent(e, s, (n, h) => (i[h] = n, i), this.rxList);
  }
}
class Et {
  constructor() {
    l(this, "rxList", null);
  }
  newRx(t = null) {
    this.rxList ?? (this.rxList = []);
    const e = new T(this.rxList, (s) => s);
    return e.update(t), e;
  }
  newRxFunc(t, ...e) {
    return this.rxList ?? (this.rxList = []), new it(this.rxList, t, { immediate: !0 }, ...e);
  }
}
const k = class k {
  constructor(t) {
    l(this, "id");
    l(this, "values", /* @__PURE__ */ Object.create(null));
    l(this, "rx", {
      eventsByNames: {},
      values: {},
      allValues: []
    });
    l(this, "_ids", []);
    this.descriptors = t, this.id = k.lastId++, this._ids = k.idsArr(t);
    for (let e = 0; e < this._ids.length; e++) {
      const s = this._ids[e];
      this.initId(s);
    }
  }
  initId(t) {
    this.rx.values[t] = [], this.rx.eventsByNames[t] = /* @__PURE__ */ Object.create(null), this.values[t] = /* @__PURE__ */ Object.create(null);
  }
  addDescriptor(t, e) {
    if (this.descriptors[t])
      throw new Error(`Descriptor "${String(t)}" already exists`);
    this._ids.push(t), this.descriptors[t] = e, this.initId(t);
  }
  removeDescriptor(t) {
    const e = this._ids.indexOf(t);
    if (e === -1) throw new Error(`Descriptor "${String(t)}" not found`);
    this._ids.splice(e, 1), delete this.values[t], delete this.descriptors[t], delete this.rx.values[t], delete this.rx.eventsByNames[t];
  }
  getValue(t, e = "0") {
    const s = this.values[t];
    if (!s)
      throw new Error(`Scope value bucket "${String(t)}" not found`);
    return s[e];
  }
  setValue(t, e, s = "0", i = !1) {
    if (!this.values[t])
      throw new Error(
        `Cannot set for unknown id "${t}" (descriptor not found)`
      );
    this.values[t][s] = e, this.execSubs(this.rx.values[t], e, i, s), this.updateAllValues();
  }
  setValues(t, e = !1) {
    return this._set(t, e);
  }
  setValuesAtIndex(t, e = "0", s = !1) {
    return this._set(k.wrapAtIndex(t, e), s);
  }
  newRxEvent(t, e, s, i) {
    const n = this.rx.eventsByNames[t];
    n[e] = n[e] || [];
    const h = new T(n[e], s);
    return i.push(h), h;
  }
  newRxAllValues(t) {
    return new T(this.rx.allValues, t);
  }
  newRxValue(t, e, s) {
    const i = new T(this.rx.values[t], e);
    return s.push(i), i;
  }
  emitEvent(t, e, s, i) {
    if (this.rx.eventsByNames[t] && this.rx.eventsByNames[t][s])
      for (const n of this.rx.eventsByNames[t][s])
        n.update(i, e);
  }
  _set(t, e) {
    for (let s in t) {
      const i = t[s];
      if (!this.values[s])
        throw new Error(
          `Cannot set for unknown id "${String(s)}" (descriptor not found)`
        );
      for (let n in i)
        this.values[s][n] = i[n], this.execSubs(this.rx.values[s], i[n], e, n);
    }
    this.updateAllValues();
  }
  updateAllValues() {
    let t = 0;
    for (; t < this.rx.allValues.length; )
      this.rx.allValues[t].update(this.values), t++;
  }
  execSubs(t, e, s, i) {
    for (let n = 0; n < t.length; n++)
      t[n].update(e, s, i);
  }
  static idsArr(t) {
    return Object.keys(t);
  }
  static ids(t) {
    const e = /* @__PURE__ */ Object.create(null), s = k.idsArr(t);
    for (let i = 0; i < s.length; i++) {
      const n = s[i];
      e[n] = n;
    }
    return e;
  }
  static wrapAtIndex(t, e = "0") {
    const s = /* @__PURE__ */ Object.create(null);
    for (let i in t)
      s[i] = { [e]: t[i] };
    return s;
  }
  ids() {
    return k.ids(this.descriptors);
  }
  idsArr() {
    return k.idsArr(this.descriptors);
  }
};
l(k, "lastId", 0);
let W = k;
class At {
  constructor(t) {
    l(this, "matcher");
    l(this, "re", /([:*])(\w+)/g);
    this.templateUrl = t, this.matcher = new q(t);
  }
  getReplacer(t) {
    return (e, s) => {
      if (!(s in t))
        throw new Error(
          `Missing route param "${s}" for template "${this.templateUrl}"`
        );
      const i = t[s];
      return e === "*" ? String(i).split("/").map((n) => encodeURIComponent(String(n))).join("/") : encodeURIComponent(String(i));
    };
  }
  build(t = {}, e, s) {
    const i = this.getReplacer(t), n = this.templateUrl.replace(
      this.re,
      (p, m, f) => i(m, f)
    ), h = e == null ? void 0 : e.toString(), c = s ? s.replace(/^#/, "") : "";
    return n + (h ? `?${h}` : "") + (c ? `#${c}` : "");
  }
}
const R = class R {
  constructor(t) {
    l(this, "names", []);
    l(this, "re");
    let e = t.replace(R.reEscape, "\\$&");
    e = e.replace(R.reParam, this.replacer.bind(this)), this.re = new RegExp("^" + e + "$");
  }
  replacer(t, e, s) {
    return this.names.push(s), e === ":" ? "([^/]*)" : "(.*)";
  }
  parse(t) {
    const e = t.match(this.re);
    if (!e) return null;
    const s = {};
    for (let i = 0; i < this.names.length; i++) {
      const n = e[i + 1], h = +n;
      s[this.names[i]] = isNaN(h) ? n : h;
    }
    return s;
  }
};
l(R, "reEscape", /[\-\[\]{}()+?.,\\\^$|#\s]/g), l(R, "reParam", /([:*])(\w+)/g);
let q = R;
const K = /* @__PURE__ */ new Set();
class Ct extends Et {
  constructor() {
    super();
    l(this, "rules", K);
    l(this, "completedComponentRules", []);
    l(this, "pathname$", this.newRx(""));
    l(this, "hash$", this.newRx(""));
    l(this, "search$", this.newRx(""));
    l(this, "scrollToHashElementIsBlocked", !1);
    l(this, "unblockScrollToHashElement", () => {
      this.scrollToHashElementIsBlocked = !1;
    });
    l(this, "eventListener", () => {
      this.update();
    });
    window.addEventListener("hashchange", this.eventListener), window.addEventListener("popstate", this.eventListener);
  }
  hrefIsActive(e, s = null) {
    const i = new URL(e, window.location.origin);
    let n = s != null && s.startsWith ? window.location.pathname.startsWith(i.pathname) : i.pathname === window.location.pathname, h = !0, c = !0;
    return !(s != null && s.ignoreSearch) && i.search && (h = i.search === window.location.search), !(s != null && s.ignoreHash) && i.hash && (c = i.hash === window.location.hash), n && h && c;
  }
  getCompletedRedirectRules(e) {
    const s = [], i = window.location.pathname;
    for (const n of e)
      n.url.matcher.parse(i) && s.push({
        redirectTo: n.redirectTo,
        url: n.url
      });
    return s;
  }
  getCompletedComponentRules(e, s) {
    const i = new Set(e.map((c) => c.url)), n = [], h = window.location.pathname;
    for (const c of s) {
      const p = c.url.matcher.parse(h);
      if (p)
        if (i.has(c.url)) {
          const m = e.find((f) => f.url === c.url);
          m.params$.update(p), n.push(m);
        } else {
          const m = c.componentSelectorUnbox(), f = c.routeSelectorUnbox();
          n.push({
            url: c.url,
            componentSelector: m,
            routeSelector: f,
            params$: this.newRx(p),
            httpFactory: c.httpFactory,
            onLoadRoute: c.onLoadRoute,
            onUnloadRoute: c.onUnloadRoute,
            components: []
          });
        }
    }
    return n;
  }
  update(e = !1) {
    const s = new URL(window.location.href);
    if (this.pathname$.value !== s.pathname) {
      const { redirectRules: i, componentRules: n } = this.separateRules();
      if (!e && this.applyRedirectRulesForUrl(i)) {
        this.update(!0);
        return;
      }
      this.applyComponentRulesForUrl(n), this.pathname$.update(s.pathname);
    }
    this.hash$.value !== s.hash && (this.hash$.update(s.hash), this.scrollToHashElement()), this.search$.value !== s.search && this.search$.update(s.search);
  }
  scrollToHashElement() {
    var e;
    this.scrollToHashElementIsBlocked || this.hash$.value && ((e = document.querySelector(this.hash$.value)) == null || e.scrollIntoView({ behavior: "instant", block: "start" }));
  }
  blockScrollToHashElement(e = 200) {
    return this.scrollToHashElementIsBlocked = !0, at(e, this.unblockScrollToHashElement);
  }
  pushHistory(e) {
    const s = new URL(e, window.location.origin);
    this.pathname$.value === s.pathname && this.hash$.value === s.hash && this.search$.value === s.search || (history.pushState("", "", e), this.update());
  }
  pushHistoryLink(e, s) {
    e.preventDefault(), this.pushHistory(s);
  }
  separateRules() {
    const e = [], s = [];
    for (const i of this.rules) {
      let n = !1, h = !1;
      if (typeof i.componentSelectorUnbox == "function" && (n = !0), i.redirectTo && (h = !0), n && h || !n && !h)
        throw new Error(
          `Invalid options for ${JSON.stringify(i.originalParams, null, 2)}: expected either "componentSelectorUnbox" or "redirectTo"`
        );
      n ? e.push(i) : s && s.push(i);
    }
    return {
      componentRules: e,
      redirectRules: s
    };
  }
  applyRedirectRulesForUrl(e) {
    const s = this.getCompletedRedirectRules(e);
    if (s.length) {
      const i = s[s.length - 1];
      return history.replaceState(null, "", i.redirectTo), !0;
    }
    return !1;
  }
  applyComponentRulesForUrl(e) {
    const s = this.completedComponentRules, i = this.getCompletedComponentRules(s, e), n = new Set(s.map((c) => c.url)), h = new Set(i.map((c) => c.url));
    for (const c of s)
      h.has(c.url) || (typeof c.onUnloadRoute == "function" && c.onUnloadRoute(), N.removeComponents(c.components));
    for (const c of i) {
      if (n.has(c.url))
        continue;
      const p = document.querySelector(c.routeSelector);
      if (!p)
        throw new Error(
          `Node for ${c.routeSelector} for ${c.componentSelector} not found`
        );
      p.innerHTML = `<${c.componentSelector}></${c.componentSelector}>`, N.connectBySelector(
        c.componentSelector,
        c.components,
        p,
        c
      ), typeof c.onLoadRoute == "function" && c.onLoadRoute();
    }
    this.completedComponentRules = i;
  }
}
const Nt = new Ct();
class Rt {
  constructor(t) {
    l(this, "routerLayoutIdx", 0);
    l(this, "rules", {});
    const e = Object.keys(t);
    for (const s of e) {
      const i = t[s];
      this.rules[s] = {
        ...i,
        url: new At(i.url),
        originalParams: i
      };
      const n = this.rules[s];
      typeof n.componentSelectorUnbox == "function" && typeof n.routeSelectorUnbox != "function" && (n.routeSelectorUnbox = this.getRouterOutletUnbox()), K.add(this.rules[s]);
    }
  }
  buildUrl(t, e = {}) {
    return this.rules[t].url.build(e);
  }
  getRouterOutletUnbox() {
    const t = this.routerLayoutIdx++;
    return () => `.router-outlet-${t}`;
  }
  destroy() {
    const t = Object.keys(this.rules);
    for (const e of t)
      K.delete(this.rules[e]);
  }
}
const B = class B {
  constructor(t, e = {}, s = !1, i = 0) {
    l(this, "cache", {});
    l(this, "factory", (t) => {
      const e = this, s = (n) => ({
        ...n || {},
        signal: t
      });
      return {
        request: (n, h, c) => e.request(n, h, s(c)),
        clearCache: (n, h, c) => e.clearCache(n, h, s(c)),
        get: (n, h) => e.get(n, s(h)),
        post: (n, h) => e.post(n, s(h)),
        put: (n, h) => e.put(n, s(h)),
        patch: (n, h) => e.patch(n, s(h)),
        delete: (n, h) => e.delete(n, s(h))
      };
    });
    this.rootUrl = t, this.interceptors = e, this.withCredentials = s, this.cacheTime = i;
  }
  static getQueryString(t) {
    if (!t) return "";
    const e = [];
    for (const s of Object.keys(t)) {
      const i = t[s];
      (i || i === 0) && e.push(
        `${encodeURIComponent(s)}=${encodeURIComponent(String(i))}`
      );
    }
    return e.length ? `?${e.join("&")}` : "";
  }
  getKeyForCache(t, e, s, i) {
    const n = typeof i == "string" ? i : "";
    return t + JSON.stringify(e || {}) + JSON.stringify(s || {}) + n;
  }
  async clearCache(t, e, s = {}) {
    const i = this.rootUrl + e + B.getQueryString(s.query);
    this.interceptors.params && await this.interceptors.params(t, i, s);
    const n = this.getKeyForCache(
      i,
      s.query,
      s.headers,
      s.body
    );
    delete this.cache[n];
  }
  getBodyForForm(t) {
    if (t == null) return "";
    const e = [];
    for (const s of Object.keys(t)) {
      let i = t[s];
      typeof i == "object" && i !== null && (i = JSON.stringify(i)), e.push(
        `${encodeURIComponent(s)}=${encodeURIComponent(String(i))}`
      );
    }
    return e.join("&");
  }
  normalizeBody(t, e) {
    const s = (t == null ? void 0 : t["Content-Type"]) || "application/x-www-form-urlencoded";
    return s === "application/json" ? JSON.stringify(e ?? null) : s === "application/x-www-form-urlencoded" ? this.getBodyForForm(e ?? {}) : e;
  }
  makeError(t, e) {
    const s = new Error(t);
    return s.status = e == null ? void 0 : e.status, s.data = e == null ? void 0 : e.data, s.url = e == null ? void 0 : e.url, s;
  }
  async readResponseData(t) {
    const e = await t.text();
    if (!e) return null;
    try {
      return JSON.parse(e);
    } catch {
      return e;
    }
  }
  async request(t, e, s = {}) {
    const {
      query: i = {},
      headers: n = {},
      body: h,
      useCache: c = !1,
      signal: p
    } = s, m = this.rootUrl + e + B.getQueryString(i);
    this.interceptors.params && await this.interceptors.params(t, m, s);
    const f = !!(c || this.cacheTime), d = f ? this.getKeyForCache(m, i, n, h) : "";
    if (f && this.cache[d])
      return this.cache[d];
    const a = (async () => {
      let r = null;
      try {
        const C = {
          method: t,
          credentials: this.withCredentials ? "include" : "same-origin",
          signal: p
        };
        n && Object.keys(n).length && (C.headers = Object.keys(n).reduce((_, b) => (_[b] = String(n[b]), _), {})), h != null && t !== "GET" && (C.body = this.normalizeBody(n, h), n["Content-Type"] || (n["Content-Type"] = "application/x-www-form-urlencoded", C.headers["Content-Type"] = n["Content-Type"])), r = await fetch(m, C);
      } catch (C) {
        throw f && (this.cache[d] = null), (C == null ? void 0 : C.name) === "AbortError" ? this.makeError("Request aborted", { status: 0, url: m }) : (this.interceptors.error && await this.interceptors.error(t, m, s, 0, null, null), this.makeError(B.REFUSED, { status: 0, url: m }));
      }
      const w = await this.readResponseData(r);
      if (r.ok)
        return this.interceptors.success && await this.interceptors.success(t, m, s, w, r), f && this.cacheTime && setTimeout(() => delete this.cache[d], this.cacheTime), w;
      f && (this.cache[d] = null), this.interceptors.error && await this.interceptors.error(
        t,
        m,
        s,
        r.status,
        w,
        r
      );
      const U = w && (w.message || w.error) || r.statusText || `Request failed with status ${r.status}`;
      throw this.makeError(String(U), {
        status: r.status,
        data: w,
        url: m
      });
    })();
    return f && (this.cache[d] = a), a;
  }
  get(t, e = {}) {
    return this.request("GET", t, e);
  }
  post(t, e = {}) {
    return this.request("POST", t, e);
  }
  put(t, e = {}) {
    return this.request("PUT", t, e);
  }
  patch(t, e = {}) {
    return this.request("PATCH", t, e);
  }
  delete(t, e = {}) {
    return this.request("DELETE", t, e);
  }
};
l(B, "REFUSED", "net::ERR_CONNECTION_REFUSED");
let X = B;
export {
  kt as AbstractComponent,
  Et as AbstractService,
  X as HttpClient,
  Rt as RouteUrlBucket,
  W as RxScope,
  O as Template,
  N as componentsRegistryService,
  Nt as routerService
};
//# sourceMappingURL=index.js.map

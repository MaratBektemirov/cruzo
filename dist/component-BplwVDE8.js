var W = Object.defineProperty;
var P = (n, t, e) => t in n ? W(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var a = (n, t, e) => P(n, typeof t != "symbol" ? t + "" : t, e);
const Z = (n) => n === " " || n === `
` || n === "	" || n === "\r", _ = (n) => n >= "0" && n <= "9", X = /[A-Za-z_$]/, O = /[A-Za-z0-9_$]/, Y = (n) => X.test(n), tt = (n) => O.test(n), et = [
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
function st(n, t) {
  for (const e of et) if (n.startsWith(e, t)) return e;
  return null;
}
function nt(n) {
  n = n.trim();
  const t = [];
  let e = 0;
  for (; e < n.length; ) {
    const s = n[e];
    if (Z(s)) {
      e++;
      continue;
    }
    if (s === "'" || s === '"') {
      const o = s, c = e;
      e++;
      let d = "", u = !1;
      for (; e < n.length; ) {
        const m = n[e++];
        if (m === "\\") {
          if (e >= n.length)
            throw new Error(`Unterminated escape sequence in string at ${c}`);
          const f = n[e++];
          d += f === "n" ? `
` : f === "t" ? "	" : f;
          continue;
        }
        if (m === o) {
          u = !0;
          break;
        }
        d += m;
      }
      if (!u)
        throw new Error(`Unterminated string literal at ${c}`);
      t.push({ t: "str", v: d });
      continue;
    }
    if (_(s) || s === "." && _(n[e + 1] || "")) {
      let o = "";
      for (; e < n.length && (_(n[e]) || n[e] === "."); ) o += n[e++];
      t.push({ t: "num", v: Number(o) });
      continue;
    }
    if (Y(s)) {
      let o = "";
      for (; e < n.length && tt(n[e]); ) o += n[e++];
      t.push({ t: "id", v: o });
      continue;
    }
    const i = st(n, e);
    if (i) {
      e += i.length, "()[]{},".includes(i) ? t.push({ t: "punc", v: i }) : t.push({ t: "op", v: i });
      continue;
    }
    throw new Error(`Unexpected char "${s}" at ${e}`);
  }
  return t.push({ t: "eof" }), t;
}
const A = {
  ip: "color:#777",
  hex: "color:#999",
  op: "color:#4fc1ff;font-weight:600",
  jump: "color:#ff5370;font-weight:600",
  arg: "color:#000",
  com: "color:#777;font-style:italic"
}, D = (n) => "0x" + (n >>> 0).toString(16).padStart(8, "0"), F = (n) => {
  if (typeof n == "string") return JSON.stringify(n);
  if (n == null || typeof n == "number" || typeof n == "boolean") return String(n);
  try {
    const t = JSON.stringify(n);
    return t && t.length > 60 ? t.slice(0, 57) + "…" : t;
  } catch {
    return Object.prototype.toString.call(n);
  }
}, w = {}, j = 255, J = 8;
var G = /* @__PURE__ */ ((n) => (n[n.PUSH_CONST = 1] = "PUSH_CONST", n[n.LOAD_ID = 2] = "LOAD_ID", n[n.LOAD_THIS = 3] = "LOAD_THIS", n[n.GET_PROP = 4] = "GET_PROP", n[n.GET_PROP_KEEP = 5] = "GET_PROP_KEEP", n[n.GET_INDEX = 6] = "GET_INDEX", n[n.GET_INDEX_KEEP = 7] = "GET_INDEX_KEEP", n[n.POP = 8] = "POP", n[n.POP_BELOW = 9] = "POP_BELOW", n[n.UNARY_NOT = 10] = "UNARY_NOT", n[n.UNARY_POS = 11] = "UNARY_POS", n[n.UNARY_NEG = 12] = "UNARY_NEG", n[n.BIN_ADD = 13] = "BIN_ADD", n[n.BIN_SUB = 14] = "BIN_SUB", n[n.BIN_MUL = 15] = "BIN_MUL", n[n.BIN_DIV = 16] = "BIN_DIV", n[n.BIN_MOD = 17] = "BIN_MOD", n[n.BIN_EQ = 18] = "BIN_EQ", n[n.BIN_NEQ = 19] = "BIN_NEQ", n[n.BIN_SEQ = 20] = "BIN_SEQ", n[n.BIN_SNEQ = 21] = "BIN_SNEQ", n[n.BIN_LT = 22] = "BIN_LT", n[n.BIN_LTE = 23] = "BIN_LTE", n[n.BIN_GT = 24] = "BIN_GT", n[n.BIN_GTE = 25] = "BIN_GTE", n[n.CALL_FN = 26] = "CALL_FN", n[n.CALL_METHOD = 27] = "CALL_METHOD", n[n.RX_UI = 28] = "RX_UI", n[n.JMP = 29] = "JMP", n[n.JMP_IF_FALSE = 30] = "JMP_IF_FALSE", n[n.JMP_IF_FALSE_KEEP = 31] = "JMP_IF_FALSE_KEEP", n[n.JMP_IF_TRUE_KEEP = 32] = "JMP_IF_TRUE_KEEP", n[n.JMP_IF_NULLISH = 33] = "JMP_IF_NULLISH", n[n.MAKE_ARRAY = 34] = "MAKE_ARRAY", n[n.MAKE_OBJECT = 35] = "MAKE_OBJECT", n[n.ONCE_ENTER = 36] = "ONCE_ENTER", n[n.ONCE_STORE = 37] = "ONCE_STORE", n))(G || {});
function it(n) {
  return n === 29 || n === 30 || n === 31 || n === 32 || n === 33 || n === 36;
}
function M(n, t = 0) {
  return t << J | n & j;
}
function R(n) {
  return n & j;
}
function $(n) {
  return n >>> J;
}
class K {
  constructor(t, e, s, i, o, c) {
    this.code = t, this.consts = e, this.idNames = s, this.exprCount = i, this.onceCount = o, this.expr = c;
  }
  onlyOnce() {
    return this.exprCount === 1 && this.onceCount === 1;
  }
  fmtArg(t, e, s) {
    switch (t) {
      case 1:
        return [`const[${e}]`, F(this.consts[e])];
      case 2:
        return [this.idNames[e] ?? `<bad id[${e}]>`, ""];
      case 4:
      case 5:
        return [F(this.consts[e]), ""];
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
        return [`-> ${e}`, ""];
      case 26:
      case 27:
        return [`args.length -> ${e}`, ""];
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
      const e = this.code[t] >>> 0, s = R(e), i = $(e);
      let o;
      s === 36 && (o = (this.code[t + 1] ?? 0) >>> 0);
      const c = G[s] ?? `OP_${s}`, [d, u] = this.fmtArg(s, i, o), m = `%c${String(t).padStart(4)} %c${D(e)}  %c${c.padEnd(18)} %c${d}` + (u ? ` %c; ${u}` : ""), f = [
        A.ip,
        A.hex,
        it(s) ? A.jump : A.op,
        A.arg,
        ...u ? [A.com] : []
      ];
      if (console.log(m, ...f), s === 36) {
        t++;
        const p = (this.code[t] ?? 0) >>> 0, r = `%c${String(t).padStart(4)} %c${D(p)}  %c${"WIDE".padEnd(18)} %c${`-> ${p}`}`;
        console.log(r, A.ip, A.hex, A.jump, A.arg);
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
    for (i || (i = [], t.onceMap.set(this, i)); i.length <= e; ) i.push(w);
    i[e] = s;
  }
  getOnceSlotValue(t, e) {
    if (t.onceMap ?? (t.onceMap = /* @__PURE__ */ new Map()), this.onlyOnce())
      return t.onceMap.has(this) ? t.onceMap.get(this) : (t.onceMap.set(this, w), w);
    let s = t.onceMap.get(this);
    for (s || (s = [], t.onceMap.set(this, s)); s.length <= e; ) s.push(w);
    return s[e];
  }
  getSafeErrorMsg(t, e) {
    return `TemplateTypeError: Cannot read properties of ${t === null ? "null" : "undefined"} (reading '${e}')`;
  }
  run(t, e, s, i, o, c) {
    const d = this.code, u = this.consts, m = this.idNames;
    let f, p;
    const r = [];
    let h = 0, v = 0, E = 0;
    const C = (N, k, y) => {
      const l = r[N];
      if (typeof l != "function")
        throw new Error(`Cannot call undefined or non-function value: ${l}`);
      if (!y) return l.call(k);
      const x = r.slice(h - y, h);
      return l.apply(k, x);
    };
    for (; v < d.length; ) {
      const N = d[v++], k = R(N), y = $(N);
      switch (k) {
        case 1:
          r[h++] = u[y];
          break;
        case 2: {
          const l = m[y];
          switch (l) {
            case "root":
              f ?? (f = t.root.self()), r[h++] = f;
              break;
            case "app":
              r[h++] = i;
              break;
            case "index":
              r[h++] = t.cloneIndex;
              break;
            case "$element":
              r[h++] = t.node;
              break;
            case "event":
              r[h++] = c;
              break;
            default:
              r[h++] = t.getVarFromLexicalEnv(l);
              break;
          }
          break;
        }
        case 3:
          p ?? (p = t.getThisArg(o)), r[h++] = p;
          break;
        case 4: {
          const l = u[y], x = r[--h];
          x == null ? (t.handleSafeError(this.getSafeErrorMsg(x, l), this.expr), r[h++] = void 0) : r[h++] = x[l];
          break;
        }
        case 5: {
          const l = u[y], x = r[--h];
          let g;
          x == null ? (t.handleSafeError(this.getSafeErrorMsg(x, l), this.expr), g = void 0) : g = x[l], r[h++] = x, r[h++] = g;
          break;
        }
        case 6: {
          const l = r[--h], x = r[--h];
          x == null ? (t.handleSafeError(this.getSafeErrorMsg(x, l + ""), this.expr), r[h++] = void 0) : r[h++] = x[l];
          break;
        }
        case 7: {
          const l = r[--h], x = r[--h];
          let g;
          x == null ? (t.handleSafeError(this.getSafeErrorMsg(x, l + ""), this.expr), g = void 0) : g = x[l], r[h++] = x, r[h++] = g;
          break;
        }
        case 8:
          h--;
          break;
        case 9: {
          const l = r[--h];
          h--, r[h++] = l;
          break;
        }
        case 10:
          r[h - 1] = !r[h - 1];
          break;
        case 11:
          r[h - 1] = +r[h - 1];
          break;
        case 12:
          r[h - 1] = -r[h - 1];
          break;
        case 13: {
          const l = r[--h];
          r[h - 1] = r[h - 1] + l;
          break;
        }
        case 14: {
          const l = r[--h];
          r[h - 1] = r[h - 1] - l;
          break;
        }
        case 15: {
          const l = r[--h];
          r[h - 1] = r[h - 1] * l;
          break;
        }
        case 16: {
          const l = r[--h];
          r[h - 1] = r[h - 1] / l;
          break;
        }
        case 17: {
          const l = r[--h];
          r[h - 1] = r[h - 1] % l;
          break;
        }
        case 18: {
          const l = r[--h];
          r[h - 1] = r[h - 1] == l;
          break;
        }
        case 19: {
          const l = r[--h];
          r[h - 1] = r[h - 1] != l;
          break;
        }
        case 20: {
          const l = r[--h];
          r[h - 1] = r[h - 1] === l;
          break;
        }
        case 21: {
          const l = r[--h];
          r[h - 1] = r[h - 1] !== l;
          break;
        }
        case 22: {
          const l = r[--h];
          r[h - 1] = r[h - 1] < l;
          break;
        }
        case 23: {
          const l = r[--h];
          r[h - 1] = r[h - 1] <= l;
          break;
        }
        case 24: {
          const l = r[--h];
          r[h - 1] = r[h - 1] > l;
          break;
        }
        case 25: {
          const l = r[--h];
          r[h - 1] = r[h - 1] >= l;
          break;
        }
        case 26: {
          const l = y, x = h - l - 1;
          p ?? (p = t.getThisArg(o));
          const g = C(x, p, l);
          h = x, r[h++] = g;
          break;
        }
        case 27: {
          const l = y, x = h - l - 1, g = h - l - 2, S = r[g], T = C(x, S, l);
          h = g, r[h++] = T;
          break;
        }
        case 28: {
          const l = r[--h];
          if (l == null) throw new Error(`::rx is invalid on ${l}`);
          r[h++] = t.getRxValue(
            e,
            l,
            s,
            o,
            E > 0
          );
          break;
        }
        case 36: {
          const l = y, x = d[v++] >>> 0, g = this.getOnceSlotValue(t, l);
          g !== w ? (r[h++] = g, v = x) : E++;
          break;
        }
        case 37: {
          const l = y;
          this.setOnceSlotValue(t, l, r[h - 1]), E--;
          break;
        }
        case 29:
          v = y;
          break;
        case 30: {
          r[--h] || (v = y);
          break;
        }
        case 31: {
          r[h - 1] ? h-- : v = y;
          break;
        }
        case 32: {
          r[h - 1] ? v = y : h--;
          break;
        }
        case 33: {
          r[h - 1] == null && (v = y);
          break;
        }
        case 34: {
          const l = y, x = new Array(l);
          for (let g = l - 1; g >= 0; g--) x[g] = r[--h];
          r[h++] = x;
          break;
        }
        case 35: {
          const l = y, x = {};
          for (let g = 0; g < l; g++) {
            const S = r[--h], T = r[--h];
            x[T] = S;
          }
          r[h++] = x;
          break;
        }
        default:
          throw new Error(`Unknown op ${k} at ip=${v - 1}`);
      }
    }
    return h ? r[h - 1] : void 0;
  }
}
class rt {
  constructor(t) {
    a(this, "pos", 0);
    a(this, "code", []);
    a(this, "consts", null);
    a(this, "constMap");
    a(this, "idNames", null);
    a(this, "idMap");
    a(this, "onceSlot", 0);
    a(this, "exprDepth", 0);
    a(this, "exprCount", 0);
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
      const o = this.consts.length;
      return this.consts.push(t), this.constMap.set(s, o), o;
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
    this.code.push(M(t, e));
  }
  emitJump(t) {
    const e = this.code.length;
    return this.code.push(M(t, 0)), e;
  }
  patch(t, e) {
    const s = this.code[t];
    this.code[t] = M(R(s), e);
  }
  canCount() {
    return this.exprDepth === 0 && this.exprCount === 0;
  }
  parseBinaryCounted(t, e, s) {
    t();
    let i = this.peek();
    if (this.canCount() && i.t === "op" && e.includes(i.v)) {
      let o = 1;
      for (; i.t === "op" && e.includes(i.v); ) {
        const c = this.next().v;
        t(), s(c), o++, i = this.peek();
      }
      this.exprCount = o;
      return;
    }
    for (; i.t === "op" && e.includes(i.v); ) {
      const o = this.next().v;
      t(), s(o), i = this.peek();
    }
  }
  parseShortCircuit(t, e, s) {
    t();
    let i = this.peek();
    const o = this.canCount() && i.t === "op" && i.v === e;
    let c = 1;
    for (; i.t === "op" && i.v === e; ) {
      this.next();
      const d = this.emitJump(s);
      t(), this.patch(d, this.code.length), o && c++, i = this.peek();
    }
    o && (this.exprCount = c);
  }
  parseNullishChain(t) {
    t();
    let e = this.peek();
    const s = this.canCount() && e.t === "op" && e.v === "??";
    let i = 1;
    for (; e.t === "op" && e.v === "??"; ) {
      this.next();
      const o = this.emitJump(
        33
        /* JMP_IF_NULLISH */
      ), c = this.emitJump(
        29
        /* JMP */
      );
      this.patch(o, this.code.length), this.emit(
        8
        /* POP */
      ), t(), this.patch(c, this.code.length), s && i++, e = this.peek();
    }
    s && (this.exprCount = i);
  }
  getBytecode(t) {
    if (this.peek().t === "eof") throw new Error("Empty template expression is not allowed");
    if (this.parseExpression(), this.peek().t !== "eof") throw new Error("Unexpected token after expression");
    return new K(
      new Uint32Array(this.code),
      this.consts,
      this.idNames,
      this.exprCount || 1,
      this.onceSlot,
      t
    );
  }
  parseExpression() {
    this.parseTernary();
  }
  parseTernary() {
    this.parseNullish();
    const t = this.peek();
    if (t.t === "op" && t.v === "?") {
      this.canCount() && (this.exprCount = 3), this.next();
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
    this.parseNullishChain(() => this.parseOr());
  }
  parseOr() {
    this.parseShortCircuit(
      () => this.parseAnd(),
      "||",
      32
      /* JMP_IF_TRUE_KEEP */
    );
  }
  parseAnd() {
    this.parseShortCircuit(
      () => this.parseEq(),
      "&&",
      31
      /* JMP_IF_FALSE_KEEP */
    );
  }
  parseEq() {
    this.parseBinaryCounted(
      () => this.parseRel(),
      ["===", "!==", "==", "!="],
      (t) => {
        switch (t) {
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
      }
    );
  }
  parseRel() {
    this.parseBinaryCounted(
      () => this.parseAdd(),
      ["<", "<=", ">", ">="],
      (t) => {
        switch (t) {
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
      }
    );
  }
  parseAdd() {
    this.parseBinaryCounted(
      () => this.parseMul(),
      ["+", "-"],
      (t) => this.emit(
        t === "+" ? 13 : 14
        /* BIN_SUB */
      )
    );
  }
  parseMul() {
    this.parseBinaryCounted(
      () => this.parseUnary(),
      ["*", "/", "%"],
      (t) => this.emit(
        t === "*" ? 15 : t === "/" ? 16 : 17
        /* BIN_MOD */
      )
    );
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
      t && (this.emit(
        9
        /* POP_BELOW */
      ), t = !1);
    }, i = () => {
      e.push(this.emitJump(
        33
        /* JMP_IF_NULLISH */
      ));
    }, o = (d) => {
      const u = this.c(d), m = this.peek(), f = m.t === "punc" && m.v === "(";
      this.emit(f ? 5 : 4, u), t = f;
    }, c = () => {
      const d = this.peek(), u = d.t === "punc" && d.v === "(";
      this.emit(
        u ? 7 : 6
        /* GET_INDEX */
      ), t = u;
    };
    for (; ; ) {
      const d = this.peek();
      if (d.t === "op" && d.v === ".") {
        s(), this.next();
        const u = this.next();
        if (u.t !== "id") throw new Error('Expected identifier after "."');
        o(u.v);
        continue;
      }
      if (d.t === "op" && d.v === "?.") {
        const u = this.tokens[this.pos + 1];
        if ((u == null ? void 0 : u.t) === "punc" && u.v === "(") {
          s(), this.next(), i();
          continue;
        }
        if ((u == null ? void 0 : u.t) === "punc" && u.v === "[") {
          s(), this.next(), this.next(), i(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]"), c();
          continue;
        }
        s(), this.next(), i();
        const m = this.next();
        if (m.t !== "id") throw new Error('Expected identifier after "?."');
        o(m.v);
        continue;
      }
      if (d.t === "punc" && d.v === "[") {
        s(), this.next(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]"), c();
        continue;
      }
      if (d.t === "punc" && d.v === "(") {
        this.next();
        const u = this.parseArgsAndCount();
        this.expectPunc(")"), t ? (this.emit(27, u), t = !1) : this.emit(26, u);
        continue;
      }
      if (d.t === "op" && d.v === "::") {
        this.next();
        const u = this.next();
        if (u.t !== "id") throw new Error('Expected modifier after "::"');
        if (u.v === "rx") {
          s(), this.emit(
            28
            /* RX_UI */
          );
          continue;
        }
        throw new Error(`Unknown modifier: ${u.v}`);
      }
      break;
    }
    if (s(), e.length) {
      const d = this.code.length;
      for (const u of e) this.patch(u, d);
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
        const o = this.peek();
        if (o.t === "op" && o.v === ":")
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
const L = "{{", ot = "}}";
var q = /* @__PURE__ */ ((n) => (n[n.REPEAT = 1] = "REPEAT", n[n.EVENT = 2] = "EVENT", n[n.TEXT_NODE = 3] = "TEXT_NODE", n[n.ATTRIBUTE = 4] = "ATTRIBUTE", n[n.ATTACHED = 5] = "ATTACHED", n[n.LEXICAL_ENV = 6] = "LEXICAL_ENV", n[n.INNER_HTML = 7] = "INNER_HTML", n))(q || {});
class z {
  constructor(t = 5e3) {
    a(this, "map", /* @__PURE__ */ new Map());
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
const V = new z(5e3), H = new z(5e3), ht = {
  checked: "checked",
  selected: "selected",
  disabled: "disabled",
  hidden: "hidden",
  readonly: "readOnly",
  required: "required",
  open: "open"
}, at = /* @__PURE__ */ new Set(["component-id", "bucket-id"]);
let I = null;
const ct = { bubbles: !1 }, b = class b {
  constructor(t) {
    a(this, "root", null);
    a(this, "debug", null);
    a(this, "area", null);
    a(this, "areas", null);
    a(this, "parent", null);
    a(this, "self", null);
    a(this, "lexicalEnv", null);
    a(this, "selector", "");
    a(this, "children", null);
    a(this, "clones", null);
    a(this, "rxAcc", null);
    a(this, "pointer", null);
    a(this, "cloneIndex", null);
    a(this, "parentNode", null);
    a(this, "attached", !0);
    a(this, "detecting", !1);
    a(this, "repeatBC", null);
    a(this, "attachedBC", null);
    a(this, "nodeByIndex", null);
    a(this, "nodeValueByIndex", null);
    a(this, "attrValueByIndex", null);
    a(this, "innerHTMLValue", "");
    a(this, "events", null);
    a(this, "onRxUpdate", null);
    a(this, "rxUpdated", null);
    a(this, "rxUpdatedScheduled", !1);
    a(this, "domStructureChanged", null);
    a(this, "domChangedScheduled", !1);
    a(this, "onceMap", null);
    a(this, "node", null);
    if (Object.assign(this, t), typeof this.self != "function")
      throw new Error("Invalid self param");
    this.root || (this.root = this, this.areas = [], this.debug = {
      selector: t.selector,
      __tplFile: t.__tplFile
    }, this.createAreas(this.node), this.onRxUpdate = this.getRxUpdate());
    const e = +this.node.getAttribute("area-index");
    this.area = this.root.areas[e];
    const s = this.node.getAttribute("repeat");
    s && (this.setPointer(), this.repeatBC = this.getTemplateBytecode(s, !0, "repeat"), this.area.filled || (this.area.templateNodeForClone = this.node.cloneNode(
      !0
    ), this.area.templateNodeForClone.removeAttribute("repeat")), this.node.remove(), this.clones = []), this.area.filled ? this.handleAttributesFilledArea() : this.handleAttributes(), this.area.innerHtmlTemplateBC || this.handleChildrens(this.node), this.setEvents(), this.area.attrNameByIndex && (this.attrValueByIndex = []), this.area.varNameByIndex && (this.lexicalEnv = /* @__PURE__ */ Object.create(null)), this.area.filled = !0;
  }
  static getChangeAttrEvent(t, e, s) {
    return new CustomEvent(
      "onchangeattr",
      Object.assign({ detail: { name: t, prev: e, next: s } }, ct)
    );
  }
  static allowAttributeEvent(t, e) {
    I ?? (I = /* @__PURE__ */ new WeakMap()), I.set(t, e);
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
    b.appVariables = t;
  }
  detectChanges() {
    this.root.completelyClearRxAcc(), this.root.rxAcc = /* @__PURE__ */ new Map(), this.root.internalDetectChanges(!0);
  }
  internalDetectChanges(t) {
    if (this.detecting) {
      const e = ["Template error: detectChanges() called during detectChanges()"];
      throw this.root.selector && e.push(this.root.selector), new Error(
        e.join(" at ")
      );
    }
    if (this.detecting = !0, this.updateVars(t), this.attachedBC && this.handleAttachedAttr(t), !this.attached) {
      this.detecting = !1;
      return;
    }
    this.repeatBC ? this.updateRepeat(t) : (this.updateAllTextNodes(t), this.updateAllChildren(t), this.updateAttributes(t), this.updateInnerHtml(t)), this.detecting = !1;
  }
  completelyClearRxAcc() {
    if (this.root.rxAcc) {
      for (const t of this.root.rxAcc) {
        const e = t[0], s = t[1];
        for (const i of s) {
          const o = i[0];
          e.postUpdateFns.delete(o.root.onRxUpdate);
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
  setEventsRec() {
    if (this.setEvents(), !!this.children)
      for (let t = 0; t < this.children.length; t++)
        this.children[t].setEventsRec();
  }
  destroyLastClone() {
    const t = this.clones.pop();
    t.node && t.node.remove(), t.locallyDestroy(), t.removePointer();
  }
  locallyDestroy() {
    this.clearRxAccLocally(), this.removeEvents(), this.locallyDestroyAllChildren(), this.repeatBC && this.destroyAllClones();
  }
  attach() {
    const e = this.getPointer().nextSibling;
    e ? this.parentNode.insertBefore(this.node, e) : this.parentNode.appendChild(this.node), this.attached = !0, this.setEventsRec(), this.parentNode = null, this.markDomStructureChanged();
  }
  linkRxWhenDetach() {
    this.updateVars(!0), this.attachedBC && this.runVMProgramForContext(
      5,
      this.attachedBC,
      0,
      !0
    );
  }
  detach() {
    this.locallyDestroy(), this.linkRxWhenDetach(), this.parentNode = this.node.parentNode, this.node.remove(), this.attached = !1, this.markDomStructureChanged();
  }
  static kebabToCamel(t) {
    return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
  }
  execRepeatExpr(t) {
    const e = this.runVMProgramForContext(1, this.repeatBC, 0, t) ?? [], s = typeof e;
    if (s === "number")
      try {
        const i = new Array(e);
        for (let o = 0; o < e; o++) i[o] = o;
        return i;
      } catch (i) {
        this.handleError(
          i,
          "vm run",
          this.repeatBC,
          this.repeatBC.expr,
          null,
          1
          /* REPEAT */
        );
      }
    else Array.isArray(e) || this.handleError(
      new Error(
        `Repeat expression must return array or number, got ${s}`
      ),
      "vm run",
      this.repeatBC,
      this.repeatBC.expr,
      null,
      1
      /* REPEAT */
    );
    return e;
  }
  rebuildClones(t = !1) {
    const e = this.execRepeatExpr(t), s = e.length - this.clones.length;
    if (s !== 0)
      if (s > 0) {
        const i = this.clones.length, o = i === 0 ? this.getPointer() : this.clones[i - 1].node, c = document.createDocumentFragment(), d = (u) => this.execRepeatExpr(u);
        for (let u = 0; u < s; u++) {
          const m = this.area.templateNodeForClone.cloneNode(!0);
          c.appendChild(m), this.addClone(m, d, i + u);
        }
        this.insertFragmentAfter(o, c), this.markDomStructureChanged();
      } else {
        for (; this.clones.length > e.length; )
          this.destroyLastClone();
        this.markDomStructureChanged();
      }
  }
  updateAttributes(t) {
    if (this.area.contentAttributes)
      for (let e = 0; e < this.area.contentAttributes.length; e++)
        this.updateAttr(this.area.contentAttributes[e], t);
  }
  updateVars(t) {
    if (this.area.varAttributes)
      for (let e = 0; e < this.area.varAttributes.length; e++) {
        const s = this.area.varAttributes[e];
        this.updateVar(s, t);
      }
  }
  removeEvents() {
    if (this.events) {
      for (const t in this.area.events) this.node.removeEventListener(t, this.events[t]);
      this.events = null;
    }
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
  handleAttachedAttr(t) {
    const e = this.runVMProgramForContext(
      5,
      this.attachedBC,
      0,
      t
    );
    e && !this.attached ? this.attach() : !e && this.attached && this.detach();
  }
  updateRepeat(t = !1) {
    this.rebuildClones(t), this.updateAllClones(t);
  }
  reactiveUpdateAttachedAttr() {
    this.internalDetectChanges(!0);
  }
  reactiveUpdateLexicalEnv() {
    this.internalDetectChanges(!0);
  }
  reactiveUpdateRepeat() {
    this.attached && this.updateRepeat(!0);
  }
  reactiveUpdateNode(t) {
    this.attached && this.updateTextNode(t, !1);
  }
  reactiveUpdateAttr(t) {
    this.attached && this.updateAttr(t, !1);
  }
  reactiveUpdateInnerHtml() {
    this.attached && this.updateInnerHtml(!1);
  }
  updateTextNode(t, e) {
    const s = this.nodeByIndex[t], i = this.area.nodeTemplateByIndex[t], o = this.execBytecode(
      3,
      i,
      t,
      e
    );
    this.nodeValueByIndex[t] === o && t in this.nodeValueByIndex || (s.textContent = o, this.nodeValueByIndex[t] = o);
  }
  updateAttr(t, e) {
    var u;
    const s = this.execBytecode(
      4,
      this.area.attrTemplateByIndex[t],
      t,
      e
    );
    let i = this.area.attrNameByIndex[t];
    i === "data-src" && (i = "src");
    const o = this.attrValueByIndex[t];
    if (o === s && t in this.attrValueByIndex) return;
    const c = s === b.REMOVE_ATTR;
    c ? this.node.removeAttribute(i) : this.node.setAttribute(i, s);
    const d = ht[i];
    d && (this.node[d] = c ? !1 : !!s), this.attrValueByIndex[t] = s, (u = I == null ? void 0 : I.get(this.node)) != null && u.has(i) && this.node.dispatchEvent(b.getChangeAttrEvent(i, o, s));
  }
  updateInnerHtml(t) {
    if (!this.area.innerHtmlTemplateBC) return;
    const e = this.runVMProgramForContext(
      7,
      this.area.innerHtmlTemplateBC,
      0,
      t
    );
    this.innerHTMLValue !== e && (this.node.innerHTML = e, this.innerHTMLValue = e);
  }
  updateVar(t, e) {
    this.lexicalEnv[this.area.varNameByIndex[t]] = this.runVMProgramForContext(
      6,
      this.area.varBytecodeByIndex[t],
      t,
      e
    );
  }
  updateAllTextNodes(t) {
    if (this.area.textNodes)
      for (let e = 0; e < this.area.textNodes.length; e++)
        this.updateTextNode(this.area.textNodes[e], t);
  }
  updateAllClones(t) {
    if (this.clones)
      for (let e = 0; e < this.clones.length; e++)
        this.clones[e].internalDetectChanges(t);
  }
  updateAllChildren(t) {
    if (this.children)
      for (let e = 0; e < this.children.length; e++)
        this.children[e].internalDetectChanges(t);
  }
  isTemplate(t) {
    if (!t) return !1;
    const e = t.indexOf(L);
    return e === -1 ? !1 : t.indexOf(ot, e + 2) !== -1;
  }
  handleTemplateParseError(t, e, s, i) {
    const o = t.slice(e, Math.min(e + 40, s)) + (s > e + 40 ? "..." : "");
    this.handleError(new Error(i), "template parse", null, t, o);
  }
  getNodeForError() {
    return this.node.outerHTML.split(">")[0] + ">";
  }
  getTemplateBytecode(t, e, s) {
    const i = H.get(t);
    if (i) return i;
    const o = [], c = t.length;
    let d = 0;
    for (; d < c; ) {
      const m = t.indexOf(L, d);
      if (m === -1) {
        d < c && o.push(t.slice(d));
        break;
      }
      m > d && o.push(t.slice(d, m));
      const f = m + 2, p = [];
      let r = f, h = null, v = -1;
      for (; r < c; ) {
        const E = t[r];
        if (h !== null) {
          if (E === "\\") {
            r += 2;
            continue;
          }
          if (E === h) {
            h = null, r++;
            continue;
          }
          r++;
          continue;
        }
        if (E === "'" || E === '"' || E === "`") {
          h = E, r++;
          continue;
        }
        if (E === "(" || E === "[" || E === "{") {
          p.push(E), r++;
          continue;
        }
        if (E === ")") {
          (!p.length || p[p.length - 1] !== "(") && this.handleTemplateParseError(t, f, c, `Unmatched ")" at position ${r}`), p.pop(), r++;
          continue;
        }
        if (E === "]") {
          (!p.length || p[p.length - 1] !== "[") && this.handleTemplateParseError(t, f, c, `Unmatched "]" at position ${r}`), p.pop(), r++;
          continue;
        }
        if (E === "}") {
          if (p.length && p[p.length - 1] === "{") {
            p.pop(), r++;
            continue;
          }
          if (p.length === 0 && t[r + 1] === "}") {
            v = r;
            break;
          }
          if (p.length > 0) {
            const C = p[p.length - 1] === "(" ? ")" : "]";
            this.handleTemplateParseError(t, f, c, `Expected "${C}" but got "}" at position ${r}`);
          }
          this.handleTemplateParseError(t, f, c, `Unexpected "}" at position ${r}`);
        }
        r++;
      }
      if (v === -1) {
        if (p.length > 0) {
          const E = p[p.length - 1], C = E === "(" ? ")" : E === "[" ? "]" : "}";
          this.handleTemplateParseError(t, f, c, `Unclosed "${E}": expected "${C}" before end of expression`);
        }
        o.push(this.getSingleBytecode(t.slice(f).trim(), t));
        break;
      }
      o.push(this.getSingleBytecode(t.slice(f, v).trim(), t)), d = v + 2;
    }
    e && o.length > 1 ? this.handleError(new Error("Template has multi expressions, only single expression is allowed here"), "vm compile", null, t) : o.filter((m) => m instanceof K).length || this.handleError(new Error(`Expression not found, ${this.getNodeForError()} in ${s} attr`), "vm compile", null, t);
    const u = o.length === 1 ? o[0] : o;
    return H.set(t, u), u;
  }
  getItem(t, e, s, i) {
    return typeof t == "string" ? t : this.runVMProgramForContext(e, t, s, i);
  }
  execBytecode(t, e, s, i) {
    if (!Array.isArray(e))
      return this.getItem(e, t, s, i);
    let o = new Array(e.length);
    for (let c = 0; c < e.length; c++) o[c] = this.getItem(e[c], t, s, i);
    return o.join("");
  }
  childNodeIsDynamic(t) {
    return t.hasAttribute("repeat") || t.hasAttribute("attached") ? !0 : this.root.areas[+t.getAttribute("area-index")].hasBindings;
  }
  addClone(t, e, s) {
    const i = new b({
      parent: this.parent,
      node: t,
      self: e,
      root: this.root,
      cloneIndex: s
    });
    return this.clones.push(i), i;
  }
  addChildren(t) {
    return new b({
      node: t,
      self: this.self,
      root: this.root,
      cloneIndex: this.cloneIndex
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
      for (let i = t.firstElementChild; i; i = i.nextElementSibling) this.createAreas(i);
  }
  hasBindingAttributes(t) {
    for (const e of Array.from(t.attributes)) if (this.isTemplate(e.value)) return !0;
    return !1;
  }
  hasTemplateTextChild(t) {
    for (let e = t.firstChild; e; e = e.nextSibling) if (e.nodeType === Node.TEXT_NODE && this.isTemplate(e.textContent)) return !0;
    return !1;
  }
  handleChildrens(t) {
    var s, i;
    let e = t.firstChild;
    for (; e; ) {
      const o = e.nextSibling;
      if (e.nodeType === 1) {
        const c = e;
        if (this.childNodeIsDynamic(c)) {
          const d = this.addChildren(c);
          d.parent = this, this.children ?? (this.children = []), this.children.push(d);
        } else
          this.handleChildrens(c);
      } else if (e.nodeType === 3) {
        const c = e.textContent;
        if (this.isTemplate(c)) {
          this.nodeByIndex ?? (this.nodeByIndex = []), this.nodeValueByIndex ?? (this.nodeValueByIndex = []);
          const d = this.nodeByIndex.push(e) - 1;
          this.area.filled || ((s = this.area).nodeTemplateByIndex ?? (s.nodeTemplateByIndex = []), this.area.nodeTemplateByIndex.push(this.getTemplateBytecode(c)), (i = this.area).textNodes ?? (i.textNodes = []), this.area.textNodes.push(d));
        }
      }
      e = o;
    }
  }
  resetDetectingUpTree() {
    let t = this;
    for (; t; )
      t.detecting = !1, t = t.parent;
  }
  handleError(t, e, s = null, i = "", o = "", c = null) {
    const d = o ? [o] : [];
    i && d.push(i), this.root.selector && d.push(this.root.selector);
    let u = d.join(" at ");
    this.root.debug.__tplFile && (u += ` (${this.root.debug.__tplFile})`);
    let m = c ? ", " + q[c] : "";
    throw t.message = `${e}${m}: ${t.message} in ${u}`, s && (console.log(u), s.log()), t;
  }
  handleSafeError(t, e = "") {
    const s = e ? [e] : [];
    this.root.selector && s.push(this.root.selector);
    let i = s.join(" at ");
    this.root.debug.__tplFile && (i += ` (${this.root.debug.__tplFile})`), console.error(`${t} in ${i}`);
  }
  getSingleBytecode(t, e) {
    t = t.trim();
    let s = V.get(t);
    if (!s)
      try {
        const i = nt(t);
        s = new rt(i).getBytecode(t), V.set(t, s);
      } catch (i) {
        this.handleError(i, "vm compile", s, e, t);
      }
    return s;
  }
  linkRxToTemplate(t, e, s) {
    if (t === 4) {
      const c = this.area.attrNameByIndex[s];
      if (c && at.has(c))
        throw new Error(
          `::rx is not allowed in "${c}".`
        );
    }
    let i = this.root.rxAcc.get(e);
    i || (i = /* @__PURE__ */ new Map(), this.root.rxAcc.set(e, i));
    let o = i.get(this);
    o || (o = [null, null, 0, 0, 0, 0], i.set(this, o)), t === 3 ? (o[0] ?? (o[0] = /* @__PURE__ */ new Set()), o[0].add(s)) : t === 4 ? (o[1] ?? (o[1] = /* @__PURE__ */ new Set()), o[1].add(s)) : t === 5 ? o[2] = 1 : t === 1 ? o[3] = 1 : t === 6 ? o[4] = 1 : t === 7 && (o[5] = 1), e.setPostUpdate(this.root.onRxUpdate);
  }
  getRxValue(t, e, s, i, o) {
    return t === 2 || o || i && this.linkRxToTemplate(t, e, s), e.actual;
  }
  getVarFromLexicalEnv(t) {
    return this.lexicalEnv && t in this.lexicalEnv ? this.lexicalEnv[t] : this.parent ? this.parent.getVarFromLexicalEnv(t) : void 0;
  }
  getThisArg(t) {
    return typeof this.cloneIndex == "number" ? this.self(t)[this.cloneIndex] : this.self();
  }
  runVMProgramForContext(t, e, s, i, o = null) {
    try {
      return this.repeatBC && t !== 1 ? void 0 : e.noRunNeeded(this) ? this.onceMap.get(e) : e.run(
        this,
        t,
        s,
        b.appVariables,
        i,
        o
      );
    } catch (c) {
      this.resetDetectingUpTree(), this.handleError(c, "vm run", e, e.expr, null, t);
    }
  }
  handleAttributesFilledArea() {
    const t = Array.from(this.node.attributes);
    for (let e = 0; e < t.length; e++) {
      const s = t[e];
      s.name === "attached" && !this.repeatBC && (this.setPointer(), this.attachedBC = this.getTemplateBytecode(s.value, !0, s.name)), s.name === "inner-html" && this.node.removeAttribute("inner-html");
    }
    if (this.area.eventAttributes)
      for (let e = 0; e < this.area.eventAttributes.length; e++)
        this.node.removeAttribute(this.area.eventAttributes[e]);
  }
  handleAttributes() {
    var e, s, i, o, c, d, u, m;
    const t = Array.from(this.node.attributes);
    for (let f = 0; f < t.length; f++) {
      const p = t[f];
      if (!(p.name === "repeat" || !this.isTemplate(p.value)))
        if (p.name.indexOf("on") === 0)
          (e = this.area).eventAttributes ?? (e.eventAttributes = []), this.area.eventAttributes.push(p.name), (s = this.area).events ?? (s.events = /* @__PURE__ */ Object.create(null)), this.area.events[p.name.slice(2)] = this.getTemplateBytecode(p.value, !0, p.name);
        else if (p.name === "attached" && !this.repeatBC)
          this.setPointer(), this.attachedBC = this.getTemplateBytecode(p.value, !0, p.name);
        else if (p.name === "inner-html")
          this.area.innerHtmlTemplateBC = this.getTemplateBytecode(p.value, !0, p.name), this.node.removeAttribute("inner-html");
        else if (p.name.indexOf("let-") === 0) {
          (i = this.area).varNameByIndex ?? (i.varNameByIndex = []);
          const r = this.area.varNameByIndex.push(b.kebabToCamel(p.name.slice(4))) - 1;
          (o = this.area).varBytecodeByIndex ?? (o.varBytecodeByIndex = []), this.area.varBytecodeByIndex.push(this.getTemplateBytecode(p.value, !0, p.name)), (c = this.area).varAttributes ?? (c.varAttributes = []), this.area.varAttributes.push(r);
        } else {
          (d = this.area).attrNameByIndex ?? (d.attrNameByIndex = []);
          const r = this.area.attrNameByIndex.push(p.name) - 1;
          (u = this.area).attrTemplateByIndex ?? (u.attrTemplateByIndex = []), this.area.attrTemplateByIndex.push(this.getTemplateBytecode(p.value)), (m = this.area).contentAttributes ?? (m.contentAttributes = []), this.area.contentAttributes.push(r);
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
        if (this.root.rxUpdatedScheduled = !1, !this.root.rxUpdated || !this.root.rxAcc) {
          this.root.rxUpdated = null;
          return;
        }
        for (const s of this.root.rxUpdated) {
          const i = this.root.rxAcc.get(s);
          if (i)
            for (const o of i) {
              const c = o[0], d = o[1];
              if (d[2]) {
                c.reactiveUpdateAttachedAttr();
                continue;
              }
              if (d[4]) {
                c.reactiveUpdateLexicalEnv();
                continue;
              }
              if (d[0])
                for (const u of d[0])
                  c.reactiveUpdateNode(u);
              if (d[1])
                for (const u of d[1])
                  c.reactiveUpdateAttr(u);
              d[3] && c.reactiveUpdateRepeat(), d[5] && c.reactiveUpdateInnerHtml();
            }
        }
        this.root.rxUpdated = null;
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
a(b, "REMOVE_ATTR", {}), a(b, "appVariables", {});
let U = b;
class lt {
  constructor() {
    a(this, "instancesBySelector", {});
    a(this, "componentsRoot", []);
    a(this, "buckets", {});
    a(this, "listBySelector", /* @__PURE__ */ new Map());
  }
  removeComponents(t, e = !1) {
    for (; t.length; ) {
      const s = t.pop();
      s.disconnectedCallback(e), B.instancesBySelector[s.selector].delete(
        s.node
      );
    }
  }
  define(t) {
    this.listBySelector.set(t.selector, t);
  }
  connectBySelector(t, e, s = document, i = null) {
    const o = s.querySelectorAll(t), c = Array.from(o), d = [];
    if (c.length) {
      const u = this.listBySelector.get(t);
      if (!u)
        throw new Error(
          `${t} component is not defined. Call componentsRegistryService.define(...)`
        );
      for (const m of c) {
        this.instancesBySelector[t] = this.instancesBySelector[t] || /* @__PURE__ */ new Map();
        let f = this.instancesBySelector[t].get(m);
        if (!f) {
          f = new u(), f.selector = t, f.node = m;
          let p = null;
          i != null && i.httpFactory && (p ?? (p = {}), p.httpFactory = i.httpFactory), i != null && i.params$ && (p ?? (p = {}), p.routeParams$ = i.params$);
          try {
            f.connectedCallback(p), e.push(f), this.instancesBySelector[t].set(m, f), d.push(f);
          } catch (r) {
            throw r;
          }
        }
      }
    }
    return d;
  }
  initApp() {
    for (const t of this.listBySelector.keys())
      this.connectBySelector(t, this.componentsRoot);
  }
  connectBucket(t) {
    this.buckets[t.id] = t;
  }
  disconnectBucket(t) {
    delete this.buckets[t.id];
  }
}
const B = new lt();
class Q {
  constructor(t, e = null) {
    a(this, "actual", null);
    a(this, "groupIndex", null);
    a(this, "postUpdateFns", null);
    this.group = t, this.fn = e, this.groupIndex = this.group.length, this.group.push(this);
  }
  update(...t) {
    if (this.actual = typeof this.fn == "function" ? this.fn(...t) : null, !!this.postUpdateFns)
      for (const e of this.postUpdateFns) e(this);
  }
  setPostUpdate(t) {
    this.postUpdateFns ?? (this.postUpdateFns = /* @__PURE__ */ new Set()), this.postUpdateFns.add(t);
  }
  unsubscribe() {
    const t = this.groupIndex, e = this.group.pop();
    t < this.group.length && (this.group[t] = e, e.groupIndex = t);
  }
}
class dt extends Q {
  constructor(e, s, i, ...o) {
    super(e, s);
    a(this, "deps");
    a(this, "updateScheduled", !1);
    a(this, "update", () => {
      this.updateScheduled || (this.updateScheduled = !0, queueMicrotask(() => {
        super.update(...this.deps.map((e) => e.actual)), this.updateScheduled = !1;
      }));
    });
    this.deps = o;
    for (const c of o) c.setPostUpdate(this.update);
    i != null && i.immediate && this.update();
  }
  unsubscribe() {
    var e, s;
    for (const i of this.deps)
      (e = i.postUpdateFns) == null || e.delete(this.update), ((s = i.postUpdateFns) == null ? void 0 : s.size) === 0 && (i.postUpdateFns = null);
    super.unsubscribe();
  }
}
class pt {
  constructor() {
    a(this, "id", "");
    a(this, "index", "");
    a(this, "selector", "");
    a(this, "node", null);
    a(this, "http", null);
    a(this, "config", null);
    a(this, "outerBucket", null);
    a(this, "innerBucket", null);
    a(this, "destroyed", !1);
    a(this, "ac", null);
    a(this, "dependencies", null);
    a(this, "connectedDependencies", null);
    a(this, "hasOuterBucket", !1);
    a(this, "hasConfig", !1);
    a(this, "isDirective", !1);
    a(this, "template", null);
    a(this, "rxList", null);
    a(this, "value$", this.newRx());
    a(this, "value", null);
    a(this, "state$", this.newRx());
    a(this, "state", null);
    a(this, "__tplFile", "");
    a(this, "onUpdateValue", (t, e, s) => {
      this.index !== e || this.value === t || this.setValue(s);
    });
    a(this, "onUpdateState", (t, e, s) => {
      this.index !== e || this.state === t || this.setState(s);
    });
  }
  disconnectedCallback(t = !1) {
    if (this.destroyed = !0, this.ac && this.ac.abort(), this.template && this.template.fullDestroy(), t && this.node && !this.isDirective && this.node.remove(), this.value$ && this.value$.unsubscribe(), this.state$ && this.state$.unsubscribe(), this.connectedDependencies && B.removeComponents(this.connectedDependencies), this.rxList) for (; this.rxList.length; ) this.rxList.pop().unsubscribe();
    this.innerBucket && B.disconnectBucket(this.innerBucket);
  }
  getBucket() {
    const t = this.getBucketId(), e = B.buckets[t];
    if (t && !e)
      throw new Error(
        `Bucket "${t}" not found for selector "${this.selector}" (component-id="${this.getId()}")`
      );
    return e;
  }
  connectedCallback(t = null) {
    if (this.syncId(), this.setIndex(), this.outerBucket = this.getBucket(), this.outerBucket) {
      const e = this.outerBucket.descriptors[this.id];
      if (this.hasConfig) {
        if (!e)
          throw new Error(
            `Descriptor not found for selector "${this.selector}" id "${this.id}" in bucket "${this.getBucketId()}"`
          );
        this.config = e.config, this.config || (this.config = {});
      }
      this.hasOuterBucket && (this.rxList ?? (this.rxList = []), this.setValue(), this.outerBucket.newRxValue(
        this.id,
        this.onUpdateValue,
        this.rxList
      ), this.setState(), this.outerBucket.newRxState(
        this.id,
        this.onUpdateState,
        this.rxList
      ));
    }
    if (this.innerBucket && B.connectBucket(this.innerBucket), !this.isDirective && !(t != null && t.disableTemplate) && this.initTemplate(), t != null && t.httpFactory) {
      this.ac = new AbortController();
      const e = Object.keys(t.httpFactory);
      this.http = /* @__PURE__ */ Object.create(null);
      for (const s of e)
        this.http[s] = t.httpFactory[s](this.ac.signal);
    }
  }
  setBucketId(t) {
    return this.node.setAttribute("bucket-id", t);
  }
  getBucketId() {
    return this.node.getAttribute("bucket-id");
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
    this.value = this.outerBucket.getValue(this.id, this.index), this.value$.update(this.value);
  }
  setState(t = !1) {
    this.state = this.outerBucket.getState(this.id, this.index), this.state$.update(this.state);
  }
  updateDependencies() {
    if (!(!this.dependencies || !this.dependencies.size)) {
      if (this.connectedDependencies) {
        let t = null, e = null;
        for (const s of this.connectedDependencies)
          document.contains(s.node) ? (e ?? (e = []), e.push(s)) : (t ?? (t = []), t.push(s));
        this.connectedDependencies = e, t && B.removeComponents(t);
      }
      for (const t of this.dependencies) this.connectDependency(t);
    }
  }
  connectDependency(t) {
    return this.connectedDependencies ?? (this.connectedDependencies = []), B.connectBySelector(
      t,
      this.connectedDependencies,
      this.node
    );
  }
  addDependencies(t) {
    this.dependencies ?? (this.dependencies = /* @__PURE__ */ new Set());
    for (const e of t) this.dependencies.add(e);
  }
  initTemplate() {
    const t = this.getHTML();
    t && (this.node.innerHTML = t, this.template = new U({
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
    const e = new Q(this.rxList, (s) => s);
    return e.update(t), e;
  }
  newRxFunc(t, ...e) {
    return this.rxList ?? (this.rxList = []), new dt(this.rxList, t, { immediate: !0 }, ...e);
  }
  newRxValueFromBucket(t, e) {
    return this.rxList ?? (this.rxList = []), t.newRxValue(e, (s) => s, this.rxList);
  }
  newRxStateFromBucket(t, e) {
    return this.rxList ?? (this.rxList = []), t.newRxState(e, (s) => s, this.rxList);
  }
  newRxEventFromBucket(t, e, s) {
    return this.rxList ?? (this.rxList = []), t.newRxEvent(e, s, (i) => i, this.rxList);
  }
  newRxValueFromBucketByIndex(t, e) {
    this.rxList ?? (this.rxList = []);
    const s = {};
    return t.newRxValue(e, (i, o) => (s[o] = i, s), this.rxList);
  }
  newRxStateFromBucketByIndex(t, e) {
    this.rxList ?? (this.rxList = []);
    const s = {};
    return t.newRxState(e, (i, o) => (s[o] = i, s), this.rxList);
  }
  newRxEventFromBucketByIndex(t, e, s) {
    this.rxList ?? (this.rxList = []);
    const i = {};
    return t.newRxEvent(e, s, (o, c) => (i[c] = o, i), this.rxList);
  }
}
export {
  pt as A,
  Q as R,
  U as T,
  dt as a,
  B as c
};
//# sourceMappingURL=component-BplwVDE8.js.map

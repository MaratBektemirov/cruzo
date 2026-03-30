var W = Object.defineProperty;
var P = (n, t, e) => t in n ? W(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var c = (n, t, e) => P(n, typeof t != "symbol" ? t + "" : t, e);
const Z = (n) => n === " " || n === `
` || n === "	" || n === "\r", T = (n) => n >= "0" && n <= "9", X = /[A-Za-z_$]/, O = /[A-Za-z0-9_$]/, Y = (n) => X.test(n), tt = (n) => O.test(n), et = [
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
      const o = s, l = e;
      e++;
      let u = "", d = !1;
      for (; e < n.length; ) {
        const x = n[e++];
        if (x === "\\") {
          if (e >= n.length)
            throw new Error(`Unterminated escape sequence in string at ${l}`);
          const m = n[e++];
          u += m === "n" ? `
` : m === "t" ? "	" : m;
          continue;
        }
        if (x === o) {
          d = !0;
          break;
        }
        u += x;
      }
      if (!d)
        throw new Error(`Unterminated string literal at ${l}`);
      t.push({ t: "str", v: u });
      continue;
    }
    if (T(s) || s === "." && T(n[e + 1] || "")) {
      let o = "";
      for (; e < n.length && (T(n[e]) || n[e] === "."); ) o += n[e++];
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
const B = {
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
  constructor(t, e, s, i, o, l) {
    this.code = t, this.consts = e, this.idNames = s, this.exprCount = i, this.onceCount = o, this.expr = l;
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
      const l = G[s] ?? `OP_${s}`, [u, d] = this.fmtArg(s, i, o), x = `%c${String(t).padStart(4)} %c${D(e)}  %c${l.padEnd(18)} %c${u}` + (d ? ` %c; ${d}` : ""), m = [
        B.ip,
        B.hex,
        it(s) ? B.jump : B.op,
        B.arg,
        ...d ? [B.com] : []
      ];
      if (console.log(x, ...m), s === 36) {
        t++;
        const p = (this.code[t] ?? 0) >>> 0, r = `%c${String(t).padStart(4)} %c${D(p)}  %c${"WIDE".padEnd(18)} %c${`-> ${p}`}`;
        console.log(r, B.ip, B.hex, B.jump, B.arg);
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
  run(t, e, s, i, o, l) {
    const u = this.code, d = this.consts, x = this.idNames;
    let m, p;
    const r = [];
    let h = 0, v = 0, E = 0;
    const A = (N, k, y) => {
      const a = r[N];
      if (typeof a != "function")
        throw new Error(`Cannot call undefined or non-function value: ${a}`);
      if (!y) return a.call(k);
      const f = r.slice(h - y, h);
      return a.apply(k, f);
    };
    for (; v < u.length; ) {
      const N = u[v++], k = R(N), y = $(N);
      switch (k) {
        case 1:
          r[h++] = d[y];
          break;
        case 2: {
          const a = x[y];
          switch (a) {
            case "root":
              m ?? (m = t.root.self()), r[h++] = m;
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
              r[h++] = l;
              break;
            default:
              r[h++] = t.getVarFromLexicalEnv(a);
              break;
          }
          break;
        }
        case 3:
          p ?? (p = t.getThisArg(o)), r[h++] = p;
          break;
        case 4: {
          const a = d[y], f = r[--h];
          f == null ? (t.handleSafeError(this.getSafeErrorMsg(f, a), this.expr), r[h++] = void 0) : r[h++] = f[a];
          break;
        }
        case 5: {
          const a = d[y], f = r[--h];
          let g;
          f == null ? (t.handleSafeError(this.getSafeErrorMsg(f, a), this.expr), g = void 0) : g = f[a], r[h++] = f, r[h++] = g;
          break;
        }
        case 6: {
          const a = r[--h], f = r[--h];
          f == null ? (t.handleSafeError(this.getSafeErrorMsg(f, a + ""), this.expr), r[h++] = void 0) : r[h++] = f[a];
          break;
        }
        case 7: {
          const a = r[--h], f = r[--h];
          let g;
          f == null ? (t.handleSafeError(this.getSafeErrorMsg(f, a + ""), this.expr), g = void 0) : g = f[a], r[h++] = f, r[h++] = g;
          break;
        }
        case 8:
          h--;
          break;
        case 9: {
          const a = r[--h];
          h--, r[h++] = a;
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
          const a = r[--h];
          r[h - 1] = r[h - 1] + a;
          break;
        }
        case 14: {
          const a = r[--h];
          r[h - 1] = r[h - 1] - a;
          break;
        }
        case 15: {
          const a = r[--h];
          r[h - 1] = r[h - 1] * a;
          break;
        }
        case 16: {
          const a = r[--h];
          r[h - 1] = r[h - 1] / a;
          break;
        }
        case 17: {
          const a = r[--h];
          r[h - 1] = r[h - 1] % a;
          break;
        }
        case 18: {
          const a = r[--h];
          r[h - 1] = r[h - 1] == a;
          break;
        }
        case 19: {
          const a = r[--h];
          r[h - 1] = r[h - 1] != a;
          break;
        }
        case 20: {
          const a = r[--h];
          r[h - 1] = r[h - 1] === a;
          break;
        }
        case 21: {
          const a = r[--h];
          r[h - 1] = r[h - 1] !== a;
          break;
        }
        case 22: {
          const a = r[--h];
          r[h - 1] = r[h - 1] < a;
          break;
        }
        case 23: {
          const a = r[--h];
          r[h - 1] = r[h - 1] <= a;
          break;
        }
        case 24: {
          const a = r[--h];
          r[h - 1] = r[h - 1] > a;
          break;
        }
        case 25: {
          const a = r[--h];
          r[h - 1] = r[h - 1] >= a;
          break;
        }
        case 26: {
          const a = y, f = h - a - 1;
          p ?? (p = t.getThisArg(o));
          const g = A(f, p, a);
          h = f, r[h++] = g;
          break;
        }
        case 27: {
          const a = y, f = h - a - 1, g = h - a - 2, S = r[g], _ = A(f, S, a);
          h = g, r[h++] = _;
          break;
        }
        case 28: {
          const a = r[--h];
          if (a == null) throw new Error(`::rx is invalid on ${a}`);
          r[h++] = t.getRxValue(
            e,
            a,
            s,
            o,
            E > 0
          );
          break;
        }
        case 36: {
          const a = y, f = u[v++] >>> 0, g = this.getOnceSlotValue(t, a);
          g !== w ? (r[h++] = g, v = f) : E++;
          break;
        }
        case 37: {
          const a = y;
          this.setOnceSlotValue(t, a, r[h - 1]), E--;
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
          const a = y, f = new Array(a);
          for (let g = a - 1; g >= 0; g--) f[g] = r[--h];
          r[h++] = f;
          break;
        }
        case 35: {
          const a = y, f = {};
          for (let g = 0; g < a; g++) {
            const S = r[--h], _ = r[--h];
            f[_] = S;
          }
          r[h++] = f;
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
    c(this, "pos", 0);
    c(this, "code", []);
    c(this, "consts", null);
    c(this, "constMap");
    c(this, "idNames", null);
    c(this, "idMap");
    c(this, "onceSlot", 0);
    c(this, "exprDepth", 0);
    c(this, "exprCount", 0);
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
        const l = this.next().v;
        t(), s(l), o++, i = this.peek();
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
    let l = 1;
    for (; i.t === "op" && i.v === e; ) {
      this.next();
      const u = this.emitJump(s);
      t(), this.patch(u, this.code.length), o && l++, i = this.peek();
    }
    o && (this.exprCount = l);
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
      ), l = this.emitJump(
        29
        /* JMP */
      );
      this.patch(o, this.code.length), this.emit(
        8
        /* POP */
      ), t(), this.patch(l, this.code.length), s && i++, e = this.peek();
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
    }, o = (u) => {
      const d = this.c(u), x = this.peek(), m = x.t === "punc" && x.v === "(";
      this.emit(m ? 5 : 4, d), t = m;
    }, l = () => {
      const u = this.peek(), d = u.t === "punc" && u.v === "(";
      this.emit(
        d ? 7 : 6
        /* GET_INDEX */
      ), t = d;
    };
    for (; ; ) {
      const u = this.peek();
      if (u.t === "op" && u.v === ".") {
        s(), this.next();
        const d = this.next();
        if (d.t !== "id") throw new Error('Expected identifier after "."');
        o(d.v);
        continue;
      }
      if (u.t === "op" && u.v === "?.") {
        const d = this.tokens[this.pos + 1];
        if ((d == null ? void 0 : d.t) === "punc" && d.v === "(") {
          s(), this.next(), i();
          continue;
        }
        if ((d == null ? void 0 : d.t) === "punc" && d.v === "[") {
          s(), this.next(), this.next(), i(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]"), l();
          continue;
        }
        s(), this.next(), i();
        const x = this.next();
        if (x.t !== "id") throw new Error('Expected identifier after "?."');
        o(x.v);
        continue;
      }
      if (u.t === "punc" && u.v === "[") {
        s(), this.next(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]"), l();
        continue;
      }
      if (u.t === "punc" && u.v === "(") {
        this.next();
        const d = this.parseArgsAndCount();
        this.expectPunc(")"), t ? (this.emit(27, d), t = !1) : this.emit(26, d);
        continue;
      }
      if (u.t === "op" && u.v === "::") {
        this.next();
        const d = this.next();
        if (d.t !== "id") throw new Error('Expected modifier after "::"');
        if (d.v === "rx") {
          s(), this.emit(
            28
            /* RX_UI */
          );
          continue;
        }
        throw new Error(`Unknown modifier: ${d.v}`);
      }
      break;
    }
    if (s(), e.length) {
      const u = this.code.length;
      for (const d of e) this.patch(d, u);
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
    c(this, "map", /* @__PURE__ */ new Map());
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
}, ct = /* @__PURE__ */ new Set(["component-id", "bucket-id"]);
let I = null;
const at = { bubbles: !1 }, b = class b {
  constructor(t) {
    c(this, "root", null);
    c(this, "debug", null);
    c(this, "parent", null);
    c(this, "self", null);
    c(this, "lexicalEnv", null);
    c(this, "selector", "");
    c(this, "children", null);
    c(this, "clones", null);
    c(this, "rxAcc", null);
    c(this, "pointer", null);
    c(this, "cloneIndex", null);
    c(this, "parentNode", null);
    c(this, "attached", !0);
    c(this, "detecting", !1);
    c(this, "repeatBC", null);
    c(this, "attachedBC", null);
    c(this, "templateNodeForClone", null);
    c(this, "innerHtmlTemplateBC", null);
    c(this, "nodeByIndex", null);
    c(this, "nodeValueByIndex", null);
    c(this, "nodeTemplateByIndex", null);
    c(this, "varNameByIndex", null);
    c(this, "varBytecodeByIndex", null);
    c(this, "varAttributes", null);
    c(this, "attrNameByIndex", null);
    c(this, "attrTemplateByIndex", null);
    c(this, "attrValueByIndex", null);
    c(this, "textNodes", null);
    c(this, "contentAttributes", null);
    c(this, "eventAttributes", null);
    c(this, "innerHTMLValue", "");
    c(this, "eventsFns", null);
    c(this, "eventsBC", null);
    c(this, "onRxUpdate", null);
    c(this, "rxUpdated", null);
    c(this, "rxUpdatedScheduled", !1);
    c(this, "domStructureChanged", null);
    c(this, "domChangedScheduled", !1);
    c(this, "onceMap", null);
    c(this, "node", null);
    if (Object.assign(this, t), typeof this.self != "function")
      throw new Error("Invalid self param");
    this.root || (this.root = this, this.debug = {
      selector: t.selector,
      __tplFile: t.__tplFile
    }, this.onRxUpdate = this.getRxUpdate()), this.handleDomAttributes(), this.handleAttributes(), this.innerHtmlTemplateBC || this.handleChildrens(this.node), this.setEvents();
  }
  static getChangeAttrEvent(t, e, s) {
    return new CustomEvent(
      "onchangeattr",
      Object.assign({ detail: { name: t, prev: e, next: s } }, at)
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
        const i = this.clones.length, o = i === 0 ? this.getPointer() : this.clones[i - 1].node, l = document.createDocumentFragment(), u = (d) => this.execRepeatExpr(d);
        for (let d = 0; d < s; d++) {
          const x = this.templateNodeForClone.cloneNode(!0);
          l.appendChild(x), this.addClone(x, u, i + d);
        }
        this.insertFragmentAfter(o, l), this.markDomStructureChanged();
      } else {
        for (; this.clones.length > e.length; )
          this.destroyLastClone();
        this.markDomStructureChanged();
      }
  }
  updateAttributes(t) {
    if (this.contentAttributes)
      for (let e = 0; e < this.contentAttributes.length; e++) this.updateAttr(this.contentAttributes[e], t);
  }
  updateVars(t) {
    if (this.varAttributes)
      for (let e = 0; e < this.varAttributes.length; e++) {
        const s = this.varAttributes[e];
        this.updateVar(s, t);
      }
  }
  removeEvents() {
    if (this.eventsFns) {
      for (const t in this.eventsFns) this.node.removeEventListener(t, this.eventsFns[t]);
      this.eventsFns = null;
    }
  }
  setEvents() {
    this.eventsFns ?? (this.eventsFns = /* @__PURE__ */ Object.create(null));
    for (const t in this.eventsBC) {
      const e = (s) => {
        this.runVMProgramForContext(
          2,
          this.eventsBC[t],
          0,
          !1,
          s
        );
      };
      this.eventsFns[t] = e, this.node.addEventListener(t, e);
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
    const s = this.nodeByIndex[t], i = this.nodeTemplateByIndex[t], o = this.execBytecode(
      3,
      i,
      t,
      e
    );
    this.nodeValueByIndex[t] === o && t in this.nodeValueByIndex || (s.textContent = o, this.nodeValueByIndex[t] = o);
  }
  updateAttr(t, e) {
    var d;
    const s = this.execBytecode(
      4,
      this.attrTemplateByIndex[t],
      t,
      e
    );
    let i = this.attrNameByIndex[t];
    i === "data-src" && (i = "src");
    const o = this.attrValueByIndex[t];
    if (o === s && t in this.attrValueByIndex) return;
    const l = s === b.REMOVE_ATTR;
    l ? this.node.removeAttribute(i) : this.node.setAttribute(i, s);
    const u = ht[i];
    u && (this.node[u] = l ? !1 : !!s), this.attrValueByIndex[t] = s, (d = I == null ? void 0 : I.get(this.node)) != null && d.has(i) && this.node.dispatchEvent(b.getChangeAttrEvent(i, o, s));
  }
  updateInnerHtml(t) {
    if (!this.innerHtmlTemplateBC) return;
    const e = this.runVMProgramForContext(
      7,
      this.innerHtmlTemplateBC,
      0,
      t
    );
    this.innerHTMLValue !== e && (this.node.innerHTML = e, this.innerHTMLValue = e);
  }
  updateVar(t, e) {
    this.lexicalEnv[this.varNameByIndex[t]] = this.runVMProgramForContext(
      6,
      this.varBytecodeByIndex[t],
      t,
      e
    );
  }
  updateAllTextNodes(t) {
    if (this.textNodes)
      for (let e = 0; e < this.textNodes.length; e++)
        this.updateTextNode(this.textNodes[e], t);
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
    const o = [], l = t.length;
    let u = 0;
    for (; u < l; ) {
      const x = t.indexOf(L, u);
      if (x === -1) {
        u < l && o.push(t.slice(u));
        break;
      }
      x > u && o.push(t.slice(u, x));
      const m = x + 2, p = [];
      let r = m, h = null, v = -1;
      for (; r < l; ) {
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
          (!p.length || p[p.length - 1] !== "(") && this.handleTemplateParseError(t, m, l, `Unmatched ")" at position ${r}`), p.pop(), r++;
          continue;
        }
        if (E === "]") {
          (!p.length || p[p.length - 1] !== "[") && this.handleTemplateParseError(t, m, l, `Unmatched "]" at position ${r}`), p.pop(), r++;
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
            const A = p[p.length - 1] === "(" ? ")" : "]";
            this.handleTemplateParseError(t, m, l, `Expected "${A}" but got "}" at position ${r}`);
          }
          this.handleTemplateParseError(t, m, l, `Unexpected "}" at position ${r}`);
        }
        r++;
      }
      if (v === -1) {
        if (p.length > 0) {
          const E = p[p.length - 1], A = E === "(" ? ")" : E === "[" ? "]" : "}";
          this.handleTemplateParseError(t, m, l, `Unclosed "${E}": expected "${A}" before end of expression`);
        }
        o.push(this.getSingleBytecode(t.slice(m).trim(), t));
        break;
      }
      o.push(this.getSingleBytecode(t.slice(m, v).trim(), t)), u = v + 2;
    }
    e && o.length > 1 ? this.handleError(new Error("Template has multi expressions, only single expression is allowed here"), "vm compile", null, t) : o.filter((x) => x instanceof K).length || this.handleError(new Error(`Expression not found, ${this.getNodeForError()} in ${s} attr`), "vm compile", null, t);
    const d = o.length === 1 ? o[0] : o;
    return H.set(t, d), d;
  }
  getItem(t, e, s, i) {
    return typeof t == "string" ? t : this.runVMProgramForContext(e, t, s, i);
  }
  execBytecode(t, e, s, i) {
    if (!Array.isArray(e))
      return this.getItem(e, t, s, i);
    let o = new Array(e.length);
    for (let l = 0; l < e.length; l++) o[l] = this.getItem(e[l], t, s, i);
    return o.join("");
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
  hasBindingAttributes(t) {
    for (const e of Array.from(t.attributes)) if (this.isTemplate(e.value)) return !0;
    return !1;
  }
  hasTemplateTextChild(t) {
    for (let e = t.firstChild; e; e = e.nextSibling) if (e.nodeType === Node.TEXT_NODE && this.isTemplate(e.textContent)) return !0;
    return !1;
  }
  handleChildrens(t) {
    let e = t.firstChild;
    for (; e; ) {
      const s = e.nextSibling;
      if (e.nodeType === 1) {
        const i = e;
        if (this.hasBindingAttributes(i) || this.hasTemplateTextChild(i)) {
          const o = this.addChildren(i);
          o.parent = this, this.children ?? (this.children = []), this.children.push(o);
        } else
          this.handleChildrens(i);
      } else if (e.nodeType === 3) {
        const i = e.textContent;
        if (this.isTemplate(i)) {
          this.nodeByIndex ?? (this.nodeByIndex = []), this.nodeValueByIndex ?? (this.nodeValueByIndex = []);
          const o = this.nodeByIndex.push(e) - 1;
          this.nodeTemplateByIndex ?? (this.nodeTemplateByIndex = []), this.nodeTemplateByIndex.push(this.getTemplateBytecode(i)), this.textNodes ?? (this.textNodes = []), this.textNodes.push(o);
        }
      }
      e = s;
    }
  }
  resetDetectingUpTree() {
    let t = this;
    for (; t; )
      t.detecting = !1, t = t.parent;
  }
  handleError(t, e, s = null, i = "", o = "", l = null) {
    const u = o ? [o] : [];
    i && u.push(i), this.root.selector && u.push(this.root.selector);
    let d = u.join(" at ");
    this.root.debug.__tplFile && (d += ` (${this.root.debug.__tplFile})`);
    let x = l ? ", " + q[l] : "";
    throw t.message = `${e}${x}: ${t.message} in ${d}`, s && (console.log(d), s.log()), t;
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
      const l = this.attrNameByIndex[s];
      if (l && ct.has(l))
        throw new Error(
          `::rx is not allowed in "${l}".`
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
    } catch (l) {
      this.resetDetectingUpTree(), this.handleError(l, "vm run", e, e.expr, null, t);
    }
  }
  handleDomAttributes() {
    const t = this.node.getAttribute("repeat"), e = this.node.getAttribute("attached");
    t ? (this.setPointer(), this.repeatBC = this.getTemplateBytecode(t, !0, "repeat"), this.templateNodeForClone = this.node.cloneNode(!0), this.templateNodeForClone.removeAttribute("repeat"), this.node.remove(), this.clones = []) : e && (this.setPointer(), this.attachedBC = this.getTemplateBytecode(e, !0, "attached"), this.node.removeAttribute("attached"));
  }
  handleAttributes() {
    const t = Array.from(this.node.attributes);
    for (let e = 0; e < t.length; e++) {
      const s = t[e];
      if (!(s.name === "attached" || s.name === "repeat" || !this.isTemplate(s.value)))
        if (s.name.indexOf("on") === 0)
          this.eventAttributes ?? (this.eventAttributes = []), this.eventAttributes.push(s.name), this.eventsBC ?? (this.eventsBC = /* @__PURE__ */ Object.create(null)), this.eventsBC[s.name.slice(2)] = this.getTemplateBytecode(s.value, !0, s.name), this.node.removeAttribute(s.name);
        else if (s.name === "inner-html")
          this.innerHtmlTemplateBC = this.getTemplateBytecode(s.value, !0, s.name), this.node.removeAttribute(s.name);
        else if (s.name.indexOf("let-") === 0) {
          this.varNameByIndex ?? (this.varNameByIndex = []), this.lexicalEnv ?? (this.lexicalEnv = /* @__PURE__ */ Object.create(null));
          const i = this.varNameByIndex.push(b.kebabToCamel(s.name.slice(4))) - 1;
          this.varBytecodeByIndex ?? (this.varBytecodeByIndex = []), this.varBytecodeByIndex.push(this.getTemplateBytecode(s.value, !0, s.name)), this.varAttributes ?? (this.varAttributes = []), this.varAttributes.push(i), this.node.removeAttribute(s.name);
        } else {
          this.attrNameByIndex ?? (this.attrNameByIndex = []), this.attrValueByIndex ?? (this.attrValueByIndex = []);
          const i = this.attrNameByIndex.push(s.name) - 1;
          this.attrTemplateByIndex ?? (this.attrTemplateByIndex = []), this.attrTemplateByIndex.push(this.getTemplateBytecode(s.value, !1, s.name)), this.contentAttributes ?? (this.contentAttributes = []), this.contentAttributes.push(i), this.node.removeAttribute(s.name);
        }
    }
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
              const l = o[0], u = o[1];
              if (u[2]) {
                l.reactiveUpdateAttachedAttr();
                continue;
              }
              if (u[4]) {
                l.reactiveUpdateLexicalEnv();
                continue;
              }
              if (u[0])
                for (const d of u[0])
                  l.reactiveUpdateNode(d);
              if (u[1])
                for (const d of u[1])
                  l.reactiveUpdateAttr(d);
              u[3] && l.reactiveUpdateRepeat(), u[5] && l.reactiveUpdateInnerHtml();
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
c(b, "REMOVE_ATTR", {}), c(b, "appVariables", {});
let U = b;
class lt {
  constructor() {
    c(this, "instancesBySelector", {});
    c(this, "componentsRoot", []);
    c(this, "buckets", {});
    c(this, "listBySelector", /* @__PURE__ */ new Map());
  }
  removeComponents(t, e = !1) {
    for (; t.length; ) {
      const s = t.pop();
      s.disconnectedCallback(e), C.instancesBySelector[s.selector].delete(
        s.node
      );
    }
  }
  define(t) {
    this.listBySelector.set(t.selector, t);
  }
  connectBySelector(t, e, s = document, i = null) {
    const o = s.querySelectorAll(t), l = Array.from(o), u = [];
    if (l.length) {
      const d = this.listBySelector.get(t);
      if (!d)
        throw new Error(
          `${t} component is not defined. Call componentsRegistryService.define(...)`
        );
      for (const x of l) {
        this.instancesBySelector[t] = this.instancesBySelector[t] || /* @__PURE__ */ new Map();
        let m = this.instancesBySelector[t].get(x);
        if (!m) {
          m = new d(), m.selector = t, m.node = x;
          let p = null;
          i != null && i.httpFactory && (p ?? (p = {}), p.httpFactory = i.httpFactory), i != null && i.params$ && (p ?? (p = {}), p.routeParams$ = i.params$);
          try {
            m.connectedCallback(p), e.push(m), this.instancesBySelector[t].set(x, m), u.push(m);
          } catch (r) {
            throw r;
          }
        }
      }
    }
    return u;
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
const C = new lt();
class Q {
  constructor(t, e = null) {
    c(this, "actual", null);
    c(this, "groupIndex", null);
    c(this, "postUpdateFns", null);
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
    c(this, "deps");
    c(this, "updateScheduled", !1);
    c(this, "update", () => {
      this.updateScheduled || (this.updateScheduled = !0, queueMicrotask(() => {
        super.update(...this.deps.map((e) => e.actual)), this.updateScheduled = !1;
      }));
    });
    this.deps = o;
    for (const l of o) l.setPostUpdate(this.update);
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
    c(this, "id", "");
    c(this, "index", "");
    c(this, "selector", "");
    c(this, "node", null);
    c(this, "http", null);
    c(this, "config", null);
    c(this, "outerBucket", null);
    c(this, "innerBucket", null);
    c(this, "destroyed", !1);
    c(this, "ac", null);
    c(this, "dependencies", null);
    c(this, "connectedDependencies", null);
    c(this, "hasOuterBucket", !1);
    c(this, "hasConfig", !1);
    c(this, "isDirective", !1);
    c(this, "template", null);
    c(this, "rxList", null);
    c(this, "value$", this.newRx());
    c(this, "value", null);
    c(this, "state$", this.newRx());
    c(this, "state", null);
    c(this, "__tplFile", "");
    c(this, "onUpdateValue", (t, e, s) => {
      this.index !== e || this.value === t || this.setValue(s);
    });
    c(this, "onUpdateState", (t, e, s) => {
      this.index !== e || this.state === t || this.setState(s);
    });
  }
  disconnectedCallback(t = !1) {
    if (this.destroyed = !0, this.ac && this.ac.abort(), this.template && this.template.fullDestroy(), t && this.node && !this.isDirective && this.node.remove(), this.value$ && this.value$.unsubscribe(), this.state$ && this.state$.unsubscribe(), this.connectedDependencies && C.removeComponents(this.connectedDependencies), this.rxList) for (; this.rxList.length; ) this.rxList.pop().unsubscribe();
    this.innerBucket && C.disconnectBucket(this.innerBucket);
  }
  getBucket() {
    const t = this.getBucketId(), e = C.buckets[t];
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
    if (this.innerBucket && C.connectBucket(this.innerBucket), !this.isDirective && !(t != null && t.disableTemplate) && this.initTemplate(), t != null && t.httpFactory) {
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
        this.connectedDependencies = e, t && C.removeComponents(t);
      }
      for (const t of this.dependencies) this.connectDependency(t);
    }
  }
  connectDependency(t) {
    return this.connectedDependencies ?? (this.connectedDependencies = []), C.connectBySelector(
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
    return t.newRxEvent(e, s, (o, l) => (i[l] = o, i), this.rxList);
  }
}
export {
  pt as A,
  Q as R,
  U as T,
  dt as a,
  C as c
};
//# sourceMappingURL=component-CK41B9Gk.js.map

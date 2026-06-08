var L = Object.defineProperty;
var J = (e, t, s) => t in e ? L(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var k = (e, t, s) => J(e, typeof t != "symbol" ? t + "" : t, s);
const j = (e) => e === " " || e === `
` || e === "	" || e === "\r", M = (e) => e >= "0" && e <= "9", F = /[A-Za-z_$]/, G = /[A-Za-z0-9_$]/, K = (e) => F.test(e), H = (e) => G.test(e), V = [
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
function Y(e, t) {
  for (const s of V) if (e.startsWith(s, t)) return s;
  return null;
}
function W(e) {
  e = e.trim();
  const t = [];
  let s = 0;
  for (; s < e.length; ) {
    const r = e[s];
    if (j(r)) {
      s++;
      continue;
    }
    if (r === "'" || r === '"') {
      const a = r, f = s;
      s++;
      let u = "", h = !1;
      for (; s < e.length; ) {
        const E = e[s++];
        if (E === "\\") {
          if (s >= e.length)
            throw new Error(`Unterminated escape sequence in string at ${f}`);
          const x = e[s++];
          u += x === "n" ? `
` : x === "t" ? "	" : x;
          continue;
        }
        if (E === a) {
          h = !0;
          break;
        }
        u += E;
      }
      if (!h)
        throw new Error(`Unterminated string literal at ${f}`);
      t.push({ t: "str", v: u });
      continue;
    }
    if (M(r) || r === "." && M(e[s + 1] || "")) {
      let a = "";
      for (; s < e.length && (M(e[s]) || e[s] === "."); ) a += e[s++];
      t.push({ t: "num", v: Number(a) });
      continue;
    }
    if (K(r)) {
      let a = "";
      for (; s < e.length && H(e[s]); ) a += e[s++];
      t.push({ t: "id", v: a });
      continue;
    }
    const c = Y(e, s);
    if (c) {
      s += c.length, "()[]{},".includes(c) ? t.push({ t: "punc", v: c }) : t.push({ t: "op", v: c });
      continue;
    }
    throw new Error(`Unexpected char "${r}" at ${s}`);
  }
  return t.push({ t: "eof" }), t;
}
const N = {
  ip: "color:#777",
  hex: "color:#999",
  op: "color:#4fc1ff;font-weight:600",
  jump: "color:#ff5370;font-weight:600",
  arg: "color:#000",
  com: "color:#777;font-style:italic"
}, y = (e) => "0x" + (e >>> 0).toString(16).padStart(8, "0"), B = (e) => {
  if (typeof e == "string") return JSON.stringify(e);
  if (e == null || typeof e == "number" || typeof e == "boolean") return String(e);
  try {
    const t = JSON.stringify(e);
    return t && t.length > 60 ? t.slice(0, 57) + "…" : t;
  } catch {
    return Object.prototype.toString.call(e);
  }
}, b = {}, D = 255, U = 8;
var R = /* @__PURE__ */ ((e) => (e[e.PUSH_CONST = 1] = "PUSH_CONST", e[e.LOAD_ID = 2] = "LOAD_ID", e[e.LOAD_THIS = 3] = "LOAD_THIS", e[e.GET_PROP = 4] = "GET_PROP", e[e.GET_PROP_KEEP = 5] = "GET_PROP_KEEP", e[e.GET_INDEX = 6] = "GET_INDEX", e[e.GET_INDEX_KEEP = 7] = "GET_INDEX_KEEP", e[e.POP = 8] = "POP", e[e.POP_BELOW = 9] = "POP_BELOW", e[e.UNARY_NOT = 10] = "UNARY_NOT", e[e.UNARY_POS = 11] = "UNARY_POS", e[e.UNARY_NEG = 12] = "UNARY_NEG", e[e.BIN_ADD = 13] = "BIN_ADD", e[e.BIN_SUB = 14] = "BIN_SUB", e[e.BIN_MUL = 15] = "BIN_MUL", e[e.BIN_DIV = 16] = "BIN_DIV", e[e.BIN_MOD = 17] = "BIN_MOD", e[e.BIN_EQ = 18] = "BIN_EQ", e[e.BIN_NEQ = 19] = "BIN_NEQ", e[e.BIN_SEQ = 20] = "BIN_SEQ", e[e.BIN_SNEQ = 21] = "BIN_SNEQ", e[e.BIN_LT = 22] = "BIN_LT", e[e.BIN_LTE = 23] = "BIN_LTE", e[e.BIN_GT = 24] = "BIN_GT", e[e.BIN_GTE = 25] = "BIN_GTE", e[e.CALL_FN = 26] = "CALL_FN", e[e.CALL_METHOD = 27] = "CALL_METHOD", e[e.RX_UI = 28] = "RX_UI", e[e.JMP = 29] = "JMP", e[e.JMP_IF_FALSE = 30] = "JMP_IF_FALSE", e[e.JMP_IF_FALSE_KEEP = 31] = "JMP_IF_FALSE_KEEP", e[e.JMP_IF_TRUE_KEEP = 32] = "JMP_IF_TRUE_KEEP", e[e.JMP_IF_NULLISH = 33] = "JMP_IF_NULLISH", e[e.MAKE_ARRAY = 34] = "MAKE_ARRAY", e[e.MAKE_OBJECT = 35] = "MAKE_OBJECT", e[e.ONCE_ENTER = 36] = "ONCE_ENTER", e[e.ONCE_STORE = 37] = "ONCE_STORE", e))(R || {});
function Q(e) {
  return e === 29 || e === 30 || e === 31 || e === 32 || e === 33 || e === 36;
}
function C(e, t = 0) {
  return t << U | e & D;
}
function A(e) {
  return e & D;
}
function $(e) {
  return e >>> U;
}
class X {
  constructor(t, s, r, c, a, f) {
    this.code = t, this.consts = s, this.idNames = r, this.exprCount = c, this.onceCount = a, this.expr = f;
  }
  onlyOnce() {
    return this.exprCount === 1 && this.onceCount === 1;
  }
  fmtArg(t, s, r) {
    switch (t) {
      case 1:
        return [`const[${s}]`, B(this.consts[s])];
      case 2:
        return [this.idNames[s] ?? `<bad id[${s}]>`, ""];
      case 4:
      case 5:
        return [B(this.consts[s]), ""];
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
        return [`-> ${s}`, ""];
      case 26:
      case 27:
        return [`args.length -> ${s}`, ""];
      case 34:
        return [`count=${s}`, ""];
      case 35:
        return [`pairs=${s}`, ""];
      case 36:
        return [`slot=${s} -> ${r ?? "?"}`, ""];
      case 37:
        return [`slot=${s}`, ""];
      default:
        return s ? [`a=${s}`, ""] : ["", ""];
    }
  }
  log() {
    for (let t = 0; t < this.code.length; t++) {
      const s = this.code[t] >>> 0, r = A(s), c = $(s);
      let a;
      r === 36 && (a = (this.code[t + 1] ?? 0) >>> 0);
      const f = R[r] ?? `OP_${r}`, [u, h] = this.fmtArg(r, c, a), E = `%c${String(t).padStart(4)} %c${y(s)}  %c${f.padEnd(18)} %c${u}` + (h ? ` %c; ${h}` : ""), x = [
        N.ip,
        N.hex,
        Q(r) ? N.jump : N.op,
        N.arg,
        ...h ? [N.com] : []
      ];
      if (console.log(E, ...x), r === 36) {
        t++;
        const g = (this.code[t] ?? 0) >>> 0, n = `%c${String(t).padStart(4)} %c${y(g)}  %c${"WIDE".padEnd(18)} %c${`-> ${g}`}`;
        console.log(n, N.ip, N.hex, N.jump, N.arg);
      }
    }
  }
  noRunNeeded(t) {
    var s;
    return this.onlyOnce() && ((s = t.onceMap) == null ? void 0 : s.has(this));
  }
  setOnceSlotValue(t, s, r) {
    if (t.onceMap ?? (t.onceMap = /* @__PURE__ */ new Map()), this.onlyOnce()) {
      t.onceMap.set(this, r);
      return;
    }
    let c = t.onceMap.get(this);
    for (c || (c = [], t.onceMap.set(this, c)); c.length <= s; ) c.push(b);
    c[s] = r;
  }
  getOnceSlotValue(t, s) {
    if (t.onceMap ?? (t.onceMap = /* @__PURE__ */ new Map()), this.onlyOnce())
      return t.onceMap.has(this) ? t.onceMap.get(this) : (t.onceMap.set(this, b), b);
    let r = t.onceMap.get(this);
    for (r || (r = [], t.onceMap.set(this, r)); r.length <= s; ) r.push(b);
    return r[s];
  }
  getSafeErrorMsg(t, s) {
    return `TemplateTypeError: Cannot read properties of ${t === null ? "null" : "undefined"} (reading '${s}')`;
  }
  run(t, s, r, c, a, f) {
    const u = this.code, h = this.consts, E = this.idNames;
    let x, g;
    const n = [];
    let i = 0, _ = 0, I = 0;
    const T = (m, w, d) => {
      const o = n[m];
      if (typeof o != "function")
        throw new Error(`Cannot call undefined or non-function value: ${o}`);
      if (!d) return o.call(w);
      const p = n.slice(i - d, i);
      return o.apply(w, p);
    };
    for (; _ < u.length; ) {
      const m = u[_++], w = A(m), d = $(m);
      switch (w) {
        case 1:
          n[i++] = h[d];
          break;
        case 2: {
          const o = E[d];
          switch (o) {
            case "root":
              x ?? (x = t.root.self()), n[i++] = x;
              break;
            case "app":
              n[i++] = c;
              break;
            case "index":
              n[i++] = t.cloneIndex;
              break;
            case "$element":
              n[i++] = t.node;
              break;
            case "event":
              n[i++] = f;
              break;
            default:
              n[i++] = t.getVarFromLexicalEnv(o);
              break;
          }
          break;
        }
        case 3:
          g ?? (g = t.getThisArg(a)), n[i++] = g;
          break;
        case 4: {
          const o = h[d], p = n[--i];
          p == null ? (t.handleSafeError(this.getSafeErrorMsg(p, o), this.expr), n[i++] = void 0) : n[i++] = p[o];
          break;
        }
        case 5: {
          const o = h[d], p = n[--i];
          let l;
          p == null ? (t.handleSafeError(this.getSafeErrorMsg(p, o), this.expr), l = void 0) : l = p[o], n[i++] = p, n[i++] = l;
          break;
        }
        case 6: {
          const o = n[--i], p = n[--i];
          p == null ? (t.handleSafeError(this.getSafeErrorMsg(p, o + ""), this.expr), n[i++] = void 0) : n[i++] = p[o];
          break;
        }
        case 7: {
          const o = n[--i], p = n[--i];
          let l;
          p == null ? (t.handleSafeError(this.getSafeErrorMsg(p, o + ""), this.expr), l = void 0) : l = p[o], n[i++] = p, n[i++] = l;
          break;
        }
        case 8:
          i--;
          break;
        case 9: {
          const o = n[--i];
          i--, n[i++] = o;
          break;
        }
        case 10:
          n[i - 1] = !n[i - 1];
          break;
        case 11:
          n[i - 1] = +n[i - 1];
          break;
        case 12:
          n[i - 1] = -n[i - 1];
          break;
        case 13: {
          const o = n[--i];
          n[i - 1] = n[i - 1] + o;
          break;
        }
        case 14: {
          const o = n[--i];
          n[i - 1] = n[i - 1] - o;
          break;
        }
        case 15: {
          const o = n[--i];
          n[i - 1] = n[i - 1] * o;
          break;
        }
        case 16: {
          const o = n[--i];
          n[i - 1] = n[i - 1] / o;
          break;
        }
        case 17: {
          const o = n[--i];
          n[i - 1] = n[i - 1] % o;
          break;
        }
        case 18: {
          const o = n[--i];
          n[i - 1] = n[i - 1] == o;
          break;
        }
        case 19: {
          const o = n[--i];
          n[i - 1] = n[i - 1] != o;
          break;
        }
        case 20: {
          const o = n[--i];
          n[i - 1] = n[i - 1] === o;
          break;
        }
        case 21: {
          const o = n[--i];
          n[i - 1] = n[i - 1] !== o;
          break;
        }
        case 22: {
          const o = n[--i];
          n[i - 1] = n[i - 1] < o;
          break;
        }
        case 23: {
          const o = n[--i];
          n[i - 1] = n[i - 1] <= o;
          break;
        }
        case 24: {
          const o = n[--i];
          n[i - 1] = n[i - 1] > o;
          break;
        }
        case 25: {
          const o = n[--i];
          n[i - 1] = n[i - 1] >= o;
          break;
        }
        case 26: {
          const o = d, p = i - o - 1;
          g ?? (g = t.getThisArg(a));
          const l = T(p, g, o);
          i = p, n[i++] = l;
          break;
        }
        case 27: {
          const o = d, p = i - o - 1, l = i - o - 2, v = n[l], S = T(p, v, o);
          i = l, n[i++] = S;
          break;
        }
        case 28: {
          const o = n[--i];
          if (o == null) throw new Error(`::rx is invalid on ${o}`);
          n[i++] = t.getRxValue(
            s,
            o,
            r,
            a,
            I > 0
          );
          break;
        }
        case 36: {
          const o = d, p = u[_++] >>> 0, l = this.getOnceSlotValue(t, o);
          l !== b ? (n[i++] = l, _ = p) : I++;
          break;
        }
        case 37: {
          const o = d;
          this.setOnceSlotValue(t, o, n[i - 1]), I--;
          break;
        }
        case 29:
          _ = d;
          break;
        case 30: {
          n[--i] || (_ = d);
          break;
        }
        case 31: {
          n[i - 1] ? i-- : _ = d;
          break;
        }
        case 32: {
          n[i - 1] ? _ = d : i--;
          break;
        }
        case 33: {
          n[i - 1] == null && (_ = d);
          break;
        }
        case 34: {
          const o = d, p = new Array(o);
          for (let l = o - 1; l >= 0; l--) p[l] = n[--i];
          n[i++] = p;
          break;
        }
        case 35: {
          const o = d, p = {};
          for (let l = 0; l < o; l++) {
            const v = n[--i], S = n[--i];
            p[S] = v;
          }
          n[i++] = p;
          break;
        }
        default:
          throw new Error(`Unknown op ${w} at ip=${_ - 1}`);
      }
    }
    return i ? n[i - 1] : void 0;
  }
}
class z {
  constructor(t) {
    k(this, "pos", 0);
    k(this, "code", []);
    k(this, "consts", null);
    k(this, "constMap");
    k(this, "idNames", null);
    k(this, "idMap");
    k(this, "onceSlot", 0);
    k(this, "exprDepth", 0);
    k(this, "exprCount", 0);
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
    const s = this.next();
    if (s.t !== "punc" || s.v !== t) throw new Error(`Expected "${t}"`);
  }
  expectOp(t) {
    const s = this.next();
    if (s.t !== "op" || s.v !== t) throw new Error(`Expected "${t}"`);
  }
  c(t) {
    if (this.consts ?? (this.consts = []), typeof t == "string") {
      const r = "s:" + t;
      this.constMap ?? (this.constMap = /* @__PURE__ */ new Map());
      const c = this.constMap.get(r);
      if (c != null) return c;
      const a = this.consts.length;
      return this.consts.push(t), this.constMap.set(r, a), a;
    }
    const s = this.consts.length;
    return this.consts.push(t), s;
  }
  id(t) {
    this.idMap ?? (this.idMap = /* @__PURE__ */ new Map());
    const s = this.idMap.get(t);
    if (s != null) return s;
    this.idNames ?? (this.idNames = []);
    const r = this.idNames.length;
    return this.idNames.push(t), this.idMap.set(t, r), r;
  }
  emit(t, s = 0) {
    this.code.push(C(t, s));
  }
  emitJump(t) {
    const s = this.code.length;
    return this.code.push(C(t, 0)), s;
  }
  patch(t, s) {
    const r = this.code[t];
    this.code[t] = C(A(r), s);
  }
  canCount() {
    return this.exprDepth === 0 && this.exprCount === 0;
  }
  parseBinaryCounted(t, s, r) {
    t();
    let c = this.peek();
    if (this.canCount() && c.t === "op" && s.includes(c.v)) {
      let a = 1;
      for (; c.t === "op" && s.includes(c.v); ) {
        const f = this.next().v;
        t(), r(f), a++, c = this.peek();
      }
      this.exprCount = a;
      return;
    }
    for (; c.t === "op" && s.includes(c.v); ) {
      const a = this.next().v;
      t(), r(a), c = this.peek();
    }
  }
  parseShortCircuit(t, s, r) {
    t();
    let c = this.peek();
    const a = this.canCount() && c.t === "op" && c.v === s;
    let f = 1;
    for (; c.t === "op" && c.v === s; ) {
      this.next();
      const u = this.emitJump(r);
      t(), this.patch(u, this.code.length), a && f++, c = this.peek();
    }
    a && (this.exprCount = f);
  }
  parseNullishChain(t) {
    t();
    let s = this.peek();
    const r = this.canCount() && s.t === "op" && s.v === "??";
    let c = 1;
    for (; s.t === "op" && s.v === "??"; ) {
      this.next();
      const a = this.emitJump(
        33
        /* JMP_IF_NULLISH */
      ), f = this.emitJump(
        29
        /* JMP */
      );
      this.patch(a, this.code.length), this.emit(
        8
        /* POP */
      ), t(), this.patch(f, this.code.length), r && c++, s = this.peek();
    }
    r && (this.exprCount = c);
  }
  getBytecode(t) {
    if (this.peek().t === "eof") throw new Error("Empty template expression is not allowed");
    if (this.parseExpression(), this.peek().t !== "eof") throw new Error("Unexpected token after expression");
    return new X(
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
      const s = this.emitJump(
        30
        /* JMP_IF_FALSE */
      );
      this.withNestedExpr(() => this.parseExpression());
      const r = this.emitJump(
        29
        /* JMP */
      );
      this.expectOp(":"), this.patch(s, this.code.length), this.withNestedExpr(() => this.parseExpression()), this.patch(r, this.code.length);
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
      const s = this.tokens[this.pos + 1];
      if ((s == null ? void 0 : s.t) === "op" && s.v === "::") {
        this.next(), this.next();
        const r = this.allocOnceSlot();
        this.emit(36, r);
        const c = this.code.length;
        this.code.push(0), this.parsePostfix(), this.emit(37, r), this.code[c] = this.code.length;
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
    const s = [], r = () => {
      t && (this.emit(
        9
        /* POP_BELOW */
      ), t = !1);
    }, c = () => {
      s.push(this.emitJump(
        33
        /* JMP_IF_NULLISH */
      ));
    }, a = (u) => {
      const h = this.c(u), E = this.peek(), x = E.t === "punc" && E.v === "(";
      this.emit(x ? 5 : 4, h), t = x;
    }, f = () => {
      const u = this.peek(), h = u.t === "punc" && u.v === "(";
      this.emit(
        h ? 7 : 6
        /* GET_INDEX */
      ), t = h;
    };
    for (; ; ) {
      const u = this.peek();
      if (u.t === "op" && u.v === ".") {
        r(), this.next();
        const h = this.next();
        if (h.t !== "id") throw new Error('Expected identifier after "."');
        a(h.v);
        continue;
      }
      if (u.t === "op" && u.v === "?.") {
        const h = this.tokens[this.pos + 1];
        if ((h == null ? void 0 : h.t) === "punc" && h.v === "(") {
          r(), this.next(), c();
          continue;
        }
        if ((h == null ? void 0 : h.t) === "punc" && h.v === "[") {
          r(), this.next(), this.next(), c(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]"), f();
          continue;
        }
        r(), this.next(), c();
        const E = this.next();
        if (E.t !== "id") throw new Error('Expected identifier after "?."');
        a(E.v);
        continue;
      }
      if (u.t === "punc" && u.v === "[") {
        r(), this.next(), this.withNestedExpr(() => this.parseExpression()), this.expectPunc("]"), f();
        continue;
      }
      if (u.t === "punc" && u.v === "(") {
        this.next();
        const h = this.parseArgsAndCount();
        this.expectPunc(")"), t ? (this.emit(27, h), t = !1) : this.emit(26, h);
        continue;
      }
      if (u.t === "op" && u.v === "::") {
        this.next();
        const h = this.next();
        if (h.t !== "id") throw new Error('Expected modifier after "::"');
        if (h.v === "rx") {
          r(), this.emit(
            28
            /* RX_UI */
          );
          continue;
        }
        throw new Error(`Unknown modifier: ${h.v}`);
      }
      break;
    }
    if (r(), s.length) {
      const u = this.code.length;
      for (const h of s) this.patch(h, u);
    }
  }
  parseArgsAndCount() {
    let t = 0, s = this.peek();
    if (s.t === "punc" && s.v === ")") return 0;
    for (; ; ) {
      if (this.withNestedExpr(() => this.parseExpression()), t++, s = this.peek(), s.t === "punc" && s.v === ",") {
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
      let s = 0, r = this.peek();
      if (r.t === "punc" && r.v === "]") {
        this.next(), this.emit(34, 0);
        return;
      }
      for (; ; ) {
        if (this.withNestedExpr(() => this.parseExpression()), s++, r = this.peek(), r.t === "punc" && r.v === ",") {
          this.next();
          continue;
        }
        break;
      }
      this.expectPunc("]"), this.emit(34, s);
      return;
    }
    if (t.t === "punc" && t.v === "{") {
      let s = 0, r = this.peek();
      if (r.t === "punc" && r.v === "}") {
        this.next(), this.emit(35, 0);
        return;
      }
      for (; ; ) {
        const c = this.next();
        if (c.t !== "id" && c.t !== "str")
          throw new Error("Expected object key");
        const a = this.peek();
        if (a.t === "op" && a.v === ":")
          this.emit(1, this.c(c.v)), this.next(), this.withNestedExpr(() => this.parseExpression());
        else {
          if (c.t !== "id")
            throw new Error("Shorthand requires identifier");
          this.emit(1, this.c(c.v)), this.emit(2, this.id(c.v));
        }
        if (s++, r = this.peek(), r.t === "punc" && r.v === ",") {
          this.next();
          continue;
        }
        break;
      }
      this.expectPunc("}"), this.emit(35, s);
      return;
    }
    throw new Error(`Unexpected token in expression: ${JSON.stringify(t, null, 2)}`);
  }
}
export {
  X as Bytecode,
  R as OP,
  z as VMProgramCompiler,
  W as tokenizeExpr
};
//# sourceMappingURL=vm.js.map

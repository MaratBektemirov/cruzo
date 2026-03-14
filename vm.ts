export type Tok =
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "punc"; v: string }
  | { t: "eof" };

const isWS = (c: string) => c === " " || c === "\n" || c === "\t" || c === "\r";
const isDigit = (c: string) => c >= "0" && c <= "9";
const ID_START_REGEXP = /[A-Za-z_$]/;
const ID_REGEXP = /[A-Za-z0-9_$]/;
const isIdStart = (c: string) => ID_START_REGEXP.test(c);
const isId = (c: string) => ID_REGEXP.test(c);

const ops = [
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
  "}",
];

function matchOp(input: string, i: number): string {
  for (const op of ops) {
    if (input.startsWith(op, i)) return op;
  }
  return null;
}

export function tokenizeExpr(input: string): Tok[] {
  input = input.trim();

  const out: Tok[] = [];
  let i = 0;

  while (i < input.length) {
    const c = input[i];

    if (isWS(c)) {
      i++;
      continue;
    }

    if (c === "'" || c === '"') {
      const q = c;
      i++;
      let s = "";
      while (i < input.length) {
        const ch = input[i++];
        if (ch === "\\") {
          const nxt = input[i++];
          s += nxt === "n" ? "\n" : nxt === "t" ? "\t" : nxt;
          continue;
        }
        if (ch === q) break;
        s += ch;
      }
      out.push({ t: "str", v: s });
      continue;
    }

    if (isDigit(c) || (c === "." && isDigit(input[i + 1] || ""))) {
      let s = "";
      while (i < input.length && (isDigit(input[i]) || input[i] === "."))
        s += input[i++];
      out.push({ t: "num", v: Number(s) });
      continue;
    }

    if (isIdStart(c)) {
      let s = "";
      while (i < input.length && isId(input[i])) s += input[i++];
      out.push({ t: "id", v: s });
      continue;
    }

    const op = matchOp(input, i);

    if (op) {
      i += op.length;
      if ("()[]{},".includes(op)) out.push({ t: "punc", v: op });
      else out.push({ t: "op", v: op });
      continue;
    }

    throw new Error(`Unexpected char "${c}" at ${i}`);
  }

  out.push({ t: "eof" });
  return out;
}

const C = {
  ip: "color:#777",
  hex: "color:#999",
  op: "color:#4fc1ff;font-weight:600",
  jump: "color:#ff5370;font-weight:600",
  arg: "color:#c3e88d",
  com: "color:#777;font-style:italic",
};

const hex32 = (x: number) => "0x" + (x >>> 0).toString(16).padStart(8, "0");

const show = (v: any) => {
  if (typeof v === "string") return JSON.stringify(v);
  if (v == null) return String(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const s = JSON.stringify(v);
    return s && s.length > 60 ? s.slice(0, 57) + "…" : s;
  } catch {
    return Object.prototype.toString.call(v);
  }
};

export class Bytecode {
  constructor(
    private code: Uint32Array,
    private consts: any[],
    private idNames: string[],
    private exprCount: number,
    private onceCount: number
  ) {
  }

  public onlyOnce() {
    return this.exprCount === 1 && this.onceCount === 1;
  }

  fmtArg(op: OP, a: number, wide?: number) {
    switch (op) {
      case OP.PUSH_CONST:
        return [`const[${a}]`, show(this.consts[a])];

      case OP.LOAD_ID:
        return [`id[${a}]`, this.idNames[a] ?? "<bad id>"];

      case OP.GET_PROP:
      case OP.GET_PROP_KEEP:
        return [`prop[${a}]`, show(this.consts[a])];

      case OP.JMP:
      case OP.JMP_IF_FALSE:
      case OP.JMP_IF_FALSE_KEEP:
      case OP.JMP_IF_TRUE_KEEP:
      case OP.JMP_IF_NULLISH:
        return [`-> ${a}`, ""];

      case OP.CALL_FN:
      case OP.CALL_METHOD:
        return [`argc=${a}`, ""];

      case OP.MAKE_ARRAY:
        return [`count=${a}`, ""];

      case OP.MAKE_OBJECT:
        return [`pairs=${a}`, ""];

      case OP.ONCE_ENTER:
        return [`slot=${a} -> ${wide ?? "?"}`, ""];

      case OP.ONCE_STORE:
        return [`slot=${a}`, ""];

      default:
        return a ? [`a=${a}`, ""] : ["", ""];
    }
  };

  log() {
    for (let ip = 0; ip < this.code.length; ip++) {
      const instr = this.code[ip] >>> 0;
      const op = opOf(instr);
      const a = aOf(instr);

      let wide: number | undefined;
      if (op === OP.ONCE_ENTER) wide = (this.code[ip + 1] ?? 0) >>> 0;

      const opName = OP[op] ?? `OP_${op}`;
      const [arg, comment] = this.fmtArg(op, a, wide);

      const fmt =
        `%c${String(ip).padStart(4)} ` +
        `%c${hex32(instr)}  ` +
        `%c${opName.padEnd(18)} ` +
        `%c${arg}` +
        (comment ? ` %c; ${comment}` : "");

      const styles = [
        C.ip,
        C.hex,
        isJump(op) ? C.jump : C.op,
        C.arg,
        ...(comment ? [C.com] : []),
      ];

      console.log(fmt, ...styles);

      if (op === OP.ONCE_ENTER) {
        ip++;
        const w = (this.code[ip] ?? 0) >>> 0;

        const fmt2 =
          `%c${String(ip).padStart(4)} ` +
          `%c${hex32(w)}  ` +
          `%c${"WIDE".padEnd(18)} ` +
          `%c${`-> ${w}`}`;

        console.log(fmt2, C.ip, C.hex, C.jump, C.arg);
      }
    }
  }

  noRunNeeded(template: any) {
    return this.onlyOnce() && template.onceMap?.has(this);
  }

  setOnceSlotValue(template: any, slot: number, slotValue: any) {
    template.onceMap ??= new Map();

    if (this.onlyOnce()) {
      template.onceMap.set(this, slotValue);
      return;
    }

    let values = template.onceMap.get(this);
    
    if (!values) {
      values = [];
      template.onceMap.set(this, values);
    }

    while (values.length <= slot) values.push(ONCE_EMPTY);
    values[slot] = slotValue;
  }


  getOnceSlotValue(template: any, slot: number) {
    template.onceMap ??= new Map();

    if (this.onlyOnce()) {
      if (template.onceMap.has(this)) return template.onceMap.get(this);
      template.onceMap.set(this, ONCE_EMPTY);
      return ONCE_EMPTY;
    }

    let values = template.onceMap.get(this);
    if (!values) {
      values = [];
      template.onceMap.set(this, values);
    }

    while (values.length <= slot) values.push(ONCE_EMPTY);
    return values[slot];
  }

  run(
    template: any,
    ctx: number,
    linkIndex: number,
    app: any,
    rxAccIsFilling: boolean,
    event: Event,
  ) {
    const code = this.code;
    const consts = this.consts;
    const idNames = this.idNames;

    let root: any;
    let thisArg: any;

    const stack: any[] = [];

    let sp = 0;
    let ip = 0;
    let onceDepth = 0;

    while (ip < code.length) {
      const instr = code[ip++];
      const op = opOf(instr);
      const a = aOf(instr);

      switch (op) {
        case OP.PUSH_CONST:
          stack[sp++] = consts[a];
          break;

        case OP.LOAD_ID: {
          const name = idNames[a];

          switch (name) {
            case "root":
              root ??= template.root.self();
              stack[sp++] = root;
              break;
            case "app":
              stack[sp++] = app;
              break;
            case "index":
              stack[sp++] = template.cloneIndex;
              break;
            case "$element":
              stack[sp++] = template.node;
              break;
            case "event":
              stack[sp++] = event;
              break;
            default:
              stack[sp++] = template.getVarFromLexicalEnv(name);
              break;
          }
          break;
        }

        case OP.LOAD_THIS:
          thisArg ??= template.getThisArg();
          stack[sp++] = thisArg;
          break;

        case OP.GET_PROP: {
          const prop = consts[a] as string;
          const obj = stack[--sp];
          stack[sp++] = obj == null ? undefined : obj[prop];
          break;
        }

        case OP.GET_PROP_KEEP: {
          const prop = consts[a] as string;
          const obj = stack[--sp];
          const val = obj == null ? undefined : obj[prop];
          stack[sp++] = obj;
          stack[sp++] = val;
          break;
        }

        case OP.GET_INDEX: {
          const idx = stack[--sp];
          const obj = stack[--sp];
          stack[sp++] = obj == null ? undefined : obj[idx];
          break;
        }

        case OP.GET_INDEX_KEEP: {
          const idx = stack[--sp];
          const obj = stack[--sp];
          const val = obj == null ? undefined : obj[idx];
          stack[sp++] = obj;
          stack[sp++] = val;
          break;
        }

        case OP.POP:
          sp--;
          break;

        case OP.POP_BELOW: {
          const top = stack[--sp];
          sp--;
          stack[sp++] = top;
          break;
        }

        case OP.UNARY_NOT:
          stack[sp - 1] = !stack[sp - 1];
          break;
        case OP.UNARY_POS:
          stack[sp - 1] = +stack[sp - 1];
          break;
        case OP.UNARY_NEG:
          stack[sp - 1] = -stack[sp - 1];
          break;

        case OP.BIN_ADD: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] + r;
          break;
        }
        case OP.BIN_SUB: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] - r;
          break;
        }
        case OP.BIN_MUL: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] * r;
          break;
        }
        case OP.BIN_DIV: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] / r;
          break;
        }
        case OP.BIN_MOD: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] % r;
          break;
        }

        case OP.BIN_EQ: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] == r;
          break;
        }
        case OP.BIN_NEQ: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] != r;
          break;
        }
        case OP.BIN_SEQ: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] === r;
          break;
        }
        case OP.BIN_SNEQ: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] !== r;
          break;
        }
        case OP.BIN_LT: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] < r;
          break;
        }
        case OP.BIN_LTE: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] <= r;
          break;
        }
        case OP.BIN_GT: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] > r;
          break;
        }
        case OP.BIN_GTE: {
          const r = stack[--sp];
          stack[sp - 1] = stack[sp - 1] >= r;
          break;
        }

        case OP.CALL_FN: {
          const argc = a;
          const fnIndex = sp - argc - 1;
          const fn = stack[fnIndex];

          if (typeof fn !== "function") {
            sp = fnIndex;
            stack[sp++] = undefined;
            break;
          }

          thisArg ??= template.getThisArg();

          switch (argc) {
            case 0:
              sp = fnIndex;
              stack[sp++] = fn.call(thisArg);
              break;
            case 1: {
              const a0 = stack[sp - 1];
              sp = fnIndex;
              stack[sp++] = fn.call(thisArg, a0);
              break;
            }
            case 2: {
              const a0 = stack[sp - 2];
              const a1 = stack[sp - 1];
              sp = fnIndex;
              stack[sp++] = fn.call(thisArg, a0, a1);
              break;
            }
            case 3: {
              const a0 = stack[sp - 3];
              const a1 = stack[sp - 2];
              const a2 = stack[sp - 1];
              sp = fnIndex;
              stack[sp++] = fn.call(thisArg, a0, a1, a2);
              break;
            }
            case 4: {
              const a0 = stack[sp - 4];
              const a1 = stack[sp - 3];
              const a2 = stack[sp - 2];
              const a3 = stack[sp - 1];
              sp = fnIndex;
              stack[sp++] = fn.call(thisArg, a0, a1, a2, a3);
              break;
            }
            default: {
              const args = new Array(argc);
              for (let i = 0; i < argc; i++) args[i] = stack[sp - argc + i];
              sp = fnIndex;
              stack[sp++] = fn.apply(thisArg, args);
              break;
            }
          }
          break;
        }

        case OP.CALL_METHOD: {
          const argc = a;
          const fnIndex = sp - argc - 1;
          const objIndex = sp - argc - 2;
          const fn = stack[fnIndex];
          const obj = stack[objIndex];

          if (typeof fn !== "function") {
            sp = objIndex;
            stack[sp++] = undefined;
            break;
          }

          switch (argc) {
            case 0:
              sp = objIndex;
              stack[sp++] = fn.call(obj);
              break;
            case 1: {
              const a0 = stack[sp - 1];
              sp = objIndex;
              stack[sp++] = fn.call(obj, a0);
              break;
            }
            case 2: {
              const a0 = stack[sp - 2];
              const a1 = stack[sp - 1];
              sp = objIndex;
              stack[sp++] = fn.call(obj, a0, a1);
              break;
            }
            case 3: {
              const a0 = stack[sp - 3];
              const a1 = stack[sp - 2];
              const a2 = stack[sp - 1];
              sp = objIndex;
              stack[sp++] = fn.call(obj, a0, a1, a2);
              break;
            }
            case 4: {
              const a0 = stack[sp - 4];
              const a1 = stack[sp - 3];
              const a2 = stack[sp - 2];
              const a3 = stack[sp - 1];
              sp = objIndex;
              stack[sp++] = fn.call(obj, a0, a1, a2, a3);
              break;
            }
            default: {
              const args = new Array(argc);
              for (let i = 0; i < argc; i++) args[i] = stack[sp - argc + i];
              sp = objIndex;
              stack[sp++] = fn.apply(obj, args);
              break;
            }
          }

          break;
        }

        case OP.RX_UI: {
          const rx = stack[--sp];
          if (rx == null) throw new Error(`::rx is invalid on ${rx}`);
          stack[sp++] = template.getRxValue(ctx, rx, linkIndex, rxAccIsFilling, onceDepth > 0);
          break;
        }

        case OP.ONCE_ENTER: {
          const slotIndex = a;
          const targetIp = code[ip++] >>> 0;

          const slotValue = this.getOnceSlotValue(template, slotIndex);

          if (slotValue !== ONCE_EMPTY) {
            stack[sp++] = slotValue;
            ip = targetIp;
          } else {
            onceDepth++;
          }
          break;
        }

        case OP.ONCE_STORE: {
          const slotIndex = a;

          this.setOnceSlotValue(template, slotIndex, stack[sp - 1]);

          onceDepth--;
          break;
        }

        case OP.JMP:
          ip = a;
          break;

        case OP.JMP_IF_FALSE: {
          const cond = stack[--sp];
          if (!cond) ip = a;
          break;
        }

        case OP.JMP_IF_FALSE_KEEP: {
          const cond = stack[sp - 1];
          if (!cond) ip = a;
          else sp--;
          break;
        }

        case OP.JMP_IF_TRUE_KEEP: {
          const cond = stack[sp - 1];
          if (cond) ip = a;
          else sp--;
          break;
        }

        case OP.JMP_IF_NULLISH: {
          const v = stack[sp - 1];
          if (v == null) ip = a;
          break;
        }

        case OP.MAKE_ARRAY: {
          const count = a;
          const arr = new Array(count);
          for (let i = count - 1; i >= 0; i--) arr[i] = stack[--sp];
          stack[sp++] = arr;
          break;
        }

        case OP.MAKE_OBJECT: {
          const pairCount = a;
          const obj: any = {};
          for (let i = 0; i < pairCount; i++) {
            const value = stack[--sp];
            const key = stack[--sp];
            obj[key] = value;
          }
          stack[sp++] = obj;
          break;
        }

        default:
          throw new Error(`Unknown op ${op} at ip=${ip - 1}`);
      }
    }

    return sp ? stack[sp - 1] : undefined;
  }
};

const ONCE_EMPTY = {};

const OP_MASK = 0xff;
const A_SHIFT = 8;

export enum OP {
  PUSH_CONST = 1,
  LOAD_ID = 2,
  LOAD_THIS = 3,

  GET_PROP = 4,
  GET_PROP_KEEP = 5,

  GET_INDEX = 6,
  GET_INDEX_KEEP = 7,

  POP = 8,
  POP_BELOW = 9,

  UNARY_NOT = 10,
  UNARY_POS = 11,
  UNARY_NEG = 12,

  BIN_ADD = 13,
  BIN_SUB = 14,
  BIN_MUL = 15,
  BIN_DIV = 16,
  BIN_MOD = 17,

  BIN_EQ = 18,
  BIN_NEQ = 19,
  BIN_SEQ = 20,
  BIN_SNEQ = 21,
  BIN_LT = 22,
  BIN_LTE = 23,
  BIN_GT = 24,
  BIN_GTE = 25,

  CALL_FN = 26,
  CALL_METHOD = 27,

  RX_UI = 28,

  JMP = 29,
  JMP_IF_FALSE = 30,
  JMP_IF_FALSE_KEEP = 31,
  JMP_IF_TRUE_KEEP = 32,
  JMP_IF_NULLISH = 33,

  MAKE_ARRAY = 34,
  MAKE_OBJECT = 35,

  ONCE_ENTER = 36,
  ONCE_STORE = 37,
}

function isJump(op: OP) {
  return op === OP.JMP ||
    op === OP.JMP_IF_FALSE ||
    op === OP.JMP_IF_FALSE_KEEP ||
    op === OP.JMP_IF_TRUE_KEEP ||
    op === OP.JMP_IF_NULLISH ||
    op === OP.ONCE_ENTER
};

function ins(op: OP, a = 0): number {
  return (a << A_SHIFT) | (op & OP_MASK);
}

function opOf(x: number): OP {
  return (x & OP_MASK) as OP;
}

function aOf(x: number): number {
  return x >>> A_SHIFT;
}

export class VMProgramCompiler {
  private pos = 0;

  private code: number[] = [];
  private consts: any[] = null;
  private constMap: Map<string, number>;

  private idNames: string[] = null;
  private idMap: Map<string, number>;

  private onceSlot = 0;

  private exprDepth = 0;
  private exprCount = 0;

  constructor(private tokens: Tok[]) { }

  private withNestedExpr<T>(fn: () => T): T {
    this.exprDepth++;
    try {
      return fn();
    } finally {
      this.exprDepth--;
    }
  }

  private allocOnceSlot(): number {
    return this.onceSlot++;
  }

  private peek(): Tok {
    return this.tokens[this.pos];
  }

  private next(): Tok {
    return this.tokens[this.pos++];
  }

  private expectPunc(v: string) {
    const t = this.next();
    if (t.t !== "punc" || t.v !== v) throw new Error(`Expected "${v}"`);
  }

  private expectOp(v: string) {
    const t = this.next();
    if (t.t !== "op" || t.v !== v) throw new Error(`Expected "${v}"`);
  }

  private c(v: any): number {
    this.consts ??= [];
    if (typeof v === "string") {
      const k = "s:" + v;
      this.constMap ??= new Map();
      const hit = this.constMap.get(k);
      if (hit != null) return hit;
      const idx = this.consts.length;
      this.consts.push(v);
      this.constMap.set(k, idx);
      return idx;
    }
    const idx = this.consts.length;
    this.consts.push(v);
    return idx;
  }

  private id(name: string): number {
    this.idMap ??= new Map();
    const hit = this.idMap.get(name);
    if (hit != null) return hit;
    this.idNames ??= [];
    const idx = this.idNames.length;
    this.idNames.push(name);
    this.idMap.set(name, idx);
    return idx;
  }

  private emit(op: OP, a = 0) {
    this.code.push(ins(op, a));
  }

  private emitJump(op: OP): number {
    const i = this.code.length;
    this.code.push(ins(op, 0));
    return i;
  }

  private patch(instrIndex: number, targetIp: number) {
    const old = this.code[instrIndex];
    this.code[instrIndex] = ins(opOf(old), targetIp);
  }

  getBytecode(expr: string): Bytecode {
    if (this.peek().t === "eof") throw new Error(`Empty template expression is not allowed`);

    this.parseExpression();
    const t = this.peek();
    if (t.t !== "eof") throw new Error(`Unexpected token after expression`);

    return new Bytecode(
      new Uint32Array(this.code),
      this.consts,
      this.idNames,
      this.exprCount || 1,
      this.onceSlot,
    );
  }

  private parseExpression() {
    this.parseTernary();
  }

  private parseTernary() {
    this.parseNullish();
    const t = this.peek();
    if (t.t === "op" && t.v === "?") {
      if (this.exprDepth === 0 && this.exprCount === 0) this.exprCount = 3;

      this.next();
      const jFalse = this.emitJump(OP.JMP_IF_FALSE);

      this.withNestedExpr(() => this.parseExpression());
      const jEnd = this.emitJump(OP.JMP);

      this.expectOp(":");
      this.patch(jFalse, this.code.length);

      this.withNestedExpr(() => this.parseExpression());
      this.patch(jEnd, this.code.length);
    }
  }

  private parseNullish() {
    this.parseOr();
    let t = this.peek();

    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && t.v === "??") {
      let terms = 1;

      while (t.t === "op" && t.v === "??") {
        this.next();

        const jComputeRight = this.emitJump(OP.JMP_IF_NULLISH);
        const jEnd = this.emitJump(OP.JMP);

        this.patch(jComputeRight, this.code.length);
        this.emit(OP.POP);

        this.parseOr();

        this.patch(jEnd, this.code.length);
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && t.v === "??") {
      this.next();

      const jComputeRight = this.emitJump(OP.JMP_IF_NULLISH);
      const jEnd = this.emitJump(OP.JMP);

      this.patch(jComputeRight, this.code.length);
      this.emit(OP.POP);

      this.parseOr();

      this.patch(jEnd, this.code.length);
      t = this.peek();
    }
  }

  private parseOr() {
    this.parseAnd();
    let t = this.peek();

    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && t.v === "||") {
      let terms = 1;

      while (t.t === "op" && t.v === "||") {
        this.next();
        const jKeep = this.emitJump(OP.JMP_IF_TRUE_KEEP);
        this.parseAnd();
        this.patch(jKeep, this.code.length);
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && t.v === "||") {
      this.next();
      const jKeep = this.emitJump(OP.JMP_IF_TRUE_KEEP);
      this.parseAnd();
      this.patch(jKeep, this.code.length);
      t = this.peek();
    }
  }

  private parseAnd() {
    this.parseEq();
    let t = this.peek();

    if (this.exprDepth === 0 && this.exprCount === 0 && t.t === "op" && t.v === "&&") {
      let terms = 1;

      while (t.t === "op" && t.v === "&&") {
        this.next();
        const jKeep = this.emitJump(OP.JMP_IF_FALSE_KEEP);
        this.parseEq();
        this.patch(jKeep, this.code.length);
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && t.v === "&&") {
      this.next();
      const jKeep = this.emitJump(OP.JMP_IF_FALSE_KEEP);
      this.parseEq();
      this.patch(jKeep, this.code.length);
      t = this.peek();
    }
  }

  private parseEq() {
    this.parseRel();
    let t = this.peek();

    if (
      this.exprDepth === 0 &&
      this.exprCount === 0 &&
      t.t === "op" &&
      ["===", "!==", "==", "!="].includes(t.v)
    ) {
      let terms = 1;

      while (t.t === "op" && ["===", "!==", "==", "!="].includes(t.v)) {
        const op = (this.next() as any).v as string;
        this.parseRel();
        switch (op) {
          case "===":
            this.emit(OP.BIN_SEQ);
            break;
          case "!==":
            this.emit(OP.BIN_SNEQ);
            break;
          case "==":
            this.emit(OP.BIN_EQ);
            break;
          case "!=":
            this.emit(OP.BIN_NEQ);
            break;
        }
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && ["===", "!==", "==", "!="].includes(t.v)) {
      const op = (this.next() as any).v as string;
      this.parseRel();
      switch (op) {
        case "===":
          this.emit(OP.BIN_SEQ);
          break;
        case "!==":
          this.emit(OP.BIN_SNEQ);
          break;
        case "==":
          this.emit(OP.BIN_EQ);
          break;
        case "!=":
          this.emit(OP.BIN_NEQ);
          break;
      }
      t = this.peek();
    }
  }

  private parseRel() {
    this.parseAdd();
    let t = this.peek();

    if (
      this.exprDepth === 0 &&
      this.exprCount === 0 &&
      t.t === "op" &&
      ["<", "<=", ">", ">="].includes(t.v)
    ) {
      let terms = 1;

      while (t.t === "op" && ["<", "<=", ">", ">="].includes(t.v)) {
        const op = (this.next() as any).v as string;
        this.parseAdd();
        switch (op) {
          case "<":
            this.emit(OP.BIN_LT);
            break;
          case "<=":
            this.emit(OP.BIN_LTE);
            break;
          case ">":
            this.emit(OP.BIN_GT);
            break;
          case ">=":
            this.emit(OP.BIN_GTE);
            break;
        }
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && ["<", "<=", ">", ">="].includes(t.v)) {
      const op = (this.next() as any).v as string;
      this.parseAdd();
      switch (op) {
        case "<":
          this.emit(OP.BIN_LT);
          break;
        case "<=":
          this.emit(OP.BIN_LTE);
          break;
        case ">":
          this.emit(OP.BIN_GT);
          break;
        case ">=":
          this.emit(OP.BIN_GTE);
          break;
      }
      t = this.peek();
    }
  }

  private parseAdd() {
    this.parseMul();
    let t = this.peek();

    if (
      this.exprDepth === 0 &&
      this.exprCount === 0 &&
      t.t === "op" &&
      ["+", "-"].includes(t.v)
    ) {
      let terms = 1;

      while (t.t === "op" && ["+", "-"].includes(t.v)) {
        const op = (this.next() as any).v as string;
        this.parseMul();
        this.emit(op === "+" ? OP.BIN_ADD : OP.BIN_SUB);
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && ["+", "-"].includes(t.v)) {
      const op = (this.next() as any).v as string;
      this.parseMul();
      this.emit(op === "+" ? OP.BIN_ADD : OP.BIN_SUB);
      t = this.peek();
    }
  }

  private parseMul() {
    this.parseUnary();
    let t = this.peek();

    if (
      this.exprDepth === 0 &&
      this.exprCount === 0 &&
      t.t === "op" &&
      ["*", "/", "%"].includes(t.v)
    ) {
      let terms = 1;

      while (t.t === "op" && ["*", "/", "%"].includes(t.v)) {
        const op = (this.next() as any).v as string;
        this.parseUnary();
        this.emit(op === "*" ? OP.BIN_MUL : op === "/" ? OP.BIN_DIV : OP.BIN_MOD);
        terms++;
        t = this.peek();
      }

      this.exprCount = terms;
      return;
    }

    while (t.t === "op" && ["*", "/", "%"].includes(t.v)) {
      const op = (this.next() as any).v as string;
      this.parseUnary();
      this.emit(op === "*" ? OP.BIN_MUL : op === "/" ? OP.BIN_DIV : OP.BIN_MOD);
      t = this.peek();
    }
  }

  private parseUnary() {
    const t = this.peek();

    if (t.t === "id" && t.v === "once") {
      const la = this.tokens[this.pos + 1];
      if (la?.t === "op" && la.v === "::") {
        this.next();
        this.next();

        const slot = this.allocOnceSlot();

        this.emit(OP.ONCE_ENTER, slot);
        const wideIndex = this.code.length;
        this.code.push(0);

        this.parsePostfix();

        this.emit(OP.ONCE_STORE, slot);
        this.code[wideIndex] = this.code.length;
        return;
      }
    }

    if (t.t === "op" && ["!", "+", "-"].includes(t.v)) {
      this.next();
      this.parseUnary();
      this.emit(t.v === "!" ? OP.UNARY_NOT : t.v === "+" ? OP.UNARY_POS : OP.UNARY_NEG);
      return;
    }

    this.parsePostfix();
  }

  private parsePostfix() {
    this.parsePrimary();

    let hasObjFnPair = false;
    const nullishJumps: number[] = [];
    const emitNullishGuard = () => {
      nullishJumps.push(this.emitJump(OP.JMP_IF_NULLISH));
    };

    while (true) {
      const t = this.peek();

      if (t.t === "op" && t.v === ".") {
        if (hasObjFnPair) {
          this.emit(OP.POP_BELOW);
          hasObjFnPair = false;
        }

        this.next();
        const id = this.next();
        if (id.t !== "id") throw new Error(`Expected identifier after "."`);

        const propIdx = this.c(id.v);
        const la = this.peek();

        if (la.t === "punc" && la.v === "(") {
          this.emit(OP.GET_PROP_KEEP, propIdx);
          hasObjFnPair = true;
        } else {
          this.emit(OP.GET_PROP, propIdx);
          hasObjFnPair = false;
        }
        continue;
      }

      if (t.t === "op" && t.v === "?.") {
        const la0 = this.tokens[this.pos + 1];

        if (la0?.t === "punc" && la0.v === "(") {
          if (hasObjFnPair) {
            this.emit(OP.POP_BELOW);
            hasObjFnPair = false;
          }

          this.next();
          emitNullishGuard();
          continue;
        }

        if (la0?.t === "punc" && la0.v === "[") {
          if (hasObjFnPair) {
            this.emit(OP.POP_BELOW);
            hasObjFnPair = false;
          }

          this.next();
          this.next();

          emitNullishGuard();

          this.withNestedExpr(() => this.parseExpression());
          this.expectPunc("]");

          const la2 = this.peek();
          if (la2.t === "punc" && la2.v === "(") {
            this.emit(OP.GET_INDEX_KEEP);
            hasObjFnPair = true;
          } else {
            this.emit(OP.GET_INDEX);
            hasObjFnPair = false;
          }
          continue;
        }

        if (hasObjFnPair) {
          this.emit(OP.POP_BELOW);
          hasObjFnPair = false;
        }

        this.next();
        emitNullishGuard();

        const id = this.next();
        if (id.t !== "id") throw new Error(`Expected identifier after "?."`);

        const propIdx = this.c(id.v);
        const la = this.peek();

        if (la.t === "punc" && la.v === "(") {
          this.emit(OP.GET_PROP_KEEP, propIdx);
          hasObjFnPair = true;
        } else {
          this.emit(OP.GET_PROP, propIdx);
          hasObjFnPair = false;
        }
        continue;
      }

      if (t.t === "punc" && t.v === "[") {
        if (hasObjFnPair) {
          this.emit(OP.POP_BELOW);
          hasObjFnPair = false;
        }

        this.next();
        this.withNestedExpr(() => this.parseExpression());
        this.expectPunc("]");

        const la = this.peek();
        if (la.t === "punc" && la.v === "(") {
          this.emit(OP.GET_INDEX_KEEP);
          hasObjFnPair = true;
        } else {
          this.emit(OP.GET_INDEX);
          hasObjFnPair = false;
        }
        continue;
      }

      if (t.t === "punc" && t.v === "(") {
        this.next();
        const argc = this.parseArgsAndCount();
        this.expectPunc(")");

        if (hasObjFnPair) {
          this.emit(OP.CALL_METHOD, argc);
          hasObjFnPair = false;
        } else {
          this.emit(OP.CALL_FN, argc);
        }
        continue;
      }

      if (t.t === "op" && t.v === "::") {
        this.next();
        const mod = this.next();
        if (mod.t !== "id") throw new Error(`Expected modifier after "::"`);

        if (mod.v === "rx") {
          if (hasObjFnPair) {
            this.emit(OP.POP_BELOW);
            hasObjFnPair = false;
          }
          this.emit(OP.RX_UI);
          continue;
        }

        throw new Error(`Unknown modifier: ${mod.v}`);
      }

      break;
    }

    if (hasObjFnPair) this.emit(OP.POP_BELOW);

    if (nullishJumps.length) {
      const target = this.code.length;
      for (const j of nullishJumps) this.patch(j, target);
    }
  }

  private parseArgsAndCount(): number {
    let argc = 0;

    let t = this.peek();
    if (t.t === "punc" && t.v === ")") return 0;

    while (true) {
      this.withNestedExpr(() => this.parseExpression());
      argc++;

      t = this.peek();
      if (t.t === "punc" && t.v === ",") {
        this.next();
        continue;
      }
      break;
    }

    return argc;
  }

  private parsePrimary() {
    const t = this.next();

    if (t.t === "num") {
      this.emit(OP.PUSH_CONST, this.c(t.v));
      return;
    }

    if (t.t === "str") {
      this.emit(OP.PUSH_CONST, this.c(t.v));
      return;
    }

    if (t.t === "id") {
      if (t.v === "this") {
        this.emit(OP.LOAD_THIS);
        return;
      }
      if (t.v === "true") {
        this.emit(OP.PUSH_CONST, this.c(true));
        return;
      }
      if (t.v === "false") {
        this.emit(OP.PUSH_CONST, this.c(false));
        return;
      }
      if (t.v === "null") {
        this.emit(OP.PUSH_CONST, this.c(null));
        return;
      }
      if (t.v === "undefined") {
        this.emit(OP.PUSH_CONST, this.c(undefined));
        return;
      }
      this.emit(OP.LOAD_ID, this.id(t.v));
      return;
    }

    if (t.t === "punc" && t.v === "(") {
      this.withNestedExpr(() => this.parseExpression());
      this.expectPunc(")");
      return;
    }

    if (t.t === "punc" && t.v === "[") {
      let count = 0;

      let la = this.peek();
      if (la.t === "punc" && la.v === "]") {
        this.next();
        this.emit(OP.MAKE_ARRAY, 0);
        return;
      }

      while (true) {
        this.withNestedExpr(() => this.parseExpression());
        count++;

        la = this.peek();
        if (la.t === "punc" && la.v === ",") {
          this.next();
          continue;
        }
        break;
      }

      this.expectPunc("]");
      this.emit(OP.MAKE_ARRAY, count);
      return;
    }

    if (t.t === "punc" && t.v === "{") {
      let count = 0;

      let la = this.peek();
      if (la.t === "punc" && la.v === "}") {
        this.next();
        this.emit(OP.MAKE_OBJECT, 0);
        return;
      }

      while (true) {
        const keyTok = this.next();

        if (keyTok.t !== "id" && keyTok.t !== "str") {
          throw new Error(`Expected object key`);
        }

        const la0 = this.peek();

        if (la0.t === "op" && la0.v === ":") {
          this.emit(OP.PUSH_CONST, this.c(keyTok.v));
          this.next();
          this.withNestedExpr(() => this.parseExpression());
        } else {
          if (keyTok.t !== "id") {
            throw new Error(`Shorthand requires identifier`);
          }
          this.emit(OP.PUSH_CONST, this.c(keyTok.v));
          this.emit(OP.LOAD_ID, this.id(keyTok.v));
        }

        count++;

        la = this.peek();
        if (la.t === "punc" && la.v === ",") {
          this.next();
          continue;
        }
        break;
      }

      this.expectPunc("}");
      this.emit(OP.MAKE_OBJECT, count);
      return;
    }

    throw new Error(`Unexpected token in expression: ${JSON.stringify(t, null, 2)}`);
  }
}
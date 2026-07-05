import { describe, expect, it } from "vitest";
import { Rx } from "./rx";
import { Bytecode, tokenizeExpr, VMProgramCompiler } from "./vm";

function compile(expr: string): Bytecode {
  const tokens = tokenizeExpr(expr);
  return new VMProgramCompiler(tokens).getBytecode(expr);
}

type RunOpts = {
  root?: Record<string, any>;
  app?: any;
  thisArg?: any;
  cloneIndex?: number;
  lexical?: Record<string, any>;
  event?: Event;
};

function createTemplate(opts: RunOpts = {}) {
  const root = opts.root ?? {};

  return {
    root: { self: () => root },
    cloneIndex: opts.cloneIndex ?? null,
    node: null as HTMLElement | null,
    onceMap: new Map(),
    getVarFromLexicalEnv(name: string) {
      return opts.lexical?.[name];
    },
    getRxValue(_ctx: number, rx: Rx<any>) {
      return rx.actual;
    },
    getThisArg(_allowRxLink: boolean) {
      if (typeof opts.cloneIndex === "number" && Array.isArray(opts.thisArg)) {
        return opts.thisArg[opts.cloneIndex];
      }
      return opts.thisArg ?? root;
    },
    handleSafeError(msg: string) {
      throw new Error(msg);
    },
  };
}

function evalExpr(expr: string, opts: RunOpts = {}) {
  const bc = compile(expr);
  const template = createTemplate(opts);
  return bc.run(template, 0, 0, opts.app ?? null, false, opts.event ?? null);
}

function rx<T>(value: T) {
  const group: Rx<any>[] = [];
  const cell = new Rx(group, (v: T) => v, value);
  cell.update(value);
  return cell;
}

describe("tokenizeExpr", () => {
  it("tokenizes numbers, strings, ids, and operators", () => {
    const tokens = tokenizeExpr("root.count$::rx + 1");
    expect(tokens.map((t) => (t.t === "eof" ? "eof" : `${t.t}:${"v" in t ? t.v : ""}`))).toEqual([
      "id:root",
      "op:.",
      "id:count$",
      "op:::", // op token with v "::"
      "id:rx",
      "op:+",
      "num:1",
      "eof",
    ]);
  });

  it("throws on unterminated string", () => {
    expect(() => tokenizeExpr('"hello')).toThrow(/Unterminated string/);
  });

  it("throws on unexpected character (assignment not supported)", () => {
    expect(() => tokenizeExpr("root.count$ = 1")).toThrow(/Unexpected char "="/);
  });
});

describe("VMProgramCompiler", () => {
  it("rejects empty expression", () => {
    expect(() => compile("   ")).toThrow(/Empty template expression/);
  });

  it("rejects trailing tokens", () => {
    expect(() => compile("1 2")).toThrow(/Unexpected token after expression/);
  });
});

describe("Bytecode.run — literals and arithmetic", () => {
  it("evaluates numbers and strings", () => {
    expect(evalExpr("42")).toBe(42);
    expect(evalExpr('"hello"')).toBe("hello");
    expect(evalExpr("'a\\tb'")).toBe("a\tb");
  });

  it("evaluates boolean and nullish literals", () => {
    expect(evalExpr("true")).toBe(true);
    expect(evalExpr("false")).toBe(false);
    expect(evalExpr("null")).toBe(null);
    expect(evalExpr("undefined")).toBe(undefined);
  });

  it("evaluates arithmetic", () => {
    expect(evalExpr("1 + 2 * 3")).toBe(7);
    expect(evalExpr("(1 + 2) * 3")).toBe(9);
    expect(evalExpr("10 % 3")).toBe(1);
    expect(evalExpr("-5 + +2")).toBe(-3);
  });
});

describe("Bytecode.run — comparisons and logic", () => {
  it("evaluates equality", () => {
    expect(evalExpr("1 === 1")).toBe(true);
    expect(evalExpr("1 !== 2")).toBe(true);
    expect(evalExpr("1 == '1'")).toBe(true);
    expect(evalExpr("1 != 2")).toBe(true);
  });

  it("evaluates ordering", () => {
    expect(evalExpr("2 < 3")).toBe(true);
    expect(evalExpr("3 >= 3")).toBe(true);
  });

  it("evaluates && and ||", () => {
    expect(evalExpr("true && false")).toBe(false);
    expect(evalExpr("false || 7")).toBe(7);
    expect(evalExpr("0 || null || 'x'")).toBe("x");
  });

  it("evaluates ?? and ternary", () => {
    expect(evalExpr("null ?? 'd'")).toBe("d");
    expect(evalExpr("0 ?? 1")).toBe(0);
    expect(evalExpr("true ? 'y' : 'n'")).toBe("y");
    expect(evalExpr("false ? 'y' : 'n'")).toBe("n");
  });
});

describe("Bytecode.run — root context", () => {
  it("reads root properties and calls methods", () => {
    const root = {
      title: "Cruzo",
      add(a: number, b: number) {
        return a + b;
      },
    };

    expect(evalExpr("root.title", { root })).toBe("Cruzo");
    expect(evalExpr("root.add(2, 3)", { root })).toBe(5);
  });

  it("reads Rx via ::rx", () => {
    const count$ = rx(3);
    const root = { count$ };

    expect(evalExpr("root.count$::rx", { root })).toBe(3);

    count$.update(10);
    expect(evalExpr("root.count$::rx", { root })).toBe(10);
  });

  it("throws when ::rx is applied to null", () => {
    const root = { nil: null as null };
    expect(() => evalExpr("root.nil::rx", { root })).toThrow(/::rx is invalid/);
  });

  it("supports method calls used in templates (update)", () => {
    const count$ = rx(1);
    const root = {
      count$,
      bump() {
        count$.update(count$.actual + 1);
      },
    };

    evalExpr("root.bump()", { root });
    expect(count$.actual).toBe(2);
  });
});

describe("Bytecode.run — this and lexical vars", () => {
  it("reads this property in repeat scope", () => {
    const item = { name: "alpha" };
    expect(evalExpr("this.name", { thisArg: item })).toBe("alpha");
  });

  it("reads lexical repeat binding via ::rx", () => {
    const item$ = rx({ name: "beta" });
    expect(evalExpr("item::rx.name", { lexical: { item: item$ } })).toBe("beta");
  });

  it("reads lexical env vars", () => {
    expect(evalExpr("name", { lexical: { name: "beta" } })).toBe("beta");
  });
});

describe("Bytecode.run — collections and optional chaining", () => {
  it("creates arrays and objects", () => {
    expect(evalExpr("[1, 2, 3]")).toEqual([1, 2, 3]);
    expect(evalExpr("{ a: 1, b: 2 }")).toEqual({ a: 1, b: 2 });
  });

  it("supports property and index access", () => {
    const root = { items: ["x", "y"] };
    expect(evalExpr("root.items[1]", { root })).toBe("y");
  });

  it("supports optional chaining", () => {
    const root = { meta: null as { id: number } | null };
    expect(evalExpr("root.meta?.id", { root })).toBe(null);
    root.meta = { id: 5 };
    expect(evalExpr("root.meta?.id", { root })).toBe(5);
  });
});

describe("Bytecode.run — once modifier", () => {
  it("evaluates once::expr only on first run", () => {
    let calls = 0;
    const root = {
      nextId() {
        calls++;
        return calls;
      },
    };

    const template = createTemplate({ root });
    const bc = compile("once::root.nextId()");

    expect(bc.run(template, 0, 0, null, false, null)).toBe(1);
    expect(bc.run(template, 0, 0, null, false, null)).toBe(1);
    expect(calls).toBe(1);
  });
});

describe("Bytecode.run — builtins", () => {
  it("loads app, index, $element, event", () => {
    const node = { tag: "div" };
    const app = { version: 1 };
    const event = { type: "click" } as Event;

    const template = {
      ...createTemplate(),
      cloneIndex: 2,
      node,
    };

    const bc = compile("app.version + index");
    expect(bc.run(template, 0, 0, app, false, event)).toBe(3);

    expect(compile("$element").run(template, 0, 0, app, false, event)).toBe(node);
    expect(compile("event.type").run(template, 0, 0, app, false, event)).toBe("click");
  });
});

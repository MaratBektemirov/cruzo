export type Tok = {
    t: "num";
    v: number;
} | {
    t: "str";
    v: string;
} | {
    t: "id";
    v: string;
} | {
    t: "op";
    v: string;
} | {
    t: "punc";
    v: string;
} | {
    t: "eof";
};
export declare function tokenizeExpr(input: string): Tok[];
export declare enum OP {
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
    ONCE_STORE = 37
}
export declare class Bytecode {
    private code;
    private consts;
    private idNames;
    private exprCount;
    private onceCount;
    expr: string;
    constructor(code: Uint32Array, consts: any[], idNames: string[], exprCount: number, onceCount: number, expr: string);
    onlyOnce(): boolean;
    fmtArg(op: OP, a: number, wide?: number): string[];
    log(): void;
    noRunNeeded(template: any): any;
    setOnceSlotValue(template: any, slot: number, slotValue: any): void;
    getOnceSlotValue(template: any, slot: number): any;
    getSafeErrorMsg(obj: any, prop: string): string;
    run(template: any, ctx: number, linkIndex: number, app: any, allowRxLink: boolean, event: Event): any;
}
export declare class VMProgramCompiler {
    private tokens;
    private pos;
    private code;
    private consts;
    private constMap;
    private idNames;
    private idMap;
    private onceSlot;
    private exprDepth;
    private exprCount;
    constructor(tokens: Tok[]);
    private withNestedExpr;
    private allocOnceSlot;
    private peek;
    private next;
    private expectPunc;
    private expectOp;
    private c;
    private id;
    private emit;
    private emitJump;
    private patch;
    private canCount;
    private parseBinaryCounted;
    private parseShortCircuit;
    private parseNullishChain;
    getBytecode(expr: string): Bytecode;
    private parseExpression;
    private parseTernary;
    private parseNullish;
    private parseOr;
    private parseAnd;
    private parseEq;
    private parseRel;
    private parseAdd;
    private parseMul;
    private parseUnary;
    private parsePostfix;
    private parseArgsAndCount;
    private parsePrimary;
}
//# sourceMappingURL=vm.d.ts.map
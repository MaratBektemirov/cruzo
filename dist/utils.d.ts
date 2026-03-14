export declare function arrayToHash<I extends Record<PropertyKey, any>, K extends keyof I>(arr: I[], key: K): Record<string, I>;
export declare function roundValue(value: string | number, n?: number): number;
export declare function delay(ms: number): Promise<unknown>;
export declare function debounce<A1, A2, A3, A4, B>(ms: number, cb: (a1?: A1, a2?: A2, a3?: A3, a4?: A4) => B): (a1?: A1, a2?: A2, a3?: A3, a4?: A4) => Promise<B>;
//# sourceMappingURL=utils.d.ts.map
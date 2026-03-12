export declare function arrayToHash<I extends Record<PropertyKey, any>, K extends keyof I>(arr: I[], key: K): Record<string, I>;
export declare function delay(ms: number): Promise<unknown>;
export declare function debounce<T extends (...args: any[]) => any>(ms: number, cb: T): (this: ThisParameterType<T>, ...args: Parameters<T>) => void;
//# sourceMappingURL=utils.d.ts.map
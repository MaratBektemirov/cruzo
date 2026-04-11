export declare class Rx<A, Args extends any[] = any[]> {
    private group;
    fn: (...args: Args) => A;
    actual: A;
    private groupIndex;
    postUpdateFns?: Set<(rx: Rx<any>) => any>;
    constructor(group: Rx<any>[], fn?: (...args: Args) => A, initValue?: A);
    update(...args: Args): void;
    setPostUpdate(fn: (value: Rx<any>) => any): void;
    unsubscribe(): void;
}
export declare class RxFunc<A> extends Rx<A> {
    private readonly deps;
    private updateScheduled;
    update: () => void;
    constructor(group: Rx<any>[], fn: (...args: any[]) => A, opts?: {
        immediate?: boolean;
    }, ...deps: Rx<any>[]);
    unsubscribe(): void;
}
//# sourceMappingURL=rx.d.ts.map
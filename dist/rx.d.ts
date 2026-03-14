export declare class Rx<A> {
    private group;
    fn: (...args: any[]) => A;
    value: A;
    private groupIndex;
    postUpdateFns?: Set<(rx: Rx<any>) => any>;
    constructor(group: Rx<any>[], fn?: (...args: any[]) => A);
    update(...args: any[]): void;
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
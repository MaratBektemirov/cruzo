import { Rx, RxFunc } from "./rx";
export declare abstract class AbstractService {
    rxList: Rx<(value: any) => any>[];
    constructor();
    newRx<T>(initial?: T): Rx<T>;
    newRxFunc<RR, A extends readonly Rx<(...args: any[]) => any>[]>(cb: (...values: {
        [K in keyof A]: A[K]["value"];
    }) => RR, ...deps: A): RxFunc<RR>;
}
//# sourceMappingURL=service.d.ts.map
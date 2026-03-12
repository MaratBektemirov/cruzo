import { Rx, RxFunc } from "./rx";
export declare abstract class AbstractService {
    rxList: Rx<(value: any) => any>[];
    constructor();
    newRx<T>(initial?: T): Rx<T, [v: T]>;
    newRxFunc<RR, A extends readonly Rx<any>[]>(cb: (...values: {
        [K in keyof A]: A[K]["actual"];
    }) => RR, ...deps: A): RxFunc<RR>;
}
//# sourceMappingURL=service.d.ts.map
import { BucketEvent, ComponentDescriptor } from "./interfaces";
import { Rx } from "./rx";
export declare class RxBucket<A> {
    descriptors: {
        [K in keyof A]: ComponentDescriptor<A[K]>;
    };
    static lastId: number;
    id: number;
    private values;
    private states;
    private rx;
    private _ids;
    constructor(descriptors: {
        [K in keyof A]: ComponentDescriptor<A[K]>;
    });
    private initId;
    getValue(id: keyof A, index?: string): any;
    getState(id: keyof A, index?: string): any;
    getConfigRx(id: keyof A): Record<keyof A, Rx<any, any[]>>[keyof A];
    setValue(id: keyof A, value: any, index?: string, byUser?: boolean): void;
    setState(id: keyof A, value: any, index?: string, byUser?: boolean): void;
    setConfig(id: keyof A, value: any): void;
    setValues(values: Partial<Record<keyof A, {
        [index: string]: any;
    }>>, byUser?: boolean): void;
    setValuesAtIndex<I extends string>(values: Partial<{
        [id in keyof A]: any;
    }>, index?: I, byUser?: boolean): void;
    setStates(states: Partial<Record<keyof A, {
        [index: string]: any;
    }>>, byUser?: boolean): void;
    setStatesAtIndex<I extends string>(states: Partial<{
        [id in keyof A]: any;
    }>, index?: I, byUser?: boolean): void;
    newRxEvent<K extends keyof BucketEventMap, B>(id: keyof A, name: K, fn: (event: BucketEvent<BucketEventMap[K]>, index?: string) => B, rxList: Rx<any>[]): Rx<B, [event: BucketEvent<BucketEventMap[K]>, index?: string]>;
    newRxValue<B>(id: keyof A, fn: (value: any, index?: string, byUser?: boolean) => B, rxList: Rx<any>[], initValue?: any, index?: string): Rx<any, any[]>;
    newRxState<B>(id: keyof A, fn: (value: any, index?: string, byUser?: boolean) => B, rxList: Rx<any>[], initValue?: any, index?: string): Rx<any, any[]>;
    emitEvent<K extends keyof BucketEventMap>(id: keyof A, name: K, event: BucketEvent<BucketEventMap[K]>, index?: string): void;
    private _setValues;
    private _setStates;
    private execRxs;
    static idsArr<D>(descriptors: {
        [K in keyof D]: ComponentDescriptor<D[K]>;
    }): (keyof D)[];
    static wrapAtIndex<A, I extends string>(values: Partial<{
        [id in keyof A]: any;
    }>, index?: I): Partial<{
        [id in keyof A]: Record<I, any>;
    }>;
}
//# sourceMappingURL=rx-bucket.d.ts.map
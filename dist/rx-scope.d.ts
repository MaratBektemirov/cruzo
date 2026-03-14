import { ComponentDescriptor, ScopeEvent } from "./interfaces";
import { Rx } from "./rx";
export declare class RxScope<A> {
    descriptors: {
        [K in keyof A]: ComponentDescriptor<A[K]>;
    };
    static lastId: number;
    id: number;
    private values;
    private rx;
    private _ids;
    constructor(descriptors: {
        [K in keyof A]: ComponentDescriptor<A[K]>;
    });
    private initId;
    addDescriptor(id: keyof A, descriptor: ComponentDescriptor<any>): void;
    removeDescriptor(id: keyof A): void;
    getValue(id: keyof A, index?: string): any;
    setValue(id: keyof A, value: any, index?: string, byUser?: boolean): void;
    setValues(values: Partial<Record<keyof A, {
        [index: string]: any;
    }>>, byUser?: boolean): void;
    setValuesAtIndex<I extends string>(values: Partial<{
        [id in keyof A]: any;
    }>, index?: I, byUser?: boolean): void;
    newRxEvent<K extends keyof ScopeEventMap, B>(id: keyof A, name: K, fn: (event: ScopeEvent<ScopeEventMap[K]>, index: string) => B, rxList: Rx<any>[]): Rx<B>;
    newRxAllValues(fn: (values: Record<keyof A, {
        [index: string]: any;
    }>) => Record<keyof A, {
        [index: string]: any;
    }>): Rx<Record<keyof A, {
        [index: string]: any;
    }>>;
    newRxValue<B>(id: keyof A, fn: (value: any, byUser: boolean, index: string) => B, rxList: Rx<any>[]): Rx<any>;
    emitEvent<K extends keyof ScopeEventMap>(id: keyof A, index: string, name: K, event: ScopeEvent<ScopeEventMap[K]>): void;
    private _set;
    private updateAllValues;
    private execSubs;
    static idsArr<D>(descriptors: {
        [K in keyof D]: ComponentDescriptor<D[K]>;
    }): (keyof D)[];
    static ids<D>(descriptors: {
        [K in keyof D]: ComponentDescriptor<D[K]>;
    }): { [K in keyof D]: keyof D; };
    static wrapAtIndex<A, I extends string>(values: Partial<{
        [id in keyof A]: any;
    }>, index?: I): Partial<{
        [id in keyof A]: Record<I, any>;
    }>;
    ids(): { [K in keyof A]: keyof A; };
    idsArr(): (keyof A)[];
}
//# sourceMappingURL=rx-scope.d.ts.map
import { IHttpClient, ComponentConnectedParams, ComponentsList, ScopeEvent } from "./interfaces";
import { Template } from "./template";
import { Rx, RxFunc } from "./rx";
import { RxScope } from "./rx-scope";
export declare abstract class AbstractComponent<Config = any, ValueType = any> {
    id: string;
    index: string;
    selector: string;
    node: HTMLElement;
    http: {
        [key: string]: IHttpClient;
    };
    config: Config;
    outerScope: RxScope<any>;
    innerScope: RxScope<any>;
    destroyed: boolean;
    protected ac: AbortController;
    protected dependencies: Set<string>;
    connectedDependencies: ComponentsList;
    hasOuterScope: boolean;
    hasConfig: boolean;
    isDirective: boolean;
    template: Template;
    rxList: Rx<any>[];
    value$: Rx<ValueType>;
    value: ValueType;
    protected __tplFile: string;
    constructor();
    disconnectedCallback(): void;
    getScope(): RxScope<any>;
    connectedCallback(params?: ComponentConnectedParams): void;
    setScopeId(id: string): void;
    getScopeId(): string;
    setId(id: string): void;
    getId(): string;
    getIndex(): string;
    private syncId;
    private setIndex;
    private onUpdateValue;
    protected getHTML(): string;
    protected setValue(byUser?: boolean): void;
    protected updateDependencies(): void;
    connectDependency(selector: string): AbstractComponent<any, any>[];
    addDependencies(dependencies: string[]): void;
    protected initTemplate(): void;
    protected domStructureChanged(): void;
    newRx<T>(initial?: T): Rx<T>;
    newRxFunc<RR, A extends readonly Rx<any>[]>(cb: (...values: {
        [K in keyof A]: A[K]["value"];
    }) => RR, ...deps: A): RxFunc<RR>;
    newRxValueFromScope<A>(scope: RxScope<A>, id: keyof A): Rx<any>;
    newRxEventFromScope<A, K extends keyof ScopeEventMap>(scope: RxScope<A>, id: keyof A, name: K): Rx<ScopeEvent<ScopeEventMap[K]>>;
    newRxValueFromScopeByIndex<A>(scope: RxScope<A>, id: keyof A): Rx<any>;
    newRxEventFromScopeByIndex<A, K extends keyof ScopeEventMap>(scope: RxScope<A>, id: keyof A, name: K): Rx<Record<string, ScopeEvent<ScopeEventMap[K]>>>;
}
//# sourceMappingURL=component.d.ts.map
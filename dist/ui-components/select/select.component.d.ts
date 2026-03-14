import { AbstractComponent } from "cruzo";
export interface SelectItem {
    label: string;
    value: any;
}
export interface SelectConfigParams {
    placeholder: string;
    multi?: boolean;
    getItems: (...args: any[]) => Promise<SelectItem[]>;
}
export declare function SelectConfig(params: SelectConfigParams): SelectConfigParams;
export declare class SelectComponent extends AbstractComponent<SelectConfigParams, Record<string, boolean>> {
    static selector: string;
    hasConfig: boolean;
    hasOuterScope: boolean;
    open$: import("../../rx").Rx<boolean>;
    items$: import("../../rx").Rx<SelectItem[]>;
    selectedLabel$: import("../../rx").Rx<string>;
    getItems$: import("../../rx").RxFunc<Promise<void>>;
    constructor();
    connectedCallback(): void;
    getItems(): Promise<void>;
    disconnectedCallback(): void;
    private handleOutsideClick;
    toggle(): void;
    toggleItem(item: SelectItem): void;
    getItemContent(): string;
    getHTML(): string;
}
//# sourceMappingURL=select.component.d.ts.map
import { AbstractComponent } from "../../lib";
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
    hasOuterBucket: boolean;
    open$: import("../../lib").Rx<boolean, [v: boolean]>;
    items$: import("../../lib").Rx<SelectItem[], [v: SelectItem[]]>;
    selectedLabel$: import("../../lib").Rx<string, [v: string]>;
    getItems$: import("../../lib").RxFunc<Promise<void>>;
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
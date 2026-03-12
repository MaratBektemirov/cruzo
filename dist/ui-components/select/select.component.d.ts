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
    hasOuterScope: boolean;
    open$: import("../../lib/rx").Rx<boolean, [v: boolean]>;
    items$: import("../../lib/rx").Rx<SelectItem[], [v: SelectItem[]]>;
    selectedLabel$: import("../../lib/rx").Rx<string, [v: string]>;
    getItems$: import("../../lib/rx").RxFunc<Promise<void>>;
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
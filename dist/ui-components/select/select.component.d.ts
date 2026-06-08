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
    hasOuterBucket: boolean;
    open$: import("cruzo").Rx<boolean, [v: boolean]>;
    items$: import("cruzo").Rx<SelectItem[], [v: SelectItem[]]>;
    selectedLabel$: import("cruzo").Rx<string, [v: string]>;
    private itemsLoadToken;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleOutsideClick;
    toggle(): void;
    toggleItem(item: SelectItem): void;
    getHTML(): string;
}
//# sourceMappingURL=select.component.d.ts.map
import { AbstractComponent } from "cruzo";
interface InputConfigParams {
    label?: string;
    enableContentWidth?: boolean;
    roundValue?: number;
}
export declare function InputConfig(params: InputConfigParams): InputConfigParams;
export declare class InputComponent extends AbstractComponent<InputConfigParams> {
    static selector: string;
    hasConfig: boolean;
    hasOuterScope: boolean;
    tooltipNode: HTMLElement;
    hasFocus: boolean;
    hasMouseEnter: boolean;
    getHTML(): string;
    isCheckbox(): boolean;
    isNumber(): boolean;
    getInput(): HTMLInputElement;
    showTooltipIfOverflow: () => void;
    updateTooltipText(): void;
    updateTooltipCoords: () => void;
    recalc(): void;
    protected setValue(byUser?: boolean): void;
    onEvent(): void;
    onFocus(): void;
    onBlur(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    disconnectedCallback(): void;
}
export {};
//# sourceMappingURL=input.component.d.ts.map
import { AbstractComponent } from "cruzo";
export interface InputConfig {
    type?: "text" | "password" | "email" | "url" | "tel" | "search" | "number";
    maxlength?: number;
    placeholder?: string;
    required?: boolean;
    autocomplete?: string;
    inputmode?: string;
    name?: string;
    id?: string;
}
export declare function InputConfig(params: InputConfig): InputConfig;
export interface InputState {
    cls?: string;
}
export declare class InputComponent extends AbstractComponent<InputConfig, any, InputState> {
    static selector: string;
    hasConfig: boolean;
    hasOuterBucket: boolean;
    tooltipNode: HTMLElement;
    hasFocus: boolean;
    hasMouseEnter: boolean;
    getHTML(): string;
    isNumber(): boolean;
    getInput(): HTMLInputElement;
    recalc(): void;
    updateTooltipText(): void;
    updateTooltipCoords: () => void;
    onEvent(): void;
    onFocus(): void;
    onBlur(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    disconnectedCallback(): void;
    connectedCallback(): void;
}
//# sourceMappingURL=input.component.d.ts.map
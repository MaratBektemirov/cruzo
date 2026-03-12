import { AbstractComponent } from "../../lib";
interface InputConfigParams {
    type?: 'text' | 'password' | 'email' | 'url' | 'tel' | 'search' | 'number';
    maxlength?: number;
    placeholder?: string;
    required?: boolean;
    autocomplete?: string;
    inputmode?: string;
}
export declare function InputConfig(params: InputConfigParams): InputConfigParams;
interface InputConfigState {
    required: boolean;
    placeholder: string;
    cls: string;
    maxlength: number;
    autocomplete: string;
    inputmode: string;
}
export declare class InputComponent extends AbstractComponent<InputConfigParams, any, InputConfigState> {
    static selector: string;
    hasConfig: boolean;
    hasOuterScope: boolean;
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
export {};
//# sourceMappingURL=input.component.d.ts.map
import { AbstractComponent } from "../../lib";
export declare enum SpinnerValue {
    "inactive" = "inactive",
    "active" = "active"
}
export interface SpinnerConfigParams {
    color?: string;
    size?: string;
}
export declare function SpinnerConfig(params: SpinnerConfigParams): SpinnerConfigParams;
export declare class SpinnerComponent extends AbstractComponent<SpinnerConfigParams, SpinnerValue> {
    static selector: string;
    hasConfig: boolean;
    hasOuterBucket: boolean;
    isDirective: boolean;
    private contentNode;
    private hostPositionWasPatched;
    private hostPrevPosition;
    getSpinnerStyle(): string;
    getHTML(): string;
    connectedCallback(): void;
    getCls(value: SpinnerValue): string;
    private syncContentFromState;
    private ensureContent;
    private ensureHostPositionForOverlay;
    private destroyContent;
    protected setValue(byUser?: boolean): void;
    disconnectedCallback(): void;
}
//# sourceMappingURL=spinner.component.d.ts.map
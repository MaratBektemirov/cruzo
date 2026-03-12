import { AbstractComponent } from "../../lib";
interface ButtonGroupConfigParams {
    items: Array<{
        label: string;
        value: string;
    }>;
}
export declare function ButtonGroupConfig(params: ButtonGroupConfigParams): ButtonGroupConfigParams;
export declare class ButtonGroupComponent extends AbstractComponent<ButtonGroupConfigParams> {
    static selector: string;
    hasConfig: boolean;
    hasOuterScope: boolean;
    getHTML(): string;
    select(value: string): void;
}
export {};
//# sourceMappingURL=button-group.component.d.ts.map
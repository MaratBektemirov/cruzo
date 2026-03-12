import { AbstractComponent } from "../../lib";
declare global {
    interface ScopeEventMap {
        closeModal: {
            isOK: boolean;
        };
    }
}
interface ModalConfigParams {
    bodyContent: string;
    dependencies?: Set<string>;
}
export declare function ModalConfig(params: ModalConfigParams): ModalConfigParams;
export declare class ModalComponent extends AbstractComponent<ModalConfigParams> {
    static selector: string;
    hasOuterScope: boolean;
    hasConfig: boolean;
    getCloseRx: () => import("../../lib/rx").Rx<Record<string, import("../../lib").ScopeEvent<{
        isOK: boolean;
    }>>, [event: import("../../lib").ScopeEvent<{
        isOK: boolean;
    }>, index?: string]>;
    closeEvents$: ReturnType<typeof this.getCloseRx>;
    getHTML(): string;
    constructor();
    static attach(componentId: string, scopeId: number | string): void;
    closeModal(isOK: boolean): void;
    destroyModal(): void;
    connectedCallback(): void;
}
export {};
//# sourceMappingURL=modal.component.d.ts.map
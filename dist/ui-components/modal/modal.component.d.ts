import { AbstractComponent } from "../../lib";
declare global {
    interface BucketEventMap {
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
    hasOuterBucket: boolean;
    hasConfig: boolean;
    getCloseRx: () => import("../../lib").Rx<Record<string, import("../../lib").BucketEvent<{
        isOK: boolean;
    }>>, [event: import("../../lib").BucketEvent<{
        isOK: boolean;
    }>, index?: string]>;
    closeEvents$: ReturnType<typeof this.getCloseRx>;
    getHTML(): string;
    constructor();
    static attach(componentId: string, bucketId: number | string): void;
    closeModal(isOK: boolean): void;
    destroyModal(): void;
    connectedCallback(): void;
}
export {};
//# sourceMappingURL=modal.component.d.ts.map
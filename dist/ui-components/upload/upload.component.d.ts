import { AbstractComponent, type Rx } from "cruzo";
interface UploadConfigParams {
    accept: string;
}
export declare function UploadConfig(params: UploadConfigParams): UploadConfigParams;
export declare class UploadComponent extends AbstractComponent<UploadConfigParams> {
    static selector: string;
    hasOuterScope: boolean;
    hasConfig: boolean;
    reset$: Rx<any>;
    constructor();
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    getHTML(): string;
    upload: (event: Event) => void;
}
export {};
//# sourceMappingURL=upload.component.d.ts.map
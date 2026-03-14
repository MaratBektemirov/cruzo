import { Bytecode } from "./vm";
import { Rx } from "./rx";
declare enum CONTEXT_TYPE {
    REPEAT = 1,
    EVENT = 2,
    TEXT_NODE = 3,
    ATTRIBUTE = 4,
    ATTACHED = 5,
    LEXICAL_ENV = 6,
    INNER_HTML = 7
}
type SelfFunction = (...args: any[]) => any;
interface TemplateDebug {
    selector?: string;
    __tplFile?: string;
}
interface TemplateParams extends TemplateDebug {
    node: HTMLElement;
    self?: SelfFunction;
    parent?: Template;
    root?: Template;
    cloneIndex?: number;
    domStructureChanged?: (...args: any[]) => any;
    rxAccIsFillingLocally?: boolean;
}
export type ChangeAttrEvent = CustomEvent<{
    name: string;
    prev: string;
    next: string;
}>;
declare global {
    interface HTMLElementEventMap {
        onchangeattr: ChangeAttrEvent;
    }
}
export declare class Template {
    private root;
    private debug;
    private area;
    private areas;
    private parent;
    private self;
    private rxAccIsFillingLocally;
    private lexicalEnv;
    private selector;
    private children;
    private clones;
    private rxAcc;
    private rxAccIsFilling;
    private pointer;
    private cloneIndex;
    private parentNode;
    private attached;
    private detecting;
    private repeatBC;
    private attachedBC;
    private nodeByIndex;
    private nodeValueByIndex;
    private attrValueByIndex;
    private innerHTMLValue;
    private events;
    private onRxUpdate;
    private rxUpdated;
    private rxUpdatedScheduled;
    private domStructureChanged;
    private domChangedScheduled;
    onceMap: Map<Bytecode, any | any[]>;
    node: HTMLElement;
    static appVariables: any;
    static getChangeAttrEvent(name: string, prev: string, next: string): ChangeAttrEvent;
    static allowAttributeEvent(element: HTMLElement, attrsSet: Set<string>): void;
    static stringToNode(str: string): HTMLElement;
    static setAppVariables(appVariables: any): void;
    detectChanges(): void;
    private internalDetectChanges;
    completelyClearRxAcc(): void;
    clearRxAccLocally(): void;
    fullDestroy(): void;
    private destroyAllClones;
    private locallyDestroyAllChildren;
    private destroyLastClone;
    private locallyDestroy;
    private attach;
    private detach;
    private static kebabToCamel;
    private execRepeatExpr;
    private rebuildClones;
    private updateAttributes;
    private updateVars;
    private removeEvents;
    private setEvents;
    private handleAttachedAttr;
    private updateRepeat;
    private reactiveUpdateAttachedAttr;
    private reactiveUpdateLexicalEnv;
    private reactiveUpdateRepeat;
    private reactiveUpdateNode;
    private reactiveUpdateAttr;
    private reactiveUpdateInnerHtml;
    private updateTextNode;
    private updateAttr;
    private updateInnerHtml;
    private updateVar;
    private updateAllTextNodes;
    private updateAllClones;
    private updateAllChildren;
    private isTemplate;
    private getQuoteMap;
    private getTemplateArray;
    private getItem;
    private execTemplateArray;
    private childNodeIsDynamic;
    private addClone;
    private addChildren;
    private areaFactory;
    private createAreas;
    private hasBindingAttributes;
    private isBindingHandler;
    private hasTemplateTextChild;
    private handleChildrens;
    private resetDetectingUpTree;
    private handleError;
    private getVMProgram;
    private linkRxToTemplate;
    getRxValue(ctx: CONTEXT_TYPE, rx: Rx<any>, linkIndex: number, rxAccIsFilling: boolean, onceMod: boolean): any;
    getVarFromLexicalEnv(name: string): any;
    private getThisArg;
    private runVMProgramForContext;
    private handleAttributesFilledArea;
    private handleAttributes;
    private markDomStructureChanged;
    private getRxUpdate;
    constructor(params: TemplateParams);
    private insertFragmentAfter;
    private removePointer;
    private getPointer;
    private setPointer;
}
export {};
//# sourceMappingURL=template.d.ts.map
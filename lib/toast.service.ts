import { AbstractService } from "./service";
import { Template } from "./template";
import { componentsRegistryService } from "./components-registry.service";
import type {
  ToastAlignX,
  ToastAlignY,
  ToastItem,
  ToastKind,
  ToastShowParams,
} from "./types/toast-types";

class ToastService extends AbstractService {
  public toasts$ = this.newRx<ToastItem[]>([]);

  private idSeq = 0;
  private timeouts = new Map<string, number>();

  show(params: ToastShowParams) {
    this.ensureHost();

    const kind: ToastKind = params.kind ?? "info";
    const timeoutMs = params.timeoutMs ?? 3500;

    const alignXParam: ToastAlignX | undefined = params.alignX;
    const alignYParam: ToastAlignY | undefined = params.alignY;

    const anchor =
      params.anchor ??
      this.getAnchorFromElement(params.element, alignXParam, alignYParam) ??
      this.getAnchorFromViewport(alignXParam, alignYParam);

    const alignX: ToastAlignX = alignXParam ?? "center";
    const alignY: ToastAlignY = alignYParam ?? "center";

    const toast: ToastItem = {
      id: String(++this.idSeq),
      title: params.title,
      message: params.message,
      kind,
      createdAt: Date.now(),
      anchorX: anchor?.x,
      anchorY: anchor?.y,
      alignX,
      alignY,
      element: params.element ?? null,
    };

    this.toasts$.update([...(this.toasts$.actual ?? []), toast]);

    if (timeoutMs > 0) {
      const timerId = window.setTimeout(() => {
        this.timeouts.delete(toast.id);
        this.dismiss(toast.id);
      }, timeoutMs);
      this.timeouts.set(toast.id, timerId);
    }

    return toast.id;
  }

  dismiss(id: string) {
    const timerId = this.timeouts.get(id);
    if (timerId != null) {
      window.clearTimeout(timerId);
      this.timeouts.delete(id);
    }

    const next = (this.toasts$.actual ?? []).filter((t) => t.id !== id);
    if (next.length === (this.toasts$.actual ?? []).length) return;
    this.toasts$.update(next);
  }

  clear() {
    for (const timerId of this.timeouts.values()) {
      window.clearTimeout(timerId);
    }
    this.timeouts.clear();
    this.toasts$.update([]);
  }

  private getAnchorFromElement(
    element: Element | null | undefined,
    alignX: ToastAlignX | undefined,
    alignY: ToastAlignY | undefined,
  ): { x: number; y: number } | null {
    if (!element) return null;
    if (typeof (element as any).getBoundingClientRect !== "function") return null;

    const rect = element.getBoundingClientRect();

    const ax = alignX ?? "center";
    const ay = alignY ?? "center";

    const x = ax === "left" ? rect.left : ax === "right" ? rect.right : rect.left + rect.width / 2;
    const y = ay === "top" ? rect.top : ay === "bottom" ? rect.bottom : rect.top + rect.height / 2;

    return { x, y };
  }

  private getAnchorFromViewport(
    alignX: ToastAlignX | undefined,
    alignY: ToastAlignY | undefined,
  ): { x: number; y: number } | null {
    const m = 16;

    const ax = alignX ?? "center";
    const ay = alignY ?? "center";

    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;

    const x = ax === "left" ? m : ax === "right" ? Math.max(m, vw - m) : vw / 2;
    const y = ay === "top" ? m : ay === "bottom" ? Math.max(m, vh - m) : vh / 2;

    return { x, y };
  }

  private ensureHost() {
    if (typeof document === "undefined") return;
    const selector = "toast-component";
    if (document.querySelector(selector)) return;

    const node = Template.stringToNode(
      `<${selector}></${selector}>`,
    );
    document.body.appendChild(node);
    componentsRegistryService.connectBySelector(
      selector,
      componentsRegistryService.componentsRoot,
      document.body,
    );
  }
}

export const toastService = new ToastService();

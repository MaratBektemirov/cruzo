import { AbstractComponent, componentsRegistryService } from "cruzo";
import { UI_KIT } from "../const";
import { toastService, type ToastAlignX, type ToastAlignY, type ToastItem } from "cruzo";

const TOAST_TX: Record<ToastAlignX, string> = {
  left: "0%",
  center: "-50%",
  right: "-100%",
};

const TOAST_TY: Record<ToastAlignY, string> = {
  top: "0%",
  center: "-50%",
  bottom: "-100%",
};

function sameToastAnchor(a: ToastItem, b: ToastItem): boolean {
  if (a.element || b.element) {
    return a.element === b.element;
  }

  return (
    a.anchorX === b.anchorX &&
    a.anchorY === b.anchorY &&
    a.alignX === b.alignX &&
    a.alignY === b.alignY
  );
}

export class ToastComponent extends AbstractComponent {
  static selector = "toast-component";

  toasts$ = toastService.toasts$;
  tick$ = this.newRx(0);

  getHTML() {
    return `<div class="${UI_KIT}_toast-host" attached="{{root.toasts$::rx && root.toasts$::rx.length}}">
        <div
          repeat="{{root.toasts$::rx}}"
          class="${UI_KIT}_toast ${UI_KIT}_toast-{{this.kind}}"
          style="{{root.getStyle(this, root.tick$::rx)}}"
          role="status"
          aria-live="polite"
          onclick="{{root.dismiss(this)}}"
          >
          <div class="${UI_KIT}_toast-content">
            <div class="${UI_KIT}_toast-title" attached="{{this.title}}">{{this.title}}</div>
            <div class="${UI_KIT}_toast-message">{{this.message}}</div>
          </div>
          <button type="button" class="${UI_KIT}_toast-close" aria-label="Close">×</button>
        </div>
      </div>`;
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener("scroll", this.onViewportChanged, true);
    window.addEventListener("resize", this.onViewportChanged, { passive: true });
  }

  disconnectedCallback(removeFromDom = false) {
    window.removeEventListener("scroll", this.onViewportChanged, true);
    window.removeEventListener("resize", this.onViewportChanged);
    super.disconnectedCallback(removeFromDom);
  }

  private onViewportChanged = () => {
    this.tick$.update((this.tick$.actual ?? 0) + 1);
  };

  getStyle(toast: ToastItem, _tick: number) {
    const alignX = toast.alignX ?? "center";
    const alignY = toast.alignY ?? "center";

    let x = toast.anchorX;
    let y = toast.anchorY;

    const rect = toast.element?.getBoundingClientRect?.();
    if (rect) {
      x = { left: rect.left, center: rect.left + rect.width / 2, right: rect.right }[alignX];
      y = { top: rect.top, center: rect.top + rect.height / 2, bottom: rect.bottom }[alignY];
    }

    if (x == null || y == null) return "";

    const idx = Math.max(
      0,
      (toastService.toasts$.actual ?? [])
        .filter((t) => (t.element || (t.anchorX != null && t.anchorY != null)) && sameToastAnchor(t, toast))
        .findIndex((t) => t.id === toast.id),
    );

    const tx = TOAST_TX[alignX];
    const ty = TOAST_TY[alignY];
    const offset = idx * 58 * (alignY === "bottom" ? -1 : 1);

    return `position:fixed;left:${Math.round(x)}px;top:${Math.round(y + (alignY === "bottom" ? -10 : 10))}px;transform:translate3d(${tx}, ${ty}, 0) translate3d(0, ${offset}px, 0);z-index:10000;`;
  }

  dismiss(toast: ToastItem) {
    toastService.dismiss(toast.id);
  }
}

componentsRegistryService.define(ToastComponent);

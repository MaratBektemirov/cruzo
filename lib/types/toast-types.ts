// Keep in sync with ui-components/toast/types.ts

export type ToastKind = "info" | "success" | "error";

export type ToastAlignX = "left" | "center" | "right";
export type ToastAlignY = "top" | "center" | "bottom";

export interface ToastShowParams {
  title?: string;
  message: string;
  kind?: ToastKind;
  timeoutMs?: number;
  element?: Element | null;
  anchor?: { x: number; y: number };
  alignX?: ToastAlignX;
  alignY?: ToastAlignY;
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  kind: ToastKind;
  createdAt: number;
  anchorX?: number;
  anchorY?: number;
  alignX?: ToastAlignX;
  alignY?: ToastAlignY;
  element?: Element | null;
}

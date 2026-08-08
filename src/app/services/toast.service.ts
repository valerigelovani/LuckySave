import { Injectable, signal } from '@angular/core';
import { createId } from '../core/utils/id.util';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);
  readonly all = this.toasts.asReadonly();

  show(type: ToastType, title: string, message?: string, durationMs = 4200): void {
    const toast: Toast = { id: createId('toast'), type, title, message };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  warning(title: string, message?: string): void {
    this.show('warning', title, message);
  }

  error(title: string, message?: string): void {
    this.show('error', title, message);
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';

const ICONS: Record<string, string> = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  private toastService = inject(ToastService);
  toasts = this.toastService.all;

  iconFor(type: string): string {
    return ICONS[type] ?? 'info';
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}

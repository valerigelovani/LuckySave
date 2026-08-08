import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './notification-banner.html',
  styleUrl: './notification-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBanner {
  @Input() variant: 'info' | 'warning' | 'success' | 'danger' = 'info';
  @Input() icon = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() dismissible = false;
  @Output() action = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();
}

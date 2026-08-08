import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TimelineVariant = 'primary' | 'mint' | 'gold' | 'coral' | 'neutral' | 'info';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './timeline-item.html',
  styleUrl: './timeline-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineItem {
  @Input() icon = 'circle';
  @Input() variant: TimelineVariant = 'neutral';
  @Input() title = '';
  @Input() description = '';
  @Input() meta = '';
  @Input() amountLabel = '';
  @Input() isLast = false;
}

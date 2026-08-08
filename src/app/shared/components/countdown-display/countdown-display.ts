import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { daysUntil, formatDate } from '../../../core/utils/date.util';

@Component({
  selector: 'app-countdown-display',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './countdown-display.html',
  styleUrl: './countdown-display.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownDisplay {
  @Input() targetDate = '';
  @Input() label = 'Next draw';

  get days(): number {
    return daysUntil(this.targetDate);
  }

  get dateLabel(): string {
    return formatDate(this.targetDate);
  }

  get daysText(): string {
    const d = this.days;
    if (d <= 0) return 'Today';
    if (d === 1) return '1 day';
    return `${d} days`;
  }
}

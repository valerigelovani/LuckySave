import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { daysUntil } from '../../../core/utils/date.util';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-countdown-display',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './countdown-display.html',
  styleUrl: './countdown-display.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownDisplay {
  private i18n = inject(I18nService);

  @Input() targetDate = '';
  @Input() label = '';

  get days(): number {
    return daysUntil(this.targetDate);
  }

  get dateLabel(): string {
    return this.i18n.formatDate(this.targetDate);
  }

  get daysText(): string {
    const d = this.days;
    if (d <= 0) return this.i18n.t('countdown.today');
    if (d === 1) return this.i18n.t('countdown.oneDay');
    return this.i18n.t('countdown.days', { count: d });
  }
}

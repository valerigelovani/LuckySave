import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCard {
  @Input() icon = 'insights';
  @Input() label = '';
  @Input() value = '';
  @Input() sub = '';
  @Input() accent: 'primary' | 'mint' | 'gold' | 'neutral' | 'coral' = 'primary';
}

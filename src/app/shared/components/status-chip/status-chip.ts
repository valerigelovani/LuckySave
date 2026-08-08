import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChipVariant } from '../../helpers/status.util';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './status-chip.html',
  styleUrl: './status-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChip {
  @Input() variant: ChipVariant = 'neutral';
  @Input() label = '';
  @Input() icon = '';
  @Input() size: 'sm' | 'md' = 'md';
}

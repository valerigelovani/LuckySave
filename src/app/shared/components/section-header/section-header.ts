import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-member-avatar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './member-avatar.html',
  styleUrl: './member-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberAvatar {
  @Input() initials = '';
  @Input() color = '#5B4FE9';
  @Input() size = 44;
  @Input() ring = false;
  @Input() badge: 'winner' | 'you' | null = null;
}

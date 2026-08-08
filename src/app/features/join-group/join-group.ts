import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Group } from '../../core/models';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { GroupService } from '../../services/group.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-join-group-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, MemberAvatar, EmptyState, TranslatePipe],
  templateUrl: './join-group.html',
  styleUrl: './join-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinGroupPage {
  private groupService = inject(GroupService);
  private router = inject(Router);
  i18n = inject(I18nService);

  joinableGroups = this.groupService.joinableGroups;

  seatsRemaining(group: Group): number {
    return this.groupService.seatsRemaining(group);
  }

  estimatedPot(group: Group): number {
    return this.groupService.estimatedPot(group);
  }

  fillRatio(group: Group): number {
    return group.totalMembers === 0 ? 0 : Math.round((group.members.length / group.totalMembers) * 100);
  }

  join(group: Group): void {
    if (this.seatsRemaining(group) <= 0) return;
    this.groupService.joinGroup(group.id);
    this.router.navigate(['/dashboard']);
  }
}

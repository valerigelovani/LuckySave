import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Group } from '../../core/models';
import { formatCurrency } from '../../core/utils/currency.util';
import { formatDate } from '../../core/utils/date.util';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-join-group-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, MemberAvatar, EmptyState],
  templateUrl: './join-group.html',
  styleUrl: './join-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinGroupPage {
  private groupService = inject(GroupService);
  private router = inject(Router);

  joinableGroups = this.groupService.joinableGroups;

  formatCurrency = formatCurrency;
  formatDate = formatDate;

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

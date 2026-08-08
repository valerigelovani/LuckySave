import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Group, GroupMember } from '../../core/models';
import { groupStatusChip } from '../../shared/helpers/status.util';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SummaryCard } from '../../shared/components/summary-card/summary-card';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { GroupService } from '../../services/group.service';
import { StoreService } from '../../services/store.service';
import { I18nService } from '../../services/i18n.service';

interface GroupParticipation {
  group: Group;
  member: GroupMember;
  contributed: number;
  won: number;
  paymentsMade: number;
  drawsParticipated: number;
  loanBalance: number;
  position: number;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, SectionHeader, SummaryCard, StatusChip, MemberAvatar, EmptyState, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private groupService = inject(GroupService);
  private store = inject(StoreService);
  private router = inject(Router);
  i18n = inject(I18nService);

  currentUser = this.store.currentUser;
  myGroups = this.groupService.myGroups;

  participation = computed<GroupParticipation[]>(() =>
    this.myGroups()
      .map((group) => {
        const member = this.groupService.currentUserMember(group);
        if (!member) return null;

        const won = group.draws
          .filter((d) => d.winnerId === member.id)
          .reduce((sum, d) => sum + d.prizeAmount, 0);

        const paymentsMade = group.payments.filter(
          (p) => p.memberId === member.id && (p.status === 'paid' || p.status === 'covered'),
        ).length;

        const loanBalance = group.loans
          .filter((l) => l.memberId === member.id && l.status === 'outstanding')
          .reduce((sum, l) => sum + l.remainingBalance, 0);

        const sortedMembers = [...group.members].sort(
          (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
        );
        const position = sortedMembers.findIndex((m) => m.id === member.id) + 1;

        const entry: GroupParticipation = {
          group,
          member,
          contributed: member.totalContributed,
          won,
          paymentsMade,
          drawsParticipated: group.draws.length,
          loanBalance,
          position,
        };
        return entry;
      })
      .filter((entry): entry is GroupParticipation => entry !== null),
  );

  totalContributed = computed(() => this.participation().reduce((sum, p) => sum + p.contributed, 0));
  totalWon = computed(() => this.participation().reduce((sum, p) => sum + p.won, 0));
  totalPayments = computed(() => this.participation().reduce((sum, p) => sum + p.paymentsMade, 0));
  totalDraws = computed(() => this.participation().reduce((sum, p) => sum + p.drawsParticipated, 0));
  totalLoanBalance = computed(() => this.participation().reduce((sum, p) => sum + p.loanBalance, 0));
  activeGroupsCount = computed(() => this.participation().filter((p) => p.group.status === 'active').length);

  groupStatusChip = groupStatusChip;

  switchGroup(groupId: string): void {
    this.groupService.setActiveGroup(groupId);
    this.router.navigate(['/dashboard']);
  }
}

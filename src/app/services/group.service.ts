import { Injectable, computed, inject } from '@angular/core';
import { Group, GroupMember, HistoryItem } from '../core/models';
import { addDays } from '../core/utils/date.util';
import { createId } from '../core/utils/id.util';
import { shuffle } from '../core/utils/shuffle.util';
import { CURRENT_USER_ID } from '../core/constants/app.constants';
import { StoreService } from './store.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

export interface CreateGroupPayload {
  name: string;
  description?: string;
  monthlyContribution: number;
  totalMembers: number;
  durationMonths: number;
  isPrivate: boolean;
  autoRandomDraw: boolean;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private store = inject(StoreService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  readonly groups = this.store.groups;
  readonly myGroups = this.store.myGroups;
  readonly activeGroup = this.store.activeGroup;

  readonly joinableGroups = computed(() =>
    this.groups().filter(
      (g) => g.status === 'forming' && !g.members.some((m) => m.userId === CURRENT_USER_ID),
    ),
  );

  setActiveGroup(groupId: string): void {
    this.store.setActiveGroup(groupId);
  }

  eligibleMembers(group: Group): GroupMember[] {
    return group.members.filter((m) => m.isEligible);
  }

  seatsRemaining(group: Group): number {
    return Math.max(0, group.totalMembers - group.members.length);
  }

  estimatedPot(group: Group): number {
    return group.monthlyContribution * group.totalMembers;
  }

  progressRatio(group: Group): number {
    if (group.durationMonths === 0) return 0;
    const completed = group.draws.length;
    return Math.min(1, completed / group.durationMonths);
  }

  paidThisMonthCount(group: Group): number {
    return group.payments.filter((p) => p.month === group.currentMonth && (p.status === 'paid' || p.status === 'covered')).length;
  }

  currentUserMember(group: Group): GroupMember | undefined {
    return group.members.find((m) => m.userId === CURRENT_USER_ID);
  }

  scheduledMemberId(group: Group, month: number): string | undefined {
    return group.payoutOrder[month - 1];
  }

  scheduledMonthForMember(group: Group, memberId: string): number | undefined {
    const index = group.payoutOrder.indexOf(memberId);
    return index === -1 ? undefined : index + 1;
  }

  createGroup(payload: CreateGroupPayload): Group {
    const groupId = createId('grp');
    const user = this.store.currentUser();

    const founder: GroupMember = {
      id: createId('mem'),
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      avatarInitials: user.avatarInitials,
      joinedAt: new Date().toISOString(),
      hasWon: false,
      isEligible: true,
      currentPaymentStatus: 'pending',
      totalContributed: 0,
      isCurrentUser: true,
    };

    const history: HistoryItem[] = [
      {
        id: createId('hist'),
        groupId,
        type: 'group_created',
        month: 0,
        titleKey: 'event.groupCreated.title',
        titleParams: { name: payload.name },
        descriptionKey: 'event.groupCreated.desc',
        descriptionParams: { user: user.name },
        timestamp: new Date().toISOString(),
      },
      {
        id: createId('hist'),
        groupId,
        type: 'member_joined',
        month: 0,
        titleKey: 'event.memberJoined.title',
        titleParams: { name: user.name },
        descriptionKey: 'event.memberJoined.desc',
        descriptionParams: { name: user.name, group: payload.name },
        timestamp: new Date().toISOString(),
      },
    ];

    const status: Group['status'] = payload.totalMembers <= 1 ? 'active' : 'forming';

    const group: Group = {
      id: groupId,
      name: payload.name,
      description: payload.description,
      monthlyContribution: payload.monthlyContribution,
      totalMembers: payload.totalMembers,
      durationMonths: payload.durationMonths,
      isPrivate: payload.isPrivate,
      autoRandomDraw: payload.autoRandomDraw,
      status,
      currentMonth: 1,
      createdAt: new Date().toISOString(),
      nextDrawDate: addDays(new Date(), 30).toISOString(),
      members: [founder],
      payments: [],
      draws: [],
      loans: [],
      history,
      payoutOrder: status === 'active' ? [founder.id] : [],
    };

    this.store.addGroup(group);
    this.store.setActiveGroup(groupId);
    this.toast.success(
      this.i18n.t('toast.groupCreatedTitle'),
      this.i18n.t('toast.groupCreatedMessage', { name: payload.name }),
    );
    return group;
  }

  joinGroup(groupId: string): void {
    const group = this.store.getGroup(groupId);
    if (!group) return;

    if (this.seatsRemaining(group) <= 0) {
      this.toast.error(this.i18n.t('toast.groupFullTitle'), this.i18n.t('toast.groupFullMessage'));
      return;
    }

    if (group.members.some((m) => m.userId === CURRENT_USER_ID)) {
      this.toast.info(this.i18n.t('toast.alreadyJoinedTitle'), this.i18n.t('toast.alreadyJoinedMessage'));
      return;
    }

    const user = this.store.currentUser();
    const newMember: GroupMember = {
      id: createId('mem'),
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      avatarInitials: user.avatarInitials,
      joinedAt: new Date().toISOString(),
      hasWon: false,
      isEligible: true,
      currentPaymentStatus: 'pending',
      totalContributed: 0,
      isCurrentUser: true,
    };

    this.store.updateGroup(groupId, (g) => {
      const members = [...g.members, newMember];
      const willBeFull = members.length >= g.totalMembers;
      const historyEntry: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'member_joined',
        month: g.currentMonth,
        titleKey: 'event.memberJoined.title',
        titleParams: { name: user.name },
        descriptionKey: 'event.memberJoined.desc',
        descriptionParams: { name: user.name, group: g.name },
        timestamp: new Date().toISOString(),
      };
      return {
        ...g,
        members,
        status: willBeFull ? 'active' : g.status,
        payoutOrder: willBeFull ? shuffle(members.map((m) => m.id)) : g.payoutOrder,
        history: [historyEntry, ...g.history],
      };
    });

    this.store.setActiveGroup(groupId);
    this.toast.success(
      this.i18n.t('toast.welcomeAboardTitle'),
      this.i18n.t('toast.welcomeAboardMessage', { name: group.name }),
    );
  }
}

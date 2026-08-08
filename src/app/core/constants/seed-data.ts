import {
  AppState,
  DrawResult,
  Group,
  GroupMember,
  HistoryEventParams,
  HistoryItem,
  Loan,
  Payment,
} from '../models';
import { getInitials, pickAvatarColor } from '../utils/avatar.util';
import { addDays } from '../utils/date.util';
import { createId } from '../utils/id.util';
import { CURRENT_USER_ID, CURRENT_USER_NAME } from './app.constants';

function member(
  name: string,
  opts: Partial<GroupMember> & { joinedDaysAgo: number },
): GroupMember {
  return {
    id: createId('mem'),
    userId: name === CURRENT_USER_NAME ? CURRENT_USER_ID : createId('user'),
    name,
    avatarColor: pickAvatarColor(name),
    avatarInitials: getInitials(name),
    joinedAt: addDays(new Date(), -opts.joinedDaysAgo).toISOString(),
    hasWon: false,
    isEligible: true,
    currentPaymentStatus: 'pending',
    totalContributed: 0,
    ...opts,
  };
}

function payment(
  groupId: string,
  memberId: string,
  month: number,
  amount: number,
  status: Payment['status'],
  dueInDays: number,
  paidDaysAgo?: number,
): Payment {
  return {
    id: createId('pay'),
    groupId,
    memberId,
    month,
    amount,
    status,
    dueDate: addDays(new Date(), dueInDays).toISOString(),
    paidAt: paidDaysAgo !== undefined ? addDays(new Date(), -paidDaysAgo).toISOString() : undefined,
  };
}

function draw(
  groupId: string,
  month: number,
  winner: GroupMember,
  prizeAmount: number,
  eligibleMemberIds: string[],
  daysAgo: number,
): DrawResult {
  return {
    id: createId('draw'),
    groupId,
    month,
    winnerId: winner.id,
    winnerName: winner.name,
    winnerInitials: winner.avatarInitials,
    winnerColor: winner.avatarColor,
    prizeAmount,
    eligibleMemberIds,
    drawDate: addDays(new Date(), -daysAgo).toISOString(),
  };
}

function loan(
  groupId: string,
  member: GroupMember,
  month: number,
  amount: number,
  status: Loan['status'],
  createdDaysAgo: number,
  repaidDaysAgo?: number,
): Loan {
  return {
    id: createId('loan'),
    groupId,
    memberId: member.id,
    memberName: member.name,
    month,
    amount,
    remainingBalance: status === 'repaid' ? 0 : amount,
    status,
    createdAt: addDays(new Date(), -createdDaysAgo).toISOString(),
    repaidAt: repaidDaysAgo !== undefined ? addDays(new Date(), -repaidDaysAgo).toISOString() : undefined,
  };
}

function historyItem(
  groupId: string,
  type: HistoryItem['type'],
  month: number,
  titleKey: string,
  titleParams: HistoryEventParams | undefined,
  descriptionKey: string,
  descriptionParams: HistoryEventParams | undefined,
  daysAgo: number,
  amount?: number,
): HistoryItem {
  return {
    id: createId('hist'),
    groupId,
    type,
    month,
    titleKey,
    titleParams,
    descriptionKey,
    descriptionParams,
    timestamp: addDays(new Date(), -daysAgo).toISOString(),
    amount,
  };
}

function sortHistory(items: HistoryItem[]): HistoryItem[] {
  return [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function buildFamilyCircle(): Group {
  const groupId = 'grp-family-circle';
  const contribution = 200;
  const totalMembers = 6;
  const groupName = 'ოჯახის წრე';

  const priya = member('Priya Sharma', { joinedDaysAgo: 70, hasWon: true, wonMonth: 1, isEligible: false, currentPaymentStatus: 'paid', totalContributed: 600 });
  const james = member('James Wilson', { joinedDaysAgo: 70, hasWon: true, wonMonth: 2, isEligible: false, currentPaymentStatus: 'paid', totalContributed: 600 });
  const luka = member(CURRENT_USER_NAME, { joinedDaysAgo: 70, isCurrentUser: true, currentPaymentStatus: 'pending', totalContributed: 400 });
  const sara = member('Sara Kim', { joinedDaysAgo: 70, currentPaymentStatus: 'paid', totalContributed: 600 });
  const diego = member('Diego Fernandez', { joinedDaysAgo: 70, currentPaymentStatus: 'paid', totalContributed: 400 });
  const emma = member('Emma Novak', { joinedDaysAgo: 70, currentPaymentStatus: 'paid', totalContributed: 600 });

  const members = [priya, james, luka, sara, diego, emma];

  const payments: Payment[] = [
    payment(groupId, priya.id, 1, contribution, 'paid', -42, 41),
    payment(groupId, james.id, 1, contribution, 'paid', -42, 40),
    payment(groupId, luka.id, 1, contribution, 'paid', -42, 39),
    payment(groupId, sara.id, 1, contribution, 'paid', -42, 41),
    payment(groupId, diego.id, 1, contribution, 'paid', -42, 38),
    payment(groupId, emma.id, 1, contribution, 'paid', -42, 40),

    payment(groupId, priya.id, 2, contribution, 'paid', -12, 12),
    payment(groupId, james.id, 2, contribution, 'paid', -12, 11),
    payment(groupId, luka.id, 2, contribution, 'paid', -12, 10),
    payment(groupId, sara.id, 2, contribution, 'paid', -12, 12),
    payment(groupId, diego.id, 2, contribution, 'covered', -12, undefined),
    payment(groupId, emma.id, 2, contribution, 'paid', -12, 11),

    payment(groupId, priya.id, 3, contribution, 'paid', 3, 2),
    payment(groupId, james.id, 3, contribution, 'paid', 3, 1),
    payment(groupId, luka.id, 3, contribution, 'pending', 3, undefined),
    payment(groupId, sara.id, 3, contribution, 'paid', 3, 2),
    payment(groupId, diego.id, 3, contribution, 'paid', 3, 1),
    payment(groupId, emma.id, 3, contribution, 'paid', 3, 3),
  ];

  const draws: DrawResult[] = [
    draw(groupId, 1, priya, contribution * totalMembers, [priya.id, james.id, luka.id, sara.id, diego.id, emma.id], 41),
    draw(groupId, 2, james, contribution * totalMembers, [james.id, luka.id, sara.id, diego.id, emma.id], 11),
  ];

  const loans: Loan[] = [loan(groupId, diego, 2, contribution, 'outstanding', 11)];

  const history = sortHistory([
    historyItem(groupId, 'group_created', 0, 'event.groupCreated.title', { name: groupName }, 'event.groupCreated.desc', { user: luka.name }, 70),
    ...members.map((m) => historyItem(groupId, 'member_joined', 0, 'event.memberJoined.title', { name: m.name }, 'event.memberJoined.desc', { name: m.name, group: groupName }, 70)),
    ...payments.filter((p) => p.status === 'paid').map((p) => {
      const m = members.find((mm) => mm.id === p.memberId)!;
      return historyItem(
        groupId,
        'payment_made',
        p.month,
        'event.paymentMade.title',
        { name: m.name },
        'event.paymentMade.desc',
        { month: p.month, amount: p.amount },
        p.paidAt ? Math.round((Date.now() - new Date(p.paidAt).getTime()) / 86400000) : 0,
        p.amount,
      );
    }),
    historyItem(groupId, 'payment_late', 2, 'event.paymentLate.title', { name: diego.name }, 'event.paymentLate.desc', { name: diego.name, month: 2 }, 13),
    historyItem(groupId, 'loan_created', 2, 'event.loanCreated.title', undefined, 'event.loanCreated.desc', { name: diego.name }, 11, contribution),
    historyItem(groupId, 'draw_completed', 1, 'event.drawCompleted.title', { name: priya.name }, 'event.drawCompleted.desc', { name: priya.name, month: 1, amount: contribution * totalMembers }, 41, contribution * totalMembers),
    historyItem(groupId, 'draw_completed', 2, 'event.drawCompleted.title', { name: james.name }, 'event.drawCompleted.desc', { name: james.name, month: 2, amount: contribution * totalMembers }, 11, contribution * totalMembers),
  ]);

  return {
    id: groupId,
    name: groupName,
    description: 'ჩვენი საოჯახო დანაზოგის ჯგუფი — ექვსი სანდო წევრი, ერთი გამოსავალი ყოველთვიურად.',
    monthlyContribution: contribution,
    totalMembers,
    durationMonths: 6,
    isPrivate: true,
    autoRandomDraw: true,
    status: 'active',
    currentMonth: 3,
    createdAt: addDays(new Date(), -70).toISOString(),
    nextDrawDate: addDays(new Date(), 6).toISOString(),
    members,
    payments,
    draws,
    loans,
    history,
  };
}

function buildOfficeSquad(): Group {
  const groupId = 'grp-office-squad';
  const contribution = 150;
  const totalMembers = 4;
  const groupName = 'საოფისე გუნდი';

  const marta = member('Marta Lopez', { joinedDaysAgo: 150, hasWon: true, wonMonth: 1, isEligible: false, currentPaymentStatus: 'paid', totalContributed: 600 });
  const noah = member('Noah Bennett', { joinedDaysAgo: 150, hasWon: true, wonMonth: 2, isEligible: false, currentPaymentStatus: 'paid', totalContributed: 600 });
  const luka = member(CURRENT_USER_NAME, { joinedDaysAgo: 150, isCurrentUser: true, hasWon: true, wonMonth: 3, isEligible: false, currentPaymentStatus: 'paid', totalContributed: 600 });
  const grace = member('Grace Liu', { joinedDaysAgo: 150, hasWon: true, wonMonth: 4, isEligible: false, currentPaymentStatus: 'paid', totalContributed: 600 });

  const members = [marta, noah, luka, grace];
  const monthWindows = [140, 110, 80, 50];

  const payments: Payment[] = monthWindows.flatMap((daysAgo, idx) =>
    members.map((m) => payment(groupId, m.id, idx + 1, contribution, 'paid', -daysAgo, daysAgo - 1)),
  );

  const winners = [marta, noah, luka, grace];
  const draws: DrawResult[] = monthWindows.map((daysAgo, idx) => {
    const eligibleAtTime = winners.slice(idx).map((w) => w.id);
    return draw(groupId, idx + 1, winners[idx], contribution * totalMembers, eligibleAtTime, daysAgo);
  });

  const history = sortHistory([
    historyItem(groupId, 'group_created', 0, 'event.groupCreated.title', { name: groupName }, 'event.groupCreated.desc', { user: marta.name }, 150),
    ...members.map((m) => historyItem(groupId, 'member_joined', 0, 'event.memberJoined.title', { name: m.name }, 'event.memberJoined.desc', { name: m.name, group: groupName }, 150)),
    ...draws.map((d) =>
      historyItem(
        groupId,
        'draw_completed',
        d.month,
        'event.drawCompleted.title',
        { name: d.winnerName },
        'event.drawCompleted.desc',
        { name: d.winnerName, month: d.month, amount: d.prizeAmount },
        monthWindows[d.month - 1],
        d.prizeAmount,
      ),
    ),
  ]);

  return {
    id: groupId,
    name: groupName,
    description: 'დასრულებული ოთხთვიანი ჯგუფი გუნდთან ერთად — ყველამ მიიღო თავისი ჯერი.',
    monthlyContribution: contribution,
    totalMembers,
    durationMonths: 4,
    isPrivate: true,
    autoRandomDraw: true,
    status: 'completed',
    currentMonth: 4,
    createdAt: addDays(new Date(), -150).toISOString(),
    nextDrawDate: addDays(new Date(), -50).toISOString(),
    members,
    payments,
    draws,
    loans: [],
    history,
  };
}

function buildOpenGroup(config: {
  id: string;
  name: string;
  description: string;
  contribution: number;
  totalMembers: number;
  joined: number;
  durationMonths: number;
  isPrivate: boolean;
  drawInDays: number;
  names: string[];
}): Group {
  const members = config.names
    .slice(0, config.joined)
    .map((name, idx) => member(name, { joinedDaysAgo: 20 - idx * 2, currentPaymentStatus: 'pending', totalContributed: 0 }));

  const history = sortHistory([
    historyItem(config.id, 'group_created', 0, 'event.groupCreated.title', { name: config.name }, 'event.groupCreated.desc', { user: members[0]?.name ?? '' }, 21),
    ...members.map((m) => historyItem(config.id, 'member_joined', 0, 'event.memberJoined.title', { name: m.name }, 'event.memberJoined.desc', { name: m.name, group: config.name }, 20)),
  ]);

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    monthlyContribution: config.contribution,
    totalMembers: config.totalMembers,
    durationMonths: config.durationMonths,
    isPrivate: config.isPrivate,
    autoRandomDraw: true,
    status: 'forming',
    currentMonth: 1,
    createdAt: addDays(new Date(), -21).toISOString(),
    nextDrawDate: addDays(new Date(), config.drawInDays).toISOString(),
    members,
    payments: [],
    draws: [],
    loans: [],
    history,
  };
}

export function buildSeedState(): AppState {
  const familyCircle = buildFamilyCircle();
  const officeSquad = buildOfficeSquad();

  const downtown = buildOpenGroup({
    id: 'grp-downtown-colleagues',
    name: 'ცენტრის კოლეგები',
    description: 'მშვიდი დანაზოგის ჯგუფი ცენტრის ოფისის კოლეგებისთვის.',
    contribution: 150,
    totalMembers: 8,
    joined: 5,
    durationMonths: 8,
    isPrivate: false,
    drawInDays: 18,
    names: ['Liam Carter', 'Sofia Petrova', 'Ken Watanabe', 'Olivia Brooks', 'Tariq Hassan'],
  });

  const weekend = buildOpenGroup({
    id: 'grp-weekend-circle',
    name: 'შაბათ-კვირის წრე',
    description: 'მეგობრები ერთად აზოგებენ — ერთი გამოსავალი ყოველთვიურად.',
    contribution: 100,
    totalMembers: 10,
    joined: 8,
    durationMonths: 10,
    isPrivate: false,
    drawInDays: 9,
    names: ['Maya Torres', 'Ben Okafor', 'Lucia Rossi', 'Ivan Petrenko', 'Hana Suzuki', 'Owen Clarke', 'Zoe Adams', 'Felix Wagner'],
  });

  const neighborhood = buildOpenGroup({
    id: 'grp-neighborhood-savers',
    name: 'სამეზობლო დამზოგველები',
    description: 'მეზობლების სანდო ჯგუფი — ახლა უკვე სავსეა.',
    contribution: 250,
    totalMembers: 6,
    joined: 6,
    durationMonths: 6,
    isPrivate: false,
    drawInDays: 5,
    names: ['Robert Nguyen', 'Chloe Martin', 'David Osei', 'Nadia Farouk', 'Ethan Brooks', 'Ingrid Larsen'],
  });

  return {
    currentUser: {
      id: CURRENT_USER_ID,
      name: CURRENT_USER_NAME,
      email: 'luka.meladze@example.com',
      avatarColor: pickAvatarColor(CURRENT_USER_NAME),
      avatarInitials: getInitials(CURRENT_USER_NAME),
      memberSince: addDays(new Date(), -150).toISOString(),
    },
    groups: [familyCircle, officeSquad, downtown, weekend, neighborhood],
    activeGroupId: familyCircle.id,
  };
}

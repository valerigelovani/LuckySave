export interface DrawResult {
  id: string;
  groupId: string;
  month: number;
  winnerId: string;
  winnerName: string;
  winnerInitials: string;
  winnerColor: string;
  prizeAmount: number;
  eligibleMemberIds: string[];
  drawDate: string;
}

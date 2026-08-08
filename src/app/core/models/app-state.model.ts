import { Group } from './group.model';
import { User } from './user.model';

export interface AppState {
  currentUser: User;
  groups: Group[];
  activeGroupId: string;
}

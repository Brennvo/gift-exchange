import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { Suggestion } from '../entities/suggestion.entity';

export interface IEvent {
  objectType: string;
  data: User | Group | UserGroupPoll | Suggestion | number;
}

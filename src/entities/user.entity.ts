import {
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Entity,
  OneToMany,
} from 'typeorm';
import { Group } from './group.entity';
import { UserGroupPoll } from './user-group-poll.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    type => Group,
    group => group.owner,
  )
  adminGroups: Group[];

  @OneToMany(
    type => UserGroupPoll,
    userGroupPoll => userGroupPoll.user,
  )
  userPolls: UserGroupPoll[];
}

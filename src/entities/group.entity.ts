import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { UserGroupPoll } from './user-group-poll.entity';
import { Event } from './event.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupName: string;

  @Column()
  voteEndDt: Date;

  @Column()
  ownerId: number;
  @ManyToOne(
    type => User,
    user => user.adminGroups,
  )
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(
    type => UserGroupPoll,
    userGroupPoll => userGroupPoll.group,
  )
  userPolls: UserGroupPoll[];

  @OneToMany(
    type => Event,
    event => event.group,
  )
  events: Event[];
}

import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { UserGroupPoll } from './user-group-poll.entity';

@Entity()
export class Group extends BaseEntity {
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
}

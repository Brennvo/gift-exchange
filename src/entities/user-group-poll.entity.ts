import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity()
export class UserGroupPoll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  @ManyToOne(
    type => User,
    user => user.userPolls,
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  groupId: number;
  @ManyToOne(
    type => Group,
    group => group.userPolls,
  )
  @JoinColumn({ name: 'groupId' })
  group: Group;
}

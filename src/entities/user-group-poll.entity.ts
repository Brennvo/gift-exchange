import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';
import { Suggestion } from './suggestion.entity';

@Entity()
export class UserGroupPoll {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    type => Suggestion,
    suggestion => suggestion.poll,
  )
  suggestions: Suggestion[];

  @Column()
  userId: number;
  @ManyToOne(
    type => User,
    user => user.polls,
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  groupId: number;
  @ManyToOne(
    type => Group,
    group => group.polls,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'groupId' })
  group: Group;
}

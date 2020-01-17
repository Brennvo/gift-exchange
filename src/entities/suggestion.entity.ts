import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserGroupPoll } from './user-group-poll.entity';

@Entity()
export class Suggestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  link: string;

  @Column()
  pollId: number;
  @ManyToOne(
    type => UserGroupPoll,
    userGroupPoll => userGroupPoll.suggestions,
  )
  @JoinColumn({ name: 'pollId' })
  poll: UserGroupPoll;
}

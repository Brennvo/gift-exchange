import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserGroupPoll } from './user-group-poll.entity';
import { Vote } from './vote.entity';

@Entity()
export class Suggestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  link: string;

  @OneToMany(
    type => Vote,
    vote => vote.suggestions,
  )
  votes: Vote[];

  @Column()
  pollId: number;
  @ManyToOne(
    type => UserGroupPoll,
    userGroupPoll => userGroupPoll.suggestions,
  )
  @JoinColumn({ name: 'pollId' })
  poll: UserGroupPoll;
}

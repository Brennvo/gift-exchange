import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Suggestion } from './suggestion.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  @ManyToOne(
    type => User,
    user => user.adminGroups,
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  suggestionId: number;
  @ManyToOne(
    type => Suggestion,
    suggestion => suggestion.votes,
  )
  @JoinColumn({ name: 'suggestionId' })
  suggestions: Suggestion[];
}

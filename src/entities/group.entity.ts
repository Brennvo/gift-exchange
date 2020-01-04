import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Entity,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @Column()
  groupName: string;

  @Column()
  voteEndDt: Date;

  @ManyToMany(
    type => User,
    user => user.groups,
    {
      cascade: true,
    },
  )
  @JoinTable()
  participants: Array<User>;
}

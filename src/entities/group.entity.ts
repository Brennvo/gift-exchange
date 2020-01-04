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
  owner: number;

  @Column()
  groupName: string;

  @Column()
  vote_end_dt: Date;

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

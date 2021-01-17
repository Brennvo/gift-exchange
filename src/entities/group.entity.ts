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
import { Invitation } from './invitation.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  voteEndDt: Date;

  @Column({ nullable: true })
  minPrice: number;

  @Column({ nullable: true })
  maxPrice: number;

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
    {
      onDelete: 'CASCADE',
    },
  )
  polls: UserGroupPoll[];

  @OneToMany(
    type => Invitation,
    invitation => invitation.group,
    {
      onDelete: 'CASCADE',
    },
  )
  invitations: Invitation[];
}

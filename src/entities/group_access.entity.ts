import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class GroupAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column()
  accessToken: string;

  @Column()
  expireDate: Date;

  @Column()
  groupId: number;
  @ManyToOne(
    type => Group,
    group => group.accessTokens,
  )
  @JoinColumn({ name: 'groupId' })
  group: Group;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column()
  token: string;

  @Column()
  expireDate: Date;

  @Column()
  groupId: number;
  @ManyToOne(
    type => Group,
    group => group.invitations,
  )
  @JoinColumn({ name: 'groupId' })
  group: Group;
}

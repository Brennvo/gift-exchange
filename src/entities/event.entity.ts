import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IEvent } from '../interfaces/event.interface';
import { Group } from './group.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;
  @ManyToOne(
    type => Group,
    group => group.events,
  )
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  verb: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  actor: IEvent;

  @Column({ type: 'jsonb' })
  domainObject: IEvent;

  @Column({ type: 'jsonb' })
  target: IEvent;
}

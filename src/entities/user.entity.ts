import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Entity,
} from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(
    type => Group,
    group => group.participants,
  )
  groups: Group[];
}

import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollService } from './poll.service';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { Suggestion } from '../entities/suggestion.entity';
import { Event } from '../entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, UserGroupPoll, Suggestion, Event]),
  ],
  controllers: [GroupController],
  providers: [GroupService, PollService],
})
export class GroupModule {}

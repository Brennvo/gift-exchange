import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { Suggestion } from '../entities/suggestion.entity';
import { EmailModule } from '../email/email.module';
import { PollController } from './poll/poll.controller';
import { Invitation } from '../entities/invitation.entity';
import { PollService } from './poll/poll.service';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      User,
      UserGroupPoll,
      Suggestion,
      Invitation,
    ]),
    EmailModule,
    InvitationModule,
  ],
  controllers: [GroupController, PollController],
  providers: [PollService, GroupService],
})
export class GroupModule {}

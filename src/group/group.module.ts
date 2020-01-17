import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { UserGroupPoll } from 'src/entities/user-group-poll.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, UserGroupPoll])],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}

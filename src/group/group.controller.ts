import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateGroupDTO } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { UpdateGroupDTO } from './dto/update-group.dto';
import { GroupGuard } from './guards/group.guard';
import { Group } from '../entities/group.entity';
import { PollService } from './poll/poll.service';

@UseGuards(AuthGuard('jwt'), GroupGuard)
@Controller('group')
export class GroupController {
  constructor(
    private groupService: GroupService,
    private readonly pollService: PollService,
  ) {}

  // Create a new group
  @Post()
  @UsePipes(ValidationPipe)
  createGroup(
    @Request() req,
    @Body() createGroupDto: CreateGroupDTO,
  ): Promise<Group> {
    return this.groupService.createGroup(req.user, createGroupDto);
  }

  // Return all groups associated with a user
  @Get()
  getGroups(@Request() req): Promise<Group[]> {
    return this.groupService.getUserGroups(req.user);
  }

  // Return a single group
  @Get('/:groupId')
  getGroup(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
  ): Promise<any> {
    return this.groupService.getGroupById(groupId);
  }

  // Updates group data
  @Patch('/:groupId')
  updateGroup(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
    @Body() updateGroupDto: UpdateGroupDTO,
  ): Promise<Group> {
    return this.groupService.updateGroup(req.user, groupId, updateGroupDto);
  }

  // Creates invitation(s) for a group
  @Post('/:groupId/invitation')
  createInvitations(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
    @Body('emails') emails: string[],
  ): Promise<any> {
    return this.groupService.inviteMembers(groupId, emails);
  }

  // Deletes an invitation for a group
  @Delete('/:groupId/invitation')
  deleteInvitations(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
    @Body('emails') emails: string[],
  ) {
    return this.groupService.revokeInvitation(groupId, emails);
  }

  // Adds a member to a group with a valid token by creating a poll
  @Post('/:groupId/poll/:token')
  createPoll(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
    @Param('token') token,
  ) {
    return this.groupService.createPoll(req.user, groupId, token);
  }
}

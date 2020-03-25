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

  // @Patch('/:groupId/invite')
  // invitePartipcant(
  //   @Request() req,
  //   @Param('groupId', ParseIntPipe) groupId,
  //   @Body('email') email,
  // ): Promise<any> {
  //   return this.groupService.inviteMember(req.user, groupId, email);
  // }

  // @Post('/:id/inviteMembers')
  // inviteMembers(
  //   @Request() req,
  //   @Param('id', ParseIntPipe) id,
  //   @Body('emails') emails,
  // ): Promise<any> {
  //   return this.groupService.inviteMembers(req.user, id, emails);
  // }

  // @Patch('/:id/revokeInvitation')
  // revokeInvitation(
  //   @Request() req,
  //   @Param('id', ParseIntPipe) id,
  //   @Body('email') email,
  // ): Promise<any> {
  //   return this.groupService.revokeInvitation(id, [email]);
  // }

  // @Patch('/:id/join/:accessToken')
  // joinGroup(
  //   @Request() req,
  //   @Param('id', ParseIntPipe) id,
  //   @Param('accessToken') accessToken,
  // ): Promise<Group> {
  //   return this.groupService.joinGroup(req.user, id, accessToken);
  // }

  // Return a single poll
  // @Get('/:groupId/poll/:pollId')
  // @UseGuards(PollGuard)
  // getUserPoll(
  //   @Param('groupId', ParseIntPipe) groupId,
  //   @Param('pollId', ParseIntPipe) pollId,
  // ): Promise<any> {
  //   return this.pollService.getUserPoll(pollId);
  // }

  // @Post('/:groupId/poll/:pollId')
  // @UseGuards(PollGuard)
  // createSuggestion(
  //   @Param('groupId', ParseIntPipe) groupId,
  //   @Param('pollId', ParseIntPipe) pollId,
  //   @Body() createSuggestionDto: CreateSuggestionDTO,
  // ): Promise<Suggestion> {
  //   return this.pollService.createSuggestion(
  //     groupId,
  //     pollId,
  //     createSuggestionDto,
  //   );
  // }

  // @Patch('/:groupId/poll/:pollId')
  // @UseGuards(PollGuard)
  // upvoteSuggestion(
  //   @Param('groupId', ParseIntPipe) groupId,
  //   @Param('pollId', ParseIntPipe) pollId,
  //   @Body() votePollDto: VotePollDTO,
  // ): Promise<Suggestion> {
  //   return this.pollService.voteOnSuggestion(groupId, pollId, votePollDto);
  // }
}

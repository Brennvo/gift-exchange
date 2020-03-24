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
} from '@nestjs/common';
import { CreateGroupDTO } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { UpdateGroupDTO } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateSuggestionDTO } from './dto/create-suggestion.dto';
import { PollService } from './poll.service';
import { GroupGuard } from './guards/group.guard';
import { PollGuard } from './guards/poll.guard';
import { VotePollDTO } from './dto/vote-poll.dto';
import { Group } from '../entities/group.entity';
import { Suggestion } from '../entities/suggestion.entity';

@UseGuards(AuthGuard('jwt'), GroupGuard)
@Controller('group')
export class GroupController {
  constructor(
    private groupService: GroupService,
    private readonly pollService: PollService,
  ) {}

  @Get()
  getGroups(@Request() req): Promise<Group[]> {
    return this.groupService.getUserGroups(req.user);
  }

  @Get('/:groupId')
  getGroup(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
  ): Promise<any> {
    return this.groupService.getGroupById(groupId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createGroup(
    @Request() req,
    @Body() createGroupDto: CreateGroupDTO,
  ): Promise<Group> {
    return this.groupService.createGroup(req.user, createGroupDto);
  }

  @Patch('/:id')
  updateGroup(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Body() updateGroupDto: UpdateGroupDTO,
  ): Promise<Group> {
    return this.groupService.updateGroup(req.user, id, updateGroupDto);
  }

  @Patch('/:id/invite')
  invitePartipcant(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Body('email') email,
  ): Promise<any> {
    return this.groupService.inviteMember(req.user, id, email);
  }

  @Post('/:id/inviteMembers')
  inviteMembers(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Body('emails') emails,
  ): Promise<any> {
    return this.groupService.inviteMembers(req.user, id, emails);
  }

  @Patch('/:id/revokeInvitation')
  revokeInvitation(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Body('email') email,
  ): Promise<any> {
    return this.groupService.revokeGroupAccess(id, [email]);
  }

  @Patch('/:id/join/:accessToken')
  joinGroup(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Param('accessToken') accessToken,
  ): Promise<Group> {
    return this.groupService.joinGroup(req.user, id, accessToken);
  }

  @Get('/:groupId/poll/:pollId')
  @UseGuards(PollGuard)
  getUserPoll(
    @Param('groupId', ParseIntPipe) groupId,
    @Param('pollId', ParseIntPipe) pollId,
  ): Promise<any> {
    return this.pollService.getUserPoll(groupId, pollId);
  }

  @Post('/:groupId/poll/:pollId')
  @UseGuards(PollGuard)
  createSuggestion(
    @Param('groupId', ParseIntPipe) groupId,
    @Param('pollId', ParseIntPipe) pollId,
    @Body() createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    return this.pollService.createSuggestion(
      groupId,
      pollId,
      createSuggestionDto,
    );
  }

  @Patch('/:groupId/poll/:pollId')
  @UseGuards(PollGuard)
  upvoteSuggestion(
    @Param('groupId', ParseIntPipe) groupId,
    @Param('pollId', ParseIntPipe) pollId,
    @Body() votePollDto: VotePollDTO,
  ): Promise<Suggestion> {
    return this.pollService.voteOnSuggestion(groupId, pollId, votePollDto);
  }
}

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
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateSuggestionDTO } from './dto/create-suggestion.dto';
import { PollService } from './poll.service';
import { Suggestion } from 'src/entities/suggestion.entity';
import { GroupGuard } from './gaurds/group.guard';
import { PollGuard } from './gaurds/poll.guard';

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

  @Patch('/:id/join')
  joinGroup(@Request() req, @Param('id', ParseIntPipe) id): Promise<Group> {
    return this.groupService.joinGroup(req.user, id);
  }

  @Get('/:groupId/poll/:targetUserId')
  @UseGuards(PollGuard)
  getUserPoll(
    @Param('groupId', ParseIntPipe) groupId,
    @Param('targetUserId', ParseIntPipe) targetUserId,
  ): Promise<any> {
    return this.pollService.getUserPoll(groupId, targetUserId);
  }

  @Post('/:groupId/poll/:targetUserId')
  @UseGuards(PollGuard)
  createSuggestion(
    @Param('groupId', ParseIntPipe) groupId,
    @Param('targetUserId', ParseIntPipe) targetUserId,
    @Body() createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    return this.pollService.createSuggestion(
      groupId,
      targetUserId,
      createSuggestionDto,
    );
  }

  @Patch('/:groupId/poll/:targetUserId')
  @UseGuards(PollGuard)
  upvoteSuggestion(
    @Param('groupId', ParseIntPipe) groupId,
    @Param('targetUserId', ParseIntPipe) targetUserId,
  ): Promise<Suggestion> {
    return this.pollService.upvoteSuggestion(groupId, targetUserId);
  }
}

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

@UseGuards(AuthGuard('jwt'))
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
    return this.groupService.getGroupById(req.user, groupId);
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

  @Post('/:groupId/poll/:userId')
  createSuggestion(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId,
    @Param('userId', ParseIntPipe) userId,
    @Body() createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    return this.pollService.createSuggestion(
      req.user,
      groupId,
      createSuggestionDto,
    );
  }
}

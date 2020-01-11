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
} from '@nestjs/common';
import { CreateGroupDTO } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { UpdateGroupDTO } from './dto/update-group.dto';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createGroup(@Body() createGroupDto: CreateGroupDTO): Promise<Group> {
    return this.groupService.createGroup(createGroupDto);
  }

  // @Patch('/:groupId')
  // @UsePipes(ValidationPipe)
  // updateGroup(
  //   @Param('groupId', ParseIntPipe) groupId: number,
  //   @Body() updateGroupDto: UpdateGroupDTO,
  // ): Promise<Group> {
  //   return this.groupService.updateGroup(groupId, updateGroupDto);
  // }
}

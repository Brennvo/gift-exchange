import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateGroupDTO } from './create-group.dto';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  createGroup(@Body() createGroupDto: CreateGroupDTO): Promise<any> {
    return this.groupService.createGroup(createGroupDto);
  }
}

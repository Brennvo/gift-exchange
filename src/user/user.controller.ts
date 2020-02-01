import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // craeteUser(): Promise<User> {
  //   return this.userService.createUser();
  // }

  // @Get('/groups/:groupId')
  // getGroupById(
  //   @Param('groupId', ParseIntPipe) groupId: number,
  //   @Body('userId') userId: number,
  // ): Promise<Group> {
  //   return this.userService.getGroupById(userId, groupId);
  // }

  @Get(':userId/groups')
  // Eventually, Passport will append the user to the request
  getUserGroups(@Param('userId') userId: number): Promise<any> {
    return this.userService.getUserGroups(userId);
  }
}

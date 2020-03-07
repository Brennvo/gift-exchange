import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  getUser(@Req() req) {
    return req.user;
  }

  @Get(':userId/groups')
  // Eventually, Passport will append the user to the request
  getUserGroups(@Param('userId') userId: number): Promise<any> {
    return this.userService.getUserGroups(userId);
  }
}

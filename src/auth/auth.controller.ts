import { Controller, Get, UseGuards, Body, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly googleService: GoogleStrategy,
    private readonly userService: UserService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  gooogleLogin(@Body() body) {
    // initiate google oauth login flow
    console.log('Body is: ', body);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Req() req) {
    const user = await this.userService.findByGoogleId(req.user.googleId);

    if (!user) {
      this.userService.createUser({ googleId: req.user.googleId });
    }

    return ` Hello, ${req.user.name}`;
  }
}

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
  gooogleLogin(@Body() body): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Req() req) {
    const user = await this.userService.findByGoogleId(req.user.googleId);

    if (!user) {
      this.userService.createUser({
        username: req.user.username,
        facebookId: null,
        googleId: req.user.googleId,
      });
    }

    return `Hello, ${req.user.username}`;
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin(@Body() body): void {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req) {
    const user = await this.userService.findByFacebookId(req.user.facebookId);

    if (!user) {
      this.userService.createUser({
        username: req.user.username,
        googleId: null,
        facebookId: req.user.facebookId,
      });
    }

    return `Hello, ${req.user.username}`;
  }
}

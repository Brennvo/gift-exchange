import { Controller, Get, UseGuards, Body, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  gooogleLogin(@Body() body): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Req() req) {
    const user: User = await this.userService.findByGoogleId(req.user.googleId);

    let userId;
    if (!user) {
      const newUser = await this.userService.createUser({
        username: req.user.username,
        facebookId: null,
        googleId: req.user.googleId,
      });
      userId = newUser.id;
    } else {
      userId = user.id;
    }

    const payload = { userId };

    return await this.authService.signJwt(payload);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin(@Body() body): void {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req) {
    const user = await this.userService.findByFacebookId(req.user.facebookId);

    let userId;
    if (!user) {
      const newUser = await this.userService.createUser({
        username: req.user.username,
        googleId: null,
        facebookId: req.user.facebookId,
      });
      userId = newUser.id;
    } else {
      userId = user.id;
    }

    const payload = { userId };

    return await this.authService.signJwt(payload);
  }
}

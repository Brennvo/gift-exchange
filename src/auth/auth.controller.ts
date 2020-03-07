import { Controller, Get, UseGuards, Body, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly CLIENT_URL;
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.CLIENT_URL = this.configService.get<string>('CLIENT_URL');
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  gooogleLogin(@Body() body): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Req() req, @Res() res) {
    const exisingUser: User = await this.userService.findByGoogleId(
      req.user.googleId,
    );

    let newUser;
    if (!exisingUser) {
      newUser = await this.userService.createUser({
        username: req.user.username,
        facebookId: null,
        googleId: req.user.googleId,
      });
    }

    const payload = exisingUser
      ? { userId: exisingUser.id, username: exisingUser.username }
      : { userId: newUser.id, username: newUser.username };

    const jwt = await this.authService.signJwt(payload);
    res.cookie('npid', jwt, {
      httpOnly: true,
    });
    res.redirect(this.CLIENT_URL);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin(@Body() body): void {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res() res) {
    const existingUser: User = await this.userService.findByFacebookId(
      req.user.facebookId,
    );

    let newUser;
    if (!existingUser) {
      newUser = await this.userService.createUser({
        username: req.user.username,
        googleId: null,
        facebookId: req.user.facebookId,
      });
    }

    const payload = existingUser
      ? { userId: existingUser.id, username: existingUser.username }
      : { userId: newUser.id, username: newUser.username };

    const jwt = await this.authService.signJwt(payload);
    res.cookie('npid', jwt, {
      httpOnly: true,
    });
    res.redirect(this.CLIENT_URL);
  }

  @Get('/logout')
  logout(@Req() req, @Res() res) {
    res.clearCookie('npid');
    res.send('ok');
  }
}

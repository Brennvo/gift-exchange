import { Controller, Get, UseGuards, Body, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly googleService: GoogleStrategy) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  gooogleLogin(@Body() body) {
    // initiate google oauth login flow
    console.log('Body is: ', body);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  callback(@Req() req) {
    console.log('req from callback: ', req.user);
    return ` Hello, ${req.user.displayName}`;
  }
}

import { Controller, Get, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly googleService: GoogleStrategy) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  login(@Body() body) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  callback(res) {}
}

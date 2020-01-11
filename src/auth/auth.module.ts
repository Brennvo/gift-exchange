import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy],
})
export class AuthModule {}

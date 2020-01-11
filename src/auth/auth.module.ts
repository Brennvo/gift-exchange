import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [GoogleStrategy, FacebookStrategy],
})
export class AuthModule {}

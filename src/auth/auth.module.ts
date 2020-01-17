import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from 'src/user/user.module';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtModule } from '@nestjs/jwt';
import { keys } from 'src/config/keys';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: keys.jwt.secret,
      signOptions: {
        expiresIn: 3000,
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, FacebookStrategy, JwtStrategy, AuthService],
})
export class AuthModule {}

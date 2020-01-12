import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtModule } from '@nestjs/jwt';
import { keys } from 'src/config/keys';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: keys.jwt.secret,
      signOptions: {
        expiresIn: 3000,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, FacebookStrategy, JwtStrategy, AuthService],
})
export class AuthModule {}

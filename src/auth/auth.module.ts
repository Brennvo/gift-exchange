import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { keys } from '../config/keys';
import { HistoryMiddleWare } from './middleware/history.middleware';

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
export class AuthModule {
  configure(consuemr: MiddlewareConsumer) {
    consuemr.apply(HistoryMiddleWare).forRoutes(
      {
        path: '/auth/google',
        method: RequestMethod.GET,
      },
      { path: '/auth/facebook', method: RequestMethod.GET },
    );
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { keys } from '../../config/keys';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: keys.facebook.id,
      clientSecret: keys.facebook.secret,
      callbackURL: 'http://localhost:3001/auth/facebook/callback',
    });
  }

  validate(accessToken, refreshToken, profile, cb) {
    const user = {
      facebookId: profile.id,
      username: profile.displayName,
    };
    return user;
  }
}

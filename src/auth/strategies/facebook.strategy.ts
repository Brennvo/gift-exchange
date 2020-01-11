import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { keys } from 'src/config/keys';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: keys.facebook.id,
      clientSecret: keys.facebook.secret,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
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

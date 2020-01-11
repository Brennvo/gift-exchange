import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { keys } from 'src/config/keys';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: keys.google.id,
      clientSecret: keys.google.secret,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken, refreshToken, profile, cb) {
    const user = {
      googleId: profile.id,
      name: profile.displayName,
    };
    return user;
  }
}

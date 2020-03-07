import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { keys } from '../../config/keys';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    // call the base class constructor (PassportStrategy)
    super({
      jwtFromRequest: req => {
        return req.cookies.npid;
      },
      ignoreExpieration: false,
      secretOrKey: keys.jwt.secret,
    });
  }

  async validate(payload): Promise<User> {
    const user = await this.authService.validatePayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

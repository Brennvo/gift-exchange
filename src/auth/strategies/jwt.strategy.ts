import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { keys } from 'src/config/keys';
import { UserService } from 'src/user/user.service';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    // call the base class constructor (PassportStrategy)
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpieration: false,
      secretOrKey: keys.jwt.secret,
    });
  }

  async validate(payload): Promise<User> {
    // retrieve user from the username in paload
    const { userId } = payload;
    const user = await this.userService.findById({ userId });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

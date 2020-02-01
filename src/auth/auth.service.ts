import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async validatePayload(payload) {
    const { userId } = payload;
    return await this.userService.findById(userId);
  }
}

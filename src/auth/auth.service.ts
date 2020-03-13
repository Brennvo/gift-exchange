import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private returnUrl = '';
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  setReturnUrl(url) {
    this.returnUrl = url;
  }

  getReturnurl() {
    return this.returnUrl;
  }

  async signJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async validatePayload(payload) {
    const { userId } = payload;
    return await this.userService.findById(userId);
  }
}

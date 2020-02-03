import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

describe('Auth Service tests', () => {
  let authService;
  let userService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useFactory: () => ({
            sign: jest.fn().mockReturnValue('signed mock'),
          }),
        },
        {
          provide: UserService,
          useFactory: () => ({
            findById: jest.fn(),
          }),
        },
      ],
    }).compile();

    authService = await module.get(AuthService);
    userService = await module.get(UserService);
  });

  it('should sign jwt', async () => {
    const res = await authService.signJwt('payload');
    expect(res).toBe('signed mock');
  });

  describe('validate payload tests', () => {
    it('should return true for valid user', async () => {
      userService.findById.mockResolvedValue(true);
      await expect(
        authService.validatePayload({ user: { id: 1 } }),
      ).resolves.toBeTruthy();
    });

    it('should return false for user that does not exist', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(
        authService.validatePayload({ user: null }),
      ).resolves.toBeFalsy();
    });
  });
});

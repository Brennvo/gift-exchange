import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = () => ({
  validatePayload: jest.fn(),
});

describe('JWT Strategy tests', () => {
  let jwtStrategy;
  let authService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    }).compile();

    jwtStrategy = await module.get(JwtStrategy);
    authService = await module.get(AuthService);
  });

  it('should return user when payload is valid', async () => {
    const mockPayload = { user: { id: 1 } };
    authService.validatePayload.mockResolvedValue(mockPayload);
    const res = await jwtStrategy.validate(mockPayload);
    expect(res).toBe(mockPayload);
  });

  it('should throw unauthorized exception when user not authorized', async () => {
    authService.validatePayload.mockResolvedValue(null);
    await expect(jwtStrategy.validate({})).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

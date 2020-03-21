import { TestingModule, Test } from '@nestjs/testing';
import { PollGuard } from './poll.guard';
import { PollService } from '../poll.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Poll guard tests', () => {
  let pollService;
  let pollGaurd;
  let context;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollGuard,
        {
          provide: PollService,
          useFactory: () => ({
            getUserPoll: jest.fn(),
          }),
        },
      ],
    }).compile();
    pollService = await module.get(PollService);
    pollGaurd = await module.get(PollGuard);
  });

  describe('guard permits access', () => {
    it('should return true if poll exists and user is not editing own poll', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { groupId: 2 },
            user: { id: 1 },
          }),
        }),
      };
      pollService.getUserPoll.mockResolvedValue({
        user: { id: 5 },
      });
      const res = await pollGaurd.canActivate(context);
      expect(res).toBe(true);
    });
  });

  describe('guard prohibits access', () => {
    it('should return false when poll does not exist', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { targetUserId: 2 },
            user: { id: 1 },
          }),
        }),
      };
      pollService.getUserPoll.mockResolvedValue(null);
      await expect(pollGaurd.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return false when user attempts to access own poll', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { groupId: 10 },
            user: { id: 1 },
          }),
        }),
      };
      pollService.getUserPoll.mockResolvedValue({
        user: {
          id: 1,
        },
      });
      await expect(pollGaurd.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

import { TestingModule, Test } from '@nestjs/testing';
import { GroupService } from '../group.service';
import { GroupGuard } from './group.guard';
import { NotFoundException } from '@nestjs/common';

const mockGroupService = {
  getGroupById: jest.fn(),
};

describe('Group guard tests', () => {
  let groupGuard;
  let groupService;
  let context;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupGuard,
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();
    groupGuard = await module.get(GroupGuard);
    groupService = await module.get(GroupService);
  });

  describe('guard permits access', () => {
    it('should return true if no group is being request', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: {},
          }),
        }),
      };
      const res = await groupGuard.canActivate(context);
      expect(res).toBe(true);
    });

    it('should return true if group exists and user in group', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { groupId: 1 },
            user: { id: 1 },
          }),
        }),
      };
      groupService.getGroupById.mockResolvedValue({
        userPolls: [{ user: { id: 1 } }],
      });
      const res = await groupGuard.canActivate(context);
      expect(res).toBe(true);
    });
  });

  describe('guard prohibits access', () => {
    it('should return false if group not found', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { groupId: 5 },
          }),
        }),
      };
      groupService.getGroupById.mockResolvedValue(null);
      await expect(groupGuard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return false if user not in group being request', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { groupId: 1 },
          }),
        }),
      };
      groupService.getGroupById.mockResolvedValue({
        userPolls: [{ user: { id: 99 } }],
      });
      await expect(groupGuard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

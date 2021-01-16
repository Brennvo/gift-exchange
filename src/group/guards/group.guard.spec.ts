import { TestingModule, Test } from '@nestjs/testing';
import { GroupService } from '../group.service';
import { GroupGuard } from './group.guard';
import { NotFoundException } from '@nestjs/common';

const mockGroupService = () => ({
  getGroupById: jest.fn(),
});

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
          useFactory: mockGroupService,
        },
      ],
    }).compile();
    groupGuard = await module.get(GroupGuard);
    groupService = await module.get(GroupService);
  });

  describe('permits access', () => {
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

    it('should return true if the requesting user is the owner of the group', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { groupId: 1 },
            user: { id: 1 },
          }),
        }),
      };

      groupService.getGroupById.mockResolvedValue({
        owner: { id: 1 },
        polls: [],
      });

      const res = await groupGuard.canActivate(context);

      expect(res).toBe(true);
    });

    it('should return true if the requesting user is a participant of the group', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { groupId: 1 },
            user: { id: 1 },
          }),
        }),
      };
      groupService.getGroupById.mockResolvedValue({
        owner: { id: 3 },
        polls: [{ user: { id: 1 } }],
      });
      const res = await groupGuard.canActivate(context);
      expect(res).toBe(true);
    });
  });

  describe('prohibits access', () => {
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
        owner: { id: 3 },
        polls: [{ user: { id: 99 } }],
      });
      await expect(groupGuard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

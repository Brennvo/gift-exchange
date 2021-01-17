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

  describe('wehen permitting access', () => {
    it('should return true if no specific group is being requested', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            params: {},
          }),
        }),
      };
      const res = await groupGuard.canActivate(context);
      expect(res).toBe(true);
    });

    it('should return true if the user is the owner', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
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

    it('should return true if the user is a participant', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
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

    it('should return true if the user is creaeting a new group', async () => {
      context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'POST',
            params: { groupId: null },
          }),
        }),
      };

      const res = await groupGuard.canActivate(context);
      expect(res).toBe(true);
    });
  });

  describe('when prohibiting access', () => {
    it('should return false if the group does not exist', async () => {
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

    it('should return false if the user is not a participant', async () => {
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

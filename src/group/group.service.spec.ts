import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Invitation } from '../entities/invitation.entity';
import { EmailService } from '../email/email.service';
import { InvitationService } from '../invitation/invitation.service';
import { CreateGroupDTO } from './dto/create-group.dto';
let cryptoRandomString = require('crypto-random-string');

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

const mockUser = { id: 1, name: 'foo' };

const mockGroup = {
  id: 1,
  name: 'test',
  ownerId: mockUser.id,
  voteEndDate: new Date('2020-01-01'),
  minPrice: null,
  maxPrice: null,
};

const mockPoll = {};

describe('GroupService', () => {
  // Mock services
  let groupService;
  let emailService;
  let invitationService;

  // Mock repositories
  let groupRepository;
  let userRepository;
  let pollRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        EmailService,
        InvitationService,
        { provide: getRepositoryToken(Group), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserGroupPoll),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        {
          provide: getRepositoryToken(Invitation),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    groupService = module.get(GroupService);
    emailService = module.get(EmailService);
    invitationService = module.get(InvitationService);

    groupRepository = module.get(getRepositoryToken(Group));
    userRepository = module.get(getRepositoryToken(User));
    pollRepository = module.get(getRepositoryToken(UserGroupPoll));
  });

  describe('when creating a group', () => {
    beforeEach(() => {
      pollRepository.save.mockResolvedValue(true);
      pollRepository.create.mockResolvedValue(mockPoll);
      userRepository.findOne.mockResolvedValue(mockUser);
      groupRepository.create.mockResolvedValue(mockGroup);
      groupRepository.save.mockResolvedValue(true);
      groupRepository.create.mockResolvedValue(mockGroup);
      groupRepository.save.mockResolvedValue(true);
    });

    it('should create a group without a spending limit', async () => {
      let mockDate = new Date('2020-01-01');
      const mockCreateGroupDto: CreateGroupDTO = {
        name: 'test',
        votingEndDate: mockDate,
        shouldCreatePoll: false,
        spendingLimit: null,
      };

      await groupService.createGroup(mockUser, mockCreateGroupDto);
      expect(groupRepository.create).toHaveBeenCalledWith({
        minPrice: null,
        maxPrice: null,
        name: 'test',
        owner: mockUser,
        voteEndDt: mockDate,
      });
      expect(groupRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a group with a spending limit', async () => {
      let mockDate = new Date('2020-01-01');
      const mockCreateGroupDto: CreateGroupDTO = {
        name: 'test',
        votingEndDate: mockDate,
        spendingLimit: {
          minPrice: 20,
          maxPrice: 40,
        },
        shouldCreatePoll: false,
      };

      await groupService.createGroup(mockUser, mockCreateGroupDto);
      expect(groupRepository.create).toHaveBeenCalledWith({
        name: 'test',
        voteEndDt: mockDate,
        minPrice: 20,
        maxPrice: 40,
        owner: mockUser,
      });
      expect(groupRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a new poll if specified', async () => {
      let mockDate = new Date('2020-01-01');
      pollRepository.create.mockResolvedValue({
        owner: mockUser,
        group: mockGroup,
      });
      pollRepository.save.mockResolvedValue(true);

      const mockCreateGroupDto: CreateGroupDTO = {
        name: 'test',
        votingEndDate: mockDate,
        spendingLimit: null,
        shouldCreatePoll: true,
      };

      const newGroup = await groupService.createGroup(
        mockUser,
        mockCreateGroupDto,
      );
      expect(groupRepository.create).toHaveBeenCalledWith({
        name: 'test',
        voteEndDt: mockDate,
        minPrice: null,
        maxPrice: null,
        owner: mockUser,
      });
      expect(groupRepository.save).toHaveBeenCalledTimes(1);
      expect(pollRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        group: newGroup,
      });
      expect(pollRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // describe('managing group members', () => {
  //   it('should create an access token for a group', async () => {
  //     cryptoRandomString = jest.fn().mockReturnValue('mock string');
  //     invitationRepository.create.mockResolvedValue('access');
  //     await groupService.createInvitation(mockGroup);
  //     expect(invitationRepository.create).toHaveBeenCalledTimes(1);
  //     expect(invitationRepository.save).toHaveBeenCalledTimes(1);
  //   });

  //   it('should remove an access token for a particular email', async () => {
  //     await groupService.revokeInvitation(1, 'testUser@test.com');
  //     expect(invitationRepository.delete).toHaveBeenCalledWith({
  //       groupId: 1,
  //       email: 'testUser@test.com',
  //     });
  //   });

  //   it('should send an email to invite a new group participant', async () => {
  //     groupRepository.findOne.mockReturnValue(mockGroup);
  //     groupService.createInvitation = jest.fn().mockResolvedValue({
  //       invitation: 'mock token',
  //     });
  //     emailService.sendEmail = jest.fn().mockResolvedValue('sent email');
  //     await groupService.inviteMember(mockUser, 1, 'testUser@test.com');
  //     expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
  //   });
  // });

  // describe('getting group', () => {
  //   it('should get group by id', async () => {
  //     const mockInnerJoin = jest.fn().mockReturnThis();
  //     groupRepository.createQueryBuilder = jest.fn().mockReturnValue({
  //       innerJoin: mockInnerJoin,
  //       leftJoin: mockInnerJoin,
  //       select: jest.fn().mockReturnThis(),
  //       innerJoinAndSelect: jest.fn().mockReturnThis(),
  //       getOne: jest.fn().mockReturnValue(mockGroup),
  //     });

  //     const res = await groupService.getGroupById(1);
  //     const calls = mockInnerJoin.mock.calls;
  //     expect(
  //       calls[calls.length - 1][calls[calls.length - 1].length - 1].groupId,
  //     ).toBe(1);
  //     expect(res).toBe(mockGroup);
  //   });
  // });

  // describe('joining a group', () => {
  //   beforeEach(() => {
  //     groupRepository.findOne.mockResolvedValue(mockGroup);
  //     pollRepository.find.mockResolvedValue([{ userId: 2, groupId: 2 }]);
  //     pollRepository.create.mockReturnValue(true);
  //     pollRepository.save.mockResolvedValue(true);
  //     invitationRepository.findOne.mockResolvedValue({
  //       email: 'mock@mock.com',
  //     });
  //     groupService.revokeInvitation = jest.fn();
  //   });

  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should create a new poll', async () => {
  //     const group = await groupService.joinGroup(mockUser, 1, 'token');
  //     expect(pollRepository.create).toHaveBeenCalledWith({
  //       group: mockGroup,
  //       user: mockUser,
  //     });
  //     expect(group).toBe(mockGroup);
  //   });

  //   it('should revoke the access token', async () => {
  //     await groupService.joinGroup(mockUser, 1, 'token');
  //     expect(groupService.revokeInvitation).toHaveBeenCalledWith(
  //       1,
  //       'mock@mock.com',
  //     );
  //   });

  //   it('should throw exception if user already in group', async () => {
  //     pollRepository.find.mockResolvedValue([{ userId: 1, groupId: 1 }]);
  //     await expect(groupService.joinGroup(mockUser, 1)).rejects.toThrow(
  //       ConflictException,
  //     );
  //   });

  //   it("should throw exception if user's group access is removed", async () => {
  //     invitationRepository.findOne.mockResolvedValue(undefined);
  //     await expect(groupService.joinGroup(mockUser, 1)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });
  // });

  // describe('updating a group', () => {
  //   const initialGroup = {
  //     id: 1,
  //     groupName: 'foo',
  //     voteEndDt: new Date('2020-01-01'),
  //     ownerId: mockUser.id,
  //   };

  //   beforeEach(() => {
  //     // Mock the group to be found in each request to update group
  //     groupRepository.findOne.mockResolvedValue(initialGroup);

  //     // Mock the TypeORM query builder functions
  //     pollRepository.createQueryBuilder = jest.fn().mockReturnValue({
  //       select: jest.fn().mockReturnThis(),
  //       from: jest.fn().mockReturnThis(),
  //       leftJoinAndSelect: jest.fn().mockReturnThis(),
  //       where: jest.fn().mockReturnThis(),
  //       orderBy: jest.fn().mockReturnThis(),
  //       getOne: jest.fn().mockResolvedValue('0x0'),
  //       execute: jest.fn().mockResolvedValue(true),
  //     });
  //   });

  //   it('should throw an error if the owner is not updating the group', async () => {
  //     await expect(groupService.updateGroup({ id: 99 }, 1, {})).rejects.toThrow(
  //       UnauthorizedException,
  //     );
  //   });

  //   it('should update the group name', async () => {
  //     const updatedName = 'updated group name';
  //     groupRepository.save.mockResolvedValue({
  //       groupName: updatedName,
  //     });
  //     const res = await groupService.updateGroup({ id: 1 }, 1, {
  //       groupName: updatedName,
  //     });
  //     expect(groupRepository.save).toHaveBeenCalled();
  //     expect(initialGroup.groupName).toBe(updatedName);
  //   });

  //   it('should update the end date', async () => {
  //     const updatedDate = '2020-01-02';
  //     groupRepository.save.mockResolvedValue({
  //       voteEndDt: updatedDate,
  //     });
  //     const res = await groupService.updateGroup({ id: 1 }, 1, {
  //       voteEndDt: updatedDate,
  //     });
  //     expect(groupRepository.save).toHaveBeenCalled();
  //     expect(initialGroup.voteEndDt).toBe(updatedDate);
  //   });

  //   it('should not remove owner from group', async () => {
  //     const removedParticipants = [1];
  //     await expect(
  //       groupService.updateGroup({ id: 1 }, 1, { removedParticipants }),
  //     ).rejects.toThrow(BadRequestException);
  //   });
  // });
});

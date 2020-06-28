import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateGroupDTO } from './dto/create-group.dto';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { InvitationService } from '../invitation/invitation.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly invitationService: InvitationService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroupPoll)
    private readonly userGroupPollRepository: Repository<UserGroupPoll>,
  ) {}

  async getUserGroups(user): Promise<Group[]> {
    const { id: userId } = user;

    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.userPolls', 'userPoll', 'userPoll.userId = :userId', {
        userId,
      })
      .getMany();

    return groups;
  }

  async getGroupById(groupId): Promise<any> {
    const group = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin(
        'group.invitations',
        'invitations',
        'invitations.groupId = :groupId',
        {
          groupId,
        },
      )
      .innerJoin(
        'group.userPolls',
        'userPolls',
        'userPolls.groupId = :groupId',
        {
          groupId,
        },
      )
      .select([
        'group.id',
        'group.groupName',
        'group.ownerId',
        'group.voteEndDt',
        'group.minPrice',
        'group.maxPrice',
        'userPolls.id',
        'invitations.email',
      ])
      .innerJoinAndSelect('userPolls.user', 'user')
      .getOne();

    return group;
  }

  async createGroup(user, createGroupDto: CreateGroupDTO): Promise<Group> {
    const { groupName, voteEndDt, emails, minPrice, maxPrice } = createGroupDto;
    const owner = await this.userRepository.findOne(user.id);

    // TODO: check if minimum price and maximum price are set

    // Create new group with owner
    const newGroup = await this.groupRepository.create({
      groupName,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      voteEndDt: new Date(voteEndDt),
      owner,
    });
    const group = await this.groupRepository.save(newGroup);

    // Create a poll for this user (owner) in the group
    const userPoll = this.userGroupPollRepository.create({
      user,
      group,
    });
    await this.userGroupPollRepository.save(userPoll);

    if (createGroupDto.emails && createGroupDto.emails.length > 0) {
      await this.invitationService.sendInvitations(group.id, groupName, emails);
    }

    return newGroup;
  }

  // Adds user to a group (through poll creation) if token is valid
  async createPoll(user, groupId, token): Promise<Group> {
    // Check if user attempting to join is already in group
    const groupPolls = await this.userGroupPollRepository.find({
      where: { groupId },
    });

    if (groupPolls.some(poll => poll.userId === user.id)) {
      throw new ConflictException('User already in group.');
    }

    // Check if token is still valid
    const isTokenValid = await this.invitationService.validateInvitation(token);
    if (!isTokenValid) {
      throw new NotFoundException('Sorry, that group was not found.');
    }

    // Remove token before joining
    await this.invitationService.deleteToken(token);

    const group = await this.groupRepository.findOne(groupId);

    // Create a new poll for user in group
    const newUserPoll = this.userGroupPollRepository.create({
      group,
      user,
    });
    await this.userGroupPollRepository.save(newUserPoll);

    return group;
  }

  async inviteMembers(groupId: number, emails: string[]): Promise<any> {
    const group: Group = await this.groupRepository.findOne(groupId);

    return this.invitationService.sendInvitations(
      groupId,
      group.groupName,
      emails,
    );
  }

  async updateGroup(user, groupId, updateGroupDto): Promise<Group> {
    const {
      groupName,
      voteEndDt,
      emails,
      removedParticipants,
    } = updateGroupDto;

    const group = await this.groupRepository.findOne(groupId);

    // Authorize if user is owner and permitted to edit group
    if (group.ownerId !== user.id) {
      throw new UnauthorizedException();
    }

    if (groupName) {
      group.groupName = groupName;
    }

    if (voteEndDt) {
      // TODO: validate so not date in past
      group.voteEndDt = voteEndDt;
    }

    if (emails.length > 0) {
      await this.invitationService.sendInvitations(groupId, groupName, emails);
    }

    return await this.groupRepository.save(group);
  }
}

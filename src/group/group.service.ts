import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateGroupDTO } from './dto/create-group.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
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
        'userPolls.id',
      ])
      .innerJoinAndSelect('userPolls.user', 'user')
      .getOne();

    return group;
  }

  async createGroup(user, createGroupDto: CreateGroupDTO): Promise<Group> {
    const { groupName, voteEndDt } = createGroupDto;
    const owner = await this.userRepository.findOne(user.id);

    // Create new group with owner
    const newGroup = await this.groupRepository.create({
      groupName,
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

    return newGroup;
  }

  async joinGroup(user, groupId): Promise<Group> {
    const group = await this.groupRepository.findOne(groupId);

    // Check if user is already in group
    const groupPolls = await this.userGroupPollRepository.find({
      where: { groupId },
    });

    if (groupPolls.some(poll => poll.userId === user.id)) {
      throw new BadRequestException('User already in group.');
    }

    // Create a new user poll
    const newUserPoll = this.userGroupPollRepository.create({
      group,
      user,
    });
    await this.userGroupPollRepository.save(newUserPoll);
    return group;
  }

  async updateGroup(user, groupId, updateGroupDto): Promise<Group> {
    const {
      groupName,
      voteEndDt,
      newParticipants,
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

    if (newParticipants) {
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md

      // Avoid adding users already in group
      const whereClauses = newParticipants.map(newParticipant => ({
        userId: newParticipant,
        groupId,
      }));
      const polls = await this.userGroupPollRepository.find({
        where: whereClauses,
      });

      if (polls.length) {
        throw new ConflictException('Users already in group');
      }

      // Create array of user poll data
      const newData = newParticipants.map(newParticipantId => ({
        userId: newParticipantId,
        groupId,
      }));

      // Create new user polls
      await this.userGroupPollRepository
        .createQueryBuilder()
        .insert()
        .values(newData)
        .execute();
    }

    if (removedParticipants) {
      if (removedParticipants.includes(group.ownerId)) {
        throw new BadRequestException('Cannot remove owner from group');
      }

      removedParticipants.forEach(async participantId => {
        await this.userGroupPollRepository
          .createQueryBuilder()
          .delete()
          .where('userId = :userId', { userId: participantId })
          .execute();
      });
    }

    return await this.groupRepository.save(group);
  }
}

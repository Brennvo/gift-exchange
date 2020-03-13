import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as cryptoRandomString from 'crypto-random-string';
import { CreateGroupDTO } from './dto/create-group.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { GroupAccess } from '../entities/group_access.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserGroupPoll)
    private readonly userGroupPollRepository: Repository<UserGroupPoll>,
    @InjectRepository(GroupAccess)
    private readonly groupAccess: Repository<GroupAccess>,
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

  async joinGroup(user, groupId, accessToken): Promise<Group> {
    const group = await this.groupRepository.findOne(groupId);

    // Check if user is already in group
    const groupPolls = await this.userGroupPollRepository.find({
      where: { groupId },
    });

    if (groupPolls.some(poll => poll.userId === user.id)) {
      throw new BadRequestException('User already in group.');
    }

    // TODO: Check if access token is valid

    // TODO: return BadRequestException with meaningful message of
    // expired token (then potentially resend link)

    // Create a new user poll
    const newUserPoll = this.userGroupPollRepository.create({
      group,
      user,
    });
    await this.userGroupPollRepository.save(newUserPoll);
    return group;
  }

  /**
   * Gives temporary access to a group for a particular email
   * @param group - group to join
   * @param email - email receiving access
   */
  async createGroupAccess(group: Group, email: string): Promise<GroupAccess> {
    const accessToken = cryptoRandomString({ length: 16, type: 'url-safe' });

    // Expire date on token
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    const newToken = await this.groupAccess.create({
      email,
      accessToken,
      groupId: group.id,
      expireDate,
    });

    return this.groupAccess.save(newToken);
  }

  /**
   * Removes access to a group for a particular email
   * @param group - group to join
   * @param email - email receiving access
   */
  async revokeGroupAccess(groupId: number, email: string): Promise<any> {
    return this.groupAccess.delete({ groupId, email });
  }

  async inviteMember(user, groupId, email): Promise<any> {
    const group = await this.groupRepository.findOne(groupId);
    const { accessToken } = await this.createGroupAccess(group, email);

    // TODO: send email with access token embedded in URL
    // newEmails is an array of emails
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: `Your Vote Matters with The North Poll!`,
        html: `Come join the fun with the ${group.groupName}! Visit <a href="http://localhost:3000/group/${groupId}/join/${accessToken}>The North Poll to confirm your participation</a>.`,
      });
    } catch (e) {
      throw new ServiceUnavailableException();
    }
  }

  async updateGroup(user, groupId, updateGroupDto): Promise<Group> {
    const {
      groupName,
      voteEndDt,
      newEmails,
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

    if (newEmails) {
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md

      await this.inviteMember(user, group.id, 'BrennanSignup@gmail.com');

      // // Avoid adding users already in group
      // const whereClauses = newEmails.map(newParticipant => ({
      //   userId: newParticipant,
      //   groupId,
      // }));
      // const polls = await this.userGroupPollRepository.find({
      //   where: whereClauses,
      // });

      // if (polls.length) {
      //   throw new ConflictException('Users already in group');
      // }

      // // Create array of user poll data
      // const newData = newEmails.map(newParticipantId => ({
      //   userId: newParticipantId,
      //   groupId,
      // }));

      // // Create new user polls
      // await this.userGroupPollRepository
      //   .createQueryBuilder()
      //   .insert()
      //   .values(newData)
      //   .execute();
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

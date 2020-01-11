import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateGroupDTO } from './dto/create-group.dto';
import { Group } from 'src/entities/group.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UpdateGroupDTO } from './dto/update-group.dto';
import { UserGroupPoll } from 'src/entities/user-group-poll.entity';
import { UserService } from 'src/user/user.service';

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

  async createGroup(createGroupDto: CreateGroupDTO): Promise<Group> {
    const { userId, groupName, voteEndDt } = createGroupDto;
    const owner = await this.userRepository.findOne(userId);
    const group = new Group();
    group.groupName = groupName;
    group.voteEndDt = new Date(voteEndDt);
    // TODO: Update owner to user attached to req.body from Passport
    group.owner = owner;
    const newGroup = await this.groupRepository.save(group);

    // Create a poll for this user (owner) in the group
    const userPoll = new UserGroupPoll();
    userPoll.user = owner;
    userPoll.groupId = newGroup.id;
    await this.userGroupPollRepository.save(userPoll);

    return newGroup;
  }

  // async updateGroup(
  //   groupId: number,
  //   updateGroupDto: UpdateGroupDTO,
  // ): Promise<Group> {
  //   const { groupName, voteEndDt, participants, ownerId } = updateGroupDto;

  //   const foundGroup = await Group.findOne(groupId);

  //   console.log('found group owner: ', foundGroup.ownerId);
  //   console.log('USER ID IN REQ: ', ownerId);
  //   if (foundGroup.ownerId != ownerId) {
  //     throw new UnauthorizedException();
  //   }

  //   if (!foundGroup) {
  //     throw new NotFoundException(`Group with ID ${groupId} not found.`);
  //   }

  //   if (groupName) {
  //     foundGroup.groupName = groupName;
  //   }

  //   if (voteEndDt) {
  //     foundGroup.voteEndDt = voteEndDt;
  //   }

  //   if (participants) {
  //     const updatedParticipants = await User.findByIds([
  //       foundGroup.ownerId,
  //       ...participants,
  //     ]);
  //     foundGroup.participants = updatedParticipants;
  //   }

  //   return await foundGroup.save();
  // }
}

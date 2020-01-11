import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserGroupPoll } from 'src/entities/user-group-poll.entity';
import { createQueryBuilder } from 'typeorm';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { CreateUserDTO } from './dto/createUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<User> {
    const newUser = this.userRepository.create();
    await this.userRepository.save(newUser);

    return newUser;
  }

  // async getGroupById(userId: number, groupId: number): Promise<Group> {
  //   const foundGroup = await Group.findOne({
  //     where: { id: groupId },
  //     relations: ['participants'],
  //   });

  //   const groupIds = foundGroup.participants.map(user => user.id);

  //   if (!groupIds.includes(userId)) {
  //     throw new UnauthorizedException();
  //   }

  //   return foundGroup;
  // }

  async getUserGroups(userId: number): Promise<any> {
    // const groups = await UserGroupPoll.find({
    //   where: { userId },
    //   relations: ['group'],
    // });

    // const groups = await User.createQueryBuilder('user')
    //   .leftJoinAndSelect('user.userPolls', 'userPoll', 'user.id = :userId', {
    //     userId,
    //   })
    //   .innerJoinAndSelect('userPoll.group', 'group')
    //   .getOne();

    const groups = await Group.createQueryBuilder('group')
      .innerJoin('group.userPolls', 'userPoll', 'userPoll.userId = :userId', {
        userId,
      })
      .getMany();

    // .innerJoin(
    //   'user.groupPolls',
    //   'userGroupPolls',
    //   'userGroupPolls.userId = :userId',
    //   { userId },
    // )
    // .innerJoin('userGroupPolls.group', 'group')
    // .getMany();

    return groups;
  }
}

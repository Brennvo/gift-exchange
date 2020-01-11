import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserGroupPoll } from 'src/entities/user-group-poll.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dto/createUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<User> {
    const newUser = await this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);

    return newUser;
  }

  async findByGoogleId(googleId) {
    return this.userRepository.findOne({ googleId });
  }

  async findByFacebookId(facebookId) {
    return this.userRepository.findOne({ facebookId });
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

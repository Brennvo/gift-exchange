import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';

@Injectable()
export class UserService {
  async createUser(): Promise<User> {
    const newUser = new User();
    await newUser.save();
    return newUser;
  }

  async getGroupById(userId: number, groupId: number): Promise<Group> {
    const foundGroup = await Group.findOne({
      where: { id: groupId },
      relations: ['participants'],
    });

    const groupIds = foundGroup.participants.map(user => user.id);

    if (!groupIds.includes(userId)) {
      throw new UnauthorizedException();
    }

    return foundGroup;
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const user = await User.findOne({
      where: { id: userId },
      relations: ['groups'],
    });
    return user.groups;
  }
}

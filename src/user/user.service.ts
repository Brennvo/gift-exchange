import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';

@Injectable()
export class UserService {
  async createUser(): Promise<User> {
    const newUser = new User();
    await newUser.save();
    return newUser;
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const user = await User.findOne({ id: userId });
    return user.groups;
  }
}

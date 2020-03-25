import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { GroupService } from '../group.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation } from '../../entities/invitation.entity';

@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params, url, method } = context.switchToHttp().getRequest();

    // User not accessing specific group
    if (!params.groupId) {
      return true;
    }

    const group = await this.groupService.getGroupById(params.groupId);

    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    // Does group exist or is user not in group
    if (
      !group.userPolls.some(userPoll => userPoll.user.id == user.id) &&
      !url.includes('poll') &&
      method !== 'POST'
    ) {
      throw new NotFoundException('Group not found.');
    }

    return true;
  }
}

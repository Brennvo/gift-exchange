import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { GroupService } from '../group.service';

@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  isInGroup(requestingUser, group) {
    return (
      group.owner.id == requestingUser.id ||
      group.polls.some(poll => poll.user.id == requestingUser.id)
    );
  }

  hasPermission(requestingUser, group) {
    return this.isInGroup(requestingUser, group);
  }

  /**
   * This guard will prevent a user from accessing group data that they
   * are not part of.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params, url, method } = context.switchToHttp().getRequest();

    // User is not trying to access a specific group or is trying to create a
    // new one (which does not require permission)
    if ((!params.groupId && method !== 'POST') || method === 'POST') {
      console.log(`[GROUP GUARD] - ${method} request permitted.`);
      return true;
    }
    const group = await this.groupService.getGroupById(user, params.groupId);

    if (!group || !this.hasPermission(user, group)) {
      console.log(
        `[GROUP GUARD] - ${method} request for ${params.groupId} prohibited.`,
      );
      throw new NotFoundException('Group not found.');
    }

    // if (
    //   !group.polls.some(userPoll => userPoll.user.id == user.id) ||
    //   (group.owner.user.id !== user.id &&
    //     !url.includes('poll') &&
    //     method !== 'POST')
    // ) {
    //   throw new NotFoundException('Group not found.');
    // }

    return true;
  }
}

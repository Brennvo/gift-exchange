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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();

    // User not accessing specific group
    if (!params.groupId) {
      return true;
    }

    const group = await this.groupService.getGroupById(params.groupId);

    // Does group exist or is user not in group
    if (
      !group ||
      !group.userPolls.some(userPoll => userPoll.user.id == user.id)
    ) {
      throw new NotFoundException();
    }

    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PollService } from '../poll/poll.service';
import { GroupService } from '../group.service';

@Injectable()
export class PollGuard implements CanActivate {
  constructor(
    private readonly pollService: PollService,
    private readonly groupService: GroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();

    const poll = await this.pollService.getUserPoll(params.groupId);
    const group = await this.groupService.getGroupById(poll.groupId);

    if (!poll) {
      throw new NotFoundException('Poll not found.');
    }

    // TODO: restrict access from editing your own poll
    if (user.id == poll.user.id) {
      throw new BadRequestException('Cannot access own poll');
    }

    return true;
  }
}

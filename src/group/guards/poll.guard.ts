import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PollService } from '../poll.service';

@Injectable()
export class PollGuard implements CanActivate {
  constructor(private readonly pollService: PollService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();

    const poll = await this.pollService.getUserPoll(
      params.groupId,
      params.pollId,
    );

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

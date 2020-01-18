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
      params.targetUserId,
    );

    if (!poll) {
      throw new NotFoundException();
    }

    if (user.id == params.targetUserId) {
      throw new BadRequestException('Cannot access own poll');
    }

    return true;
  }
}

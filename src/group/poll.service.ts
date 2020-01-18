import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupPoll } from 'src/entities/user-group-poll.entity';
import { User } from 'src/entities/user.entity';
import { CreateSuggestionDTO } from './dto/create-suggestion.dto';
import { Suggestion } from 'src/entities/suggestion.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(UserGroupPoll)
    private readonly pollRepository: Repository<UserGroupPoll>,
    @InjectRepository(Suggestion)
    private readonly suggestionRepository: Repository<Suggestion>,
  ) {}

  async getUserPoll(requestingUser, groupId, userId) {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.groupId = :groupId', { groupId })
      .andWhere('poll.userId = :userId', { userId })
      .leftJoin('poll.suggestions', 'suggestions')
      .innerJoin('poll.group', 'group')
      .innerJoin('poll.user', 'user')
      .select([
        'poll.groupId',
        'group.groupName',
        'user.username',
        'suggestions',
      ])
      .getOne();

    return poll;
  }

  async createSuggestion(
    user: User,
    groupId: number,
    targetUserId: number,
    createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.userId = :userId', { userId: targetUserId })
      .andWhere('poll.groupId = :groupId', { groupId })
      .getOne();

    const newSuggestion = await this.suggestionRepository.create({
      ...createSuggestionDto,
      poll,
      votes: 0,
    });

    return await this.suggestionRepository.save(newSuggestion);
  }

  async upvoteSuggestion(
    user: User,
    groupId: number,
    targetUserId: number,
  ): Promise<Suggestion> {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.userId = :userId', { userId: targetUserId })
      .andWhere('poll.groupId = :groupId', { groupId })
      .getOne();

    const suggestion = await this.suggestionRepository
      .createQueryBuilder('suggestion')
      .where('suggestion.pollId = :pollId', { pollId: poll.id })
      .getOne();

    suggestion.votes = suggestion.votes + 1;

    await this.suggestionRepository.save(suggestion);

    return suggestion;
  }
}

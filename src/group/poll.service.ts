import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSuggestionDTO } from './dto/create-suggestion.dto';
import { VotePollDTO } from './dto/vote-poll.dto';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { Suggestion } from '../entities/suggestion.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(UserGroupPoll)
    private readonly pollRepository: Repository<UserGroupPoll>,
    @InjectRepository(Suggestion)
    private readonly suggestionRepository: Repository<Suggestion>,
  ) {}

  async getUserPoll(groupId, pollId) {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.id = :pollId', { pollId })
      .leftJoin('poll.suggestions', 'suggestions')
      .innerJoin('poll.group', 'group')
      .innerJoin('poll.user', 'user')
      .select([
        'poll.id',
        'poll.groupId',
        'group.groupName',
        'user.username',
        'user.id',
        'suggestions',
      ])
      .getOne();

    return poll;
  }

  async createSuggestion(
    groupId: number,
    pollId: number,
    createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.id = :pollId', { pollId })
      .andWhere('poll.groupId = :groupId', { groupId })
      .getOne();

    const newSuggestion = await this.suggestionRepository.create({
      ...createSuggestionDto,
      poll,
      votes: 0,
    });

    return await this.suggestionRepository.save(newSuggestion);
  }

  async voteOnSuggestion(
    groupId: number,
    pollId: number,
    votePollDto: VotePollDTO,
  ): Promise<Suggestion> {
    const poll = await this.getUserPoll(groupId, pollId);

    const suggestion = await this.suggestionRepository
      .createQueryBuilder('suggestion')
      .where('suggestion.pollId = :pollId', { pollId: poll.id })
      .andWhere('suggestion.id = :suggestionId', {
        suggestionId: votePollDto.id,
      })
      .getOne();

    if (!suggestion) {
      throw new NotFoundException(`Suggestion not found for poll ${poll.id}`);
    }

    suggestion.votes = votePollDto.upvote
      ? suggestion.votes + 1
      : suggestion.votes - 1;

    await this.suggestionRepository.save(suggestion);

    return suggestion;
  }
}

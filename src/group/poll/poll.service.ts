import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSuggestionDTO } from '../dto/create-suggestion.dto';
import { UserGroupPoll } from '../../entities/user-group-poll.entity';
import { Suggestion } from '../../entities/suggestion.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(UserGroupPoll)
    private readonly pollRepository: Repository<UserGroupPoll>,
    @InjectRepository(Suggestion)
    private readonly suggestionRepository: Repository<Suggestion>,
  ) {}

  async getUserPoll(pollId) {
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
    pollId: number,
    createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.id = :pollId', { pollId })
      .getOne();

    const newSuggestion = await this.suggestionRepository.create({
      ...createSuggestionDto,
      poll,
      votes: 0,
    });

    return await this.suggestionRepository.save(newSuggestion);
  }

  async updateSuggestion(pollId, updateSuggestionDTO): Promise<Suggestion> {
    return updateSuggestionDTO.upvote
      ? this.upvoteSuggestion(updateSuggestionDTO.id)
      : this.downvoteSuggestion(updateSuggestionDTO.id);
  }

  async upvoteSuggestion(suggestionId): Promise<Suggestion> {
    const suggestion = await this.suggestionRepository.findOne(suggestionId);
    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    suggestion.votes = suggestion.votes + 1;
    return this.suggestionRepository.save(suggestion);
  }

  async downvoteSuggestion(suggestionId): Promise<Suggestion> {
    const suggestion = await this.suggestionRepository.findOne(suggestionId);

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    if (suggestion.votes === 0) {
      return Promise.resolve(suggestion);
    }

    suggestion.votes = suggestion.votes - 1;
    return this.suggestionRepository.save(suggestion);
  }
}

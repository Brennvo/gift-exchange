import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSuggestionDTO } from '../dto/create-suggestion.dto';
import { UserGroupPoll } from '../../entities/user-group-poll.entity';
import { Suggestion } from '../../entities/suggestion.entity';
import { Vote } from '../../entities/vote.entity';
import { User } from '../../entities/user.entity';
import { CastedVotesDTO } from '../dto/casted-votes.dto';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(UserGroupPoll)
    private readonly pollRepository: Repository<UserGroupPoll>,
    @InjectRepository(Suggestion)
    private readonly suggestionRepository: Repository<Suggestion>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) {}

  async getUserPoll(pollId) {
    const poll = await this.pollRepository
      .createQueryBuilder('poll')
      .where('poll.id = :pollId', { pollId })
      .leftJoin('poll.suggestions', 'suggestions')
      .leftJoin('suggestions.votes', 'votes')
      .innerJoin('poll.group', 'group')
      .innerJoin('poll.user', 'user')
      .select([
        'poll.id',
        'poll.groupId',
        'group.groupName',
        'group.minPrice',
        'group.maxPrice',
        'user.username',
        'user.id',
        'suggestions',
        'votes.id',
        'votes.userId',
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
    });

    return await this.suggestionRepository.save(newSuggestion);
  }

  async castVotes(user: User, pollId: number, castedVotesDto: CastedVotesDTO) {
    // Check if user already has votes registered in the threhold

    const suggestions = await this.suggestionRepository
      .createQueryBuilder()
      .select('price')
      .where('id IN (:...suggestionIds)', {
        suggestionIds: castedVotesDto.suggestionIds,
      })
      .execute();

    const { group } = await this.getUserPoll(pollId);

    const prices = suggestions.reduce((sum, { price }) => sum + price, 0);

    if (group.minPrice && group.maxPrice) {
      if (Number(prices) < group.minPrice || Number(prices) > group.maxPrice) {
        throw new BadRequestException(
          'Vote price does not meet proper threshold.',
        );
      }
    }

    const newVotes = castedVotesDto.suggestionIds.map(suggestionId =>
      this.castVote(user, suggestionId),
    );

    return await Promise.all(newVotes);
  }

  async castVote(user: User, suggestionId: number): Promise<Vote> {
    const newVote = await this.voteRepository.create({
      suggestionId: suggestionId,
      userId: user.id,
    });

    return await this.voteRepository.save(newVote);
  }

  async deleteVotes(user: User, pollId: number): Promise<any> {
    // Find all suggestions user has voted on in poll
    const suggestions = await this.suggestionRepository
      .createQueryBuilder('suggestion')
      .select()
      .where('suggestion.pollId = :pollId', { pollId })
      .innerJoin('suggestion.votes', 'vote')
      .select(['suggestion.id'])
      .where('vote.userId = :userId', { userId: user.id })
      .execute();

    // Delete all votes with matching suggestion ids
    const suggestionIds = suggestions.map(tuple => tuple.suggestion_id);

    // Doing a double check on user id might not be required since the query above
    // already has a WHERE clause with user id
    return this.voteRepository
      .createQueryBuilder()
      .delete()
      .where('suggestionId IN (:...suggestionIds)', {
        suggestionIds,
      })
      .andWhere('userId = :userId', { userId: user.id })
      .execute();
  }

  // async updateSuggestion(pollId, updateSuggestionDTO): Promise<Suggestion> {
  //   return updateSuggestionDTO.upvote
  //     ? this.upvoteSuggestion(updateSuggestionDTO.id)
  //     : this.downvoteSuggestion(updateSuggestionDTO.id);
  // }

  // async upvoteSuggestion(suggestionId): Promise<Suggestion> {
  //   const suggestion = await this.suggestionRepository.findOne(suggestionId);
  //   if (!suggestion) {
  //     throw new NotFoundException('Suggestion not found');
  //   }

  //   suggestion.votes = suggestion.votes + 1;
  //   return this.suggestionRepository.save(suggestion);
  // }

  // async downvoteSuggestion(suggestionId): Promise<Suggestion> {
  //   const suggestion = await this.suggestionRepository.findOne(suggestionId);

  //   if (!suggestion) {
  //     throw new NotFoundException('Suggestion not found');
  //   }

  //   if (suggestion.votes === 0) {
  //     return Promise.resolve(suggestion);
  //   }

  //   suggestion.votes = suggestion.votes - 1;
  //   return this.suggestionRepository.save(suggestion);
  // }
}

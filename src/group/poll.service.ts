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

  async createSuggestion(
    user: User,
    groupId: number,
    createSuggestionDto: CreateSuggestionDTO,
  ): Promise<Suggestion> {
    const poll = await this.pollRepository.findOne(null, {
      where: [{ groupId }, { userId: user.id }],
    });

    const newSuggestion = await this.suggestionRepository.create({
      ...createSuggestionDto,
      poll,
    });

    return await this.suggestionRepository.save(newSuggestion);
  }
}

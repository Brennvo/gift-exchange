import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Patch,
} from '@nestjs/common';
import { CreateSuggestionDTO } from '../dto/create-suggestion.dto';
import { UpdateSuggestionDTO } from '../dto/udpate-suggestion.dto';
import { PollService } from './poll.service';

@Controller('poll')
export class PollController {
  constructor(private pollService: PollService) {}

  @Get('/:pollId')
  getPoll(@Param('pollId', ParseIntPipe) pollId) {
    return this.pollService.getUserPoll(pollId);
  }

  @Post('/:pollId/suggestion')
  createSuggestion(
    @Param('pollId', ParseIntPipe) pollId,
    @Body() createSuggestionDto: CreateSuggestionDTO,
  ) {
    return this.pollService.createSuggestion(pollId, createSuggestionDto);
  }

  @Patch('/:pollId/suggestion')
  updateSuggestion(
    @Param('pollId', ParseIntPipe) pollId,
    @Body() updateSuggestionDTO: UpdateSuggestionDTO,
  ) {
    return this.pollService.updateSuggestion(pollId, updateSuggestionDTO);
  }
}

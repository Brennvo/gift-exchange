import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  Request,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { CreateSuggestionDTO } from '../dto/create-suggestion.dto';
import { UpdateSuggestionDTO } from '../dto/udpate-suggestion.dto';
import { PollService } from './poll.service';
import { AuthGuard } from '@nestjs/passport';
import { CastedVotesDTO } from '../dto/casted-votes.dto';

@UseGuards(AuthGuard('jwt'))
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
    //return this.pollService.updateSuggestion(pollId, updateSuggestionDTO);
  }

  @Post('/:pollId/vote')
  castVotes(
    @Param('pollId', ParseIntPipe) pollId,
    @Body() castedVotesDTO: CastedVotesDTO,
    @Request() req,
  ) {
    return this.pollService.castVotes(req.user, pollId, castedVotesDTO);
  }

  @Delete('/:pollId/vote')
  deleteVotes(@Param('pollId', ParseIntPipe) pollId, @Request() req) {
    return this.pollService.deleteVotes(req.user, pollId);
  }
}

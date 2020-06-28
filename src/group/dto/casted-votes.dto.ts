import { IsNotEmpty } from 'class-validator';

export class CastedVotesDTO {
  @IsNotEmpty()
  suggestionIds: number[];
}

import { VoteType } from '../enums/VoteType.enum';

export class UpdateSuggestionDTO {
  id: number;
  title?: string;
  desription?: string;
  link?: string;
  vote?: VoteType;
}

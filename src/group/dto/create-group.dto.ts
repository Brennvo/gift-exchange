import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  votingEndDate: Date;

  @IsNotEmpty()
  shouldCreatePoll: boolean;

  @IsOptional()
  spendingLimit: null | {
    minPrice: number;
    maxPrice: number;
  };
}

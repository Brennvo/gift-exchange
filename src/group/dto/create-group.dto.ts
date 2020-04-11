import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDTO {
  @IsNotEmpty()
  groupName: string;

  @IsNotEmpty()
  voteEndDt: Date;

  @IsNotEmpty()
  minPrice: number;

  @IsNotEmpty()
  maxPrice: number;

  @IsOptional()
  emails: string[];
}

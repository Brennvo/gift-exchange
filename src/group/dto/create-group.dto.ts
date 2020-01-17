import { IsNotEmpty } from 'class-validator';

export class CreateGroupDTO {
  @IsNotEmpty()
  groupName: string;

  @IsNotEmpty()
  voteEndDt: Date;
}

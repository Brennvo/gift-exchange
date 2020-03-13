import { IsOptional } from 'class-validator';

export class UpdateGroupDTO {
  ownerId: number;

  @IsOptional()
  groupName: string;

  @IsOptional()
  voteEndDt: Date;

  @IsOptional()
  newEmails: string[];

  @IsOptional()
  removedParticipants: number[];
}

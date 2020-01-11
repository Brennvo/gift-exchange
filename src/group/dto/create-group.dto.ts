import { IsNotEmpty } from 'class-validator';
import { User } from 'src/entities/user.entity';

export class CreateGroupDTO {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  groupName: string;

  @IsNotEmpty()
  voteEndDt: Date;
}

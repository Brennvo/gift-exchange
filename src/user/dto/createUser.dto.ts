import { IsOptional } from 'class-validator';

export class CreateUserDTO {
  @IsOptional()
  googleId: string;
}

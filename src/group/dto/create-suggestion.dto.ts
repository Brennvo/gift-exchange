import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSuggestionDTO {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  link: string;

  @IsOptional()
  price: number;
}

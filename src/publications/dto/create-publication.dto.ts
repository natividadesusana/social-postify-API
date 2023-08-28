import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePublicationDto {
  @IsNotEmpty()
  @IsNumber()
  mediaId: number;

  @IsNotEmpty()
  @IsNumber()
  postId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}

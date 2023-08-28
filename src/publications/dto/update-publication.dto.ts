import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicationDto } from './create-publication.dto';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  mediaId?: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  postId?: number;

  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  date?: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaDto } from './create-media.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMediaDto extends PartialType(CreateMediaDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;
}

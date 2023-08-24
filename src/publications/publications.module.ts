import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';

@Module({
  controllers: [PublicationsController],
  providers: [PublicationsService],
})
export class PublicationsModule {}

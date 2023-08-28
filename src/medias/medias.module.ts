import { Module, forwardRef } from '@nestjs/common';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { MediasRepository } from './medias.repository';
import { PublicationsModule } from 'src/publications/publications.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [forwardRef(() => PublicationsModule)],
  controllers: [MediasController],
  providers: [MediasService, MediasRepository, PrismaService],
  exports: [MediasRepository],
})
export class MediasModule {}

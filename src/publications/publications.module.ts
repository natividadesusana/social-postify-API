import { Module, forwardRef } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { MediasModule } from '../medias/medias.module';
import { PostsModule } from '../posts/posts.module';
import { PublicationsRepository } from './publications.repository';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [forwardRef(() => MediasModule), forwardRef(() => PostsModule)],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsRepository, PrismaService],
  exports: [PublicationsRepository],
})
export class PublicationsModule {}

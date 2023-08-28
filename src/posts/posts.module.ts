import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PublicationsModule } from '../publications/publications.module';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [forwardRef(() => PublicationsModule)],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PrismaService],
  exports: [PostsRepository]
})
export class PostsModule {}

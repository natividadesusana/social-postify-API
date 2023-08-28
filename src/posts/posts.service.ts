import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { PublicationsRepository } from 'src/publications/publications.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly publicationsRepository: PublicationsRepository,
  ) {}

  async create(body: CreatePostDto) {
    const { title, text, image } = body;
    if (!title || !text) throw new BadRequestException();

    const postData: CreatePostDto = { title, text };
    if (image !== undefined) {
      postData.image = image;
    }
    
    return await this.postsRepository.create(postData);
  }

  async findAll() {
    return await this.postsRepository.findAll();
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne(id);
    if (!post) throw new NotFoundException();
    return post;
  }

  async update(id: number, body: UpdatePostDto) {
    const post = await this.postsRepository.findOne(id);
    if (!post) throw new NotFoundException();
    return await this.postsRepository.update(id, body);
  }

  async remove(id: number) {
    const postInPublication = await this.publicationsRepository.postInPublication(id);
    if (postInPublication) throw new ForbiddenException();
    return await this.postsRepository.remove(id);
  }
}

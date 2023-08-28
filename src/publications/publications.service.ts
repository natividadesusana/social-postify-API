import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { MediasRepository } from '../medias/medias.repository';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class PublicationsService {
  constructor(
    private readonly publicationsRepository: PublicationsRepository,
    private readonly mediasRepository: MediasRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async checkMediaPost(mediaId: number, postId: number) {
    const mediaIdExists = await this.mediasRepository.findOne(mediaId);
    const postIdExists = await this.postsRepository.findOne(postId);
    if (!mediaIdExists || !postIdExists) throw new NotFoundException();
  }

  async checkPublication(id: number) {
    const publication = await this.publicationsRepository.findOne(id);
    if (!publication) throw new NotFoundException();
    return publication;
  }

  async create(body: CreatePublicationDto) {
    const { mediaId, postId } = body;
    await this.checkMediaPost(mediaId, postId);
    return await this.publicationsRepository.create(body);
  }

  async findAll(published?: boolean, after?: Date) {
    return await this.publicationsRepository.findAll(published, after);
  }

  async findOne(id: number) {
    const publication = await this.publicationsRepository.findOne(id);
    if (!publication) throw new NotFoundException();
    return publication;
  }

  async update(id: number, body: UpdatePublicationDto) {
    const publication = await this.checkPublication(id);
    await this.checkMediaPost(body.mediaId, body.postId);
    if (new Date() >= new Date(publication.date))
      throw new ForbiddenException();
    if (!publication) throw new NotFoundException();
    return await this.publicationsRepository.update(id, body);
  }

  async remove(id: number) {
    const publication = await this.publicationsRepository.findOne(id);
    if (!publication) throw new NotFoundException();
    if (publication.date <= new Date()) throw new ForbiddenException();
    return await this.publicationsRepository.remove(id);
  }
}

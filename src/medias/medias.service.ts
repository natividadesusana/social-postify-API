import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediasRepository } from './medias.repository';
import { PublicationsRepository } from '../publications/publications.repository';

@Injectable()
export class MediasService {
  constructor(
    private readonly mediaRepository: MediasRepository,
    private readonly publicationsRepository: PublicationsRepository,
  ) {}

  async create(body: CreateMediaDto) {
    const { title, username } = body;
    if (!title || !username) throw new BadRequestException();
    
    const existingMedia = await this.mediaRepository.findMediaByTitleAndUsername(title, username);
    if (existingMedia) throw new ConflictException();

    return await this.mediaRepository.create({ title, username });
  }

  async findAll() {
    return await this.mediaRepository.findAll();
  }

  async findOne(id: number) {
    const media = await this.mediaRepository.findOne(id);
    if (!media) throw new NotFoundException();
    return media;
  }

  async update(id: number, body: UpdateMediaDto) {
    const { title, username } = body;

    const media = await this.mediaRepository.findOne(id);
    if (!media) throw new NotFoundException();

    const existingMedia = await this.mediaRepository.findMediaByTitleAndUsername(title, username);
    if (existingMedia && existingMedia.id !== id) throw new ConflictException();
 
    return await this.mediaRepository.update(id, body);
  }

  async remove(id: number) {
    const postInPublication = await this.publicationsRepository.postInPublication(id);
    if (postInPublication) throw new ForbiddenException();
    return await this.mediaRepository.remove(id);
  }
}

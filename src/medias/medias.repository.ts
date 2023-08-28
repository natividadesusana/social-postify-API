import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMediaByTitleAndUsername(title: string, username: string) {
    return await this.prisma.media.findFirst({
      where: { title, username },
    });
  }

  async create(body: CreateMediaDto) {
    return await this.prisma.media.create({
      data: body,
    });
  }

  async findAll() {
    return await this.prisma.media.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.media.findUnique({
      where: { id },
    });
  }

  async update(id: number, body: UpdateMediaDto) {
    return await this.prisma.media.update({
      where: { id },
      data: body,
    });
  }

  async remove(id: number) {
    const media = await this.findOne(id);
    if (media) {
      return await this.prisma.media.delete({ 
        where: { id }
      });
    }
  }
}

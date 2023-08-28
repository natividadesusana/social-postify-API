import { Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PublicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreatePublicationDto) {
    return await this.prisma.publication.create({
      data: body,
    });
  }

  async findAll(published?: boolean, after?: Date) {
    const where: any = {};
    if (after) {
      where.date = { gte: after.toISOString() };
    }
    if (published !== undefined) {
      if (published) {
        where.date = { ...where.date, lte: new Date().toISOString() };
      } else {
        where.date = { ...where.date, gt: new Date().toISOString() };
      }
    }
    return await this.prisma.publication.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.publication.findUnique({
      where: { id },
    });
  }

  async update(id: number, body: UpdatePublicationDto) {
    return await this.prisma.publication.update({
      where: { id },
      data: body,
    });
  }

  async remove(id: number) {
    const publication = await this.findOne(id);
    if (publication) {
      await this.prisma.publication.delete({
        where: { id },
      });
    }
    return publication;
  }

  async postInPublication(postId: number) {
    return await this.prisma.publication.findFirst({
      where: { postId },
    });
  }

  async mediaInPublication(mediaId: number) {
    return await this.prisma.publication.findFirst({
      where: { mediaId },
    });
  }
}

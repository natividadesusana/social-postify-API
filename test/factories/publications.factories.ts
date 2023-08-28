import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

interface PublicationBody { mediaId: number; postId: number; date: string }

export async function createPublication( app: INestApplication, body: PublicationBody ) {
  return request(app.getHttpServer()).post('/publications').send(body);
}

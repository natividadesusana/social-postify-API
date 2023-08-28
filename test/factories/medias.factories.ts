import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

interface MediaBody { title: string; username: string }

export async function createMedia(app: INestApplication, body: MediaBody) {
  return request(app.getHttpServer()).post('/medias').send(body);
}

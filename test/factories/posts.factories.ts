import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

interface PostsBody { title: string; text: string; image?: string }

export async function createPost(app: INestApplication, body: PostsBody) {
  return request(app.getHttpServer()).post('/posts').send(body);
}

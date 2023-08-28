import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { cleanDB } from '../helpers';
import { createPost } from '../factories/posts.factories';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = await moduleFixture.resolve(PrismaService);
    await cleanDB(prisma);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/posts (POST) => should create a post', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'title',
        text: 'text',
      })
      .expect(HttpStatus.CREATED);
  });

  it('/posts (POST) => should return status 400 when title is not sent', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .send({
        text: 'text',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts (POST) => should return status 400 when text is not sent', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'title',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts (GET) => should return an empty array if no media records exist', async () => {
    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([]);
  });

  it('/posts (GET) => should return status 200 and posts data', async () => {
    const data = {
      title: 'title',
      text: 'text',
      image:
        'https://cbissn.ibict.br/images/phocagallery/galeria2/thumbs/phoca_thumb_l_image03_grd.png',
    };
    await createPost(app, data);

    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          text: expect.any(String),
          image: expect.any(String),
        }),
      ]),
    );
  });

  it('/posts/:id (GET) => should return status 404 if no matching post record', async () => {
    const nonExistentId = 1;

    await request(app.getHttpServer())
      .get(`/posts/${nonExistentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/posts/:id (GET) => should return post data and status 200', async () => {
    const data = {
      title: 'title',
      text: 'text',
    };
    const { body } = await createPost(app, data);

    const response = await request(app.getHttpServer())
      .get(`/posts/${body.id}`)
      .expect(HttpStatus.OK);

    const objectContaining = {
      id: expect.any(Number),
      title: expect.any(String),
      text: expect.any(String),
    };

    if (response.body[0].image) {
      objectContaining['image'] = expect.any(String);
    }

    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining(objectContaining)]),
    );
  });

  it('/posts/:id (PUT) => should update matching record and return status 200', async () => {
    const initialData = {
      title: 'title',
      text: 'text',
    };

    const updatedData = {
      title: 'title',
      text: 'text',
    };
    const { body: createdPost } = await createPost(app, initialData);

    const response = await request(app.getHttpServer())
      .put(`/posts/${createdPost.id}`)
      .send(updatedData)
      .expect(HttpStatus.OK);

    const objectContaining = {
      id: createdPost.id,
      title: updatedData.title,
      text: updatedData.text,
      image: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };

    if (response.body.image !== null) {
      objectContaining['image'] = expect.any(String);
    }
    expect(response.body).toEqual(objectContaining);
  });

  it('/posts/:id (PUT) => should return status 404 if no matching post record', async () => {
    const nonExistentId = 11;

    const updatedData = {
      title: 'title',
      text: 'text',
    };

    await request(app.getHttpServer())
      .put(`/posts/${nonExistentId}`)
      .send(updatedData)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/posts/:id (DELETE) => should delete matching record and return status 200', async () => {
    const data = {
      title: 'title',
      text: 'text',
    };

    const { body: createdPost } = await createPost(app, data);

    await request(app.getHttpServer())
      .delete(`/posts/${createdPost.id}`)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/posts/:id (DELETE) => should return status 404 if no matching post record', async () => {
    const nonExistentId = 11;

    await request(app.getHttpServer())
      .delete(`/posts/${nonExistentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

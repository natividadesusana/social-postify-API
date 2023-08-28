import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { cleanDB } from '../helpers';
import { createMedia } from '../factories/medias.factories';
import { createPost } from '../factories/posts.factories';
import { createPublication } from '../factories/publications.factories';

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

  it('/publications (POST) => should create a publication', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });
    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    return request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: media.id,
        postId: post.id,
        date: date.toISOString(),
      })
      .expect(HttpStatus.CREATED);
  });

  it('/publications (POST) => should return status 400 when mediaId is not sent', async () => {
    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    return request(app.getHttpServer())
      .post('/publications')
      .send({
        postId: post.id,
        date: date.toISOString(),
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (POST) => should return status 400 when PostId is not sent', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    return request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: media.id,
        date: date.toISOString(),
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (POST) => should return status 400 when date is not sent', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });
    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    return request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: media.id,
        postId: post.id,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (POST) => should return status 404 when mediaId has no record', async () => {
    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    return request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: 11,
        postId: post.id,
        date: date.toISOString(),
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications (POST) => should return status 404 when postId has no record', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    return request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: media.id,
        postId: 99,
        date: date.toISOString(),
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications (GET) => should return status 200 and publications data', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    const data = {
      mediaId: media.id,
      postId: post.id,
      date: date.toISOString(),
    };
    await createPublication(app, data);

    const response = await request(app.getHttpServer())
      .get('/publications')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          mediaId: expect.any(Number),
          postId: expect.any(Number),
          date: expect.any(String),
        }),
      ]),
    );
  });

  it('/publications (GET) => should return an empty array if no publications records exist', async () => {
    const response = await request(app.getHttpServer())
      .get('/publications')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([]);
  });

  it('/publications/:id (GET) => should return status 200 and publication data', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    const data = {
      mediaId: media.id,
      postId: post.id,
      date: date.toISOString(),
    };
    const { body: publication } = await createPublication(app, data);

    const response = await request(app.getHttpServer())
      .get(`/publications/${publication.id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          mediaId: expect.any(Number),
          postId: expect.any(Number),
          date: expect.any(String),
        }),
      ]),
    );
  });

  it('/publications/:id (GET) => should return status 404 if no matching publication record', async () => {
    const nonExistentId = 11;

    await request(app.getHttpServer())
      .get(`/publications/${nonExistentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (PUT) => should not update a record of a published publication and return status 403', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const publishedDate = new Date();
    publishedDate.setHours(publishedDate.getHours() - 24);

    const data = {
      mediaId: media.id,
      postId: post.id,
      date: publishedDate.toISOString(),
    };
    const { body: publishedPublication } = await createPublication(app, data);

    await request(app.getHttpServer())
      .put(`/publications/${publishedPublication.id}`)
      .send(data)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/publications/:id (PUT) => should return status 404 if no matching publication record', async () => {
    const nonExistentId = 11;

    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    await request(app.getHttpServer())
      .put(`/publications/${nonExistentId}`)
      .send({
        mediaId: media.id,
        postId: post.id,
        date: new Date().toISOString(),
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (PUT) => should return status 404 if no matching mediaId and postId', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    const data = {
      mediaId: media.id,
      postId: post.id,
      date: date.toISOString(),
    };

    const { body: publication } = await createPublication(app, data);

    await request(app.getHttpServer())
      .put(`/publications/${publication.id}`)
      .send({
        mediaId: 11,
        postId: 11,
        date: new Date().toISOString(),
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (DELETE) => should delete matching record and return status 200', async () => {
    const { body: media } = await createMedia(app, {
      title: 'title',
      username: 'username',
    });

    const { body: post } = await createPost(app, {
      title: 'title',
      text: 'text',
    });

    const date = new Date();
    date.setHours(date.getHours() + 24);

    const data = {
      mediaId: media.id,
      postId: post.id,
      date: date.toISOString(),
    };

    const { body: publication } = await createPublication(app, data);

    await request(app.getHttpServer())
      .delete(`/publications/${publication.id}`)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/publications/${publication.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (DELETE) => should return status 404 if no matching publication record', async () => {
    const nonExistentId = 11;

    await request(app.getHttpServer())
      .delete(`/publications/${nonExistentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

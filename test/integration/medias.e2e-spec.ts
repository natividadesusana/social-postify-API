import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { cleanDB } from '../helpers';
import { createMedia } from '../factories/medias.factories';

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

  it('/medias (POST) => should create a media', () => {
    return request(app.getHttpServer())
      .post('/medias')
      .send({
        title: 'title',
        username: 'username',
      })
      .expect(HttpStatus.CREATED);
  });

  it('/medias (POST) => should return status 400 when some required data is not sent', () => {
    return request(app.getHttpServer())
      .post('/medias')
      .send({
        username: 'username',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/medias (POST) => should return status 400 when some required data is not sent', () => {
    return request(app.getHttpServer())
      .post('/medias')
      .send({
        title: 'title',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/medias (POST) => should return status 409 when there is a record with the same combination of title and username', async () => {
    const data = {
      title: 'title',
      username: 'username',
    };
    await createMedia(app, data);

    return request(app.getHttpServer())
      .post('/medias')
      .send(data)
      .expect(HttpStatus.CONFLICT);
  });

  it('/medias (GET) => should return an empty array if no media records exist', async () => {
    const response = await request(app.getHttpServer())
      .get('/medias')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([]);
  });

  it('/medias (GET) => should return status 200 and medias data', async () => {
    const data = {
      title: 'title',
      username: 'username',
    };
    await createMedia(app, data);

    const response = await request(app.getHttpServer())
      .get('/medias')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          username: expect.any(String),
        }),
      ]),
    );
  });

  it('/medias/:id (GET) => should return status 404 if no matching media record', async () => {
    const nonExistentId = 1;

    await request(app.getHttpServer())
      .get(`/medias/${nonExistentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/medias/:id (GET) => should return media data and status 200', async () => {
    const data = {
      title: 'title',
      username: 'username',
    };
    const { body } = await createMedia(app, data);

    const response = await request(app.getHttpServer())
      .get(`/medias/${body.id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      id: expect.any(Number),
      title: expect.any(String),
      username: expect.any(String),
    });
  });

  it('/medias/:id (PUT) => should update matching record and return status 200', async () => {
    const initialData = {
      title: 'title',
      username: 'username',
    };

    const updatedData = {
      title: 'titleUpdate',
      username: 'usernameUpdate',
    };
    const { body: createdMedia } = await createMedia(app, initialData);

    const response = await request(app.getHttpServer())
      .put(`/medias/${createdMedia.id}`)
      .send(updatedData)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      id: createdMedia.id,
      title: updatedData.title,
      username: updatedData.username,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/medias/:id (PUT) => should return status 404 if no matching media record', async () => {
    const nonExistentId = 11;

    const updatedData = {
      title: 'Updated-title',
      username: 'updated-username',
    };

    await request(app.getHttpServer())
      .put(`/medias/${nonExistentId}`)
      .send(updatedData)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/medias/:id (PUT) => should return status 409 if update violates unique constraints', async () => {
    const existingMedia1 = {
      title: 'Existing Media 1',
      username: 'existing-username-1',
    };

    const existingMedia2 = {
      title: 'Existing Media 2',
      username: 'existing-username-2',
    };

    const { body: media1 } = await createMedia(app, existingMedia1);
    await createMedia(app, existingMedia2);

    const updatedData = {
      title: existingMedia2.title,
      username: existingMedia2.username,
    };

    await request(app.getHttpServer())
      .put(`/medias/${media1.id}`)
      .send(updatedData)
      .expect(HttpStatus.CONFLICT);
  });

  it('/medias/:id (DELETE) => should delete matching record and return status 200', async () => {
    const data = {
      title: 'title',
      username: 'username',
    };

    const { body: createdMedia } = await createMedia(app, data);

    await request(app.getHttpServer())
      .delete(`/medias/${createdMedia.id}`)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/medias/${createdMedia.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/medias/:id (DELETE) => should return status 404 if no matching media record', async () => {
    const nonExistentId = 11;

    await request(app.getHttpServer())
      .delete(`/medias/${nonExistentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

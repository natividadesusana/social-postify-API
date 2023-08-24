import { Test, TestingModule } from '@nestjs/testing';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';

describe('PublicationsController', () => {
  let controller: PublicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationsController],
      providers: [PublicationsService],
    }).compile();

    controller = module.get<PublicationsController>(PublicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Audio2faceGateway } from './audio2face.gateway';
import { Audio2faceService } from './audio2face.service';

describe('Audio2faceGateway', () => {
  let gateway: Audio2faceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Audio2faceGateway, Audio2faceService],
    }).compile();

    gateway = module.get<Audio2faceGateway>(Audio2faceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

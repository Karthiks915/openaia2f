import { Test, TestingModule } from '@nestjs/testing';
import { Audio2faceService } from './audio2face.service';

describe('Audio2faceService', () => {
  let service: Audio2faceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Audio2faceService],
    }).compile();

    service = module.get<Audio2faceService>(Audio2faceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiGateway } from './openai.gateway';
import { OpenaiService } from './openai.service';

describe('OpenaiGateway', () => {
  let gateway: OpenaiGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenaiGateway, OpenaiService],
    }).compile();

    gateway = module.get<OpenaiGateway>(OpenaiGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

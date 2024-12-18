import { WebSocketGateway } from '@nestjs/websockets';
import { OpenaiService } from './openai.service';

@WebSocketGateway()
export class OpenaiGateway {
  constructor(private readonly openaiService: OpenaiService) {}
}

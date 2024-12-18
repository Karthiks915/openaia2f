import { WebSocketGateway } from '@nestjs/websockets';
import { Audio2faceService } from './audio2face.service';

@WebSocketGateway()
export class Audio2faceGateway {
  constructor(private readonly audio2faceService: Audio2faceService) {}
}

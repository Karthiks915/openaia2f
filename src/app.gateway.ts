// src/app.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OpenaiService } from './openai/openai.service';
import { Audio2faceService } from './audio2face/audio2face.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private openAIReady = false;

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly audio2faceService: Audio2faceService,
  ) {}

  async onModuleInit() {
    try {
      await this.openaiService.connectToOpenAI();
      this.openAIReady = true;
      this.logger.log('Connected to Open AI, Initializing Livelink now');
      await this.audio2faceService.initLiveLink();
      this.logger.log('Livelink Initialised!');
    } catch (error) {
      this.logger.error('Error during Module Init', error);
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('audio_data')
  async handleAudioData(
    @MessageBody() audioData: string,
    client: Socket,
  ): Promise<void> {
    this.logger.log(`Received audio data with length of ${audioData.length}`);

    // 1. Send audio data to OpenAI Realtime API
    if (this.openAIReady) {
      //TODO: Need to send proper initialization events to OpenAI, for now just send initial audio
      this.openaiService.sendMessage({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_audio', audio: audioData }],
        },
      });

      this.openaiService.sendMessage({
        type: 'response.create',
        response: {
          modalities: ['text'],
        },
      });
    } else {
      this.logger.warn('OpenAI API connection not ready yet!');
      return;
    }

    //2.  send the audio data to Audio2Face REST API for Streaming
    try {
      await this.audio2faceService.pushAudioTrack(audioData, 44100, 'instance'); //TODO: Replace with actual instance.
    } catch (error) {
      this.logger.error('Error pushing audio to audio2face', error);
      client.emit('error', 'Error pushing audio to Audio2Face');
    }
  }

  onModuleDestroy() {
    this.openaiService.closeConnection();
  }
}

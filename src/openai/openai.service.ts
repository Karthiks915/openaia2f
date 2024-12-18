// src/openai/openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { config } from 'dotenv';

config(); // Load env vars

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private ws: WebSocket;
  private readonly apiKey: string = process.env.OPENAI_API_KEY;

  async connectToOpenAI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const apiUrl = 'wss://api.openai.com/v1/realtime/sessions';

      this.ws = new WebSocket(apiUrl, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      this.ws.on('open', () => {
        this.logger.log('Connected to OpenAI Realtime API');
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          this.logger.error('Error parsing message from OpenAI', error);
        }
      });

      this.ws.on('error', (error) => {
        this.logger.error('Error connecting to OpenAI Realtime API', error);
        reject(error);
      });

      this.ws.on('close', () => {
        this.logger.log('Disconnected from OpenAI Realtime API');
      });
    });
  }

  // Send a message to the OpenAI Realtime API
  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.logger.warn('WebSocket is not open, can not send the message');
    }
  }

  // Handle Messages from Open AI
  private handleMessage(message: any) {
    this.logger.log(`Recieved message from OpenAI. Type: ${message.type}`);
    if (message.type === 'response.done') {
      if (
        message.response?.output &&
        message.response.output[0].type === 'function_call'
      ) {
        this.logger.log(
          `Function call Recieved: ${JSON.stringify(message.response.output[0])}`,
        );
      }
    }
  }

  // Close WebSocket connection
  closeConnection(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

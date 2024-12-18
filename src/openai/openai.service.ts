// src/openai/openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { config } from 'dotenv';
import axios from 'axios';

config(); // Load env vars

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private ws: WebSocket;
  private readonly apiKey: string = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'wss://api.openai.com/v1/realtime/sessions';
  private ephemeralKey: string | null = null;
  private sessionInstructions: string | null = null;

  async getEphemeralKey(): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/realtime/sessions',
        {
          model: 'gpt-4o-realtime-preview-2024-12-17',
          voice: 'verse',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.ephemeralKey = response.data.client_secret.value;
      this.logger.log('Recieved Ephemeral Key: ' + this.ephemeralKey);
      return this.ephemeralKey;
    } catch (error) {
      this.logger.error('Error fetching Ephemeral key', error);
      throw error;
    }
  }

  async connectToOpenAI(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.ephemeralKey) {
        try {
          await this.getEphemeralKey();
        } catch (error) {
          this.logger.error('Could not fetch Ephemeral Key', error);
          reject(error);
          return;
        }
      }

      this.ws = new WebSocket(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${this.ephemeralKey}`,
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

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.logger.warn('WebSocket is not open, can not send the message');
    }
  }

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
        // Handle function call.
      }
    }
  }
  setInstructions(instructions: string): void {
    this.sessionInstructions = instructions;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'session.update',
        session: {
          instructions: this.sessionInstructions,
          tools: [
            {
              type: 'function',
              name: 'play_animation',
              description: "Controls the character's emotional animation state",
              parameters: {
                type: 'object',
                properties: {
                  emotion: {
                    type: 'string',
                    enum: ['angry', 'happy', 'neutral'],
                    description: 'The emotional state to animate',
                  },
                },
                required: ['emotion'],
              },
            },
          ],
        },
      });
    } else {
      this.logger.warn('Web Socket not open, can not set instructions!');
    }
  }

  closeConnection(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

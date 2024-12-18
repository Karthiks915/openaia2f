// src/audio2face/audio2face.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';

config(); // Load env vars

@Injectable()
export class Audio2faceService {
  private readonly logger = new Logger(Audio2faceService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly audio2faceApiUrl: string = process.env.AUDIO2FACE_API_URL;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.audio2faceApiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async initLiveLink() {
    try {
      // Send a short dummy audio for initialisation
      this.logger.log('Initializing Livelink with dummy audio');
      const dummyAudio = 'test';
      await this.pushAudioTrack(dummyAudio, 44100, 'instance'); // Replace with actual instance name.

      // Enable LiveLink
      this.logger.log('Enabling Livelink streaming');
      const enableLivelinkData = {
        node_path: '/World/audio2face/StreamLivelink',
        value: true,
      };

      const livelinkResult = await this.axiosInstance.post(
        '/A2F/Exporter/Act',
        enableLivelinkData,
      );

      this.logger.log(
        `Livelink initialised: ${JSON.stringify(livelinkResult.data)}`,
      );
    } catch (error) {
      this.logger.error('Error initing livelink', error);
      throw error;
    }
  }

  // Send audio data to Audio2Face
  async pushAudioTrack(
    audioData: string,
    sampleRate: number,
    instanceName: string,
  ): Promise<any> {
    this.logger.log(
      `Pushing audio track with length: ${audioData.length} to instance: ${instanceName}`,
    );
    try {
      const response = await this.axiosInstance.post(
        '/A2F/Exporter/push_audio_track_stream',
        {
          data: audioData,
          samplerate: sampleRate,
          instance_r: instanceName, // Replace with actual instance name
        },
      );

      this.logger.log(`Pushed Audio Track: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error pushing audio track`, error);
      throw error;
    }
  }
}

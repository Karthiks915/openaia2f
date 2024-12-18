// src/audio2face/audio2face.module.ts
import { Module } from '@nestjs/common';
import { Audio2faceService } from './audio2face.service';

@Module({
  providers: [Audio2faceService],
  exports: [Audio2faceService],
})
export class Audio2faceModule {}

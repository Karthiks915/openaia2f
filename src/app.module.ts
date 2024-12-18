// src/app.module.ts
import { Module } from '@nestjs/common';
import { OpenaiModule } from './openai/openai.module';
import { Audio2faceModule } from './audio2face/audio2face.module';
import { AppGateway } from './app.gateway';
@Module({
  imports: [OpenaiModule, Audio2faceModule],
  providers: [AppGateway],
})
export class AppModule {}

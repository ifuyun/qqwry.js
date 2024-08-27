import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import APP_CONFIG from './config/app.config';
import ENV_CONFIG from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `env/${process.env.ENV}.env`,
      load: [ENV_CONFIG, APP_CONFIG]
    })
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService]
})
export class AppModule {}

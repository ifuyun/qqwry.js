import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config: ConfigService = app.select(AppModule).get(ConfigService, { strict: true });

  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.text({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.enable('trust proxy');

  await app.listen(config.get('app.port'), config.get('app.host'), () => {
    console.info(`Server listening on: ${config.get('app.host')}:${config.get('app.port')}`);
  });
}
bootstrap();

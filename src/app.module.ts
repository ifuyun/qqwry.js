import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import APP_CONFIG from './config/app.config';
import ENV_CONFIG from './config/env.config';
import { IpModule } from './modules/ip/ip.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `env/${process.env.ENV}.env`,
      load: [ENV_CONFIG, APP_CONFIG]
    }),
    IpModule
  ],
  providers: [ConfigService],
  controllers: []
})
export class AppModule {}

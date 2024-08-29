import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { IpModel } from '../../models/ip.model';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';
import { DbConfigService } from './db-config.service';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [LoggerModule],
      inject: [ConfigService, LoggerService],
      useClass: DbConfigService
    }),
    SequelizeModule.forFeature([IpModel])
  ],
  exports: [SequelizeModule]
})
export class DatabaseModule {}

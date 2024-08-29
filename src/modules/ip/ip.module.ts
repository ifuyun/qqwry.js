import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';
import { IpController } from './ip.controller';
import { IpService } from './ip.service';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [IpController],
  providers: [IpService]
})
export class IpModule {}

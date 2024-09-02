import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';
import { IpController } from './ip.controller';
import { IpService } from './ip.service';

@Module({
  imports: [DatabaseModule, LoggerModule, CommonModule],
  controllers: [IpController],
  providers: [IpService]
})
export class IpModule {}

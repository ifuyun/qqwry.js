import { Controller, Get, Header, Post, Put, Query } from '@nestjs/common';
import { TrimPipe } from '../../pipes/trim.pipe';
import { IpService } from './ip.service';

@Controller('ips')
export class IpController {
  constructor(private readonly ipService: IpService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  searchIP(
    @Query('ip', new TrimPipe()) ips: string | string[],
    @Query('s', new TrimPipe()) s: string
  ) {
    ips = Array.isArray(ips) ? ips : [ips];

    return {
      list: this.ipService.getIPs(ips, s === '1'),
      version: this.ipService.getVersion()
    };
  }

  @Get('info')
  @Header('Content-Type', 'application/json')
  getIPDBInfo() {
    return this.ipService.getIPDBInfo();
  }

  @Post()
  @Header('Content-Type', 'application/json')
  async updateIPDB() {
    await this.ipService.updateIPDB();

    return {
      code: 0
    };
  }

  @Put()
  @Header('Content-Type', 'application/json')
  async saveIPs() {
    await this.ipService.saveIPs();

    return {
      code: 0
    };
  }
}

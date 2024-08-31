import { Controller, Get, Header, Post, Query } from '@nestjs/common';
import { TrimPipe } from '../../pipes/trim.pipe';
import { IPInfo } from './ip.interface';
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
    const simple = s === '1';
    const result: Record<string, IPInfo> = {};

    ips = Array.isArray(ips) ? ips : [ips];
    ips.forEach((ip) => {
      const data = this.ipService.getIP(ip, simple);
      result[data.IPStr] = data;
    });

    return result;
  }

  @Get('info')
  @Header('Content-Type', 'application/json')
  getInfo() {
    return this.ipService.getInfo();
  }

  @Post()
  @Header('Content-Type', 'application/json')
  async saveIPs() {
    await this.ipService.saveIPs();

    return {
      code: 0
    };
  }
}

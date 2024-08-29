import { Controller, Get, Header, Query } from '@nestjs/common';
import { TrimPipe } from '../../pipes/trim.pipe';
import { IPInfo } from './ip.interface';
import { IpService } from './ip.service';

@Controller('ip')
export class IpController {
  constructor(private readonly ipService: IpService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  searchIP(
    @Query('ip', new TrimPipe()) ips: string | string[],
    @Query('s', new TrimPipe()) s: string
  ) {
    const result: Record<string, IPInfo> = {};
    const simple = s === '1';

    ips = Array.isArray(ips) ? ips : [ips];
    ips.forEach((ip) => {
      const data = this.ipService.getIPDetail(ip, simple);
      result[data.IPStr] = data;
    });

    return result;
  }

  @Get('info')
  @Header('Content-Type', 'application/json')
  getInfo() {
    return this.ipService.getInfo();
  }

  @Get('update')
  @Header('Content-Type', 'application/json')
  async saveIPs() {
    await this.ipService.saveIPs();

    return {
      code: 0
    };
  }
}

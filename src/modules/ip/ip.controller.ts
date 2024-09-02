import { Controller, Get, Header, Post, Put, Query } from '@nestjs/common';
import { ErrorMessage } from '../../common/error-message.enum';
import { ResponseCode } from '../../common/response-code.enum';
import { BadRequestException } from '../../exceptions/bad-request.exception';
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

    const valid = this.ipService.checkIPs(ips);
    if (!valid) {
      throw new BadRequestException(ErrorMessage.IP_INVALID, ResponseCode.PARAM_PATTERN_INVALID);
    }

    return {
      list: this.ipService.getIPs(ips, s !== '0'),
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

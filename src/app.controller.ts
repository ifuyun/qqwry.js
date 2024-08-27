import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { TrimPipe } from './trim.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  searchIP(@Query('ip', new TrimPipe()) ip: string) {
    return this.appService.getIPDetail(ip);
  }

  @Get('info')
  getInfo() {
    return this.appService.getInfo();
  }
}

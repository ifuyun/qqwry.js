import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { Agent } from 'https';

@Injectable()
export class CommonService {
  constructor(private readonly httpService: HttpService) {}

  async saveFileFromURL(url: string, path: string) {
    const writer = createWriteStream(path);
    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
      httpsAgent: new Agent({
        rejectUnauthorized: false
      })
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}

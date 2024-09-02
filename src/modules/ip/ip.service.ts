import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { readFileSync, renameSync, rmSync } from 'fs';
import { decode } from 'iconv-lite';
import { Sequelize } from 'sequelize-typescript';
import { DbQueryErrorException } from '../../exceptions/db-query-error.exception';
import { InternalServerErrorException } from '../../exceptions/internal-server-error.exception';
import { generateId } from '../../helpers/helper';
import { IpModel } from '../../models/ip.model';
import { IP_LOCALHOST_4, IP_LOCALHOST_6, MAX_IP_VALUE } from '../common/common.constant';
import { CommonService } from '../common/common.service';
import { IPAddress, IPInfo } from './ip.interface';

@Injectable()
export class IpService {
  private fileBuffer: Buffer;
  private firstIndex: number;
  private lastIndex: number;
  private recordCount: number;

  constructor(
    @InjectModel(IpModel)
    private readonly ipModel: typeof IpModel,
    private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService
  ) {
    this.init();
  }

  getIP(ip: string | number, simple = true): IPInfo {
    if (typeof ip === 'number') {
      if (ip < 0 || ip > MAX_IP_VALUE) {
        return null;
      }
    } else {
      if (/^\d{1,10}$/.test(ip)) {
        ip = Number(ip);
        if (ip > MAX_IP_VALUE) {
          return null;
        }
      } else if (ip === IP_LOCALHOST_6) {
        ip = IP_LOCALHOST_4;
      } else if (!this.isValidIP(ip)) {
        return null;
      }
    }

    const ipNum = typeof ip === 'string' ? this.ipToNumber(ip) : ip;
    const ipStr = typeof ip === 'string' ? ip : this.ipToString(ip);

    return {
      IP: ipNum,
      IPStr: ipStr,
      ...this.parseIP(this.searchIP(ipNum), simple)
    };
  }

  getIPs(ips: string[], simple = true) {
    const result: Record<string, IPInfo> = {};
    ips.forEach((ip) => {
      const data = this.getIP(ip, simple);
      result[data.IPStr] = data;
    });
    if (result[IP_LOCALHOST_4]) {
      result[IP_LOCALHOST_6] = result[IP_LOCALHOST_4];
    }

    return result;
  }

  getIPDBInfo() {
    return {
      count: this.recordCount + 1,
      version: this.getVersion()
    };
  }

  getVersion(): string {
    const record = this.getRecord(this.readUIntLE(this.lastIndex + 4, 3));
    const version = record.B;

    return version.substring(0, 4) + '-' + version.substring(5, 7) + '-' + version.substring(8, 10);
  }

  isValidIP(ip: string): boolean {
    const regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

    return regex.test(ip);
  }

  ipToNumber(ip: string) {
    const parts = ip.split('.').map(Number);

    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  }

  ipToString(ipNum: number): string {
    return [(ipNum >> 24) & 255, (ipNum >> 16) & 255, (ipNum >> 8) & 255, ipNum & 255].join('.');
  }

  @Cron('0 4 * * 0', {
    name: 'updateIPDB'
  })
  async updateIPDB() {
    try {
      const datPath = this.configService.get('env.ipDatPath');
      const tmpPath = this.configService.get('env.ipDatTempPath');

      // 确保临时文件不存在
      rmSync(tmpPath, {
        force: true,
        maxRetries: 3
      });
      await this.commonService.saveFileFromURL(this.configService.get('env.ipDatUrl'), tmpPath);

      // 先删除原文件
      rmSync(datPath, {
        force: true,
        maxRetries: 3
      });
      // 再重命名
      renameSync(tmpPath, datPath);

      this.init();
    } catch (e) {
      throw new InternalServerErrorException({
        logData: {
          message: 'IP更新失败',
          stack: e.stack
        }
      });
    }
  }

  saveIPs() {
    return this.sequelize
      .transaction(async (t) => {
        for (let i = 0; i <= this.recordCount; i += 1) {
          const ip = this.parseIP(this.firstIndex + 7 * i);

          await this.ipModel.create(
            {
              ipId: generateId(),
              ipStart: ip.startIP,
              ipEnd: ip.endIP,
              ipCountry: ip.country,
              ipProvince: ip.province,
              ipCity: ip.city,
              ipDistrict: ip.district,
              ipIsp: ip.isp
            },
            { transaction: t }
          );
        }
      })
      .then(() => true)
      .catch(async (e) => {
        throw new DbQueryErrorException({
          message: 'IP保存失败',
          stack: e.stack
        });
      });
  }

  private init() {
    this.fileBuffer = readFileSync(this.configService.get('env.ipDatPath'));
    this.firstIndex = this.readUint32LE(0);
    this.lastIndex = this.readUint32LE(4);
    this.recordCount = (this.lastIndex - this.firstIndex) / 7;
  }

  private searchIP(ip: number): number {
    let low = 0;
    let high = this.recordCount;

    // 使用二分查找查找IP所在的区间
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midOffset = this.firstIndex + mid * 7;

      const startIP = this.readUIntLE(midOffset, 4);
      const recordOffset = this.readUIntLE(midOffset + 4, 3);
      const endIP = this.readUIntLE(recordOffset, 4);

      if (ip < startIP) {
        high = mid - 1;
      } else if (ip > endIP) {
        low = mid + 1;
      } else {
        return midOffset;
      }
    }

    return this.lastIndex;
  }

  private parseIP(recordOffset: number, simple = true): IPInfo {
    const startIP = this.readUIntLE(recordOffset, 4);
    const startIPStr = this.ipToString(startIP);
    const offset = this.readUIntLE(recordOffset + 4, 3);
    const endIP = this.readUIntLE(offset, 4);
    const endIPStr = this.ipToString(endIP);

    const data = this.getRecord(offset);
    let dataA = data.A;
    let dataB = data.B;

    if (startIPStr === '255.255.255.0') {
      dataA = 'IANA';
      dataB = '保留地址';
    }

    if (dataA === ' CZ88.NET' || dataA === '纯真网络') {
      dataA = '';
    }
    if (dataB === ' CZ88.NET') {
      dataB = '';
    }

    if (simple) {
      return {
        ...this.parseDataA(dataA),
        isp: dataB
      };
    }

    return {
      startIP,
      startIPStr,
      endIP,
      endIPStr,
      ...this.parseDataA(dataA),
      isp: dataB
    };
  }

  private getRecord(offset: number) {
    const recordOffset = offset + 4;
    let dataA = '';
    let dataB = '';
    let flag = this.fileBuffer[recordOffset];

    if (flag === 1) {
      // dataA与dataB均重定向
      const newOffset = this.readUIntLE(recordOffset + 1, 3);
      flag = this.fileBuffer[newOffset];

      if (flag === 2) {
        // dataA再次重定向
        const result = this.readString(this.readUIntLE(newOffset + 1, 3));
        dataA = result.str;
        dataB = this.getDataB(newOffset + 4);
      } else {
        // dataA无重定向
        const result = this.readString(newOffset);
        dataA = result.str;
        dataB = this.getDataB(result.offset);
      }
    } else if (flag === 2) {
      // dataA重定向，dataB无重定向
      const newOffset = this.readUIntLE(recordOffset + 1, 3);
      const result = this.readString(newOffset);
      dataA = result.str;
      dataB = this.getDataB(recordOffset + 4);
    } else {
      // dataA、dataB均无重定向
      const result = this.readString(recordOffset);
      dataA = result.str;
      dataB = this.getDataB(result.offset);
    }

    return {
      A: decode(Buffer.from(dataA, 'binary'), 'gbk'),
      B: decode(Buffer.from(dataB, 'binary'), 'gbk')
    };
  }

  private getDataB(offset: number): string {
    const flag = this.fileBuffer[offset];
    if (flag === 0) {
      // dataB无信息
      return '';
    }
    if (flag === 1 || flag === 2) {
      // dataB重定向
      const newOffset = this.readUIntLE(offset + 1, 3);
      return this.readString(newOffset).str;
    }
    // dataB无重定向
    return this.readString(offset).str;
  }

  private parseDataA(dataA: string): IPAddress {
    const parts = dataA.split('–');

    return {
      country: parts[0],
      province: parts[1] || '',
      city: parts[2] || '',
      district: parts[3] || ''
    };
  }

  private readString(offset: number) {
    let str = '';
    while (this.fileBuffer[offset] !== 0) {
      str += String.fromCharCode(this.fileBuffer[offset]);
      offset++;
    }

    return {
      str,
      offset: offset + 1
    };
  }

  private readUIntLE(offset: number, length: number): number {
    return this.fileBuffer.readUIntLE(offset, length);
  }

  private readUint32LE(offset: number) {
    return this.fileBuffer.readUInt32LE(offset);
  }
}

/**
 * 数据库配置
 * @author Fuyun
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions, SequelizeOptionsFactory } from '@nestjs/sequelize';
import { LoggerService } from '../logger/logger.service';

/**
 * Can't return config directly, it must be defined as a Class,
 * otherwise, LoggerService will be undefined.
 */
@Injectable()
export class DbConfigService implements SequelizeOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {}

  private dbConfig: SequelizeModuleOptions = {
    dialect: 'mysql',
    host: this.configService.get('DB_HOST'),
    port: this.configService.get('DB_PORT') || 3306,
    username: this.configService.get('DB_USERNAME'),
    password: this.configService.get('DB_PASSWORD'),
    database: this.configService.get('DB_DATABASE'),
    timezone: '+08:00',
    pool: {
      max: 5,
      min: 0,
      idle: 30000
    },
    synchronize: false,
    autoLoadModels: true,
    retryAttempts: 3
  };

  createSequelizeOptions(): SequelizeModuleOptions {
    if (this.configService.get('app.dbLog')) {
      this.dbConfig.logging = (sql) => {
        this.logger.getDbLogger().trace(sql);
      };
    } else {
      this.dbConfig.logging = false;
    }
    return this.dbConfig;
  }
}

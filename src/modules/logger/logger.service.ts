import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Appender, configure, getLogger, Logger } from 'log4js';
import * as moment from 'moment';
import { LoggerName } from './logger.enum';
import { LogData } from './logger.interface';

@Injectable()
export class LoggerService {
  private readonly loggerNames = Object.freeze([LoggerName.ACCESS, LoggerName.SYSTEM, LoggerName.DB]);
  private readonly loggerContextKey = 'logDay';
  private loggers: Record<LoggerName | string, Logger> = {};
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const appenders: { [name: string]: Appender } = {};
    const categories: { [name: string]: any } = {
      default: {
        appenders: ['system'],
        level: this.configService.get('app.logLevel')
      }
    };
    this.loggerNames.forEach((name) => {
      appenders[name] = {
        type: 'multiFile',
        base: `logs/${name}/`,
        extension: '.log',
        property: this.loggerContextKey,
        compress: false, // backup files will have .gz extension
        maxLogSize: 10485760, // 10MB
        backups: 10 // 默认5
      };
      categories[name] = {
        appenders: [name],
        level: this.configService.get('app.logLevel')
      };
    });
    configure({
      pm2: false,
      pm2InstanceVar: 'NEST_APP_INSTANCE',
      disableClustering: false,
      appenders,
      categories
    });

    this.loggerNames.forEach((name) => {
      this.loggers[name] = getLogger(name);
      this.loggers[name].addContext(this.loggerContextKey, moment().format('YYYY-MM-DD'));
    });
    this.logger = this.loggers[LoggerName.SYSTEM]; // by default
  }

  getSystemLogger(updateContext = false) {
    const logger = this.loggers[LoggerName.SYSTEM];
    if (updateContext) {
      logger.clearContext();
      logger.addContext(this.loggerContextKey, moment().format('YYYY-MM-DD'));
    }

    return logger;
  }

  getAccessLogger(updateContext = false) {
    const logger = this.loggers[LoggerName.ACCESS];
    if (updateContext) {
      logger.clearContext();
      logger.addContext(this.loggerContextKey, moment().format('YYYY-MM-DD'));
    }

    return logger;
  }

  getDbLogger(updateContext = false) {
    const logger = this.loggers[LoggerName.DB];
    if (updateContext) {
      logger.clearContext();
      logger.addContext(this.loggerContextKey, moment().format('YYYY-MM-DD'));
    }

    return logger;
  }

  @Cron('0 0 * * *', {
    name: 'updateLoggerContext'
  })
  updateContext() {
    const today = moment().format('YYYY-MM-DD');
    this.loggerNames.forEach((name) => {
      this.loggers[name].clearContext();
      this.loggers[name].addContext(this.loggerContextKey, today);
    });
  }

  formatLog(logData: string | LogData): string {
    const logResult = [''];
    if (typeof logData === 'string') {
      logResult.push(`[Msg] ${logData}`);
    } else {
      if (logData.message) {
        logResult.push(`[Msg] ${logData.message}`);
      }
      if (logData.url) {
        logResult.push(`[URL] ${logData.url}`);
      }
      if (logData.data) {
        logResult.push(`[Data] ${JSON.stringify(logData.data)}`);
      }
      if (logData.visitor) {
        logResult.push(`[User] ${logData.visitor}`);
      }
      if (logData.stack) {
        logResult.push(`[Stack] ${logData.stack}`);
      }
    }

    return logResult.join('\n');
  }

  trace(logData: string | LogData) {
    this.logger.trace(this.formatLog(logData));
  }

  traceRaw(logData: any, ...args: any[]) {
    this.logger.trace(logData, ...args);
  }

  debug(logData: string | LogData) {
    this.logger.debug(this.formatLog(logData));
  }

  debugRaw(logData: any, ...args: any[]) {
    this.logger.debug(logData, ...args);
  }

  info(logData: string | LogData) {
    this.logger.info(this.formatLog(logData));
  }

  infoRaw(logData: any, ...args: any[]) {
    this.logger.info(logData, ...args);
  }

  warn(logData: string | LogData) {
    this.logger.warn(this.formatLog(logData));
  }

  warnRaw(logData: any, ...args: any[]) {
    this.logger.warn(logData, ...args);
  }

  error(logData: string | LogData) {
    this.logger.error(this.formatLog(logData));
  }

  errorRaw(logData: any, ...args: any[]) {
    this.logger.error(logData, ...args);
  }

  fatal(logData: string | LogData) {
    this.logger.fatal(this.formatLog(logData));
  }

  fatalRaw(logData: any, ...args: any[]) {
    this.logger.fatal(logData, ...args);
  }

  mark(logData: string | LogData) {
    this.logger.mark(this.formatLog(logData));
  }

  markRaw(logData: any, ...args: any[]) {
    this.logger.mark(logData, ...args);
  }
}

/**
 * 基本配置信息
 */
import { registerAs } from '@nestjs/config';

const APP_CONFIG = () => ({
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT || '', 10) || 6000,
  logLevel: process.env.LOG_LEVEL || 'TRACE',
  dbLog: process.env.DB_LOG?.toLowerCase().trim() === 'true'
});

export default registerAs('app', APP_CONFIG);

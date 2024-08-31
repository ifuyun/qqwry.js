/**
 * 环境信息
 */
import { registerAs } from '@nestjs/config';

const ENV_CONFIG = () => {
  const environment = (process.env.ENV && process.env.ENV.trim()) || 'development';

  return {
    environment,
    isDev: environment === 'development',
    isProd: environment === 'production',
    ipDatPath: process.env.IP_DAT_PATH
  };
};

export default registerAs('env', ENV_CONFIG);

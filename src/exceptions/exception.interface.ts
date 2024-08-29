import { HttpStatus } from '@nestjs/common';
import { HttpResponseEntity } from '../common/http-response.interface';
import { LogData } from '../modules/logger/logger.interface';

export interface CustomExceptionResponse {
  status?: HttpStatus;
  data: HttpResponseEntity;
  logData?: LogData;
}

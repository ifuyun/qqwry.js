import { HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../common/error-message.enum';
import { ResponseCode } from '../common/response-code.enum';
import { LogData } from '../modules/logger/logger.interface';
import { CustomException } from './custom.exception';
import { CustomExceptionResponse } from './exception.interface';

export class DbQueryErrorException extends CustomException {
  constructor(
    logData: LogData,
    message: string | ErrorMessage = ErrorMessage.DB_QUERY_ERROR,
    resCode: ResponseCode = ResponseCode.DB_QUERY_ERROR
  ) {
    const response: CustomExceptionResponse = {
      data: {
        code: resCode,
        message
      },
      logData
    };
    super(response, HttpStatus.INTERNAL_SERVER_ERROR, resCode);
  }
}

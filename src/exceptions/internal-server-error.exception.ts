import { HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../common/error-message.enum';
import { ResponseCode } from '../common/response-code.enum';
import { CustomException } from './custom.exception';
import { CustomExceptionResponse } from './exception.interface';

export class InternalServerErrorException extends CustomException {
  constructor(
    message: string | ErrorMessage | Partial<CustomExceptionResponse> = ErrorMessage.INTERNAL_SERVER_ERROR,
    resCode: ResponseCode = ResponseCode.INTERNAL_SERVER_ERROR,
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    if (typeof message === 'string') {
      super(message, httpStatus, resCode);
    } else {
      const response: CustomExceptionResponse = {
        status: message.status || httpStatus,
        data: message.data || {
          code: ResponseCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage.INTERNAL_SERVER_ERROR
        },
        logData: message.logData
      };
      super(response, httpStatus, resCode);
    }
  }
}

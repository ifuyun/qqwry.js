import { HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../common/error-message.enum';
import { ResponseCode } from '../common/response-code.enum';
import { CustomException } from './custom.exception';
import { CustomExceptionResponse } from './exception.interface';

export class BadRequestException extends CustomException {
  constructor(
    message: string | ErrorMessage | CustomExceptionResponse = ErrorMessage.BAD_REQUEST,
    resCode: ResponseCode = ResponseCode.BAD_REQUEST,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(message, httpStatus, resCode);
  }
}

import type { Type } from '@nestjs/common'
import { HttpStatus, HttpMessage } from '@enums'
import { getHttpMessage } from '@helpers'
import {
  Exception,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  MethodNotAllowedException,
  RequestTimeoutException,
  ConflictException,
  UnprocessableEntityException,
  TooManyRequestsException,
  InternalServerErrorException,
} from '@exceptions'
import type { ExceptionParams } from '@interfaces'

const exceptions: [Type<Exception>, HttpStatus, string][] = [
  [BadRequestException, HttpStatus.BAD_REQUEST, 'Details of the Exception'],
  [UnauthorizedException, HttpStatus.UNAUTHORIZED, 'Details of the Exception'],
  [ForbiddenException, HttpStatus.FORBIDDEN, 'Details of the Exception'],
  [NotFoundException, HttpStatus.NOT_FOUND, 'Details of the Exception'],
  [MethodNotAllowedException, HttpStatus.METHOD_NOT_ALLOWED, 'Details of the Exception'],
  [RequestTimeoutException, HttpStatus.REQUEST_TIMEOUT, 'Details of the Exception'],
  [ConflictException, HttpStatus.CONFLICT, 'Details of the Exception'],
  [UnprocessableEntityException, HttpStatus.UNPROCESSABLE_ENTITY, 'Details of the Exception'],
  [TooManyRequestsException, HttpStatus.TOO_MANY_REQUESTS, 'Details of the Exception'],
  [InternalServerErrorException, HttpStatus.INTERNAL_SERVER_ERROR, 'Details of the Exception'],
]

describe('Exceptions', (): void => {
  describe('Exception', (): void => {
    const exception = new Exception({
      status: HttpStatus.BAD_REQUEST,
      message: HttpMessage.BAD_REQUEST,
      details: 'Details of the Exception',
    })

    it('should be an instance of Error', (): void => {
      expect(exception).toBeInstanceOf(Error)
    })

    it('should return an object with exception params', (): void => {
      const result: ExceptionParams = {
        status: exception.getStatus(),
        message: exception.getMessage(),
        details: exception.getDetails(),
        exception: exception.getException(),
      }

      expect(result).toStrictEqual({
        status: HttpStatus.BAD_REQUEST,
        message: HttpMessage.BAD_REQUEST,
        details: 'Details of the Exception',
        exception: Exception.name,
      })
    })
  })

  exceptions.forEach(([error, status, details]): void => {
    describe(error.name, (): void => {
      const exception = new error(details)

      it('should be an instance of Exception', (): void => {
        expect(exception).toBeInstanceOf(Exception)
      })

      it('should return an object with exception params', (): void => {
        const result: ExceptionParams = {
          status: exception.getStatus(),
          message: exception.getMessage(),
          details: exception.getDetails(),
          exception: exception.getException(),
        }

        expect(result).toStrictEqual({
          status,
          message: getHttpMessage(status),
          details: 'Details of the Exception',
          exception: error.name,
        })
      })
    })
  })
})

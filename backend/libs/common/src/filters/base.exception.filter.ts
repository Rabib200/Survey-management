import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    let message = 'Internal server error';
    let details = '';

    switch (true) {
      case exception instanceof QueryFailedError:
        message = 'Database query failed';
        details = (exception as QueryFailedError).message;
        this.logger.error(
          `Database Error: ${details}`,
          (exception as QueryFailedError).stack,
        );
        break;

      case exception instanceof BadRequestException:
        const badRequestResponse = (
          exception as BadRequestException
        ).getResponse();
        message =
          typeof badRequestResponse === 'string'
            ? badRequestResponse
            : (badRequestResponse as any).message || message;
        this.logger.warn(`Bad Request: ${message}`);
        break;

      case exception instanceof HttpException:
        const httpExceptionResponse = (
          exception as HttpException
        ).getResponse();
        message =
          typeof httpExceptionResponse === 'string'
            ? httpExceptionResponse
            : (httpExceptionResponse as any).message || message;
        details = (httpExceptionResponse as any).details || '';
        this.logger.error(
          `HttpException: ${message}`,
          (exception as HttpException).stack,
        );
        break;

      default:
        this.logger.error('Unexpected Error', (exception as any).stack);
        break;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      details,
    });
  }
}

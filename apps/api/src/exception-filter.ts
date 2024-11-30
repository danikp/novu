import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CommandValidationException, PinoLogger } from '@novu/application-generic';
import { randomUUID } from 'node:crypto';
import { captureException } from '@sentry/node';
import { ZodError } from 'zod';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { ProcessBulkTriggerCommand } from './app/events/usecases/process-bulk-trigger';

export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.getResponseMetadata(exception);
    const responseBody = this.buildResponseBody(status, request, message, exception);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    status: number,
    request: Request,
    message: string | object | Object,
    exception: unknown
  ): ErrorDto {
    const responseBody = this.buildBaseResponseBody(status, request, message);
    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      return message instanceof Object ? { ...responseBody, ...message } : responseBody;
    }

    return this.build500Error(exception, responseBody);
  }

  private build500Error(exception: unknown, responseBody: ErrorResponseBody) {
    const uuid = this.getUuid(exception);
    this.logError(uuid, exception);

    return { ...responseBody, errorId: uuid };
  }

  private buildBaseResponseBody(
    status: number,
    request: Request,
    message: string | object | Object
  ): ErrorResponseBody {
    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };
  }

  private getResponseMetadata(exception: unknown): ResponseMetadata {
    let status: number;
    let message: string | object;

    if (exception instanceof ZodError) {
      return handleZod(exception);
    }
    if (exception instanceof ZodError) {
      return handleZod(exception);
    }
    if (exception instanceof CommandValidationException) {
      return this.handleCommandValidation(exception);
    }

    if (exception instanceof HttpException && !(exception instanceof InternalServerErrorException)) {
      status = exception.getStatus();
      message = exception.getResponse();

      return { status, message };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Internal server error, contact support and provide them with the errorId`,
    };
  }
  private handleCommandValidation(exception: CommandValidationException): ResponseMetadata {
    const DO_NOT_TRACK_CLASSES = [ProcessBulkTriggerCommand.name];

    let uuid: string | undefined;
    if (!DO_NOT_TRACK_CLASSES.includes(exception.className)) {
      uuid = this.getUuid(exception);
      this.logError(uuid, exception);
    }

    return {
      message: {
        message: exception.message,
        cause: exception.constraintsViolated,
        uuid,
      },
      status: HttpStatus.BAD_REQUEST,
    };
  }

  private logError(uuid: string, exception: unknown) {
    this.logger.error(
      {
        errorId: uuid,
        /**
         * It's important to use `err` as the key, pino (the logger we use) will
         * log an empty object if the key is not `err`
         *
         * @see https://github.com/pinojs/pino/issues/819#issuecomment-611995074
         */
        err: exception,
      },
      `Unexpected exception thrown`,
      'Exception'
    );
  }

  private getUuid(exception: unknown) {
    if (process.env.SENTRY_DSN) {
      try {
        return captureException(exception);
      } catch (e) {
        return randomUUID();
      }
    } else {
      return randomUUID();
    }
  }
}

/**
 * Interface representing the structure of an error response.
 */
export class ErrorDto {
  statusCode: number;
  timestamp: string;

  /**
   * Optional unique identifier for the error, useful for tracking using sentry and newrelic, only available for 500
   */
  errorId?: string;

  path: string;
  message: string | object;
}

function handleZod(exception: ZodError) {
  const status = HttpStatus.BAD_REQUEST; // Set appropriate status for ZodError
  const message = {
    errors: exception.errors.map((err) => ({
      message: err.message,
      path: err.path,
    })),
  };

  return { status, message };
}
class ResponseMetadata {
  status: number;
  message: string | object | Object;
}
class ErrorResponseBody {
  path: string;
  message: string | object | Object;
  statusCode: number;
  timestamp: string;
}

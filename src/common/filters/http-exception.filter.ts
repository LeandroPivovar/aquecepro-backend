import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno do servidor';

    // Log do erro completo para debug
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Erro 500 em ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `Erro ${status} em ${request.method} ${request.url}: ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      );
    }

    // Em produção, não expor detalhes de erros internos
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage =
      typeof message === 'string' ? message : (message as any).message || message;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
      ...(isDevelopment && status === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error
        ? { error: exception.message, stack: exception.stack }
        : {}),
    });
  }
}


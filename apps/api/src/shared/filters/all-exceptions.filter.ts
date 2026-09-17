import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Request, Response } from "express";

type ErrorResponseBody = {
    statusCode: number;
    message: string | string[];
    error?: string;
    path: string;
    timestamp: string;
    correlationId?: string;
};

// Ensures no unhandled error (a DB error, a bug, anything not deliberately
// thrown as an HttpException by our own code) ever reaches the client with
// its raw message or stack trace — only a generic 500 does. HttpExceptions
// we threw ourselves (NotFoundException, ConflictException, class-validator's
// 400s, etc.) already carry messages we chose to expose, so those pass through.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isHttpException = exception instanceof HttpException;
        const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const body = isHttpException
            ? this.buildHttpExceptionBody(exception, request)
            : this.buildInternalErrorBody(request);

        if (!isHttpException || status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `[${request.correlationId ?? "no-correlation-id"}] ${request.method} ${request.originalUrl} -> ${status}: ${
                    exception instanceof Error ? exception.message : "Unknown error"
                }`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        response.status(status).json(body);
    }

    private buildHttpExceptionBody(exception: HttpException, request: Request): ErrorResponseBody {
        const payload = exception.getResponse();

        if (typeof payload === "string") {
            return {
                statusCode: exception.getStatus(),
                message: payload,
                path: request.originalUrl,
                timestamp: new Date().toISOString(),
                correlationId: request.correlationId,
            };
        }

        const { message, error } = payload as { message: string | string[]; error?: string };

        return {
            statusCode: exception.getStatus(),
            message,
            error,
            path: request.originalUrl,
            timestamp: new Date().toISOString(),
            correlationId: request.correlationId,
        };
    }

    private buildInternalErrorBody(request: Request): ErrorResponseBody {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
            path: request.originalUrl,
            timestamp: new Date().toISOString(),
            correlationId: request.correlationId,
        };
    }
}

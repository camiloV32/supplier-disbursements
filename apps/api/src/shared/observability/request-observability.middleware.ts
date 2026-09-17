import { Logger } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { httpRequestDurationSeconds, httpRequestsTotal } from "./metrics";

const logger = new Logger("HTTP");

// Single instrumentation point per request: assigns/propagates a correlation id,
// logs a structured summary on completion (never the request body, headers, or
// the auth cookie — only method/route/status/duration), and records the same
// data as Prometheus metrics. Runs as global middleware (not a guard/interceptor)
// so it fires even for requests rejected by auth guards or validation pipes.
export function requestObservabilityMiddleware(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();
    req.correlationId = correlationId;
    res.setHeader("X-Correlation-Id", correlationId);

    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        // req.route.path is the matched route *pattern* (e.g. "/disbursement-requests/:id"),
        // not the resolved URL — using the real URL as a metric label would blow up
        // Prometheus's cardinality with one series per unique id ever requested.
        const route = req.route?.path ?? req.path;
        const labels = { method: req.method, route, status_code: String(res.statusCode) };

        httpRequestsTotal.inc(labels);
        httpRequestDurationSeconds.observe(labels, durationMs / 1000);

        logger.log(
            JSON.stringify({
                correlationId,
                operation: `${req.method} ${req.originalUrl}`,
                statusCode: res.statusCode,
                durationMs: Math.round(durationMs),
            }),
        );
    });

    next();
}

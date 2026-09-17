import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();

// Free Node.js process signals (memory, event loop lag, GC) — event loop lag in
// particular is a useful early indicator of latency problems before requests
// start timing out.
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests, labeled by method, route and status code",
    labelNames: ["method", "route", "status_code"],
    registers: [metricsRegistry],
});

export const httpRequestDurationSeconds = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds, labeled by method, route and status code",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
    registers: [metricsRegistry],
});

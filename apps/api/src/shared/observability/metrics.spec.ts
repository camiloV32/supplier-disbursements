import { httpRequestDurationSeconds, httpRequestsTotal, metricsRegistry } from "./metrics";

describe("metrics", () => {
    it("exposes recorded HTTP requests in Prometheus text format", async () => {
        httpRequestsTotal.inc({ method: "GET", route: "/health/live", status_code: "200" });
        httpRequestDurationSeconds.observe({ method: "GET", route: "/health/live", status_code: "200" }, 0.05);

        const output = await metricsRegistry.metrics();

        expect(output).toContain("http_requests_total");
        expect(output).toContain('method="GET"');
        expect(output).toContain('route="/health/live"');
        expect(output).toContain("http_request_duration_seconds");
    });
});

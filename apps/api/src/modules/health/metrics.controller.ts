import { Controller, Get, Res, VERSION_NEUTRAL } from "@nestjs/common";
import type { Response } from "express";
import { Public } from "@shared/decorators/public.decorator";
import { metricsRegistry } from "@shared/observability/metrics";

@Controller({ path: "metrics", version: VERSION_NEUTRAL })
export class MetricsController {
    @Public()
    @Get()
    async metrics(@Res() res: Response): Promise<void> {
        res.setHeader("Content-Type", metricsRegistry.contentType);
        res.send(await metricsRegistry.metrics());
    }
}

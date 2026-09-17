import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { Public } from "@shared/decorators/public.decorator";

@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
    ) {}

    // Liveness: is the process itself responsive? No external dependency checks —
    // if this doesn't answer, Kubernetes should restart the pod. A transient DB
    // blip alone should NOT trigger a restart, so it's deliberately not checked here.
    @Public()
    @Get("live")
    live(): { status: "ok" } {
        return { status: "ok" };
    }

    // Readiness: can this instance actually serve traffic right now? Nearly every
    // endpoint in this app needs the database, so if it's unreachable, Kubernetes
    // should pull this pod out of the load-balancing rotation (not restart it) —
    // restarting wouldn't fix a database outage and would just churn pods.
    @Public()
    @Get("ready")
    @HealthCheck()
    ready() {
        return this.health.check([() => this.db.pingCheck("database")]);
    }
}

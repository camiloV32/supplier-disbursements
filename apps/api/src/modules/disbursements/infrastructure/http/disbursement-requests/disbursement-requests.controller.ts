import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { DISBURSEMENT_REQUESTS_ROUTE } from "../route.constants";
import { CreateDisbursementRequestDto } from "./dto/create-disbursement-request.dto";
import { ListDisbursementRequestsDto } from "./dto/list-disbursement-requests.dto";
import { DecideDisbursementRequestDto } from "./dto/decide-disbursement-request.dto";
import { CreateDisbursementRequestCommand } from "../../../application/commands/create-disbursement-request/create-disbursement-request.command";
import { DecideDisbursementRequestCommand } from "../../../application/commands/decide-disbursement-request/decide-disbursement-request.command";
import { ListDisbursementRequestsQuery } from "../../../application/queries/list-disbursement-requests/list-disbursement-requests.query";
import { GetDisbursementRequestQuery } from "../../../application/queries/get-disbursement-request/get-disbursement-request.query";
import { DisbursementRequestReadModel } from "../../../application/read-model/disbursement-request.read-model";
import { DecisionReadModel } from "../../../application/read-model/decision.read-model";
import {
    DisbursementRequestSummary,
    ListDisbursementRequestsResult,
} from "../../../domain/ports/disbursement-request-query.port";
import { Roles } from "@shared/decorators/roles.decorator";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { UserRole } from "../../../../iam/domain/entities/user.entity";

@Controller({
    path: DISBURSEMENT_REQUESTS_ROUTE,
    version: "1",
})
export class DisbursementRequestsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Roles(UserRole.ANALYST)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateDisbursementRequestDto): Promise<DisbursementRequestReadModel> {
        const result = await this.commandBus.execute(
            new CreateDisbursementRequestCommand({
                externalReference: dto.externalReference,
                supplierId: dto.supplierId,
                amount: dto.amount,
                currency: dto.currency,
                concept: dto.concept,
            }),
        );

        return DisbursementRequestReadModel.fromEntity(result);
    }

    @Get()
    list(@Query() query: ListDisbursementRequestsDto): Promise<ListDisbursementRequestsResult> {
        return this.queryBus.execute(
            new ListDisbursementRequestsQuery({
                status: query.status,
                search: query.search,
                cursor: query.cursor,
                limit: query.limit,
            }),
        );
    }

    @Get(":id")
    detail(@Param("id", ParseUUIDPipe) id: string): Promise<DisbursementRequestSummary> {
        return this.queryBus.execute(new GetDisbursementRequestQuery(id));
    }

    @Roles(UserRole.SUPERVISOR)
    @Post(":id/decision")
    @HttpCode(HttpStatus.OK)
    async decide(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: DecideDisbursementRequestDto,
        @CurrentUser("userId") userId: string,
    ): Promise<DecisionReadModel> {
        const decision = await this.commandBus.execute(
            new DecideDisbursementRequestCommand({
                requestId: id,
                decision: dto.decision,
                reason: dto.reason,
                decidedBy: userId,
            }),
        );

        return DecisionReadModel.fromEntity(decision);
    }
}

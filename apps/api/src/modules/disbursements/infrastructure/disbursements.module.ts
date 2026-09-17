import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DisbursementRequestOrmEntity } from "./persistence/entities/disbursement-request.orm-entity";
import { DecisionOrmEntity } from "./persistence/entities/decision.orm-entity";
import { DisbursementRequestRepository } from "../domain/ports/disbursement-request-repository.port";
import { DisbursementRequestQueryRepository } from "../domain/ports/disbursement-request-query.port";
import { DecisionRepository } from "../domain/ports/decision-repository.port";
import { TypeOrmDisbursementRequestRepository } from "./persistence/repositories/disbursement-request.repository";
import { TypeOrmDisbursementRequestQueryRepository } from "./persistence/repositories/disbursement-request-query.repository";
import { TypeOrmDecisionRepository } from "./persistence/repositories/decision.repository";
import { CreateDisbursementRequestHandler } from "../application/commands/create-disbursement-request/create-disbursement-request.handler";
import { DecideDisbursementRequestHandler } from "../application/commands/decide-disbursement-request/decide-disbursement-request.handler";
import { ListDisbursementRequestsHandler } from "../application/queries/list-disbursement-requests/list-disbursement-requests.handler";
import { GetDisbursementRequestHandler } from "../application/queries/get-disbursement-request/get-disbursement-request.handler";
import { DisbursementRequestsController } from "./http/disbursement-requests/disbursement-requests.controller";
import { SuppliersModule } from "../../suppliers/infrastructure/suppliers.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([DisbursementRequestOrmEntity, DecisionOrmEntity]),
        CqrsModule,
        SuppliersModule,
    ],
    controllers: [DisbursementRequestsController],
    providers: [
        {
            provide: DisbursementRequestRepository,
            useClass: TypeOrmDisbursementRequestRepository,
        },
        {
            provide: DisbursementRequestQueryRepository,
            useClass: TypeOrmDisbursementRequestQueryRepository,
        },
        {
            provide: DecisionRepository,
            useClass: TypeOrmDecisionRepository,
        },
        CreateDisbursementRequestHandler,
        DecideDisbursementRequestHandler,
        ListDisbursementRequestsHandler,
        GetDisbursementRequestHandler,
    ],
})
export class DisbursementsModule {}

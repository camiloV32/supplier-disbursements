import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    DisbursementRequestQueryRepository,
    ListDisbursementRequestsResult,
} from "../../../domain/ports/disbursement-request-query.port";
import { ListDisbursementRequestsQuery } from "./list-disbursement-requests.query";

@QueryHandler(ListDisbursementRequestsQuery)
export class ListDisbursementRequestsHandler implements IQueryHandler<ListDisbursementRequestsQuery> {
    constructor(
        @Inject(DisbursementRequestQueryRepository)
        private readonly queryRepository: DisbursementRequestQueryRepository,
    ) {}

    execute(query: ListDisbursementRequestsQuery): Promise<ListDisbursementRequestsResult> {
        return this.queryRepository.list(
            { status: query.status, search: query.search },
            { cursor: query.cursor, limit: query.limit },
        );
    }
}

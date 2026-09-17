import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    DisbursementRequestQueryRepository,
    DisbursementRequestSummary,
} from "../../../domain/ports/disbursement-request-query.port";
import { GetDisbursementRequestQuery } from "./get-disbursement-request.query";

@QueryHandler(GetDisbursementRequestQuery)
export class GetDisbursementRequestHandler implements IQueryHandler<GetDisbursementRequestQuery> {
    constructor(
        @Inject(DisbursementRequestQueryRepository)
        private readonly queryRepository: DisbursementRequestQueryRepository,
    ) {}

    async execute(query: GetDisbursementRequestQuery): Promise<DisbursementRequestSummary> {
        const result = await this.queryRepository.findById(query.id);

        if (!result) {
            throw new NotFoundException("Disbursement request not found");
        }

        return result;
    }
}

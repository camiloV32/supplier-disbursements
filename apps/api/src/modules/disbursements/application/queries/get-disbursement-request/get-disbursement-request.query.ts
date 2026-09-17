import { Query } from "@nestjs/cqrs";
import { DisbursementRequestSummary } from "../../../domain/ports/disbursement-request-query.port";

export class GetDisbursementRequestQuery extends Query<DisbursementRequestSummary> {
    constructor(readonly id: string) {
        super();
    }
}

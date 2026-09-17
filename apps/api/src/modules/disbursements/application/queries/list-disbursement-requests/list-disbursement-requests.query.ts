import { Query } from "@nestjs/cqrs";
import { DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";
import { ListDisbursementRequestsResult } from "../../../domain/ports/disbursement-request-query.port";

export interface ListDisbursementRequestsProps {
    status?: DisbursementStatus;
    search?: string;
    cursor?: string;
    limit: number;
}

export class ListDisbursementRequestsQuery extends Query<ListDisbursementRequestsResult> {
    readonly status?: DisbursementStatus;
    readonly search?: string;
    readonly cursor?: string;
    readonly limit: number;

    constructor(props: ListDisbursementRequestsProps) {
        super();
        this.status = props.status;
        this.search = props.search;
        this.cursor = props.cursor;
        this.limit = props.limit;
    }
}

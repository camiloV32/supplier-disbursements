import { Command } from "@nestjs/cqrs";
import { DisbursementRequest } from "../../../domain/entities/disbursement-request.entity";

export interface CreateDisbursementRequestProps {
    externalReference: string;
    supplierId: string;
    amount: number;
    currency: string;
    concept: string;
}

export class CreateDisbursementRequestCommand extends Command<DisbursementRequest> {
    readonly externalReference: string;
    readonly supplierId: string;
    readonly amount: number;
    readonly currency: string;
    readonly concept: string;

    constructor(props: CreateDisbursementRequestProps) {
        super();
        this.externalReference = props.externalReference;
        this.supplierId = props.supplierId;
        this.amount = props.amount;
        this.currency = props.currency;
        this.concept = props.concept;
    }
}

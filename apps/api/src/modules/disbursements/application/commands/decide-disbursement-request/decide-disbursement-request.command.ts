import { Command } from "@nestjs/cqrs";
import { Decision, DecisionType } from "../../../domain/entities/decision.entity";

export interface DecideDisbursementRequestProps {
    requestId: string;
    decision: DecisionType;
    reason?: string;
    decidedBy: string;
}

export class DecideDisbursementRequestCommand extends Command<Decision> {
    readonly requestId: string;
    readonly decision: DecisionType;
    readonly reason: string | null;
    readonly decidedBy: string;

    constructor(props: DecideDisbursementRequestProps) {
        super();
        this.requestId = props.requestId;
        this.decision = props.decision;
        this.reason = props.reason ?? null;
        this.decidedBy = props.decidedBy;
    }
}

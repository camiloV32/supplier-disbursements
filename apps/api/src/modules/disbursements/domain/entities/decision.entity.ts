export enum DecisionType {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export class Decision {
    constructor(
        readonly id: string,
        readonly requestId: string,
        readonly decision: DecisionType,
        readonly reason: string | null,
        readonly decidedBy: string,
        readonly decidedAt: Date,
    ) {}
}

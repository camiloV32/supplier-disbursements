import { ConflictException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Decision } from "../../../domain/entities/decision.entity";
import { DecisionRepository } from "../../../domain/ports/decision-repository.port";
import { DisbursementRequestQueryRepository } from "../../../domain/ports/disbursement-request-query.port";
import { RequestAlreadyDecidedError } from "../../../domain/errors/request-already-decided.error";
import { DecideDisbursementRequestCommand } from "./decide-disbursement-request.command";

@CommandHandler(DecideDisbursementRequestCommand)
export class DecideDisbursementRequestHandler implements ICommandHandler<DecideDisbursementRequestCommand> {
    constructor(
        @Inject(DecisionRepository)
        private readonly decisionRepository: DecisionRepository,
        @Inject(DisbursementRequestQueryRepository)
        private readonly disbursementRequestQueryRepository: DisbursementRequestQueryRepository,
    ) {}

    async execute(command: DecideDisbursementRequestCommand): Promise<Decision> {
        const request = await this.disbursementRequestQueryRepository.findById(command.requestId);

        if (!request) {
            throw new NotFoundException("Disbursement request not found");
        }

        try {
            return await this.decisionRepository.decide({
                requestId: command.requestId,
                decision: command.decision,
                reason: command.reason,
                decidedBy: command.decidedBy,
            });
        } catch (error) {
            if (error instanceof RequestAlreadyDecidedError) {
                throw new ConflictException("This disbursement request has already been decided");
            }

            throw error;
        }
    }
}

import { IsEnum, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { DecisionType } from "../../../../domain/entities/decision.entity";

export class DecideDisbursementRequestDto {
    @IsEnum(DecisionType)
    decision: DecisionType;

    // RF4: rejecting requires a reason; approving doesn't.
    @ValidateIf((dto: DecideDisbursementRequestDto) => dto.decision === DecisionType.REJECTED)
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    reason?: string;
}

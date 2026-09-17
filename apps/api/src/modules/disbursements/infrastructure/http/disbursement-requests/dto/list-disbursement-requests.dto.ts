import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { DisbursementStatus } from "../../../../domain/entities/disbursement-request.entity";

export class ListDisbursementRequestsDto {
    @IsOptional()
    @IsEnum(DisbursementStatus)
    status?: DisbursementStatus;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;
}

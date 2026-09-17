import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Length, Matches, MaxLength } from "class-validator";

export class CreateDisbursementRequestDto {
    @IsUUID()
    supplierId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    externalReference: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amount: number;

    @IsString()
    @Length(3, 3)
    @Matches(/^[A-Z]{3}$/, { message: "currency must be a 3-letter ISO 4217 code" })
    currency: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    concept: string;
}

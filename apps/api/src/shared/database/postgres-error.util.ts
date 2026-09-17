import { QueryFailedError } from "typeorm";

const UNIQUE_VIOLATION_CODE = "23505";

export function isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
        return false;
    }

    const driverError = error as QueryFailedError & { code?: string; driverError?: { code?: string } };

    return driverError.code === UNIQUE_VIOLATION_CODE || driverError.driverError?.code === UNIQUE_VIOLATION_CODE;
}

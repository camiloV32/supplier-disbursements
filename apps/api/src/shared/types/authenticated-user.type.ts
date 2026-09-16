import { UserRole } from "../../modules/iam/domain/entities/user.entity";

export type AuthenticatedUser = {
    userId: string;
    role: UserRole;
};

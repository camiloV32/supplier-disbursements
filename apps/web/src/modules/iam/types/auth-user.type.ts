export type UserRole = "ANALYST" | "SUPERVISOR";

export type AuthUser = {
    id: string;
    email: string;
    role: UserRole;
};

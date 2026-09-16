export enum UserRole {
    ANALYST = "ANALYST",
    SUPERVISOR = "SUPERVISOR",
}

export class User {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly passwordHash: string,
        readonly role: UserRole,
        readonly createdAt: Date,
    ) {}
}

export class UserReadModel {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly role: string,
    ) {}

    static fromEntity(user: { id: string; email: string; role: string }): UserReadModel {
        return new UserReadModel(user.id, user.email, user.role);
    }
}

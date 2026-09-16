import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserQuery } from "./get-user.query";
import { UserReadModel } from "../../read-model/user.read-model";
import { Inject, NotFoundException } from "@nestjs/common";
import { UserRepository } from "src/modules/iam/domain/ports/user-repository.port";

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
    constructor(@Inject(UserRepository) private readonly userRepository: UserRepository) {}

    async execute(query: GetUserQuery): Promise<UserReadModel> {
        const user = await this.userRepository.findById(query.userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return UserReadModel.fromEntity({
            id: user.id,
            email: user.email,
            role: user.role
        });
    }
}
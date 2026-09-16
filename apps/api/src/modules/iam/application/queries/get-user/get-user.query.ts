import { Query } from "@nestjs/cqrs";
import { UserReadModel } from "../../read-model/user.read-model";


export class GetUserQuery extends Query<UserReadModel> {
    constructor(readonly userId: string) {
        super();
    }
}
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../modules/iam/domain/entities/user.entity";
import { ROLES_KEY } from "../constants/metadata-keys.constant";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

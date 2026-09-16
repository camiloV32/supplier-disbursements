import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../../../domain/entities/user.entity";

@Entity({ name: "users" })
export class UserOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: "password_hash", select: false })
    passwordHash: string;

    @Column({ type: "enum", enum: UserRole })
    role: UserRole;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}

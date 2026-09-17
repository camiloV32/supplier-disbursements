import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { DecisionType } from "../../../domain/entities/decision.entity";
import { DisbursementRequestOrmEntity } from "./disbursement-request.orm-entity";
import { UserOrmEntity } from "../../../../iam/infrastructure/persistence/entities/user.orm-entity";

@Entity({ name: "decisions" })
@Check(`"decision" <> 'REJECTED' OR "reason" IS NOT NULL`)
export class DecisionOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // Unique per request: this is what makes two concurrent approve/reject attempts on the
    // same request consistent. Both inserts race, only one wins, the loser gets a DB conflict
    // instead of a second, contradictory decision being persisted.
    @Index({ unique: true })
    @Column({ name: "request_id" })
    requestId: string;

    @OneToOne(() => DisbursementRequestOrmEntity, (request) => request.decision, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "request_id" })
    request: DisbursementRequestOrmEntity;

    @Column({ type: "enum", enum: DecisionType })
    decision: DecisionType;

    @Column({ type: "text", nullable: true })
    reason: string | null;

    @Column({ name: "decided_by" })
    decidedBy: string;

    @ManyToOne(() => UserOrmEntity, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "decided_by" })
    decidedByUser: UserOrmEntity;

    @CreateDateColumn({ name: "decided_at" })
    decidedAt: Date;
}

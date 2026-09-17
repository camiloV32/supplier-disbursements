import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ValueTransformer,
} from "typeorm";
import { DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";
import { SupplierOrmEntity } from "../../../../suppliers/infrastructure/persistence/entities/supplier.orm-entity";
import { DecisionOrmEntity } from "./decision.orm-entity";

const numericTransformer: ValueTransformer = {
    to: (value: number) => value,
    from: (value: string) => Number(value),
};

@Entity({ name: "disbursement_requests" })
// Assumption for RF5 (duplicate retries): an operation is identified by (supplierId, externalReference).
// The client must send a stable externalReference per attempt; if it generates a new one per retry,
// this constraint alone will not catch the duplicate.
@Index("uq_disbursement_supplier_reference", ["supplierId", "externalReference"], { unique: true })
@Index("ix_disbursement_status_created_at", ["status", "createdAt"])
export class DisbursementRequestOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column({ name: "external_reference" })
    externalReference: string;

    @Column({ name: "supplier_id" })
    supplierId: string;

    @ManyToOne(() => SupplierOrmEntity, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "supplier_id" })
    supplier: SupplierOrmEntity;

    @Column({ type: "numeric", precision: 14, scale: 2, transformer: numericTransformer })
    amount: number;

    @Column({ type: "char", length: 3 })
    currency: string;

    @Column({ type: "text" })
    concept: string;

    @Column({ type: "enum", enum: DisbursementStatus, default: DisbursementStatus.PENDING })
    status: DisbursementStatus;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    // Inverse side only, to let the query repository do
    // `leftJoinAndSelect("request.decision", "decision")` — DecisionOrmEntity owns the FK.
    @OneToOne(() => DecisionOrmEntity, (decision) => decision.request)
    decision?: DecisionOrmEntity;
}

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "suppliers" })
export class SupplierOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index({ unique: true })
    @Column({ name: "tax_id" })
    taxId: string;

    @Column()
    name: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}

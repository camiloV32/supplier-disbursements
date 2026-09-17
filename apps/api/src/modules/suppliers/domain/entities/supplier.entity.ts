export class Supplier {
    constructor(
        readonly id: string,
        readonly taxId: string,
        readonly name: string,
        readonly createdAt: Date,
    ) {}
}

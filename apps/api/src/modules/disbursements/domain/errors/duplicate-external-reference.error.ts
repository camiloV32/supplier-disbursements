export class DuplicateExternalReferenceError extends Error {
    constructor(
        readonly supplierId: string,
        readonly externalReference: string,
    ) {
        super(
            `A disbursement request already exists for supplier ${supplierId} with externalReference ${externalReference}`,
        );
        this.name = "DuplicateExternalReferenceError";
    }
}

export class RequestAlreadyDecidedError extends Error {
    constructor(readonly requestId: string) {
        super(`Disbursement request ${requestId} has already been decided`);
        this.name = "RequestAlreadyDecidedError";
    }
}

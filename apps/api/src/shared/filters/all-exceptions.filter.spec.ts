import { ArgumentsHost, ConflictException, HttpStatus } from "@nestjs/common";
import { AllExceptionsFilter } from "./all-exceptions.filter";

describe("AllExceptionsFilter", () => {
    let filter: AllExceptionsFilter;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;
    let host: ArgumentsHost;

    beforeEach(() => {
        filter = new AllExceptionsFilter();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        host = {
            switchToHttp: () => ({
                getResponse: () => ({ status: statusMock }),
                getRequest: () => ({ method: "GET", originalUrl: "/v1/disbursement-requests" }),
            }),
        } as unknown as ArgumentsHost;
    });

    it("passes through an HttpException's status and message", () => {
        filter.catch(new ConflictException("duplicate"), host);

        expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({ statusCode: HttpStatus.CONFLICT, message: "duplicate" }),
        );
    });

    it("masks a non-HttpException as a generic 500 without leaking its message or stack", () => {
        filter.catch(new Error("password=hunter2 connection refused at 10.0.0.5"), host);

        expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        const body = jsonMock.mock.calls[0][0];
        expect(body.message).toBe("Internal server error");
        expect(JSON.stringify(body)).not.toContain("hunter2");
        expect(JSON.stringify(body)).not.toContain("10.0.0.5");
    });

    it("includes the request path and a timestamp for client-side diagnostics", () => {
        filter.catch(new ConflictException("duplicate"), host);

        const body = jsonMock.mock.calls[0][0];
        expect(body.path).toBe("/v1/disbursement-requests");
        expect(typeof body.timestamp).toBe("string");
    });
});

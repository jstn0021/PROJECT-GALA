export class ApiError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// Thrown by the repository until a real database is wired in.
// Surfaces as HTTP 503 so the client never believes data was saved.
export class DatabaseNotConnectedError extends ApiError {
    constructor(operation) {
        super(
            503,
            "database_not_connected",
            "The database is not connected yet, so this request was not saved or loaded."
        );
        this.name = "DatabaseNotConnectedError";
        this.operation = operation;
    }
}
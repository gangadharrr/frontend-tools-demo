/**
 * Application error with an HTTP status code and machine-readable error code.
 * Matches the interface expected by @hai/assistants-core's AppError so this
 * can be swapped out if that package is added later.
 */
export class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;

    constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;

        // Restore prototype chain (required when extending built-ins in TS)
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            statusCode: this.statusCode,
        };
    }
}

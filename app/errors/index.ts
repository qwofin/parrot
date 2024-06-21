
export class ParrotError extends Error {}
export class HttpError extends ParrotError {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}
export class ValidationError extends ParrotError {}
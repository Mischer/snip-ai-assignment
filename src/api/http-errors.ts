export class BadRequestError extends Error {
    public readonly status = 400;
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

export class UnsupportedSourceError extends Error {
    public readonly status = 415; // Unsupported Media Type
    constructor(message: string) {
        super(message);
        this.name = 'UnsupportedSourceError';
    }
}

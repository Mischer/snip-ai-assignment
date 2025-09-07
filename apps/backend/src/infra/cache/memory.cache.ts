export interface CachePort {
    get(key: string): Promise<unknown>;
    set(key: string, val: unknown, ttlSec: number): Promise<void>;
}

export class MemoryCache implements CachePort {
    private readonly data = new Map<string, unknown>();
    private readonly exp = new Map<string, number>();

    // use async only for better future contract with I/O cache (Redis, Valkey, etc...)
    async get(key: string): Promise<unknown> {
        const expirationDate = this.exp.get(key);
        if (expirationDate && Date.now() > expirationDate) {
            this.data.delete(key);
            this.exp.delete(key);
            return null;
        }
        return this.data.get(key) ?? null;
    }

    // use async only for better future contract with I/O cache (Redis, Valkey, etc...)
    async set(key: string, val: unknown, ttlSec: number): Promise<void> {
        this.data.set(key, val);
        this.exp.set(key, Date.now() + ttlSec * 1000);
    }
}

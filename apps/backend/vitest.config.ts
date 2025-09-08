import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['test/setup.ts'],
        include: ['test/e2e/**/*.test.ts'],
        globals: true,
        restoreMocks: true,
        clearMocks: true,
        mockReset: true,
    },
});

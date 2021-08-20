import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    globals: {
        __PACKAGE_VERSION__: true,
        __BUILD_TIME__: true,
    },
    collectCoverage: true,
    collectCoverageFrom: ['**/src/**/*.{ts}', '!**/dashboard/**', '!**/node_modules/**', '!**/spec/**'],
    coverageDirectory: 'test-reports',
    coverageReporters: ['lcov'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-reports',
                outputName: 'jest-junit.xml',
            },
        ],
    ],
    roots: ['<rootDir>/test'],
    setupFiles: ['<rootDir>/test/setup.ts'],
};
export default config;

import { build as esbuild, BuildOptions } from 'esbuild';
import path from 'path';

import { buildTime, packageVersion, releaseInformation } from './../globals';

const baseConfig: BuildOptions = {
    bundle: true,
    minify: false,
    target: 'esnext',
    sourcemap: true,
    nodePaths: [path.join(__dirname, '../src')],
    external: [],
    define: {
        __PACKAGE_VERSION__: JSON.stringify(packageVersion),
        __BUILD_TIME__: JSON.stringify(buildTime),
        __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
    },
};

const nodeConfig: BuildOptions = {
    ...baseConfig,
    format: 'cjs',
    platform: 'node',
};

const browserConfig: BuildOptions = {
    ...baseConfig,
    format: 'cjs',
    platform: 'browser',
};

const main = async (): Promise<void> => {
    await esbuild({
        ...nodeConfig,
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXParser.ts')],
    });
    await esbuild({
        ...nodeConfig,
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXServer.ts')],
    });
    await esbuild({
        ...browserConfig,
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXParserBrowser.ts')],
    });

    await esbuild({
        ...nodeConfig,
        format: 'esm',
        outExtension: {
            '.js': '.mjs',
        },
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXParser.ts')],
        banner: {
            js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
        },
    });
    await esbuild({
        ...nodeConfig,
        format: 'esm',
        outExtension: {
            '.js': '.mjs',
        },
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXServer.ts')],
        banner: {
            js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
        },
    });
    await esbuild({
        ...browserConfig,
        format: 'esm',
        outExtension: {
            '.js': '.mjs',
        },
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXParserBrowser.ts')],
    });
};

if (require.main === module) {
    void main();
}

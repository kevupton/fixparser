import path from 'path';
import { build as esbuild, BuildOptions } from 'esbuild';
import { packageVersion, buildTime, releaseInformation } from './../globals';

const baseConfig: BuildOptions = {
    bundle: true,
    minify: false,
    target: 'esnext',
    sourcemap: true,
    nodePaths: [path.join(__dirname, '../src')],
    external: [],
    banner: {
        js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
    },
    define: {
        __PACKAGE_VERSION__: JSON.stringify(packageVersion),
        __BUILD_TIME__: JSON.stringify(buildTime),
        __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
    },
};

async function main() {
    await esbuild({
        ...baseConfig,
        format: 'cjs',
        platform: 'node',
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXParser.ts')],
    });
    await esbuild({
        ...baseConfig,
        format: 'cjs',
        platform: 'node',
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXServer.ts')],
    });
    await esbuild({
        ...baseConfig,
        format: 'cjs',
        platform: 'browser',
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXParserBrowser.ts')],
    });

    await esbuild({
        ...baseConfig,
        format: 'esm',
        platform: 'node',
        outExtension: {
            '.js': '.mjs',
        },
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXParser.ts')],
    });
    await esbuild({
        ...baseConfig,
        format: 'esm',
        platform: 'node',
        outExtension: {
            '.js': '.mjs',
        },
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXServer.ts')],
    });
    await esbuild({
        ...baseConfig,
        format: 'esm',
        platform: 'browser',
        outExtension: {
            '.js': '.mjs',
        },
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXParserBrowser.ts')],
    });
}

if (require.main === module) {
    main();
}

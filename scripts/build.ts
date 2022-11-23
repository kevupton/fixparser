import path from 'path';
import { build as esbuild, BuildOptions } from 'esbuild';
import { packageVersion, buildTime, releaseInformation } from './../globals';

const baseConfig: BuildOptions = {
    bundle: true,
    minify: false,
    platform: 'node',
    target: 'esnext',
    format: 'cjs',
    sourcemap: true,
    nodePaths: [path.join(__dirname, '../src')],
    external: [],
    define: {
        __PACKAGE_VERSION__: JSON.stringify(packageVersion),
        __BUILD_TIME__: JSON.stringify(buildTime),
        __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
    },
};

async function main() {
    await esbuild({
        ...baseConfig,
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXParser.ts')],
    });
    await esbuild({
        ...baseConfig,
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXServer.ts')],
    });
    await esbuild({
        ...baseConfig,
        outdir: path.join(__dirname, '../build/cjs'),
        entryPoints: [path.join(__dirname, './../src/FIXParserBrowser.ts')],
        platform: 'browser',
    });

    await esbuild({
        ...baseConfig,
        format: 'esm',
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXParser.ts')],
    });
    await esbuild({
        ...baseConfig,
        format: 'esm',
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXServer.ts')],
    });
    await esbuild({
        ...baseConfig,
        format: 'esm',
        outdir: path.join(__dirname, '../build/esm'),
        entryPoints: [path.join(__dirname, './../src/FIXParserBrowser.ts')],
        platform: 'browser',
    });
}

if (require.main === module) {
    main();
}

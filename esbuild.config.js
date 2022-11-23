const esbuild = require('esbuild');
const globals = require('./globals');

const commonConfig = {
    entryPoints: ['./src/FIXParser.ts'],
    outfile: 'fixparser.js',
    bundle: true,
    minify: true,
    platform: 'node',
    sourcemap: true,
    define: {
        __PACKAGE_VERSION__: JSON.stringify(globals.packageVersion),
        __BUILD_TIME__: JSON.stringify(globals.buildTime),
        __RELEASE_INFORMATION__: JSON.stringify(globals.releaseInformation),
    },
};

esbuild
    .build({
        ...commonConfig,
        entryPoints: ['./src/FIXParser.ts'],
        outfile: 'fixparser.js',
        target: 'node18',
    })
    .catch(() => process.exit(1));

esbuild
    .build({
        ...commonConfig,
        entryPoints: ['./src/FIXServer.ts'],
        outfile: 'server.js',
        target: 'node18',
    })
    .catch(() => process.exit(1));

esbuild
    .build({
        entryPoints: ['./src/FIXParserBrowser.ts'],
        outfile: 'browser.js',
        platform: 'browser',
        sourcemap: true,
    })
    .catch(() => process.exit(1));

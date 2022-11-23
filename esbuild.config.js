const esbuild = require('esbuild');
const pkg = require('./package.json');

const packageVersion = pkg.version.toString().slice();
const buildTime = new Date().toISOString().slice();
const releaseInformation = btoa(Date.now().toString()).slice();

esbuild
    .build({
        entryPoints: ['./src/FIXParser.ts'],
        outfile: 'fixparser.js',
        bundle: true,
        minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node18',
        define: {
            'process.env.__PACKAGE_VERSION__': JSON.stringify(packageVersion),
            'process.env.__BUILD_TIME__': JSON.stringify(buildTime),
            'process.env.__RELEASE_INFORMATION__': JSON.stringify(releaseInformation),
        },
    })
    .catch(() => process.exit(1));

esbuild
    .build({
        entryPoints: ['./src/FIXServer.ts'],
        outfile: 'server.js',
        bundle: true,
        minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node18',
        define: {
            __PACKAGE_VERSION__: JSON.stringify(pkg.version),
            __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
            __RELEASE_INFORMATION__: JSON.stringify(btoa(Date.now().toString())),
        },
    })
    .catch(() => process.exit(1));

esbuild
    .build({
        entryPoints: ['./src/FIXParserBrowser.ts'],
        outfile: 'browser.js',
        bundle: true,
        minify: true,
        platform: 'browser',
        sourcemap: true,
        define: {
            __PACKAGE_VERSION__: JSON.stringify(pkg.version),
            __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
            __RELEASE_INFORMATION__: JSON.stringify(btoa(Date.now().toString())),
        },
    })
    .catch(() => process.exit(1));

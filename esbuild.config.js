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
            __PACKAGE_VERSION__: JSON.stringify(packageVersion),
            __BUILD_TIME__: JSON.stringify(buildTime),
            __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
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
            __PACKAGE_VERSION__: JSON.stringify(packageVersion),
            __BUILD_TIME__: JSON.stringify(buildTime),
            __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
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
            __PACKAGE_VERSION__: JSON.stringify(packageVersion),
            __BUILD_TIME__: JSON.stringify(buildTime),
            __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
        },
    })
    .catch(() => process.exit(1));

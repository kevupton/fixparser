import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createServer, request } from 'http';
import { spawn } from 'child_process';
import { resolve } from 'path';

import { build, serve } from 'esbuild';
import chalk from 'chalk';
import moment from 'moment';
import { Command } from 'commander';
import { copy } from 'esbuild-plugin-copy';
import { clean } from 'esbuild-plugin-clean';
import sassPlugin from 'esbuild-plugin-sass';

import { packageVersion, buildTime, releaseInformation } from './../globals.js';

const publicDir = './public';
const publicOutputDir = './build';
const publicOutFile = 'dashboard.js';
const srcHtmlFile = './src/index.html';
const destinationHTML = `${publicOutputDir}/index.html`;

const prepareFolder = () => {
    !existsSync(`${publicOutputDir}/`) && mkdirSync(`${publicOutputDir}/`);
};

const injectJsFile = () => {
    try {
        const str = readFileSync(srcHtmlFile)
            .toString()
            .replace(/<\/body>/, `\t<script src="${publicOutFile}"></script>\n\t<\/body>`);

        writeFileSync(destinationHTML, str);
        const message = `injected script based on ${publicOutFile} file into ${destinationHTML}`;
        console.log(`[${chalk.grey(moment().format('h:mm:ss A'))}] injector: ${chalk.green(message)}`);
    } catch (error) {
        const message = `error while injecting script based on ${publicOutFile} file into ${destinationHTML}`;
        console.log(`[${chalk.grey(moment().format('h:mm:ss A'))}] injector: ${chalk.red(message)}`);
    }
};

const createEsBuildServer = async () => {
    const clients = [];
    const NODE_PORT = 8090;

    build({
        entryPoints: ['./src/ApplicationRenderer.tsx'],
        platform: 'browser',
        bundle: true,
        minify: false,
        loader: {
            '.tsx': 'tsx',
            '.ts': 'ts',
            '.woff': 'file',
            '.woff2': 'file',
        },
        tsconfig: './tsconfig.json',
        incremental: true,
        sourcemap: true,
        outfile: `${publicOutputDir}/${publicOutFile}`,
        banner: { js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();' },
        watch: {
            onRebuild(error) {
                clients.forEach((res) => res.write('data: update\n\n'));
                clients.length = 0;
                if (error)
                    console.log(
                        `[${chalk.grey(moment().format('h:mm:ss A'))}] esbuild: ${chalk.red(
                            'error while rebuilding code',
                        )}`,
                    );
                else
                    console.log(
                        `[${chalk.grey(moment().format('h:mm:ss A'))}] esbuild: ${chalk.green(
                            'code rebuilt successfully',
                        )}`,
                    );
            },
        },
        define: {
            'process.env.NODE_ENV': '"development"',
            __PACKAGE_VERSION__: JSON.stringify(packageVersion),
            __BUILD_TIME__: JSON.stringify(buildTime),
            __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
        },
        plugins: [
            sassPlugin({
                customSassOptions: {
                    loadPaths: [resolve('./node_modules')],
                },
            }),
            clean({
                patterns: ['build/*', `!${destinationHTML}`],
                sync: true,
                verbose: false,
            }),
            copy({
                resolveFrom: 'cwd',
                assets: {
                    from: [`${publicDir}/**/*`],
                    to: [`${publicOutputDir}`],
                    keepStructure: true,
                },
            }),
        ],
    }).catch(() => process.exit(1));

    const result = await serve({ servedir: publicOutputDir }, {});

    createServer((requestListener, res) => {
        const { url, method, headers } = requestListener;
        if (requestListener.url === '/esbuild')
            return clients.push(
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                }),
            );
        const urlPath = ~url.split('/').pop().indexOf('.') ? url : '/index.html'; //for PWA with router
        requestListener.pipe(
            request({ hostname: '0.0.0.0', port: 8000, path: urlPath, method, headers }, (incomingMessage) => {
                res.writeHead(incomingMessage.statusCode, incomingMessage.headers);
                incomingMessage.pipe(res, { end: true });
            }),
            { end: true },
        );
    }).listen(NODE_PORT);

    console.log(`⚡ esbuild serving on ${result.host}:${result.port}`);
    console.log(`⚡ node with hot reload serving on ${result.host}:${NODE_PORT}`);
};

const createEsLintWatchServer = () => {
    const eslint = spawn('npx esw', ['--watch --changed --color'], { shell: true });
    eslint.stdout.on('data', (data) => {
        console.log(`[${chalk.grey(moment().format('h:mm:ss A'))}] eslint: \n${data}`);
    });

    eslint.on('error', (error) => {
        console.log(`[${chalk.grey(moment().format('h:mm:ss A'))}] eslint: error \n${error.message}`);
    });
};

const createTscServer = () => {
    const tsc = spawn('npx tsc', ['--noEmit --watch --skipLibCheck --pretty --project tsconfig.json'], {
        shell: true,
    });
    tsc.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    tsc.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
};

const main = async () => {
    const program = new Command();

    program.option('-l, --lint', 'enable eslint in watch mode');

    program.parse(process.argv);
    const options = program.opts();
    prepareFolder();
    injectJsFile();
    createEsBuildServer();
    createTscServer();
    if (options.lint) createEsLintWatchServer();
};

main();

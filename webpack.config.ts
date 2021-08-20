import path from 'path';
import { Configuration, DefinePlugin } from 'webpack';

import pkg from './package.json';

const commonConfig: Configuration = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: { babelrcRoots: ['.', '../'] },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    externals: {
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                __PACKAGE_VERSION__: JSON.stringify(pkg.version),
                __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
                __RELEASE_INFORMATION__: JSON.stringify(btoa(Date.now().toString())),
            },
        }),
    ],
    devtool: 'source-map',
};

const nodeConfig: Configuration = {
    ...commonConfig,
    entry: {
        FIXParser: './src/FIXParser.ts',
    },
    output: {
        path: path.join(__dirname),
        filename: 'fixparser.js',
        library: 'FIXParser',
        libraryTarget: 'umd',
    },
    target: 'node',
};

const serverConfig: Configuration = {
    ...commonConfig,
    entry: {
        FIXParser: './src/FIXServer.ts',
    },
    output: {
        path: path.join(__dirname),
        filename: 'server.js',
        library: 'FIXParser',
        libraryTarget: 'umd',
    },
    target: 'node',
};

const browserConfig: Configuration = {
    ...commonConfig,
    entry: {
        FIXParser: './src/FIXParserBrowser.ts',
    },
    output: {
        path: path.join(__dirname),
        filename: 'browser.js',
        library: 'FIXParser',
        libraryTarget: 'umd',
    },
    target: 'web',
    resolve: {
        ...commonConfig.resolve,
        fallback: {
            net: false,
            tls: false,
            url: false,
            assert: false,
            stream: false,
            zlib: false,
            crypto: false,
            http: false,
            https: false,
            ws: false,
        },
    },
    stats: 'verbose',
};

export default [nodeConfig, serverConfig, browserConfig];

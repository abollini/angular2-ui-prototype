﻿var webpackMerge = require('webpack-merge');
var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var defaultConfig = {
    module: {
        noParse: [
            path.join(__dirname, 'zone.js', 'dist'),
            path.join(__dirname, 'angular2', 'bundles')
        ]
    },
    context: __dirname,
    resolve: {
        root: path.join(__dirname, '/src')
    },
    output: {
        publicPath: path.resolve(__dirname),
        filename: 'bundle.js'
    }
}

var commonConfig = {
    resolve: {
        extensions: ['', '.css', '.scss', '.js', '.ts']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/, 
                loader: 'ts-loader'
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.ProvidePlugin({ $: "jquery", jQuery: "jquery" })
    ]
};


var clientConfig = {
    cache: true,
    entry: {
        "app": "./src/app/boot",
        "styles": [
            "./resources/styles/main.scss"
        ],
        "bootstrap": [
            "bootstrap-sass!./resources/bootstrap-sass.config.js"
        ]
    },
    output: {
        path: __dirname,
        filename: "./dist/[name].bundle.js"
    },
    devtool: 'source-map',
    module: {
        loaders: [            
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            },
            {
                test: /bootstrap\/js\//, 
                loader: 'imports?jQuery=jquery'
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: path.join(__dirname, 'resources', 'i18n'),
            to: path.join(__dirname, 'dist', 'i18n')
        }])
    ]
};

var serverConfig = {
    target: 'node',
    entry: './src/server',
    output: {
        path: path.join(__dirname, 'dist', 'server')
    },
    externals: checkNodeImport,
    node: {
        global: true,
        __dirname: true,
        __filename: true,
        process: true,
        Buffer: true
    }
};


module.exports = [
    // Client
    webpackMerge({}, defaultConfig, commonConfig, clientConfig),
    // Server
    webpackMerge({}, defaultConfig, commonConfig, serverConfig)
];

// Helpers
function checkNodeImport(context, request, cb) {
    if (!path.isAbsolute(request) && request.charAt(0) !== '.') {
        cb(null, 'commonjs ' + request); return;
    }
    cb();
}
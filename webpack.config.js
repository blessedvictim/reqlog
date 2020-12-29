const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
// const locateContentScripts = require("./utils/locateContentScripts");

const sourceRootPath = path.join(__dirname, "src");
// const contentScriptsPath = path.join(sourceRootPath, "ts", "contentScripts");
const distRootPath = path.join(__dirname, "dist");
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const webBrowser = process.env.WEB_BROWSER ? process.env.WEB_BROWSER : "chrome";

// const contentScripts = locateContentScripts(contentScriptsPath);

const extensionReloader = nodeEnv === "watch" ? new ExtensionReloader({
    port: 9128,
    reloadPage: true,
    entries: {
        background: "background",
        extensionPage: ["popup", "options"],
        // contentScript: Object.keys(contentScripts),
    }
}) : () => {
    this.apply = () => {
    }
};

const cleanWebpackPlugin = nodeEnv === "production" ? new CleanWebpackPlugin() : () => {
    this.apply = () => {
    }
};

module.exports = {
    optimization: {
        runtimeChunk: {
            name: 'runtime'
        }
    },
    devtool: 'source-map',
    entry: {
        background: path.join(sourceRootPath, "background", "background.js"),
        options: path.join(sourceRootPath, "options", "options.js"),
        popup: path.join(sourceRootPath, "popup", "popup.js"),
        // ...contentScripts,
    },
    output: {
        path: distRootPath,
        filename: "[name].js",
    },
    resolve: {
        extensions: [".js", ".jsx", ".json"],
        // modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
                    }
                ]
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, "options", "options.html"),
            inject: "body",
            filename: "options.html",
            title: "Options Page",
            chunks: ["options"],
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, "popup", "popup.html"),
            inject: "body",
            filename: "popup.html",
            title: "Popup Page",
            chunks: ["popup"],
        }),
        new CopyPlugin({
                patterns: [
                    {
                        from: path.join(sourceRootPath, "assets"),
                        to: path.join(distRootPath, "assets"),
                    },
                    {
                        from: path.join(sourceRootPath, "manifest.json"),
                        to: path.join(distRootPath, "manifest.json"),
                        toType: "file",
                    },
                ],
            }
        ),
        new webpack.DefinePlugin({
            "NODE_ENV": JSON.stringify(nodeEnv),
            "WEB_BROWSER": JSON.stringify(webBrowser),
        }),
        extensionReloader,
        cleanWebpackPlugin
    ],
}

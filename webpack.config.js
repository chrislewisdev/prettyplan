const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/ts/prettyplan.ts',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'src/index.html' }),
        new CopyWebpackPlugin(['src/style.css'])
    ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: { extensions: ['.ts', '.js'] },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    }
};
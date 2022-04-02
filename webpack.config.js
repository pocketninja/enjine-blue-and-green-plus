const path = require('path');
// const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/js/blue-and-green.js',
    output: {
        filename: 'js/blue-and-green.js',
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [
        // new CopyPlugin({
        //     patterns: [
        //         {from: './src/index.html', to: './'},
        //         {from: './src/game-assets', to: './game-assets/'},
        //     ]
        // })
    ],
    module: {
        rules: [
            {
                test: /.p?css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /.html$/i,
                use: ['html-loader'],
            }
        ]
    }
}
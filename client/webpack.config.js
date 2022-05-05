const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: ['./src/app.ts', './src/styles.scss'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|woff2?|eot)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext][query]"
        }
      },
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: "./src/index.html",
      favicon: "./src/favicon.ico",
    }),
    new MiniCssExtractPlugin({}),
    new CopyPlugin({
      patterns: [
        {from: "src/config.json", to: "config/config.json"},
        {from: "src/manifest.json"},
        {from: "src/help.html"},
        {from: "LICENSE"},
      ],
    }),
  ],
  performance: {
    maxAssetSize: 1048576,
    maxEntrypointSize: 524288,
  },
};

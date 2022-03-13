var path = require("path")
var webpack = require("webpack")
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var MiniCssExtractPlugin = require("mini-css-extract-plugin")

var CONFIG = {
  indexHtmlTemplate: "./src/index.html",
  fsharpEntry: "./src/App.fsproj",
  cssEntry: "./sass/main.sass",
  outputDir: "./deploy",
  assetsDir: "./public",
  devServerPort: 8080,
  devServerProxy: undefined,
  babel: {
    presets: [
      ["@babel/preset-env", {
        "targets": "> 0.25%, not dead",
        "modules": false,
        "useBuiltIns": "usage",
        "corejs": 3
      }]
    ],
  }
}

var isProduction = !process.argv.find(v => v.indexOf('webpack-dev-server') !== -1);
console.log("Bundling for " + (isProduction ? "production" : "development") + "...");

var commonPlugins = [
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: resolve(CONFIG.indexHtmlTemplate)
  })
];

module.exports = {
  entry: isProduction ? {
    app: [resolve(CONFIG.fsharpEntry), resolve(CONFIG.cssEntry)]
  } : {
    app: [resolve(CONFIG.fsharpEntry)],
    style: [resolve(CONFIG.cssEntry)]
  },
  output: {
    path: resolve(CONFIG.outputDir),
    filename: isProduction ? '[name].[fullhash].js' : '[name].js'
  },
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "eval-source-map",
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /node_modules/,
          name: "vendors",
          chunks: "all"
        }
      }
    },
  },
  plugins: isProduction ?
    commonPlugins.concat([
      new MiniCssExtractPlugin({ filename: 'style.css' }),
      new CopyWebpackPlugin({ patterns: [{ from: resolve(CONFIG.assetsDir), noErrorOnMissing: true }]}),
    ])
    : commonPlugins.concat([
      new webpack.HotModuleReplacementPlugin(),
    ]),
  resolve: {
    symlinks: false
  },
  devServer: {
    static: resolve(CONFIG.assetsDir),
    port: CONFIG.devServerPort,
    proxy: CONFIG.devServerProxy
  },
  module: {
    rules: [
      {
        test: /\.fs(x|proj)?$/,
        use: {
          loader: "fable-loader",
          options: {
            babel: CONFIG.babel
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: CONFIG.babel
        },
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 
          'css-loader',
          {
            loader: 'sass-loader',
            options: { implementation: require("sass") }
          }
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/,
        use: ["file-loader"]
      }
    ]
  }
};

function resolve(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
}

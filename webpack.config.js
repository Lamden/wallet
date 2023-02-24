var webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    CleanWebpackPlugin = require("clean-webpack-plugin"),
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    WriteFilePlugin = require("write-file-webpack-plugin");
    NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
    
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, ("secrets." + env.NODE_ENV + ".js"));

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

var options = {
  //optimization: {minimize: false},
  mode: env.NODE_ENV,
  entry: {
    popup: path.join(__dirname, "src", "js", "popup.js"),
    confirm: path.join(__dirname, "src", "js", "confirm.js"),
    app: path.join(__dirname, "src", "js", "app.js"),
    options: path.join(__dirname, "src", "js", "options.js"),
    background: path.join(__dirname, "src", "js", "background.js"),
    content: path.join(__dirname, "src", "js", "content.js")
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [
          path.resolve(__dirname, "node_modules", "monaco-editor"),
          path.resolve(__dirname, "node_modules", "flatpickr")
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: "file-loader",
        options: {
          name: "[name].[ext]"
        },
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
        options: {
          removeSVGTagAttrs: true
        }
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      },
      {
        test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: false,
						hotReload: false
					}
				}
      }
    ]
  },
  resolve: {
    alias: alias
  },
  plugins: [
    // clean the build folder
    //new CleanWebpackPlugin(["build"]),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV)
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: "src/manifest.json",
        transform: function (content, path) {
          // generates the manifest file using the package.json informations
          return Buffer.from(JSON.stringify({
            description: process.env.npm_package_description,
            version: process.env.npm_package_version,
            ...JSON.parse(content.toString())
          }))
        }
      },
      {
        from: "src/jdenticon.min.js"
      }
    ]}),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "confirm.html"),
      filename: "confirm.html",
      chunks: ["confirm"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "app.html"),
      filename: "app.html",
      chunks: ["app"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "options.html"),
      filename: "options.html",
      chunks: ["options"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "background.html"),
      filename: "background.html",
      chunks: ["background"]
    }),
    new WriteFilePlugin(),
    new MonacoWebpackPlugin({
			languages: ["python"],
		}),
    new NodePolyfillPlugin()
  ]
};

if (env.NODE_ENV === "development") {
  // options.devtool = "eval-cheap-module-source-map";
  options.devtool = "cheap-module-source-map";
}

module.exports = options;

const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const ShebangPlugin = require('webpack-shebang-plugin');

const moduleTypeExtension = {
  'commonjs': 'cjs',
  'es': 'mjs'
}

const getConfigLib = (entryFile, outputFileName, platform, moduleType) => ({
  context: __dirname,
  mode: 'production',
  entry: entryFile,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${outputFileName}.${platform}.${moduleTypeExtension[moduleType]}`,
    chunkFormat: moduleType === "es" ? "module" : "commonjs",
    globalObject: 'this',
    library: {
      name: 'gql-grammar-worker',
      type: moduleType === "mjs" ? "module" : "commonjs"
    },
  },
  experiments: {
    outputModule: moduleType === 'es',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin(),
    ],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json'
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ESLintPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
      }),
    ],
  },
});

const getConfigCli = (entryFile, outputFile) => ({
  context: __dirname,
  mode: 'production',
  target: 'node',
  entry: entryFile,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin(),
    ],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json'
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ESLintPlugin(),
    new ShebangPlugin()
  ],
});

module.exports = [
  getConfigLib('./src/lib/index.ts', 'lib', 'web', 'es'),
  getConfigLib('./src/lib/index.ts', 'lib', 'web', 'commonjs'),
  getConfigCli('./src/cli/index.ts', 'cli.js'),
];

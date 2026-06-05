const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const nodeExternals = require('webpack-node-externals');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  externals: [
    nodeExternals({
      modulesDir: join(__dirname, 'node_modules'),
      allowlist: [/^@shared\//],
    }),
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      outputHashing: 'none',
      externalDependencies: 'none',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      sourceMap: true,
      optimization: false,
      generatePackageJson: false,
      useTsconfigPaths: true,
      mergeExternals: true,
      assets: [],
    }),
  ],
};

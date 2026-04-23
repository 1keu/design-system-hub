const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');
const webpack = require('webpack');
const path = require('path');
require('dotenv').config();

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  const supabaseUrl  = process.env.SUPABASE_URL  || '';
  const supabaseKey  = process.env.SUPABASE_ANON_KEY || '';

  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'inline-source-map',

    entry: {
      ui:     './src/ui/index.tsx',
      code:   './src/plugin/code.ts',
      webapp: './src/webapp/index.tsx',
    },

    module: {
      rules: [
        { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
        { test: /\.css$/,  use: ['style-loader', 'css-loader'] },
      ],
    },

    resolve: { extensions: ['.tsx', '.ts', '.js'] },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    plugins: [
      // Plugin UI — inlined into ui.html (Figma plugin requirement)
      new HtmlWebpackPlugin({
        template: './src/ui/index.html',
        filename: 'ui.html',
        chunks: ['ui'],
        inject: 'body',
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),

      // Web App — normal HTML
      new HtmlWebpackPlugin({
        template: './src/webapp/index.html',
        filename: 'index.html',
        chunks: ['webapp'],
        inject: 'body',
      }),

      // Inject Supabase credentials at build time
      new webpack.DefinePlugin({
        'window.__SUPABASE_URL__':  JSON.stringify(supabaseUrl),
        'window.__SUPABASE_KEY__':  JSON.stringify(supabaseKey),
      }),
    ],

    devServer: {
      static: path.resolve(__dirname, 'dist'),
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
    },
  };
};

module.exports = {
  base: {
    exclude: [
      'html',
      'html-starter',
      'html-demo',
      'dist',
      'build',
      'assets',
      'tasks',
      'node_modules',
      '_temp',
      'node-script'
    ],
    serverPath: './',

    buildTemplatePath: 'html',
    buildPath: './build'
  },
  development: {
    distPath: './assets/vendor',

    minify: false,
    sourcemaps: true,
    devtool: 'eval-source-map',


    cleanDist: false
  },
  production: {
    distPath: './assets/vendor',
    minify: true,

    sourcemaps: false,
    devtool: '#source-map',

    cleanDist: true
  }
};
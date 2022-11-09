const nodeExternals = require('webpack-node-externals');

module.exports = {
  configureWebpack: config => {
    if(process.env.NODE_ENV === 'production') {
      config.externals = [nodeExternals({allowlist: [/^element-ui/]}) ];
    }
  },
  css: {
    //Import variables into all stylesheets.
    loaderOptions: {
      sass: {
        additionalData: `@import '@/assets/styles';`
      }
    }
  }
}

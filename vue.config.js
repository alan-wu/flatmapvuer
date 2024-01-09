const nodeExternals = require('webpack-node-externals');

module.exports = {
  configureWebpack: config => {
    if(process.env.NODE_ENV === 'production') {
      config.externals = [nodeExternals({allowlist: [/^element-ui/]}) ];
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')
    const fontsRule = config.module.rule('fonts')
    fontsRule.uses.clear()
    config.module
      .rule('fonts')
      .test(/\.(ttf|otf|eot|woff|woff2)$/)
      .use('base64-inline-loader')
      .loader('base64-inline-loader')
      .tap(options => {
        // modify the options...    
        return options
      })
      .end()
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 3
            }
          }
        }
      })
  },
  css: {
    //Import variables into all stylesheets.
    loaderOptions: {
      sass: {
        prependData: `@import '@/assets/styles';`
      }
    }
  }
}

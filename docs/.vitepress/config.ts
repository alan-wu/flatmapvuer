import { defineConfig } from 'vitepress'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FlatmapVuer Docs",
  description: "API documentation for FlatmapVuer",
  base: '/flatmapvuer/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'FlatmapVuer', link: '/components/FlatmapVuer' },
      { text: 'MultiFlatmapVuer', link: '/components/MultiFlatmapVuer' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Live demo', link: '/demo' }
        ]
      },
      {
        text: 'API References',
        items: [
          { text: 'FlatmapVuer', link: '/components/FlatmapVuer' },
          { text: 'MultiFlatmapVuer', link: '/components/MultiFlatmapVuer' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ABI-Software/flatmapvuer' }
    ]
  },
  markdown: { attrs: { disable: true } },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '../src/assets/styles' as *;`
        },
      },
    },
    plugins: [
      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'css',
          }),
        ],
      }),

      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
    ]
  }
})

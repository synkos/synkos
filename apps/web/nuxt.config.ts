// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxt/content', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'en', 'data-theme': 'dark' },
      title: 'Synkos — The fullstack mobile framework',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Synkos is a framework and scaffolding CLI for building fullstack mobile and web apps with Vue, Capacitor and Node.',
        },
        { name: 'theme-color', content: '#0a0a0a' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Synkos' },
        { property: 'og:site_name', content: 'Synkos' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preconnect',
          href: 'https://rsms.me/',
        },
        {
          rel: 'stylesheet',
          href: 'https://rsms.me/inter/inter.css',
        },
      ],
    },
  },

  content: {
    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 3,
        },
        highlight: {
          theme: {
            default: 'github-dark',
            dark: 'github-dark',
            light: 'github-light',
          },
          langs: [
            'bash',
            'shell',
            'js',
            'ts',
            'json',
            'vue',
            'vue-html',
            'html',
            'css',
            'scss',
            'yaml',
            'md',
            'diff',
          ],
        },
      },
    },
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'synkos_locale',
      redirectOn: 'root',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://synkos.dev',
      githubRepo: process.env.NUXT_PUBLIC_GITHUB_REPO || 'https://github.com/synkos/synkos',
    },
  },

  nitro: {
    preset: 'node-server',
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    // Workspace packages need to be pre-bundled or Vite skips them — without
    // this, `vite-plugin-css-injected-by-js` from @synkos/ui doesn't run and
    // hoisted vnodes lose their ref owner context during hydration.
    optimizeDeps: {
      include: ['@synkos/ui', '@synkos/client'],
    },
    ssr: {
      // Treat workspace packages as ESM during Nitro SSR to keep template
      // refs and component instances coherent across server/client.
      noExternal: ['@synkos/ui', '@synkos/client'],
    },
  },

  typescript: {
    strict: true,
  },
});

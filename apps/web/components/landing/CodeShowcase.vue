<script setup lang="ts">
const { t } = useI18n();

const tabs = [
  { id: 'config', label: 'app.config.ts' },
  { id: 'router', label: 'router/index.ts' },
  { id: 'page', label: 'HomePage.vue' },
] as const;

type TabId = (typeof tabs)[number]['id'];
const active = ref<TabId>('config');

const snippets: Record<TabId, string> = {
  config: `import { defineAppConfig } from 'synkos'

export default defineAppConfig({
  identity: {
    name: 'My App',
    bundleId: 'com.myco.app',
  },
  features: {
    socialLogin: ['google', 'apple'],
    biometric: true,
    pushNotifications: true,
  },
  links: {
    terms: 'https://myco.app/terms',
    privacy: 'https://myco.app/privacy',
  },
})`,
  router: `import { createRouter, createWebHashHistory } from 'vue-router'
import { MainLayout, AuthLayout, setupSynkosRouter } from '@synkos/client'
import { settingsRoutes } from './settings.routes'

export default defineRouter(() => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/auth',
        component: AuthLayout,
        children: [
          { path: 'login', component: () => import('src/pages/auth/LoginPage.vue') },
        ],
      },
      {
        path: '/',
        component: MainLayout,
        children: [
          { path: '', name: 'home', component: () => import('src/features/home/pages/HomePage.vue') },
          ...settingsRoutes,
        ],
      },
    ],
  })

  setupSynkosRouter(router)
  return router
})`,
  page: `<script setup lang="ts">
import { AppPage, AppButton, AppListSection, AppListRow } from '@synkos/ui'
import { useAuthStore } from '@synkos/client'

const auth = useAuthStore()
<\/script>

<template>
  <AppPage :title="$t('home.title')">
    <AppListSection :header="$t('home.welcome', { name: auth.user?.name })">
      <AppListRow icon="settings" :label="$t('home.settings')" to="/settings" />
      <AppListRow icon="help" :label="$t('home.help')" to="/help" />
    </AppListSection>

    <AppButton variant="primary" @click="auth.signOut">
      {{ $t('common.signOut') }}
    </AppButton>
  </AppPage>
</template>`,
};
</script>

<template>
  <section class="showcase container">
    <header class="showcase__header">
      <h2 class="showcase__title">{{ t('landing.code.title') }}</h2>
      <p class="showcase__subtitle">{{ t('landing.code.subtitle') }}</p>
    </header>

    <div class="showcase__window">
      <div class="showcase__chrome">
        <span class="showcase__dot" data-color="r" />
        <span class="showcase__dot" data-color="y" />
        <span class="showcase__dot" data-color="g" />
        <div class="showcase__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="showcase__tab"
            :data-active="active === tab.id"
            @click="active = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <pre class="showcase__code"><code>{{ snippets[active] }}</code></pre>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.showcase {
  padding: $space-16 $space-6;

  @media (min-width: $bp-lg) {
    padding: $space-20 $space-8;
  }

  &__header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto $space-12;
  }

  &__title {
    font-size: clamp(#{$text-3xl}, 5vw, #{$text-4xl});
    line-height: $leading-tight;
    font-weight: $weight-bold;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: $space-3;
  }

  &__subtitle {
    color: var(--text-secondary);
    font-size: $text-md;
  }

  &__window {
    max-width: 960px;
    margin: 0 auto;
    background: var(--bg-code);
    border: 1px solid var(--border-default);
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  &__chrome {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-3 $space-4;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-subtle);
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--border-strong);

    &[data-color='r'] {
      background: #ff5f57;
    }
    &[data-color='y'] {
      background: #febc2e;
    }
    &[data-color='g'] {
      background: #28c840;
    }
  }

  &__tabs {
    display: flex;
    gap: $space-1;
    margin-inline-start: $space-4;
    overflow-x: auto;
  }

  &__tab {
    padding: $space-1 $space-3;
    border-radius: $radius-sm;
    font-size: $text-xs;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-tertiary);
    transition: all $duration-fast $ease-out;
    white-space: nowrap;

    &[data-active='true'] {
      background: var(--bg-canvas);
      color: var(--text-primary);
    }

    &:hover:not([data-active='true']) {
      color: var(--text-secondary);
    }
  }

  &__code {
    margin: 0;
    padding: $space-6;
    background: var(--bg-code);
    border: none;
    border-radius: 0;
    font-size: $text-sm;
    line-height: 1.6;
    color: var(--text-primary);
    overflow-x: auto;
    white-space: pre;
  }
}
</style>

---
'@synkos/client': patch
'create-synkos': patch
---

Two small fixes hit when scaffolding a fresh app with `pnpm create synkos`.

**`quasar.config.ts` — type incompatibility with `synkos/vite`.** The lazy import of `synkosExtendViteConf` was typed as `((conf: unknown) => void) | null`, but the real export takes a structural `ViteConfShape`. Function parameters are contravariant, so vue-tsc rejected the destructuring assignment and `pnpm dev` failed with: `Type '(viteConf: ViteConfShape, opts?: ExtendOptions) => void' is not assignable to type '(conf: unknown) => void'`. Switched the variable to `typeof import('synkos/vite').synkosExtendViteConf | null` so it inherits the real signature.

**`AccountHubPage.vue` — multi-root warning under page transition.** The page rendered `<AppPage>` and `<SignOutDialog>` as siblings. When `MainLayout` wraps the page in its `<Transition>`, Vue logged `Component inside <Transition> renders non-element root node that cannot be animated`. Moved `<SignOutDialog>` inside `<AppPage>` — `AppBottomSheet` already teleports to `<body>`, so the visual position is unchanged.

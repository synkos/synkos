import { coreEnUS } from '@synkos/client';

/**
 * App-specific i18n strings, merged with the core strings from @synkos/client.
 *
 * HOW TO ADD STRINGS:
 *  - New top-level namespaces (e.g. a new feature): add them at the root level.
 *  - New keys inside an existing core namespace: re-declare ONLY the sub-key
 *    and spread the rest from the core, as shown for `pages` below.
 *  - To OVERRIDE a core string: just re-declare it here — it takes precedence.
 *
 * HOW UPDATES WORK:
 *  When @synkos/client releases new core strings, they appear here automatically
 *  via the spread — no manual copy needed. Only strings you declare explicitly
 *  below need your attention on package updates.
 */
export default {
  ...coreEnUS,

  // ── App-specific tabs ──────────────────────────────────────────────────────
  tabs: {
    home: 'Home',
    profile: 'Profile',
  },

  // ── App-specific pages ─────────────────────────────────────────────────────
  // Spread core pages so all settings/auth/profile strings remain available,
  // then add or override only what this app needs.
  pages: {
    ...coreEnUS.pages,

    home: {
      title: 'Welcome',
      subtitle: 'Everything you need,\nalways with you.',
    },

    // Extend the core profile page with app-specific stat labels.
    profile: {
      ...coreEnUS.pages.profile,
      stats: {
        stat1: 'Stat 1',
        stat2: 'Stat 2',
        stat3: 'Stat 3',
      },
    },
  },
};

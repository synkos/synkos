import { coreEsES } from '@synkos/client';

export default {
  ...coreEsES,

  tabs: {
    home: 'Inicio',
    profile: 'Perfil',
  },

  pages: {
    ...coreEsES.pages,

    home: {
      title: 'Bienvenido',
      subtitle: 'Todo lo que necesitas,\nsiempre contigo.',
    },

    profile: {
      ...coreEsES.pages.profile,
      stats: {
        stat1: 'Stat 1',
        stat2: 'Stat 2',
        stat3: 'Stat 3',
      },
    },
  },
};

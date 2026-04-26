import { defineBoot } from '#q-app/wrappers';
import { createNotificationsBoot } from '@synkos/client';

export default defineBoot(
  createNotificationsBoot({
    // onNotification: (notification) => {
    //   // Custom foreground handler — e.g. show an in-app banner
    // },
    // onActionPerformed: (action) => {
    //   // Custom tap handler — default navigates to action.notification.data.screen
    // },
  }),
);

// Applies the persisted/system theme as early as possible on the client
// to prevent dark/light flash on hydration.
export default defineNuxtPlugin(() => {
  const { init } = useTheme();
  init();
});

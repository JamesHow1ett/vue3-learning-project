import { createApp } from 'vue';

/**
 * Create an app for test composables which relies on lifecycle hooks
 * @param {() => T} composable
 * @returns {{ result: T, app: import('vue').App<Element> }}
 */
export function withSetup(composable) {
  let result;
  const app = createApp({
    setup() {
      result = composable();

      return () => {};
    },
  });
  app.mount(document.createElement('div'));

  return { result, app };
}

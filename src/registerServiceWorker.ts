import { registerSW } from 'virtual:pwa-register';

export function initPWA() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Can optionally prompt user to refresh for update
        console.log('New content available, reload to update.');
      },
      onOfflineReady() {
        console.log('App ready to work offline.');
      },
    });
    return updateSW;
  }
  return () => {};
}

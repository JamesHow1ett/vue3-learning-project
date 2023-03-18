export const WsWorker = new SharedWorker(new URL('sharedworker.js?sharedworker', import.meta.url));

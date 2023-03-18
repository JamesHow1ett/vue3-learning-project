/* eslint-disable no-restricted-globals */
const API_KEY = '4ff1dff5100a4e26bc68a7a29236e9860b5e0513f4695695bc59dd9a6c082b3a';
const BASE_URL_SOCKET = 'wss://streamer.cryptocompare.com/v2';

const url = new URL(BASE_URL_SOCKET);
url.searchParams.append('api_key', API_KEY);

const ws = new WebSocket(url);
const broadcastChannel = new BroadcastChannel('WebSocketChannel');
const idToPortMap = {};

/**
 * Generate a message from worker
 * @param {any} payload
 * @returns {{ payload: any, type: string }}
 */
const workerMessageFactory = (payload, type) => ({ payload, type });

const sendMessage = (data) => {
  if (data.TYPE === '5') {
    broadcastChannel.postMessage(workerMessageFactory(data, 'update_ticker'));
  }

  if (data.TYPE === '20') {
    broadcastChannel.postMessage(workerMessageFactory(data, 'ws_openned'));
  }
};

ws.onopen = () =>
  broadcastChannel.postMessage(workerMessageFactory({ wsState: ws.readyState }, 'WSState'));
ws.onclose = () =>
  broadcastChannel.postMessage(workerMessageFactory({ wsState: ws.readyState }, 'WSState'));

ws.addEventListener('message', ({ data }) => {
  const parsedData = JSON.parse(data);
  sendMessage(parsedData);
});

// eslint-disable-next-line no-undef
onconnect = (e) => {
  const port = e.ports[0];
  port.onmessage = (msg) => {
    idToPortMap[msg.data[0].from] = port;

    if (msg.data[0] === 'SubAdd') {
      const subRequest = {
        action: 'SubAdd',
        subs: [`5~CCCAGG~${msg.data[1]}~USD`],
      };
      ws.send(JSON.stringify(subRequest));
    }

    if (msg.data[0] === 'SubRemove') {
      const subRequest = {
        action: 'SubRemove',
        subs: [`5~CCCAGG~${msg.data[1]}~USD`],
      };
      ws.send(JSON.stringify(subRequest));
    }

    port.postMessage({ wsState: ws.readyState, data: msg.data });
  };

  port.postMessage({ state: ws.readyState, type: 'WSState' });
};

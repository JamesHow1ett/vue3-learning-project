import { BASE_URL_SOCKET, API_KEY } from './constants';

const url = new URL(BASE_URL_SOCKET);
url.searchParams.append('api_key', API_KEY);

const ccStreamer = new WebSocket(url);

ccStreamer.onopen = function onStreamOpen() {
  const subRequest = {
    action: 'SubAdd',
    subs: ['2~Coinbase~BTC~USD'],
  };
  ccStreamer.send(JSON.stringify(subRequest));
};

ccStreamer.onmessage = function onStreamMessage(event) {
  console.log(`Received from Cryptocompare: ${event}`);
};

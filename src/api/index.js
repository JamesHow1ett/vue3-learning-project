import { BASE_URL_REST, API_KEY } from './constants';

async function fetchData(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}

export async function fetchTickersPrices(tickersName = []) {
  const url = new URL(`${BASE_URL_REST}/pricemulti`);
  url.searchParams.append('fsyms', tickersName.join(','));
  url.searchParams.append('tsyms', 'USD');
  url.searchParams.append('api_key', API_KEY);

  const result = await fetchData(url);

  return result;
}

export async function fetchSingleTickePrices(tickerName) {
  const url = new URL(`${BASE_URL_REST}/price`);
  url.searchParams.append('fsyms', tickerName);
  url.searchParams.append('tsyms', 'USD');
  url.searchParams.append('api_key', API_KEY);

  const result = await fetchData(url);

  return result;
}

import { BASE_URL_REST, API_KEY } from './constants';

/**
 *
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchData(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

/**
 * Fetch data for array of tickers
 * @param {string[]} tickersName
 * @returns {Promise<{
 *  [tickerName: string]: { USD: number }
 * }>}
 */
export async function fetchTickersPrices(tickersName) {
  const url = new URL(`${BASE_URL_REST}/pricemulti`);
  url.searchParams.append('fsyms', tickersName.join(','));
  url.searchParams.append('tsyms', 'USD');
  url.searchParams.append('api_key', API_KEY);

  const result = await fetchData(url);

  return result;
}

/**
 * Fetch data for single ticker
 * @param {string} tickerName
 * @returns {Promise<{
 *  [tickerName: string]: { USD: number }
 * }>}
 */
export async function fetchSingleTickePrices(tickerName) {
  const url = new URL(`${BASE_URL_REST}/price`);
  url.searchParams.append('fsyms', tickerName);
  url.searchParams.append('tsyms', 'USD');
  url.searchParams.append('api_key', API_KEY);

  const result = await fetchData(url);

  return result;
}

/**
 * Fetch all available coins
 * @returns {Promise<{
 *  Data: {
 *  [tickerName: string]: {
 *    Symbol: string;
 *    FullName: string;
 *    ImageUrl: string;
 *    };
 *  }
 * }>}
 */
export async function fetchAvailableCoinList() {
  const url = new URL(`${BASE_URL_REST}/all/coinlist`);
  url.searchParams.append('summary', true);
  url.searchParams.append('api_key', API_KEY);

  const result = await fetchData(url);

  return result;
}

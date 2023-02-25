const baseUrl = 'https://min-api.cryptocompare.com/data';

async function fetchData(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}

// pricemulti?fsyms=BTC&tsyms=USD
export async function fetchTickersPrices(tickersName = []) {
  const url = new URL(`${baseUrl}/pricemulti`);
  url.searchParams.append('fsyms', tickersName.join(','));
  url.searchParams.append('tsyms', 'USD');

  const result = await fetchData(url);

  return result;
}

const STORAGE_KEY = 'tickers-list';

/**
 * @returns {string[] | null}
 */
export function getTickerList() {
  const tickers = localStorage.getItem(STORAGE_KEY);

  if (!tickers) {
    return null;
  }

  return JSON.parse(tickers);
}

export function setTickerList(tickers) {
  const tickersStringified = JSON.stringify(tickers);

  localStorage.setItem(STORAGE_KEY, tickersStringified);
}

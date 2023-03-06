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

/**
 *
 * @param {string[]} tickers
 */
export function setTickerList(tickers) {
  if (!tickers.length) {
    localStorage.removeItem('tickers-list');
    return;
  }

  const tickersStringified = JSON.stringify(tickers);

  localStorage.setItem(STORAGE_KEY, tickersStringified);
}

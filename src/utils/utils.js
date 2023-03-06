import { MINIMAL_INTL_NUMBER_FORMAT_VALUE, TICKERS_PER_PAGE } from './constants';

/**
 * @param {number} price
 * @param {boolean} [isParseAsNumber=false]
 * @returns {string} Parsed price to the human view
 */
export const parseTickerPrice = (price, isParseAsNumber) => {
  if (price < MINIMAL_INTL_NUMBER_FORMAT_VALUE) {
    return `$${price.toPrecision(1)}`;
  }

  const formatter = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' });

  if (isParseAsNumber) {
    return price < MINIMAL_INTL_NUMBER_FORMAT_VALUE
      ? `$${price.toPrecision(2)}`
      : formatter.format(price);
  }

  return formatter.format(price);
};

/**
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const gerRandomNumber = (min, max) => Math.round(Math.random() * (max - min) + min);

/**
 *
 * @param {number} tickers
 * @returns {number}
 */
export const getAllPages = (tickers) => {
  const hasRemainderOfDivision = tickers % TICKERS_PER_PAGE > 0;

  if (hasRemainderOfDivision) {
    return Math.floor(tickers / TICKERS_PER_PAGE) + 1;
  }

  return Math.floor(tickers / TICKERS_PER_PAGE);
};

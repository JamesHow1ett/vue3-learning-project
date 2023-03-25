import { MINIMAL_INTL_NUMBER_FORMAT_VALUE, TICKERS_PER_PAGE } from './constants';

/**
 * Format ticker rate to currency view
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
 * Get random number in a range
 * @param {number} min
 * @param {number} max
 * @param {number[]} excludes - Array of numbers to exclude from generate
 * @returns {number} Default return random number in range from 0 to 10
 */
export const getRandomNumber = (min = 0, max = 10, excludes = []) => {
  const randomNumber = Math.round(Math.random() * (max - min) + min);

  if (excludes.includes(randomNumber)) {
    return getRandomNumber(min, max, excludes);
  }

  return randomNumber;
};

/**
 * Calculate how many pages tickers will take
 * default is 6 tickers showing on the page
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

/**
 * Fill array with numbers from start to end
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 *
 * @example
 * fillRange(1, 4) => [1, 2, 3, 4]
 * fillRange(1, -1) => []
 * fillRange(-1, 2) => []
 * fillRange(2, 1) => []
 */
export const fillRange = (start, end) => {
  if (start > end) {
    return [];
  }

  if (start < 0 || end < 0) {
    return [];
  }

  const length = start === 0 ? end + 1 : end - start + 1;
  const range = new Array(length);
  range[0] = start;
  range[length - 1] = end;

  for (let i = 1; i < length; i += 1) {
    range[i] = start + i;
  }

  return range;
};

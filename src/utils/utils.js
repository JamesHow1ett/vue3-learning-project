import { MINIMAL_INTL_NUMBER_FORMAT_VALUE } from './constants';

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

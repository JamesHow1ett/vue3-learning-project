import { describe, expect, test } from 'vitest';
import * as utils from '../utils';

describe('Utils', () => {
  describe('parseTickerPrice', () => {
    const { parseTickerPrice } = utils;

    test.each`
      number      | expected
      ${1}        | ${'$1.00'}
      ${10}       | ${'$10.00'}
      ${0.1}      | ${'$0.10'}
      ${0.01}     | ${'$0.01'}
      ${0.001}    | ${'$0.001'}
      ${0.000322} | ${'$0.0003'}
    `('should parse number $number to currency view $expected', ({ number, expected }) => {
      const result = parseTickerPrice(number);

      expect(result).toBe(expected);
    });

    test('should parse number to currency view', () => {
      const result = parseTickerPrice(0.342, true);

      expect(result).toBe('$0.34');
    });
  });

  describe('getRandomNumber', () => {
    const { getRandomNumber } = utils;

    test('should return a random number between 0 and 10 by default', () => {
      const result = getRandomNumber();

      expect(result >= 0).toBe(true);
      expect(result <= 10).toBe(true);
    });

    test.each`
      min  | max
      ${5} | ${20}
      ${1} | ${3}
    `('should return a random number between $min and $max', ({ min, max }) => {
      const result = getRandomNumber(min, max);

      expect(result >= min).toBe(true);
      expect(result <= max).toBe(true);
    });

    test.each`
      min  | max   | exclude
      ${1} | ${20} | ${[5, 10, 15]}
      ${1} | ${20} | ${[7, 10, 15, 19]}
      ${1} | ${20} | ${[5, 10, 15, 8, 6]}
    `(
      'should return a random number between $min and $max and exclude $exclude',
      ({ min, max, exclude }) => {
        const result = getRandomNumber(min, max, exclude);

        expect(result >= min).toBe(true);
        expect(result <= max).toBe(true);
        expect(exclude.includes(result)).toBe(false);
      }
    );
  });

  describe('getAllPages', () => {
    const { getAllPages } = utils;

    test.each`
      tickers | expected
      ${2}    | ${1}
      ${6}    | ${1}
      ${7}    | ${2}
      ${12}   | ${2}
      ${13}   | ${3}
    `(
      'should return number of total pages $expected for tickers $tickers',
      ({ tickers, expected }) => {
        const result = getAllPages(tickers);

        expect(result).toBe(expected);
      }
    );
  });

  describe('fillRange', () => {
    const { fillRange } = utils;

    test.each`
      start | end   | expected
      ${2}  | ${1}  | ${[]}
      ${-1} | ${1}  | ${[]}
      ${0}  | ${-1} | ${[]}
      ${1}  | ${4}  | ${[1, 2, 3, 4]}
      ${2}  | ${3}  | ${[2, 3]}
      ${0}  | ${5}  | ${[0, 1, 2, 3, 4, 5]}
    `(
      'should return $expected if passed start: $start and end: $end',
      ({ start, end, expected }) => {
        const result = fillRange(start, end);

        expect(result).toEqual(expected);
      }
    );
  });
});

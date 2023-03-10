import { defineStore } from 'pinia';
import { fetchTickersPrices, fetchSingleTickePrices, fetchAvailableCoinList } from '../api';
import { Storage, ALL_COINS_NAMES, TICKERS_STORAGE_KEY } from '../services/localStoreService';
import { MAX_GRAPH_ELEMENTS } from './constants';

export const useTickerStore = defineStore('ticker', {
  /**
   * @typedef {object} Ticker
   * @property {string} name
   * @property {string} fullName
   * @property {number | string} rate
   * @property {number[]} prices
   * @property {string} imgUrl
   */
  /**
   * @typedef {object} Coin
   * @property {string} Symbol
   * @property {string} FullName
   * @property {string} ImageUrl
   */
  /**
   * @returns {{
   *  tickers: Ticker[];
   *  currentTicker: Ticker | null;
   *  allCoins: {
   *    [tickerName: string]: Coin
   *  } | null;
   *  allCoinsNames: string[][]
   *  loading: boolean;
   *  maxGraphElements: number;
   * }}
   */
  state: () => ({
    allCoins: null,
    allCoinsNames: [],
    tickers: [],
    currentTicker: null,
    loading: false,
    maxGraphElements: MAX_GRAPH_ELEMENTS,
  }),
  getters: {
    getTickerByName(state) {
      /**
       * @param {string} tickerName
       * @returns {Ticker}
       */
      return (tickerName) => state.tickers.find(({ name }) => name === tickerName);
    },
  },
  actions: {
    /**
     * Fetch all coins data
     */
    async fetchAllCoinsList() {
      const savedAllCoins = Storage.getItem(ALL_COINS_NAMES);

      if (savedAllCoins) {
        /**
         * @type {{
         *  [tickerName: string]: Coin}
         * }
         */
        const parsedSavedAllCoins = JSON.parse(savedAllCoins);
        this.allCoins = parsedSavedAllCoins;
        this.allCoinsNames = Object.keys(parsedSavedAllCoins).map((key) => [
          key,
          parsedSavedAllCoins[key].FullName,
        ]);
        return;
      }

      this.loading = true;
      const { Data } = await fetchAvailableCoinList();

      this.allCoins = Data;
      this.allCoinsNames = Object.keys(Data).map((key) => [key, Data[key].FullName]);
      this.loading = false;

      Storage.setItem(ALL_COINS_NAMES, this.allCoins);
    },
    /**
     * Fetch data for all added tickers
     * @param {string | string[]} tickerName
     * @returns {Promise<Ticker[]>}
     */
    async fetchTikersData(tickerName) {
      this.loading = true;

      const tickers = this.tickers.map(({ name }) => name);

      if (typeof tickerName === 'string') {
        tickers.push(tickerName.toUpperCase());
      } else {
        tickers.push(...tickerName);
      }

      Storage.setArrayItem(TICKERS_STORAGE_KEY, tickers);

      const data = await fetchTickersPrices(tickers);
      /**
       * @type {Ticker[]}
       */
      const tickersList = tickers.map((name) => ({
        name,
        rate: data[name]?.USD ?? '-',
        prices: [data[name]?.USD ?? 0],
        imgUrl: this.allCoins[name]?.ImageUrl ?? '',
        fullName: this.allCoins[name]?.FullName ?? '',
      }));

      this.tickers = tickersList;
      this.loading = false;

      return tickersList;
    },
    /**
     * Update added tickers
     */
    async updateTickersData() {
      if (!this.tickers.length) {
        return;
      }

      const tickers = this.tickers.map(({ name }) => name);
      const data = await fetchTickersPrices(tickers);

      Object.keys(data).forEach((key) => {
        const ticker = this.tickers.find(({ name }) => name === key);
        ticker.rate = data[key].USD;
      });
    },
    /**
     * Update selected ticker prices
     */
    async graphPrices() {
      if (!this.currentTicker) {
        return;
      }

      const { USD } = await fetchSingleTickePrices(this.currentTicker.name);

      this.currentTicker.prices.push(USD);

      while (this.currentTicker.prices.length > this.maxGraphElements) {
        this.shiftSelectedTickerGraph();
      }
    },
    /**
     * Set selected ticker to recive data and show graph of prices
     * @param {string} tickerName
     */
    selectTicker(tickerName) {
      const ticker = this.tickers.find(({ name }) => name === tickerName);

      if (ticker) {
        this.currentTicker = {
          ...ticker,
          prices: [ticker.rate],
        };
      }
    },
    /**
     * Clear selection
     */
    unselectTicker() {
      this.currentTicker = null;
    },
    /**
     * Remove ticker from list of tickers
     * @param {string} tickerName
     */
    removeTicker(tickerName) {
      this.tickers = this.tickers.filter(({ name }) => name !== tickerName);

      if (this.currentTicker?.name === tickerName) {
        this.currentTicker = null;
      }

      Storage.setArrayItem(
        TICKERS_STORAGE_KEY,
        this.tickers.map(({ name }) => name)
      );
    },
    /**
     * Remove first price to show correct graph
     */
    shiftSelectedTickerGraph() {
      this.currentTicker.prices.shift();
    },
    /**
     * Set max elements value
     * @param {number} maxElements
     */
    setMaxGraphElements(maxElements) {
      this.maxGraphElements = maxElements;
    },
  },
});

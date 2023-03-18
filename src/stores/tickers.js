import { defineStore } from 'pinia';
import { fetchTickersPrices, fetchAvailableCoinList } from '../api';
import { Storage, ALL_COINS_NAMES, TICKERS_STORAGE_KEY } from '../services/localStoreService';
import { WsWorker } from '../services/shared-worker/WsSharedWorker';

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
        WsWorker.port.postMessage(['SubAdd', tickerName]);
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
     * Update added tickers data
     * @param {{
     *  FLAGS: number;
     *  FROMSYMBOL: string;
     *  PRICE: number;
     * }} wsTickerData
     */
    async updateTickersData(wsTickerData) {
      const ticker = this.tickers.find(({ name }) => name === wsTickerData.FROMSYMBOL);
      if (ticker && (wsTickerData.FLAGS === 1 || wsTickerData.FLAGS === 2)) {
        ticker.rate = wsTickerData.PRICE;
      }

      if (!this.currentTicker) {
        return;
      }

      if (wsTickerData.FLAGS === 1 || wsTickerData.FLAGS === 2) {
        this.currentTicker.prices.push(wsTickerData.PRICE);
      }

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
      const ticker = this.tickers.find(({ name }) => name === this.currentTicker.name);
      ticker.prices = [ticker.rate];
      this.currentTicker = null;
    },
    /**
     * Remove ticker from list of tickers
     * @param {string} tickerName
     */
    removeTicker(tickerName) {
      WsWorker.port.postMessage(['SubRemove', tickerName]);
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

import { defineStore } from 'pinia';
import { fetchTickersPrices, fetchSingleTickePrices, fetchAvailableCoinList } from '../api';

export const useTickerStore = defineStore('ticker', {
  /**
   * @typedef {object} Ticker
   * @property {string} name
   * @property {number} rate
   * @property {number[]} prices
   * @property {string} imgUrl
   */
  /**
   * @returns {{
   *  tickers: Ticker[];
   *  currentTicker: Ticker | null;
   *  allCoins: {
   *    [tickerName: string]: {
   *      Symbol: string;
   *      FullName: string;
   *      ImageUrl: string;
   *    };
   *  } | null;
   *  loading: boolean;
   * }}
   */
  state: () => ({
    allCoins: null,
    tickers: [],
    currentTicker: null,
    loading: false,
  }),
  getters: {
    getTickerByName(state) {
      /**
       * @param {string} tickerName
       */
      return (tickerName) => state.tickers.find(({ name }) => name === tickerName);
    },
  },
  actions: {
    async fetchAllCoinsList() {
      this.loading = true;
      const { Data } = await fetchAvailableCoinList();

      this.allCoins = Data;
      this.loading = false;
    },
    /**
     * Fetch data for all added tickers
     * @param {string} newTicker
     */
    async fetchTikersData(newTicker) {
      this.loading = true;

      const tickers = this.tickers.map(({ name }) => name);
      tickers.push(newTicker.toUpperCase());

      const data = await fetchTickersPrices(tickers);
      /**
       * @type {Ticker[]}
       */
      const tickersList = [];

      Object.keys(data).forEach((key) => {
        /**
         * @type {Ticker}
         */
        const tickerData = {
          name: key,
          rate: data[key].USD,
          prices: [data[key].USD],
          imgUrl: this.allCoins[key].ImageUrl,
        };
        tickersList.push(tickerData);
      });

      this.tickers = tickersList;
      this.loading = false;
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
    },
  },
});

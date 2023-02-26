import { defineStore } from 'pinia';
import { fetchTickersPrices, fetchSingleTickePrices } from '../api';

export const useTickerStore = defineStore('ticker', {
  state: () => ({
    tickers: [],
    currentTicker: null,
    loading: false,
  }),
  getters: {
    getTickerByName(state) {
      return (tickerName) => state.tickers.find(({ name }) => name === tickerName);
    },
  },
  actions: {
    async fetchTikersData(newTicker) {
      this.loading = true;

      const tickers = this.tickers.map(({ name }) => name);
      tickers.push(newTicker);

      const data = await fetchTickersPrices(tickers);
      const tickersList = [];

      Object.keys(data).forEach((key) => {
        const tickerData = {
          name: key,
          rate: data[key].USD,
        };
        tickersList.push(tickerData);
      });

      this.tickers = tickersList;
      this.loading = false;
    },
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
    async graphPrices() {
      if (!this.currentTicker) {
        return;
      }

      const { USD } = await fetchSingleTickePrices(this.currentTicker.name);

      this.currentTicker.prices.push(USD);
    },
    selectTicker(tickerName) {
      const ticker = this.tickers.find(({ name }) => name === tickerName);

      if (ticker) {
        this.currentTicker = {
          ...ticker,
          prices: [ticker.rate],
        };
      }
    },
    unselectTicker() {
      this.currentTicker = null;
    },
    removeTicker(tickerName) {
      const filteredTickers = this.tickers.filter(({ name }) => name !== tickerName);

      this.tickers = filteredTickers;
    },
  },
});

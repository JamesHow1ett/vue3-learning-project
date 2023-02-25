import { defineStore } from 'pinia';
import { fetchTickersPrices } from '../api';

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
    },
    selectTicker(tickerName) {
      const ticker = this.tickers.find(({ name }) => name === tickerName);

      if (ticker) {
        this.currentTicker = ticker;
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

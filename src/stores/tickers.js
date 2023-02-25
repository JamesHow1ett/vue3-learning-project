import { defineStore } from 'pinia';

export const useTickerStore = defineStore('ticker', {
  state: () => ({
    tickers: [
      {
        name: 'lol',
        value: 1488,
      },
      {
        name: 'kek',
        value: 322,
      },
    ],
    currentTicker: null,
    loading: false,
  }),
  getters: {
    getTickerByName(state) {
      return (tickerName) => state.tickers.find(({ name }) => name === tickerName);
    },
  },
  actions: {
    addTicker(tickerData) {
      this.tickers.push(tickerData);
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

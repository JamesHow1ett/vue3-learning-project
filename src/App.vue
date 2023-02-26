<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTickerStore } from './stores/tickers';
import { TIMER_DELAY } from './utils/constants';

import AnimatedSpinner from './components/animated-spinner/AnimatedSpinner.vue';
import TickerItem from './components/ticker-item/TickerItem.vue';
import BarChart from './components/bar-chart/BarChart.vue';

const { THREE_SECONDS, FIVE_SECONDS } = TIMER_DELAY;

let intervalUpdateGraph;
let intervalUpdateTickersData;
const tickerInput = ref('');
const errorIsTickerAdded = ref(false);

const store = useTickerStore();
const { tickers, loading, currentTicker } = storeToRefs(store);

watch(tickers, (newValue, oldValue) => {
  if (!newValue.length) {
    clearInterval(intervalUpdateTickersData);
    return;
  }

  if (newValue.length !== oldValue.length) {
    clearInterval(intervalUpdateTickersData);

    intervalUpdateTickersData = setInterval(() => {
      store.updateTickersData();
    }, FIVE_SECONDS);
  }
});

watch(currentTicker, (value) => {
  if (!value) {
    clearInterval(intervalUpdateGraph);
    return;
  }

  intervalUpdateGraph = setInterval(() => {
    store.graphPrices();
  }, THREE_SECONDS);
});

watch(
  () => tickerInput.value,
  (tickerName) => {
    const addedTicker = store.getTickerByName(tickerName);

    errorIsTickerAdded.value = !!addedTicker;
  }
);

function removeTicker(tickerName) {
  store.removeTicker(tickerName);
}

function addNewTicker() {
  if (!tickerInput.value) {
    return;
  }

  store.fetchTikersData(tickerInput.value);

  tickerInput.value = '';
}

function selectTicker(tickerName) {
  if (!tickerName || errorIsTickerAdded.value) {
    return;
  }

  clearInterval(intervalUpdateGraph);

  if (currentTicker.value && currentTicker.value.name === tickerName) {
    store.unselectTicker();

    return;
  }

  store.selectTicker(tickerName);
}
</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700">Ticker</label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                id="wallet"
                v-model="tickerInput"
                type="text"
                name="wallet"
                class="block w-full pr-10 pl-2 py-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Example DOGE"
                @keyup.enter="addNewTicker"
              />
            </div>
            <!-- <div class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                BTC
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                DOGE
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                BCH
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                CHD
              </span>
            </div> -->
            <div v-if="errorIsTickerAdded" class="text-sm text-red-600">
              Ticker is already added
            </div>
          </div>
        </div>
        <button
          :disabled="!tickerInput || errorIsTickerAdded"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-25"
          @click="addNewTicker"
        >
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Add
        </button>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl
          class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3"
          :class="{
            relative: loading,
            'py-6': loading,
          }"
        >
          <animated-spinner v-if="loading" />
          <template v-else>
            <ticker-item
              v-for="ticker in tickers"
              :key="ticker.name"
              :ticker="ticker"
              @remove-ticker="removeTicker"
              @select-ticker="selectTicker"
            />
          </template>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <template v-if="currentTicker">
        <bar-chart :ticker="currentTicker" @unset-ticker="store.unselectTicker" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTickerStore } from './stores/tickers';
import { TIMER_DELAY } from './utils/constants';
import { defaultTypeSuggestions } from './stores/constants';

import AnimatedSpinner from './components/animated-spinner/AnimatedSpinner.vue';
import TickerItem from './components/ticker-item/TickerItem.vue';
import BarChart from './components/bar-chart/BarChart.vue';

const { THREE_SECONDS, FIVE_SECONDS } = TIMER_DELAY;
const TICKERS_PER_PAGE = 6;

let intervalUpdateGraph;
let intervalUpdateTickersData;
const state = reactive({
  tickerInput: '',
  filterInput: '',
  errorIsTickerAdded: false,
  typeSuggestions: defaultTypeSuggestions,
  pagination: {
    startIdx: 0,
    endIdx: 6,
  },
});
const store = useTickerStore();
const { allCoins, tickers, loading, currentTicker } = storeToRefs(store);

onMounted(async () => {
  await store.fetchAllCoinsList();
});

const filteredTickers = computed(() =>
  tickers.value.filter((ticker) => ticker.name.includes(state.filterInput.toUpperCase()))
);

const paginatedTickers = computed(() =>
  filteredTickers.value.slice(state.pagination.startIdx, state.pagination.endIdx)
);

const currentPage = computed(() => state.pagination.endIdx / TICKERS_PER_PAGE);

const allPages = computed(() => {
  const hasRemainderOfDivision = filteredTickers.value.length % TICKERS_PER_PAGE > 0;

  if (hasRemainderOfDivision) {
    return Math.floor(filteredTickers.value.length / TICKERS_PER_PAGE) + 1;
  }

  return Math.floor(filteredTickers.value.length / TICKERS_PER_PAGE);
});

const hasPrevPage = computed(() => currentPage.value > 1);

const hasNextPage = computed(() => filteredTickers.value.length > state.pagination.endIdx);

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
  () => state.tickerInput,
  (tickerName) => {
    const tickerNameUpperCase = tickerName.toUpperCase();
    const addedTicker = store.getTickerByName(tickerNameUpperCase);
    state.errorIsTickerAdded = !!addedTicker;

    const allSuggestions = [];

    Object.values(allCoins.value).forEach((coin) => {
      if (coin.Symbol === tickerNameUpperCase) {
        allSuggestions.push(coin);
        return;
      }

      const finded =
        coin.Symbol.includes(tickerNameUpperCase) || coin.FullName.includes(tickerName);

      if (finded) {
        allSuggestions.push(coin);
      }
    });

    const exactMatch = allSuggestions.find((coin) => coin.Symbol === tickerNameUpperCase);
    let suggestionList = [];

    if (exactMatch) {
      suggestionList = [exactMatch, ...allSuggestions.slice(0, 3)];
    } else {
      suggestionList = [...allSuggestions.slice(0, 4)];
    }

    state.typeSuggestions = suggestionList.map((coin) => ({
      tickerName: coin.Symbol,
    }));
  }
);

function prevPage() {
  if (hasPrevPage.value) {
    state.pagination.startIdx -= TICKERS_PER_PAGE;
    state.pagination.endIdx -= TICKERS_PER_PAGE;
  }
}

function nextPage() {
  if (hasNextPage.value) {
    state.pagination.startIdx += TICKERS_PER_PAGE;
    state.pagination.endIdx += TICKERS_PER_PAGE;
  }
}

function removeTicker(tickerName) {
  store.removeTicker(tickerName);

  if (paginatedTickers.value.length < currentPage.value * TICKERS_PER_PAGE) {
    prevPage();
  }
}

function addNewTicker() {
  if (!state.tickerInput) {
    return;
  }

  store.fetchTikersData(state.tickerInput);

  state.tickerInput = '';
}

function addFromSuggestion(tickerName) {
  store.fetchTikersData(tickerName);
  state.tickerInput = '';
}

function selectTicker(tickerName) {
  if (!tickerName || state.errorIsTickerAdded) {
    return;
  }

  clearInterval(intervalUpdateGraph);

  if (currentTicker.value?.name === tickerName) {
    store.unselectTicker();

    return;
  }

  store.selectTicker(tickerName);
}
</script>

<template>
  <animated-spinner v-if="loading" />

  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700">Ticker</label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                id="wallet"
                v-model="state.tickerInput"
                type="text"
                name="wallet"
                class="block w-full pr-10 pl-2 py-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Example DOGE"
                @keyup.enter="addNewTicker"
              />
            </div>
            <div
              v-if="state.typeSuggestions.length"
              class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
            >
              <span
                v-for="suggestion in state.typeSuggestions"
                :key="suggestion.tickerName"
                :class="{
                  'cursor-not-allowed': !!store.getTickerByName(suggestion.tickerName),
                  'opacity-25': !!store.getTickerByName(suggestion.tickerName),
                  'text-grey-800': !!store.getTickerByName(suggestion.tickerName),
                }"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer hover:text-purple-800"
                @click="() => addFromSuggestion(suggestion.tickerName)"
              >
                {{ suggestion.tickerName }}
              </span>
            </div>
            <div v-if="errorIsTickerAdded" class="text-sm text-red-600">
              Ticker is already added
            </div>
          </div>
        </div>
        <button
          :disabled="!state.tickerInput || state.errorIsTickerAdded"
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
        <div class="max-w-xs">
          <label for="filter" class="block text-sm font-medium text-gray-700">Filter</label>
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              id="filter"
              v-model="state.filterInput"
              type="text"
              name="filter"
              class="block w-full pr-10 pl-2 py-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Example DOGE"
            />
          </div>
          <div class="mt-4">
            <button
              :disabled="!hasPrevPage"
              type="button"
              class="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-25"
              @click="prevPage"
            >
              Prev
            </button>
            <span class="mx-4 font-medium">Page: {{ currentPage }}/{{ allPages }}</span>
            <button
              :disabled="!hasNextPage"
              type="button"
              class="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-25"
              @click="nextPage"
            >
              Next
            </button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <ticker-item
            v-for="ticker in paginatedTickers"
            :key="ticker.name"
            :ticker="ticker"
            @remove-ticker="removeTicker"
            @select-ticker="selectTicker"
          />
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <template v-if="currentTicker">
        <bar-chart :ticker="currentTicker" @unset-ticker="store.unselectTicker" />
      </template>
    </div>
  </div>
</template>

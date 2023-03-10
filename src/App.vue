<script setup>
import { onMounted, reactive, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTickerStore } from './stores/tickers';
import { fillRange, getAllPages, getRandomNumber } from './utils/utils';
import { TIMER_DELAY, TICKERS_PER_PAGE, DEFAULT_PAGINATION } from './utils/constants';
import { defaultTypeSuggestions } from './stores/constants';
import { Storage, TICKERS_STORAGE_KEY } from './services/localStoreService';
import { usePageParams } from './composables/usePageParams';

import AnimatedSpinner from './components/animated-spinner/AnimatedSpinner.vue';
import TickerItem from './components/ticker-item/TickerItem.vue';
import BarChart from './components/bar-chart/BarChart.vue';
import VButton from './components/v-button/VButton.vue';

const { THREE_SECONDS, FIVE_SECONDS } = TIMER_DELAY;

const { updatePageOptions, getPageOptions, deletePageOption } = usePageParams();

const { filter } = getPageOptions();

let intervalUpdateGraph;
let intervalUpdateTickersData;
const state = reactive({
  tickerInput: '',
  filterInput: filter ?? '',
  errorIsTickerAdded: false,
  typeSuggestions: defaultTypeSuggestions,
  pagination: { ...DEFAULT_PAGINATION },
});
const store = useTickerStore();
const { allCoins, allCoinsNames, tickers, loading, currentTicker } = storeToRefs(store);

onMounted(async () => {
  await store.fetchAllCoinsList();

  const savedTickers = Storage.getItem(TICKERS_STORAGE_KEY);

  if (savedTickers) {
    /**
     * @type {string[]}
     */
    const parseSavedTickers = JSON.parse(savedTickers);

    store.fetchTikersData(parseSavedTickers).then((tickersList) => {
      const { page } = getPageOptions();
      const parsedPage = parseInt(page, 10);

      if (parsedPage < 1 || Number.isNaN(parsedPage) || filter) {
        deletePageOption('page');
        state.pagination = {
          ...DEFAULT_PAGINATION,
        };

        return;
      }

      if (parsedPage === 1) {
        state.pagination = {
          ...DEFAULT_PAGINATION,
        };
      } else if (parsedPage > 1) {
        const lastPage = getAllPages(tickersList.length);
        const hasPage = tickersList.length / (parsedPage * TICKERS_PER_PAGE - TICKERS_PER_PAGE) > 1;

        if (hasPage) {
          state.pagination = {
            startIdx: parsedPage * TICKERS_PER_PAGE - TICKERS_PER_PAGE,
            endIdx: parsedPage * TICKERS_PER_PAGE,
          };
        } else {
          state.pagination = {
            startIdx: lastPage * TICKERS_PER_PAGE - TICKERS_PER_PAGE,
            endIdx: DEFAULT_PAGINATION.endIdx * lastPage,
          };
        }
      }

      updatePageOptions(state.pagination.endIdx / TICKERS_PER_PAGE, state.filterInput);
    });
  } else {
    deletePageOption('page');
  }
});

const addedTickersNames = computed(() => tickers.value.map((ticker) => ticker.name));

const filteredTickers = computed(() =>
  tickers.value.filter((ticker) => ticker.name.includes(state.filterInput.toUpperCase()))
);

const paginatedTickers = computed(() =>
  filteredTickers.value.slice(state.pagination.startIdx, state.pagination.endIdx)
);

const currentPage = computed(() => {
  return state.pagination.endIdx / TICKERS_PER_PAGE;
});

const allPages = computed(() => getAllPages(tickers.value.length));

const hasPrevPage = computed(() => currentPage.value > 1);

const hasNextPage = computed(() => filteredTickers.value.length > state.pagination.endIdx);

const pageOptions = computed(() => ({
  page: currentPage.value,
  filter: state.filterInput,
}));

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

/**
 * Show random suggestion
 */
const getRandomSuggestions = () => {
  const maxLenth = allCoinsNames.value.length;
  const startIdx = getRandomNumber(0, maxLenth - 4);
  const endIdx = startIdx + 4;

  const guessSuggestions = allCoinsNames.value
    .slice(startIdx, endIdx)
    .map(([coinName]) => coinName);
  const randomSuggestionsList = [];

  guessSuggestions.forEach((coin) => {
    if (addedTickersNames.value.includes(coin)) {
      const excludeIndexes = fillRange(startIdx, endIdx);
      const newRandomIdx = getRandomNumber(startIdx, endIdx, excludeIndexes);
      const [[suggestions]] = allCoinsNames.value.slice(startIdx, endIdx).slice(newRandomIdx);

      randomSuggestionsList.push({
        tickerName: allCoins.value[suggestions].Symbol,
      });
    } else {
      randomSuggestionsList.push({
        tickerName: allCoins.value[coin].Symbol,
      });
    }
  });
  state.typeSuggestions = randomSuggestionsList;
};

/**
 * Show suggestions list, but not more than four suggestion
 * @param {string} tickerName
 */
const updateSuggestions = (tickerName) => {
  const tickerNameUpperCase = tickerName.toUpperCase();
  const addedTicker = store.getTickerByName(tickerNameUpperCase);
  state.errorIsTickerAdded = !!addedTicker;

  /**
   * @type {string[]}
   */
  const allSuggestions = [];

  allCoinsNames.value.forEach(([coinName, coinFullName]) => {
    if (coinName === tickerNameUpperCase) {
      allSuggestions.push(coinName);
      return;
    }

    const finded = coinName.includes(tickerNameUpperCase) || coinFullName.includes(tickerName);

    if (finded) {
      allSuggestions.push(coinName);
    }
  });

  const exactMatchIdx = allSuggestions.indexOf(tickerNameUpperCase);

  if (exactMatchIdx !== -1) {
    state.typeSuggestions = [allSuggestions[exactMatchIdx], ...allSuggestions.slice(0, 3)].map(
      (coin) => ({
        tickerName: allCoins.value[coin].Symbol,
      })
    );
  } else {
    state.typeSuggestions = [...allSuggestions.slice(0, 4)].map((coin) => ({
      tickerName: allCoins.value[coin].Symbol,
    }));
  }
};

watch(
  () => state.tickerInput,
  (value) => {
    if (value) {
      updateSuggestions(value);
    } else {
      getRandomSuggestions();
    }
  }
);

watch(
  () => state.filterInput,
  () => {
    state.pagination = { ...DEFAULT_PAGINATION };
  }
);

watch(
  () => filteredTickers.value.length,
  (length) => {
    if (length === 0) {
      deletePageOption('page');
    }
  }
);

watch(
  () => pageOptions.value,
  (value) => {
    updatePageOptions(value.page, value.filter);
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
  if (!state.tickerInput || state.errorIsTickerAdded) {
    return;
  }

  store.fetchTikersData(state.tickerInput);

  state.tickerInput = '';
}

function addFromSuggestion(tickerName, isAdded = false) {
  if (isAdded) {
    return;
  }

  store.fetchTikersData(tickerName);
  state.tickerInput = '';

  getRandomSuggestions();
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
  <Transition name="spinner">
    <animated-spinner v-if="loading" />
  </Transition>

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
                  '!cursor-not-allowed': !!store.getTickerByName(suggestion.tickerName),
                  '!opacity-25': !!store.getTickerByName(suggestion.tickerName),
                  '!text-grey-800': !!store.getTickerByName(suggestion.tickerName),
                }"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer hover:text-purple-800"
                @click="
                  () =>
                    addFromSuggestion(
                      suggestion.tickerName,
                      !!store.getTickerByName(suggestion.tickerName)
                    )
                "
              >
                {{ suggestion.tickerName }}
              </span>
            </div>
            <div v-if="state.errorIsTickerAdded" class="text-sm text-red-600">
              Ticker is already added
            </div>
          </div>
        </div>
        <v-button :disabled="!state.tickerInput || state.errorIsTickerAdded" @click="addNewTicker">
          <template #append-icon>
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
          </template>
          Add
        </v-button>
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
            <v-button :disabled="!hasPrevPage" @click="prevPage"> Prev </v-button>
            <span class="mx-4 font-medium">Page: {{ currentPage }}/{{ allPages }}</span>
            <v-button :disabled="!hasNextPage" @click="nextPage"> Next </v-button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <transition-group name="tickers-list">
            <template v-if="paginatedTickers.length">
              <ticker-item
                v-for="ticker in paginatedTickers"
                :key="ticker.name"
                :ticker="ticker"
                @remove-ticker="removeTicker"
                @select-ticker="selectTicker"
              />
            </template>
            <div v-else>
              <span class="text-md">No results found.</span>
            </div>
          </transition-group>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <Transition name="bar-chart">
        <bar-chart
          v-if="currentTicker"
          :ticker="currentTicker"
          @unset-ticker="store.unselectTicker"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.spinner-enter-active,
.spinner-leave-active,
.bar-chart-enter-active,
.bar-chart-leave-active {
  transition: all 0.5s ease;
}

.tickers-list-enter-active,
.tickers-list-leave-active {
  transition: all 0.3s ease-in;
}

.bar-chart-enter-from,
.bar-chart-leave-to,
.spinner-enter-from,
.spinner-leave-to {
  opacity: 0;
}
.tickers-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.tickers-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTickerStore } from '../../stores/tickers';
import { parseTickerPrice } from '../../utils/utils';

import VButton from '../v-button/VButton.vue';

const props = defineProps({
  ticker: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const emit = defineEmits(['removeTicker', 'selectTicker']);

const store = useTickerStore();
const { currentTicker } = storeToRefs(store);

const parsedPrice = computed(() => {
  if (!props.ticker.name) {
    return '-';
  }

  if (typeof props.ticker.rate === 'string') {
    return '-';
  }

  return parseTickerPrice(props.ticker.rate);
});

const isActive = computed(() => {
  if (!currentTicker.value) {
    return false;
  }

  if (!props.ticker.name) {
    return false;
  }

  return currentTicker.value.name === props.ticker.name;
});

function removeTicker() {
  if (!props.ticker.name) {
    return;
  }

  emit('removeTicker', props.ticker.name);
}

function selectTicker() {
  if (!props.ticker.name) {
    return;
  }

  emit('selectTicker', props.ticker.name);
}
</script>

<template>
  <div
    class="bg-white overflow-hidden shadow rounded-lg border-4 border-solid cursor-pointer"
    :class="{ 'border-purple-800': isActive }"
  >
    <div class="px-4 py-5 sm:p-6 text-center" data-testid="ticker-body" @click="selectTicker">
      <dt class="text-sm font-medium text-gray-500 truncate">
        <div class="flex justify-center items-center gap-1" data-testid="ticker-info">
          {{ ticker.name }}
          <img
            :src="`https://www.cryptocompare.com/${ticker.imgUrl}`"
            :alt="ticker.name"
            class="object-cover h-6"
          />
        </div>
      </dt>
      <dd class="mt-1 text-3xl font-semibold text-gray-900" data-testid="ticker-price">
        {{ parsedPrice }}
      </dd>
    </div>
    <div class="w-full border-t border-gray-200"></div>
    <v-button
      icon-button
      class="group flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-purple-800 hover:bg-gray-200 transition-all focus:outline-none"
      data-testid="remove-btn"
      @click="removeTicker"
    >
      <template #append-icon>
        <svg
          class="h-5 w-5 group-hover:fill-purple-800"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="#718096"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </template>
      Remove
    </v-button>
  </div>
</template>

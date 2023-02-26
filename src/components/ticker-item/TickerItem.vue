<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTickerStore } from '../../stores/tickers';

const props = defineProps({
  ticker: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const emit = defineEmits(['removeTicker', 'selectTicker']);

const parseTickerValue = computed(() => {
  if (!props.ticker.name) {
    return '';
  }

  if (props.ticker.rate >= 1) {
    return props.ticker.rate.toFixed(2);
  }

  return props.ticker.rate.toPrecision(2);
});

const store = useTickerStore();
const { currentTicker } = storeToRefs(store);

function removeTicker() {
  emit('removeTicker', props.ticker.name);
}

function selectTicker() {
  emit('selectTicker', props.ticker.name);
}

const isActive = computed(() => {
  if (!currentTicker.value) {
    return false;
  }

  if (!props.ticker.name) {
    return false;
  }
  return currentTicker.value.name === props.ticker.name;
});
</script>

<template>
  <div
    class="bg-white overflow-hidden shadow rounded-lg border-4 border-solid cursor-pointer"
    :class="{ 'border-purple-800': isActive }"
  >
    <div class="px-4 py-5 sm:p-6 text-center" @click="selectTicker">
      <dt class="text-sm font-medium text-gray-500 truncate">
        {{ ticker.name }}
      </dt>
      <dd class="mt-1 text-3xl font-semibold text-gray-900">
        {{ parseTickerValue }}
      </dd>
    </div>
    <div class="w-full border-t border-gray-200"></div>
    <button
      class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
      @click="removeTicker"
    >
      <svg
        class="h-5 w-5"
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
      Remove
    </button>
  </div>
</template>

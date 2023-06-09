<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useTickerStore } from '../../stores/tickers';
import { MAX_GRAPH_ELEMENTS } from '../../stores/constants';
import { parseTickerPrice } from '../../utils/utils';
import { HALF_GRAPH_HEIGHT } from './constants';
import { userRandomBgColor } from '../../composables/useRandomBgColor';

import VButton from '../v-button/VButton.vue';

const props = defineProps({
  ticker: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['unsetTicker']);

const store = useTickerStore();

const { bgColor, updateColor } = userRandomBgColor();

const barChart = ref(null);
const maxValue = ref(0);
const minValue = ref(0);

const noramilizedGraph = computed(() => {
  if (maxValue.value === minValue.value) {
    return props.ticker.prices.map(() => {
      updateColor();

      return {
        price: HALF_GRAPH_HEIGHT,
        bgColor: bgColor.value,
      };
    });
  }

  return props.ticker.prices.map((price) => {
    updateColor();

    return {
      price: 5 + ((price - minValue.value) * 95) / (maxValue.value - minValue.value),
      bgColor: bgColor.value,
    };
  });
});

function calculateMaxGraphElements() {
  if (!barChart.value) {
    return;
  }

  store.setMaxGraphElements(barChart.value.clientWidth / MAX_GRAPH_ELEMENTS);
}

watch(
  () => props.ticker,
  () => {
    maxValue.value = Math.max(...props.ticker.prices);
    minValue.value = Math.min(...props.ticker.prices);
    nextTick().then(calculateMaxGraphElements);
  },
  {
    deep: true,
    immediate: true,
  }
);

onMounted(() => {
  window.addEventListener('resize', calculateMaxGraphElements);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateMaxGraphElements);
});
</script>

<template>
  <section class="relative flex py-4 mt-6">
    <h3
      class="absolute text-lg leading-6 font-medium text-gray-900 -top-4"
      data-testid="chart-name"
    >
      {{ ticker.fullName }} - USD
    </h3>
    <div class="flex flex-col justify-between mr-2" data-testid="chart-legend">
      <div class="text-[0.7rem]">
        {{ parseTickerPrice(maxValue, true) }}
      </div>
      <div class="text-[0.7rem]">
        {{ parseTickerPrice(minValue, true) }}
      </div>
    </div>
    <div
      ref="barChart"
      class="flex items-end border-gray-600 border-b border-l w-[95%] h-64"
      data-testid="graph"
    >
      <transition-group name="graph">
        <div
          v-for="(bar, idx) in noramilizedGraph"
          :key="idx"
          :style="{ height: `${bar.price}%` }"
          :class="bar.bgColor"
          class="border w-10"
          data-testid="bar"
        ></div>
      </transition-group>
    </div>
    <v-button
      type="button"
      class="absolute top-0 right-0"
      icon-button
      data-testid="close-chart-btn"
      @click="emit('unsetTicker')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:svgjs="http://svgjs.com/svgjs"
        version="1.1"
        width="30"
        height="30"
        x="0"
        y="0"
        viewBox="0 0 511.76 511.76"
        style="enable-background: new 0 0 512 512"
        xml:space="preserve"
      >
        <g>
          <path
            d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
            fill="#718096"
            data-original="#000000"
          ></path>
        </g>
      </svg>
    </v-button>
  </section>
</template>

<style scoped>
.graph-enter-active,
.graph-leave-active {
  transition: all 0.5s ease;
}
.graph-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.graph-leave-to {
  opacity: 0;
}
</style>

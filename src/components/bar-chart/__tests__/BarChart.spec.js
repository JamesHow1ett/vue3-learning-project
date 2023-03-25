import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { parseTickerPrice } from '../../../utils/utils';
import { mockTicker } from './mocks';
import BarChart from '../BarChart.vue';

vi.mock('../../../services/shared-worker/WsSharedWorker', () => ({
  WsWorker: () => {},
}));

describe('BarChart component', () => {
  /**
   * @type {import('@vue/test-utils').VueWrapper | null}
   */
  let wrapper = null;

  /**
   * @param {import('@vue/test-utils').MountingOptions} options
   */
  const createComponent = (options = {}) => {
    wrapper = shallowMount(BarChart, {
      props: {
        ticker: mockTicker,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
        mocks: {
          $setup() {
            return { parseTickerPrice };
          },
        },
      },
      ...options,
    });
  };

  const findFullText = () => wrapper.find('[data-testid="chart-name"]');
  const findChartLegend = () => wrapper.find('[data-testid="chart-legend"]');
  const findCloseChartButton = () => wrapper.find('[data-testid="close-chart-btn"]');
  const findGraph = () => wrapper.find('[data-testid="graph"]');

  beforeEach(async () => {
    createComponent();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('should render ticker full name', () => {
    const text = findFullText();

    expect(text.element.textContent).toContain(`${mockTicker.fullName} - USD`);
  });

  test('should render chart legend with min and max values', () => {
    createComponent({
      props: {
        ticker: {
          ...mockTicker,
          prices: [100, 200, 322],
        },
      },
    });

    const legend = findChartLegend();
    const maxValue = legend.element.childNodes[0];
    const minValue = legend.element.childNodes[1];

    expect(maxValue.textContent).toContain('$322.00');
    expect(minValue.textContent).toContain('$100.00');
  });

  test('should emit unsetTicker by click on the close button', async () => {
    const closeBtn = findCloseChartButton();

    await closeBtn.trigger('click');

    expect(wrapper.emitted('unsetTicker')).toBeTruthy();
  });

  describe('chart render', () => {
    test('render all bars with half height if prices have same value', () => {
      createComponent({
        props: {
          ticker: {
            ...mockTicker,
            prices: [100, 100, 100],
          },
        },
      });

      const chart = findGraph();
      const bars = chart.element.querySelectorAll('[data-testid="bar"]');

      expect(bars).toHaveLength(3);
      bars.forEach((bar) => {
        expect(bar.getAttribute('style')).toContain('height: 50%;');
      });
    });

    test('render bars with different height if prices have different values', () => {
      createComponent({
        props: {
          ticker: {
            ...mockTicker,
            prices: [100, 322, 420],
          },
        },
      });

      const chart = findGraph();
      const bars = chart.element.querySelectorAll('[data-testid="bar"]');
      const firstBarHeight = bars[0].getAttribute('style');
      const secondBarHeight = bars[1].getAttribute('style');
      const thirdBarHeight = bars[2].getAttribute('style');

      expect(bars).toHaveLength(3);
      expect(firstBarHeight).not.toBe(secondBarHeight);
      expect(firstBarHeight).not.toBe(thirdBarHeight);
      expect(secondBarHeight).not.toBe(thirdBarHeight);
    });

    test('not render bars if prices are empty', () => {
      createComponent({
        props: {
          ticker: {
            ...mockTicker,
            prices: [],
          },
        },
      });

      const chart = findGraph();
      const bars = chart.element.querySelectorAll('[data-testid="bar"]');

      expect(bars).toHaveLength(0);
    });
  });
});

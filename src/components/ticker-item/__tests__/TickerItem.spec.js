import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mockTicker } from './mocks';
import { initialState } from '../../../stores/tickers';

import TickerItem from '../TickerItem.vue';

vi.mock('../../../services/shared-worker/WsSharedWorker', () => ({
  WsWorker: () => {},
}));

describe('TickerItem component', () => {
  /**
   * @type {import('@vue/test-utils').VueWrapper | null}
   */
  let wrapper = null;

  const VButtonStub = {
    template: '<button>Remove</button>',
  };

  /**
   * @param {import('@vue/test-utils').MountingOptions} options
   * @param {Record<string, unknown>}
   */
  const createComponent = (options = {}, tickerState = initialState) => {
    wrapper = shallowMount(TickerItem, {
      props: {
        ticker: mockTicker,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ticker: {
                ...tickerState,
              },
            },
          }),
        ],
        stubs: {
          VButton: VButtonStub,
        },
      },
      ...options,
    });
  };

  const findTickerInfo = () => wrapper.find('[data-testid="ticker-info"]');
  const findTickerPrice = () => wrapper.find('[data-testid="ticker-price"]');
  const findTickerBody = () => wrapper.find('[data-testid="ticker-body"]');
  const findRemoveButton = () => wrapper.find('[data-testid="remove-btn"]');

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('should render ticker name', () => {
    const tickerInfo = findTickerInfo();

    expect(tickerInfo.element.textContent.trim()).toBe(mockTicker.name);
  });

  test('should render ticker img', () => {
    const tickerInfo = findTickerInfo();
    const img = tickerInfo.element.querySelector('img');

    expect(img.getAttribute('src')).toBe(`https://www.cryptocompare.com/${mockTicker.imgUrl}`);
    expect(img.getAttribute('alt')).toBe(mockTicker.name);
  });

  test('should parse and render ticker rate', () => {
    let tickerPrice = findTickerPrice();

    expect(tickerPrice.element.textContent.trim()).toBe('$322.00');

    createComponent({
      props: {
        ticker: {
          ...mockTicker,
          rate: 'rate',
        },
      },
    });

    tickerPrice = findTickerPrice();

    expect(tickerPrice.element.textContent.trim()).toBe('-');

    createComponent({
      props: {
        ticker: {
          ...mockTicker,
          name: '',
        },
      },
    });

    tickerPrice = findTickerPrice();

    expect(tickerPrice.element.textContent.trim()).toBe('-');
  });

  test('should render ticker as active if current ticker in store is passed ticker', () => {
    expect(wrapper.classes()).not.toContain('border-purple-800');

    createComponent(
      {},
      {
        initialState,
        currentTicker: mockTicker,
      }
    );

    expect(wrapper.classes()).toContain('border-purple-800');
  });

  describe('emits', () => {
    test('should emit selectTicker with ticker name', async () => {
      const tickerBody = findTickerBody();

      await tickerBody.trigger('click');

      const emitEvent = wrapper.emitted('selectTicker');

      expect(emitEvent).toHaveLength(1);
      expect(emitEvent[0][0]).toEqual(mockTicker.name);
    });

    test('should not emit selectTicker if ticker has no name', async () => {
      createComponent({
        props: {
          ticker: {
            ...mockTicker,
            name: '',
          },
        },
      });
      const tickerBody = findTickerBody();

      await tickerBody.trigger('click');

      expect(wrapper.emitted('selectTicker')).toBeUndefined();
    });

    test('should emit removeTicker with ticker name', async () => {
      const removeButton = findRemoveButton();

      await removeButton.trigger('click');

      const emitEvent = wrapper.emitted('removeTicker');

      expect(emitEvent).toHaveLength(1);
      expect(emitEvent[0][0]).toEqual(mockTicker.name);
    });

    test('should not emit removeTicker if ticker has no name', async () => {
      createComponent({
        props: {
          ticker: {
            ...mockTicker,
            name: '',
          },
        },
      });
      const removeButton = findRemoveButton();

      await removeButton.trigger('click');

      expect(wrapper.emitted('removeTicker')).toBeUndefined();
    });
  });
});

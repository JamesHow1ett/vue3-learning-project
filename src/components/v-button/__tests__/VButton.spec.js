import { describe, test, expect, afterEach, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import VButton from '../VButton.vue';

describe('VButton component', () => {
  /**
   * @type {import('@vue/test-utils').VueWrapper | null}
   */
  let wrapper = null;

  /**
   * @param {import('@vue/test-utils').MountingOptions} options
   */
  const createComponent = (options = {}) => {
    wrapper = shallowMount(VButton, {
      ...options,
    });
  };

  const findButton = () => wrapper.find('button');

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('should render a button', () => {
    const button = findButton();

    expect(button.element.tagName.toLowerCase()).toBe('button');
    expect(button.classes()).not.toHaveLength(0);
  });

  test('should not render any children by default', () => {
    const button = findButton();

    expect(button.element.children).toHaveLength(0);
  });

  test('button should not be disabled by default', () => {
    const button = findButton();

    expect(button.element.hasAttribute('disabled')).toBe(false);
    expect(button.classes()).not.toContain('disabled:opacity-25');
  });

  describe('props', () => {
    test('button should be disabled by props', () => {
      createComponent({
        props: {
          disabled: true,
        },
      });
      const button = findButton();

      expect(button.element.hasAttribute('disabled')).toBe(true);
      expect(button.classes()).toContain('disabled:opacity-25');
    });

    test('button should has no classes if passed iconButton prop', () => {
      createComponent({
        props: {
          iconButton: true,
        },
      });
      const button = findButton();

      expect(button.classes()).toHaveLength(0);
    });
  });

  describe('render slots', () => {
    test('should render passed child as default slot', () => {
      createComponent({
        slots: {
          default: '<span>Default slot</span>',
        },
      });
      const button = findButton();

      expect(button.element.children).toHaveLength(1);
      expect(button.text()).toBe('Default slot');
    });

    test('should render content in the append-icon slot', () => {
      createComponent({
        slots: {
          'append-icon': '<span>Append slot</span>',
        },
      });
      const button = findButton();

      expect(button.element.children).toHaveLength(1);
      expect(button.element.firstElementChild.textContent).toBe('Append slot');
    });

    test('should render content in the prepend-icon slot', () => {
      createComponent({
        slots: {
          'prepend-icon': '<span>Prepend slot</span>',
        },
      });
      const button = findButton();

      expect(button.element.children).toHaveLength(1);
      expect(button.element.firstElementChild.textContent).toBe('Prepend slot');
    });
  });

  describe('emits', () => {
    test('should emit click event', async () => {
      const button = findButton();

      await button.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('click');
    });

    test('should not emit click if button is disabled', async () => {
      createComponent({
        props: {
          disabled: true,
        },
      });
      const button = findButton();

      await button.trigger('click');

      expect(wrapper.emitted('click')).toBeUndefined();
    });
  });
});

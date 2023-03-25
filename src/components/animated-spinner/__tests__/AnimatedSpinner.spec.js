import { describe, test, expect, afterEach, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import AnimatedSpinner from '../AnimatedSpinner.vue';

describe('AnimatedSpinner component', () => {
  /**
   * @type {import('@vue/test-utils').VueWrapper | null}
   */
  let wrapper = null;

  const createComponent = (options = {}) => {
    wrapper = shallowMount(AnimatedSpinner, {
      ...options,
    });
  };

  const findSvg = () => wrapper.find('svg');

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('should render spinner wrapper with correct classes', () => {
    const expectedClasses = [
      'fixed',
      'w-100',
      'h-100',
      'opacity-80',
      'bg-purple-800',
      'inset-0',
      'z-50',
      'flex',
      'items-center',
      'justify-center',
    ];

    expect(wrapper.classes()).toEqual(expectedClasses);
  });

  test('should render svg icon as child with animation classes', () => {
    const expectedClasses = ['animate-spin', '-ml-1', 'mr-3', 'h-12', 'w-12', 'text-white'];
    const svg = findSvg();

    expect(svg.element.tagName.toLowerCase()).toBe('svg');
    expect(svg.classes()).toEqual(expectedClasses);
  });
});

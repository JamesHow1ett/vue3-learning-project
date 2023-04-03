import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { usePageParams } from '../usePageParams';

describe('usePageParams', () => {
  const testUrl = 'https://test-url.com';
  const spyFn = vi.fn;
  const windowStub = vi.fn(() => ({
    window: {
      location: {
        href: testUrl,
      },
      history: {
        pushState: spyFn(),
      },
    },
  }));

  beforeAll(() => {
    vi.stubGlobal('Window', windowStub);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('should return functions for get, set and delete', () => {
    const { getPageOptions, updatePageOptions, deletePageOption } = usePageParams();

    expect(typeof getPageOptions === 'function').toBeTruthy();
    expect(typeof updatePageOptions === 'function').toBeTruthy();
    expect(typeof deletePageOption === 'function').toBeTruthy();
  });

  test('getPageOptions should return an object with page and filter values', () => {
    const { getPageOptions } = usePageParams();
    const { page, filter } = getPageOptions();

    expect(page).toBeNull();
    expect(filter).toBeNull();
  });

  test('updatePageOptions should set current page and filter to the page params', () => {
    const { updatePageOptions, getPageOptions } = usePageParams();

    updatePageOptions(1, 'test');
    const { page, filter } = getPageOptions();

    expect(page).toBe('1');
    expect(filter).toBe('test');
  });

  test('deletePageOption should delete page option by passed option name', () => {
    const { deletePageOption, getPageOptions } = usePageParams();

    // values from the previous test
    expect(getPageOptions().page).toBe('1');
    expect(getPageOptions().filter).toBe('test');

    deletePageOption('page');

    expect(getPageOptions().page).toBeNull();
    expect(getPageOptions().filter).toBe('test');

    deletePageOption('filter');

    expect(getPageOptions().filter).toBeNull();
  });
});

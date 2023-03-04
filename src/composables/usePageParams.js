import { unref, ref, onMounted } from 'vue';

/**
 *
 * @returns {{
 *  page: import('vue').Ref<string>;
 *  filter: import('vue').Ref<string>;
 *  updatePageOptions: () => void;
 * }}
 */
export function usePageParams() {
  const { searchParams, pathname } = new URL(window.location.href);

  const page = ref(searchParams.get('page') ?? 1);
  const filter = ref(searchParams.get('filter') ?? '');

  /**
   *
   * @param {import('vue').Ref<number> | number} currentPage
   * @param {import('vue').Ref<string> | string} currentFilter
   */
  function updatePageOptions(currentPage, currentFilter) {
    page.value = unref(currentPage);
    filter.value = unref(currentFilter);

    if (parseInt(page.value, 10)) {
      searchParams.set('page', page.value);
    }

    if (filter.value) {
      searchParams.set('filter', filter.value);
    } else {
      searchParams.delete('filter');
    }

    if (searchParams.toString()) {
      window.history.pushState(null, document.title, `${pathname}?${searchParams.toString()}`);
    }
  }

  onMounted(() => {
    updatePageOptions(page, filter);
  });

  return { page, filter, updatePageOptions };
}

import { unref } from 'vue';

/**
 *
 * @returns {{
 *  getPageOptions: () => {
 *  page: string | null;
 *  filter: string | null;
 * };
 *  updatePageOptions: (currentPage: import('vue').Ref<number> | number, currentFilter: import('vue').Ref<string> | string) => void;
 *  deletePageOption: (optionName: string) => void;
 * }}
 */
export function usePageParams() {
  const { searchParams, pathname } = new URL(window.location.href);

  /**
   * @private
   */
  function setPageParams() {
    if (searchParams.toString()) {
      window.history.pushState(null, document.title, `${pathname}?${searchParams.toString()}`);
    } else {
      window.history.pushState(null, document.title, `${pathname}`);
    }
  }

  /**
   *
   * @param {import('vue').Ref<number> | number} currentPage
   * @param {import('vue').Ref<string> | string} currentFilter
   */
  function updatePageOptions(currentPage, currentFilter) {
    const page = unref(currentPage);
    const filter = unref(currentFilter);

    if (parseInt(page, 10)) {
      searchParams.set('page', page.toString());
    }

    if (filter) {
      searchParams.set('filter', filter);
    } else {
      searchParams.delete('filter');
    }

    setPageParams();
  }

  /**
   * 
   * @returns {{
   *  page: string | null;
   *  filter: string | null;
   * }}
   */
  function getPageOptions() {
    return {
      page: searchParams.get('page'),
      filter: searchParams.get('filter'),
    };
  }

  /**
   *
   * @param {string} optionName
   */
  function deletePageOption(optionName) {
    searchParams.delete(optionName);

    setPageParams();
  }

  return { updatePageOptions, getPageOptions, deletePageOption };
}

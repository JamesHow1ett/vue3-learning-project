export const TICKERS_STORAGE_KEY = 'tickers-list';
export const ALL_COINS_NAMES = 'all-coins-names';

export class Storage {
  /**
   * Get item from local storage
   * @param {string} key
   * @returns {string | null}
   */
  static getItem(key) {
    return localStorage.getItem(key);
  }

  /**
   * @param {string} key
   * @param {any} value
   * @returns {true}
   */
  static setItem(key, value) {
    const stringifiedValue = JSON.stringify(value);
    localStorage.setItem(key, stringifiedValue);

    return true;
  }

  /**
   * Set Array item, remove item from storage if passed to set an empty array
   * @param {string} key
   * @param {any[]} value
   * @returns {boolean}
   */
  static setArrayItem(key, value) {
    if (!value.length) {
      localStorage.removeItem(key);
      return false;
    }

    const stringifiedValue = JSON.stringify(value);

    localStorage.setItem(key, stringifiedValue);

    return true;
  }
}

import { beforeAll, describe, expect, test } from 'vitest';
import { isRef } from 'vue';
import { withSetup } from '../../utils/test-utils';

import { userRandomBgColor, COLOR_MAP } from '../useRandomBgColor';

const colorMapValues = Object.values(COLOR_MAP);

describe('userRandomBgColor', () => {
  /**
   * @type {{ bgColor: import('vue').Ref<string>; updateColor: () => void }}
   */
  let composable;

  beforeAll(() => {
    const { result } = withSetup(() => userRandomBgColor());
    composable = result;
  });

  test('should retrun ref and function', () => {
    expect(isRef(composable.bgColor)).toBeTruthy();
    expect(typeof composable.updateColor === 'function').toBeTruthy();
  });

  test('should return a color from color palete', () => {
    expect(colorMapValues).toContain(composable.bgColor.value);

    composable.updateColor();

    expect(colorMapValues).toContain(composable.bgColor.value);
  });
});

import { ref, onMounted } from 'vue';
import { getRandomNumber } from '../utils/utils';

const COLOR_MAP = {
  'color-1': 'bg-purple-800',
  'color-2': 'bg-amber-700',
  'color-3': 'bg-cyan-600',
  'color-4': 'bg-lime-600',
  'color-5': 'bg-fuchsia-600',
};

export function userRandomBgColor() {
  const bgColor = ref('');

  function updateColor() {
    const randomNumber = getRandomNumber(1, 5);
    const color = COLOR_MAP[`color-${randomNumber}`];
    bgColor.value = color;
  }

  onMounted(() => {
    updateColor();
  });

  return { bgColor, updateColor };
}

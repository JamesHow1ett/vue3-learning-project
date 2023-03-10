<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  iconButton: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const defaultClasses =
  'my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500';
const disabledClasses = 'disabled:opacity-25';
</script>

<template>
  <button
    :disabled="disabled"
    type="button"
    :class="{
      [defaultClasses]: !iconButton,
      [disabledClasses]: disabled,
    }"
    @click="emit('click', $event)"
  >
    <slot name="append-icon"></slot>
    <slot></slot>
    <slot name="prepend-icon"></slot>
  </button>
</template>

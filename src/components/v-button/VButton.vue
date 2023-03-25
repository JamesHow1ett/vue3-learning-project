<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  iconButton: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(['click']);

function handleClick(event) {
  if (props.disabled) {
    return;
  }

  emit('click', event);
}

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
    @click="handleClick($event)"
  >
    <slot name="append-icon"></slot>
    <slot></slot>
    <slot name="prepend-icon"></slot>
  </button>
</template>

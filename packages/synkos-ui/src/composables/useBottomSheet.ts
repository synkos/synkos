import { ref, computed } from 'vue';

export function useBottomSheet(initialOpen = false) {
  const isOpen = ref(initialOpen);

  const bindings = computed(() => ({
    modelValue: isOpen.value,
    'onUpdate:modelValue': (v: boolean) => {
      isOpen.value = v;
    },
  }));

  return {
    isOpen,
    bindings,
    open: () => {
      isOpen.value = true;
    },
    close: () => {
      isOpen.value = false;
    },
    toggle: () => {
      isOpen.value = !isOpen.value;
    },
  };
}

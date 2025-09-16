import { ref, watch, triggerRef } from 'vue'

export function modelRef(value: any = null) {
  const _value = ref(value);
  const skipNextWatch = ref(false);

  watch(_value, () => {
    if (skipNextWatch.value) {
      skipNextWatch.value = false;
      return;
    }
    skipNextWatch.value = true;
    triggerRef(_value);
  }, { deep: true });

  return _value;
} 
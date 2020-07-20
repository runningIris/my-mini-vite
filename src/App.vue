<template>
  <div>
    <h3>{{ count }}</h3>
    <p>{{ double }}</p>
    <button @click="add">click</button>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import "./index.css";
export default {
  setup() {
    const count = ref(0);
    function add() {
      count.value++;
    }
    const double = computed(() => count.value * 2);
    return { add, count, double };
  },
};
</script>

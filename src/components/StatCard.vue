<script setup lang="ts">
defineProps<{ value: string | number; label: string }>()
</script>

<template>
  <div class="stat-card">
    <h3>{{ value }}</h3>
    <p>{{ label }}</p>
  </div>
</template>

<template>
  <div class="lead-management-page">
    <RuleConfig />
  </div>
</template>

<script setup lang="ts" name="LeadManagementRule">
import RuleConfig from "./components/RuleConfig.vue";
</script>

<style scoped lang="scss">
.lead-management-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;

  :deep(.rule-config-container) {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}
</style>

<template>
  <div class="lead-management-page">
    <LeadList ref="leadListRef" />
  </div>
</template>

<script setup lang="ts" name="LeadManagementList">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import LeadList from "./components/LeadList.vue";

const route = useRoute();
const leadListRef = ref<InstanceType<typeof LeadList> | null>(null);

onMounted(() => {
  // 从路由查询参数获取过滤条件
  const query = route.query;
  if (Object.keys(query).length > 0) {
    // 将查询参数传递给 LeadList 组件
    leadListRef.value?.setFilters(query);
  }
  leadListRef.value?.refreshTable();
});
</script>

<style scoped lang="scss">
.lead-management-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;

  :deep(.pro-table-container) {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}
</style>

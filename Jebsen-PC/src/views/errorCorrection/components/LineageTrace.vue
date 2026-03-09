<template>
  <div class="lineage-trace-container">
    <div class="header-info">
      <span class="title">身份血缘溯源</span>
      <el-tag type="success" size="small" class="one-id-badge">{{ oneId || "ONEID000000001" }}</el-tag>
    </div>
    <div class="table-card">
      <ProTable
        ref="proTable"
        :columns="columns"
        :data="lineageData"
        :pagination="true"
        :tool-button="['refresh', 'setting', 'search']"
        :border="true"
      >
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

export interface LineageItem {
  mergeTime: string; // 合并时间
  mergePerson: string; // 合并人
  systemName: string; // 系统名称
  field: string; // 变更字段
  oldValue: string; // 原值
  newValue: string; // 新值
  reason: string; // 合并原因
}

interface Props {
  lineageData: LineageItem[];
  oneId?: string;
}

const props = defineProps<Props>();

// 表格列配置
const columns = reactive<ColumnProps<LineageItem>[]>([
  {
    prop: "mergeTime",
    label: "合并时间",
    width: 180,
    sortable: true
  },
  {
    prop: "mergePerson",
    label: "合并人",
    width: 150,
    search: { el: "input", placeholder: "请输入合并人" }
  },
  {
    prop: "systemName",
    label: "系统名称",
    width: 120,
    search: { el: "input", placeholder: "请输入系统名称" }
  },
  {
    prop: "field",
    label: "变更字段",
    width: 120
  },
  {
    prop: "oldValue",
    label: "原值",
    minWidth: 150
  },
  {
    prop: "newValue",
    label: "新值",
    minWidth: 150
  },
  {
    prop: "reason",
    label: "合并原因",
    minWidth: 200,
    showOverflowTooltip: true
  }
]);
</script>

<style scoped lang="scss">
.lineage-trace-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 0;
  background-color: #ffffff;

  .header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
    margin-bottom: 8px;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .one-id-badge {
      font-family: monospace;
      font-weight: bold;
      background-color: #e1f3d8;
      color: #67c23a;
      border: 1px solid #e1f3d8;
    }
  }

  .table-card {
    padding: 0;

    :deep(.table-main) {
      padding: 0;
      border: none;
      background: transparent;

      .el-table {
        border-radius: 4px;
      }
    }
  }
}
</style>

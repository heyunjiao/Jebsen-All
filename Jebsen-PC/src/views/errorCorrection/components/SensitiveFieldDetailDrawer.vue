<template>
  <el-drawer v-model="visible" :title="title" size="400px" :with-header="true" direction="rtl" append-to-body>
    <div class="sensitive-field-detail">
      <div class="field-info">
        <div class="field-label">{{ fieldLabel }}</div>
        <div class="field-count">共 {{ values.length }} 条记录</div>
      </div>
      <div class="values-list">
        <div v-for="(item, idx) in values" :key="idx" class="value-item" :class="{ 'is-primary': item.isPrimary }">
          <div class="value-header">
            <el-tag v-if="item.isPrimary" type="warning" size="small">主值</el-tag>
            <span class="value-source">{{ item.source }}</span>
            <span v-if="item.updateTime" class="value-time">{{ item.updateTime }}</span>
          </div>
          <div class="value-content">
            <SensitiveFieldViewer :value="item.value" :field-key="fieldKey" :field-label="fieldLabel" :one-id="oneId || ''" />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SensitiveFieldViewer from "./SensitiveFieldViewer.vue";

export interface SensitiveValueItem {
  value: string;
  source: string; // 来源系统或"黄金记录"
  isPrimary?: boolean; // 是否为主值
  updateTime?: string; // 更新时间
}

interface Props {
  modelValue: boolean;
  fieldKey: string;
  fieldLabel: string;
  values: SensitiveValueItem[];
  oneId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});

const title = computed(() => `${props.fieldLabel}详情`);
</script>

<style scoped lang="scss">
.sensitive-field-detail {
  .field-info {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color);

    .field-label {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .field-count {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .values-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .value-item {
    padding: 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    background: var(--el-bg-color);

    &.is-primary {
      border-color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }

    .value-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .value-source {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .value-time {
        margin-left: auto;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    .value-content {
      font-size: 14px;
    }
  }
}
</style>

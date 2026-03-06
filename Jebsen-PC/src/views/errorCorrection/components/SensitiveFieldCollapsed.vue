<template>
  <div class="sensitive-field-collapsed">
    <div class="collapsed-display">
      <SensitiveFieldViewer :value="primaryValue" :field-key="fieldKey" :field-label="fieldLabel" :one-id="oneId || ''" />
      <span v-if="additionalCount > 0" class="additional-count">(+{{ additionalCount }})</span>
      <el-button link type="primary" size="small" :icon="View" @click="showDetail = true" class="detail-btn"> 详情 </el-button>
    </div>
    <SensitiveFieldDetailDrawer
      v-model="showDetail"
      :field-key="fieldKey"
      :field-label="fieldLabel"
      :values="allValues"
      :one-id="oneId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { View } from "@element-plus/icons-vue";
import SensitiveFieldViewer from "./SensitiveFieldViewer.vue";
import SensitiveFieldDetailDrawer, { type SensitiveValueItem } from "./SensitiveFieldDetailDrawer.vue";

interface Props {
  fieldKey: string;
  fieldLabel: string;
  primaryValue: string;
  allValues: SensitiveValueItem[];
  oneId?: string;
}

const props = defineProps<Props>();

const showDetail = ref(false);

const additionalCount = computed(() => {
  return Math.max(0, props.allValues.length - 1);
});
</script>

<style scoped lang="scss">
.sensitive-field-collapsed {
  display: flex;
  align-items: center;
  gap: 8px;

  .collapsed-display {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
  }

  .additional-count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  .detail-btn {
    flex-shrink: 0;
    font-size: 12px;
  }
}
</style>

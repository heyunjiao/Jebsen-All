<template>
  <div class="sensitive-field-viewer">
    <span class="masked-value">{{ maskedValue }}</span>
    <el-icon v-if="hasPermission" class="unmask-icon" :class="{ unmasked: isUnmasked }" @click="handleUnmask">
      <View v-if="!isUnmasked" />
      <Hide v-else />
    </el-icon>
    <el-tooltip v-else content="您没有查看明文权限" placement="top">
      <el-icon class="unmask-icon disabled"><Lock /></el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { View, Hide, Lock } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { maskData, hasUnmaskPermission, getFieldMaskingType } from "../utils/dataMasking";

interface Props {
  value: string;
  fieldKey: string;
  fieldLabel?: string;
  oneId?: string;
}

const props = defineProps<Props>();

const isUnmasked = ref(false);
const hasPermission = computed(() => {
  // 简化权限检查，默认允许（实际应从权限系统获取）
  return true;
});

const maskedValue = computed(() => {
  if (isUnmasked.value) {
    return props.value;
  }
  const type = getFieldMaskingType(props.fieldKey);
  return maskData(props.value, type);
});

const handleUnmask = async () => {
  if (!hasPermission.value) {
    return;
  }

  if (isUnmasked.value) {
    // 重新脱敏
    isUnmasked.value = false;
  } else {
    // 查看明文
    try {
      await ElMessageBox.confirm(
        `您正在查看高敏感字段【${props.fieldLabel || props.fieldKey}】的明文数据。\n\n此操作将被记录到审计日志中，请确保您有权限查看该信息。`,
        "风险提示",
        {
          confirmButtonText: "确认查看",
          cancelButtonText: "取消",
          type: "warning"
        }
      );

      isUnmasked.value = true;
    } catch {
      // 客户取消
    }
  }
};
</script>

<style scoped lang="scss">
.sensitive-field-viewer {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;

  .masked-value {
    flex: 1;
    font-family: monospace;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .unmask-icon {
    cursor: pointer;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      color: var(--el-color-primary);
    }

    &.unmasked {
      color: var(--el-color-warning);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}
</style>

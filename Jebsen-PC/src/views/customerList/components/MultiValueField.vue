<template>
  <div class="multi-value-field">
    <!-- 单值情况：直接使用 DataMasking -->
    <template v-if="isSingleValue">
      <DataMasking :value="singleValue" :type="getMaskingType(fieldKey)" @view="handleView" />
    </template>
    <!-- 多值情况：使用 SensitiveFieldCollapsed -->
    <template v-else>
      <SensitiveFieldCollapsed
        :field-key="fieldKey"
        :field-label="fieldLabel"
        :primary-value="primaryValue"
        :all-values="allValues"
        :one-id="oneId || ''"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MultiValueItem } from "../interface";
import DataMasking from "./DataMasking.vue";
import SensitiveFieldCollapsed from "@/views/errorCorrection/components/SensitiveFieldCollapsed.vue";
import type { SensitiveValueItem } from "@/views/errorCorrection/components/SensitiveFieldDetailDrawer.vue";
import { convertToSensitiveValueItems, getPrimaryValue } from "../utils/multiValueHelper";

interface Props {
  fieldKey: string;
  fieldLabel: string;
  fieldValue: string | MultiValueItem[] | undefined;
  oneId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "view", value: string | number): void;
}>();

// 判断是否为单值
const isSingleValue = computed(() => {
  if (!props.fieldValue) return true;
  if (typeof props.fieldValue === "string") return true;
  if (!Array.isArray(props.fieldValue)) return true;
  // 数组长度为0或1时，视为单值
  return props.fieldValue.length <= 1;
});

// 单值时的值（确保返回字符串）
const singleValue = computed(() => {
  if (!props.fieldValue) return "";

  // 如果是字符串，直接返回
  if (typeof props.fieldValue === "string") {
    return props.fieldValue;
  }

  // 如果是数组
  if (Array.isArray(props.fieldValue)) {
    if (props.fieldValue.length === 0) return "";

    const firstItem = props.fieldValue[0];
    // 如果第一个元素是字符串（不应该发生，但做兼容处理）
    if (typeof firstItem === "string") {
      return firstItem;
    }
    // 如果是对象，提取 value 属性
    if (firstItem && typeof firstItem === "object" && "value" in firstItem) {
      const value = firstItem.value;
      // 确保返回字符串
      return value != null ? String(value) : "";
    }
  }

  return "";
});

// 主值
const primaryValue = computed(() => {
  return getPrimaryValue(props.fieldValue);
});

// 所有值（转换为 SensitiveValueItem 格式）
const allValues = computed((): SensitiveValueItem[] => {
  return convertToSensitiveValueItems(props.fieldValue, props.fieldKey);
});

// 获取脱敏类型
const getMaskingType = (key: string): "phone" | "idCard" | "custom" => {
  const keyLower = key.toLowerCase();
  if (keyLower.includes("phone") || keyLower.includes("mobile")) {
    return "phone";
  }
  if (keyLower.includes("idcard") || keyLower.includes("id")) {
    return "idCard";
  }
  return "custom";
};

// 处理查看事件
const handleView = (value: string | number) => {
  emit("view", value);
};
</script>

<style scoped lang="scss">
.multi-value-field {
  display: inline-flex;
  align-items: center;
}
</style>

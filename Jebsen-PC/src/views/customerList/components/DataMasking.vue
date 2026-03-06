<template>
  <span class="data-masking">
    <span v-if="!isVisible" class="masked-text">{{ maskedValue }}</span>
    <span v-else class="visible-text">{{ value }}</span>
    <el-button v-if="!isVisible && showToggle" link type="primary" size="small" @click="handleView" class="view-btn">
      <el-icon><View /></el-icon>
      {{ $t("customer.masking.view") }}
    </el-button>
    <el-button v-else-if="isVisible && showToggle" link type="info" size="small" @click="handleHide" class="hide-btn">
      <el-icon><Hide /></el-icon>
      {{ $t("customer.masking.hide") }}
    </el-button>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { View, Hide } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  value: string | number | undefined | null;
  type?: "phone" | "idCard" | "custom";
  showToggle?: boolean;
  maskChar?: string;
  maskLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "phone",
  showToggle: true,
  maskChar: "*",
  maskLength: 4
});

const emit = defineEmits<{
  view: [value: string | number];
  hide: [];
}>();

const isVisible = ref(false);

// 根据类型生成脱敏值
const maskedValue = computed(() => {
  // 处理空值或无效值
  if (props.value === null || props.value === undefined || props.value === "") {
    return "";
  }

  const valueStr = String(props.value);

  // 如果转换后是 "[object Object]"，说明传入的是对象，返回空
  if (valueStr === "[object Object]") {
    console.warn("DataMasking: 接收到对象类型，期望字符串或数字", props.value);
    return "";
  }

  if (props.type === "phone") {
    // 手机号：138****5678
    if (valueStr.length >= 11) {
      return valueStr.slice(0, 3) + props.maskChar.repeat(4) + valueStr.slice(-4);
    }
    return props.maskChar.repeat(valueStr.length);
  }

  if (props.type === "idCard") {
    // 身份证：110***********1234
    if (valueStr.length >= 18) {
      return valueStr.slice(0, 3) + props.maskChar.repeat(11) + valueStr.slice(-4);
    }
    return props.maskChar.repeat(valueStr.length);
  }

  // 自定义：保留前后各maskLength位
  if (valueStr.length > props.maskLength * 2) {
    return (
      valueStr.slice(0, props.maskLength) +
      props.maskChar.repeat(valueStr.length - props.maskLength * 2) +
      valueStr.slice(-props.maskLength)
    );
  }

  return props.maskChar.repeat(valueStr.length);
});

// 查看明文（触发审计）
const handleView = () => {
  ElMessageBox.alert(t("customer.masking.auditWarning"), t("customer.masking.auditTitle"), {
    confirmButtonText: t("common.confirm"),
    type: "warning"
  }).then(() => {
    isVisible.value = true;
    emit("view", props.value);
  });
};

// 隐藏明文
const handleHide = () => {
  isVisible.value = false;
  emit("hide");
};
</script>

<style scoped lang="scss">
.data-masking {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .masked-text {
    color: var(--el-text-color-regular);
    font-family: monospace;
  }

  .visible-text {
    color: var(--el-text-color-primary);
  }

  .view-btn,
  .hide-btn {
    padding: 0;
    font-size: 12px;
  }
}
</style>

import type { MultiValueItem } from "../interface";
import type { SensitiveValueItem } from "@/views/errorCorrection/components/SensitiveFieldDetailDrawer.vue";

/**
 * 将多值字段转换为 SensitiveValueItem 格式
 */
export function convertToSensitiveValueItems(
  fieldValue: string | MultiValueItem[] | undefined,
  fieldKey: string
): SensitiveValueItem[] {
  if (!fieldValue) {
    return [];
  }

  // 如果是字符串，转换为单值数组
  if (typeof fieldValue === "string") {
    return [
      {
        value: fieldValue,
        source: "黄金记录",
        isPrimary: true
      }
    ];
  }

  // 如果是数组，转换为 SensitiveValueItem 格式
  return fieldValue.map(item => ({
    value: item.value,
    source: item.source || "未知来源",
    isPrimary: item.isPrimary || false,
    updateTime: item.updateTime
  }));
}

/**
 * 获取主值（用于显示）
 */
export function getPrimaryValue(fieldValue: string | MultiValueItem[] | undefined): string {
  if (!fieldValue) {
    return "";
  }

  if (typeof fieldValue === "string") {
    return fieldValue;
  }

  // 从数组中查找主值
  const primaryItem = fieldValue.find(item => item.isPrimary);
  if (primaryItem) {
    return primaryItem.value;
  }

  // 如果没有主值，返回第一个值
  return fieldValue.length > 0 ? fieldValue[0].value : "";
}

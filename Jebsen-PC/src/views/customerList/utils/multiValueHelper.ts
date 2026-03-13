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

  // 如果是数组，转换为 SensitiveValueItem 格式（isPrimary 表示优选/主值，兼容 isPreferred）
  return fieldValue.map(item => ({
    value: item.value,
    source: item.source || "未知来源",
    isPrimary: !!(item.isPreferred ?? item.isPrimary),
    updateTime: item.updateTime
  }));
}

/**
 * 获取展示用首选值（电话场景为优选号码，兼容 isPreferred / isPrimary）
 */
export function getPrimaryValue(fieldValue: string | MultiValueItem[] | undefined): string {
  if (!fieldValue) {
    return "";
  }

  if (typeof fieldValue === "string") {
    return fieldValue;
  }

  const preferredItem = fieldValue.find(item => item.isPreferred ?? item.isPrimary);
  if (preferredItem) {
    return preferredItem.value;
  }

  return fieldValue.length > 0 ? fieldValue[0].value : "";
}

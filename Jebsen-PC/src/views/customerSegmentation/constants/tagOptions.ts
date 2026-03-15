/**
 * 客户分群 - 标签选项（与标签管理 tagCategory 统一）
 * 供 QuickFilters 与 index 预览共用，保证选项与展示一致
 */
import { TAG_CATEGORY_OPTIONS, getFlattenedCategoryMeta } from "@/constants/tagCategory";

export interface TagOption {
  label: string;
  value: string;
}

/** 系统标签选项：来自 tagCategory 叶子节点 */
const categoryMeta = getFlattenedCategoryMeta(TAG_CATEGORY_OPTIONS);
export const SEGMENT_TAG_OPTIONS: TagOption[] = categoryMeta
  .filter(m => m.isLeaf)
  .map(m => ({ value: m.value, label: m.label }));

/** BDC 投诉标签选项 */
export const BDC_COMPLAINT_TAG_OPTIONS: TagOption[] = [
  { label: "服务态度投诉", value: "bdc_service_attitude" },
  { label: "维修质量投诉", value: "bdc_repair_quality" },
  { label: "价格/费用争议", value: "bdc_price_dispute" },
  { label: "预约/等待体验差", value: "bdc_waiting_experience" },
  { label: "配件供应问题", value: "bdc_parts_supply" },
  { label: "其他投诉", value: "bdc_other_complaint" }
];

const tagLabelMap = new Map<string, string>(SEGMENT_TAG_OPTIONS.map(o => [o.value, o.label]));
const bdcLabelMap = new Map<string, string>(BDC_COMPLAINT_TAG_OPTIONS.map(o => [o.value, o.label]));

/** 根据 value 取系统标签展示名，未知则返回原值 */
export function getSegmentTagLabel(value: string): string {
  return tagLabelMap.get(value) ?? value;
}

/** 根据 value 取 BDC 投诉标签展示名，未知则返回原值 */
export function getBdcComplaintTagLabel(value: string): string {
  return bdcLabelMap.get(value) ?? value;
}

/** 将标签 value 数组转为展示名（用于预览） */
export function formatTagLabels(values: string[], getLabel: (v: string) => string): string {
  if (!values?.length) return "";
  return values.map(getLabel).join("、");
}

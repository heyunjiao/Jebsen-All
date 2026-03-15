/**
 * 客户分群 - 售后行为相关选项（需求侧：最后一次保养门店、最后一次返厂门店）
 * 门店列表可按实际接口替换为异步加载
 */
export interface StoreOption {
  label: string;
  value: string;
}

/** 最后保养/返厂门店选项（示例，实际可接门店列表接口） */
export const LAST_SERVICE_STORE_OPTIONS: StoreOption[] = [
  { value: "store_001", label: "保时捷中心（北京）" },
  { value: "store_002", label: "保时捷中心（上海）" },
  { value: "store_003", label: "保时捷中心（广州）" },
  { value: "store_004", label: "保时捷中心（深圳）" },
  { value: "store_005", label: "保时捷中心（杭州）" },
  { value: "store_006", label: "保时捷中心（成都）" },
  { value: "store_007", label: "保时捷中心（南京）" },
  { value: "store_008", label: "保时捷中心（苏州）" },
  { value: "store_009", label: "保时捷中心（武汉）" },
  { value: "store_010", label: "保时捷中心（西安）" }
];

const storeLabelMap = new Map(LAST_SERVICE_STORE_OPTIONS.map(o => [o.value, o.label]));

export function getLastServiceStoreLabel(value: string): string {
  return storeLabelMap.get(value) ?? value;
}

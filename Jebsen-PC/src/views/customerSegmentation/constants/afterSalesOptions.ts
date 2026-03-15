/**
 * 客户分群 - 售后行为相关选项（需求侧：最后一次保养门店、最后一次返厂门店）
 * 门店枚举取「-」前内容，与 @/constants/storeList 一致
 */
import { STORE_LIST } from "@/constants/storeList";

export interface StoreOption {
  label: string;
  value: string;
}

/** 最后保养/返厂门店选项（与全局门店枚举一致） */
export const LAST_SERVICE_STORE_OPTIONS: StoreOption[] = STORE_LIST.map(s => ({
  value: s.storeId,
  label: s.storeName
}));

const storeLabelMap = new Map(LAST_SERVICE_STORE_OPTIONS.map(o => [o.value, o.label]));

export function getLastServiceStoreLabel(value: string): string {
  return storeLabelMap.get(value) ?? value;
}

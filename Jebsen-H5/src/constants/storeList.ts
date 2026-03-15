/**
 * 门店枚举：取「-」之前的内容作为 storeId 枚举值，storeName 为完整显示名
 * 与 PC 端 @/constants/storeList 保持一致
 */
export interface StoreInfo {
  storeId: string;
  storeName: string;
}

/** 全部门店列表（枚举值为 - 前的内容） */
export const STORE_LIST: StoreInfo[] = [
  { storeId: "GZTH", storeName: "GZTH-PC" },
  { storeId: "HN", storeName: "HN-POA" },
  { storeId: "HZWL", storeName: "HZWL-P" },
  { storeId: "NJJN", storeName: "NJJN-PO" },
  { storeId: "SHMH", storeName: "SHMH-P" },
  { storeId: "SHPX", storeName: "SHPX-PC" },
  { storeId: "SZLG", storeName: "SZLG-PC" },
  { storeId: "SZLH", storeName: "SZLH-PC" }
];

export function getStoreName(storeId: string): string {
  return STORE_LIST.find(s => s.storeId === storeId)?.storeName ?? storeId;
}

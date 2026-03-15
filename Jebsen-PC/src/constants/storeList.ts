/**
 * 门店枚举：取「-」之前的内容作为 storeId 枚举值，storeName 为完整显示名
 * 来源：GZTH-PC, HN-POA, HZWL-P, NJJN-PO, SHMH-P, SHPX-PC, SZLG-PC, SZLH-PC
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

/** 门店枚举值（仅 storeId 数组，便于校验等） */
export const STORE_IDS = STORE_LIST.map(s => s.storeId) as [
  "GZTH",
  "HN",
  "HZWL",
  "NJJN",
  "SHMH",
  "SHPX",
  "SZLG",
  "SZLH"
];

export function getStoreName(storeId: string): string {
  return STORE_LIST.find(s => s.storeId === storeId)?.storeName ?? storeId;
}

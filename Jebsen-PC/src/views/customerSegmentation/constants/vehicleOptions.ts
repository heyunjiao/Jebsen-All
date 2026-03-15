/**
 * 客户分群 - 车辆关联信息选项（来自需求侧字段列表）
 */
export interface VehicleOption {
  label: string;
  value: string;
}

/** 车辆属性：新车/二手车 */
export const VEHICLE_ATTRIBUTE_OPTIONS: VehicleOption[] = [
  { value: "new", label: "新车" },
  { value: "used", label: "二手车" }
];

/** 购车属性：首次购车/增购/换购 */
export const PURCHASE_ATTRIBUTE_OPTIONS: VehicleOption[] = [
  { value: "first", label: "首次购车" },
  { value: "additional", label: "增购" },
  { value: "replacement", label: "换购" }
];

const vehicleAttrMap = new Map(VEHICLE_ATTRIBUTE_OPTIONS.map(o => [o.value, o.label]));
const purchaseAttrMap = new Map(PURCHASE_ATTRIBUTE_OPTIONS.map(o => [o.value, o.label]));

export function getVehicleAttributeLabel(value: string): string {
  return vehicleAttrMap.get(value) ?? value;
}
export function getPurchaseAttributeLabel(value: string): string {
  return purchaseAttrMap.get(value) ?? value;
}

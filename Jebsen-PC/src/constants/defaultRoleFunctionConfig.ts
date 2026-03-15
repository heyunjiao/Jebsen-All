/**
 * 默认角色与功能配置（与权限矩阵图一致）
 * 功能块 × 角色：查(查看) / 增删改
 */

export type RoleCategory = "Centra" | "DM" | "GIT";

/** 默认角色定义（图片中的 13 个角色） */
export const DEFAULT_ROLES = [
  // Centra Role
  { roleKey: "sales_manager", roleName: "销售经理/主管", category: "Centra" as RoleCategory, sort: 1 },
  { roleKey: "aftersales_manager", roleName: "售后/服务经理", category: "Centra" as RoleCategory, sort: 2 },
  { roleKey: "cw_manager", roleName: "CW经理/专员", category: "Centra" as RoleCategory, sort: 3 },
  { roleKey: "soft_maintenance_manager", roleName: "软保经理/专员", category: "Centra" as RoleCategory, sort: 4 },
  { roleKey: "bdc_specialist", roleName: "BDC专员", category: "Centra" as RoleCategory, sort: 5 },
  { roleKey: "bdc_manager", roleName: "BDC经理", category: "Centra" as RoleCategory, sort: 6 },
  // DM Business Role
  { roleKey: "cb_mkt_head", roleName: "CB/MKT Head", category: "DM" as RoleCategory, sort: 7 },
  { roleKey: "dm_sales", roleName: "DM Sales", category: "DM" as RoleCategory, sort: 8 },
  { roleKey: "aftersales_dm", roleName: "Aftersales DM", category: "DM" as RoleCategory, sort: 9 },
  { roleKey: "dm_poc", roleName: "DM PoC", category: "DM" as RoleCategory, sort: 10 },
  { roleKey: "dm_cm", roleName: "DM CM", category: "DM" as RoleCategory, sort: 11 },
  // GIT Role
  { roleKey: "data", roleName: "Data", category: "GIT" as RoleCategory, sort: 12 },
  { roleKey: "app", roleName: "App", category: "GIT" as RoleCategory, sort: 13 }
] as const;

/** 拥有「权限管理-账号/角色」与「系统监控-操作日志」的角色（仅查或查+增删改） */
export const ROLES_WITH_AUTH_AND_OPERLOG = ["sales_manager", "aftersales_manager", "data", "app"] as const;

/** 拥有企微/BDC H5 相关功能的角色 */
export const ROLES_WITH_WEIXIN_BDC_H5 = [
  "bdc_specialist",
  "bdc_manager",
  "cb_mkt_head",
  "dm_sales",
  "aftersales_dm",
  "dm_poc",
  "dm_cm",
  "data",
  "app"
] as const;

/**
 * 功能模块与菜单 ID 对应关系（与 authMenuList 经 transformMenuToTree 后的 id 一致）
 * 顺序：home(1), dataMonitor(2), dataProcess(3,4,5,6), customer(7,8,9,10), tagManage(11), segmentManage(12),
 *       leadManagement(13-17), auth(18,19,20,21), operation(22,23), system(24-28), monitor(29,30,31)
 */
export const MENU_IDS = {
  home: 1,
  dataMonitor: 2,
  dataProcess: 3,
  dataQualityWorkbench: 4,
  errorCorrection: 5,
  fileUploadLog: 6,
  customer: 7,
  customerList: 8,
  customerBatchOperation: 9,
  customerSegmentation: 10,
  tagManage: 11,
  segmentManage: 12,
  leadManagement: 13,
  leadDashboard: 14,
  leadList: 15,
  leadRule: 16,
  leadTracking: 17,
  auth: 18,
  accountManage: 19,
  roleManage: 20,
  menuMange: 21,
  operation: 22,
  storeAnalysis: 23,
  system: 24,
  departmentManage: 25,
  noticeManage: 26,
  collectionConfig: 27,
  collectionGlobalRulesConfig: 28,
  monitor: 29,
  operlogManage: 30,
  loginlogManage: 31
} as const;

/** 所有角色均可访问的菜单 ID（首页、源数据采集、数据处理、客户管理、标签、分群、商机、系统管理-非权限） */
export const BASE_MENU_IDS = [
  MENU_IDS.home,
  MENU_IDS.dataMonitor,
  MENU_IDS.dataProcess,
  MENU_IDS.dataQualityWorkbench,
  MENU_IDS.errorCorrection,
  MENU_IDS.fileUploadLog,
  MENU_IDS.customer,
  MENU_IDS.customerList,
  MENU_IDS.customerBatchOperation,
  MENU_IDS.customerSegmentation,
  MENU_IDS.tagManage,
  MENU_IDS.segmentManage,
  MENU_IDS.leadManagement,
  MENU_IDS.leadDashboard,
  MENU_IDS.leadList,
  MENU_IDS.leadRule,
  MENU_IDS.leadTracking,
  MENU_IDS.system,
  MENU_IDS.departmentManage,
  MENU_IDS.noticeManage,
  MENU_IDS.collectionConfig,
  MENU_IDS.collectionGlobalRulesConfig
];

/** 仅 销售经理/主管、售后/服务经理、Data、App 可访问的菜单（权限管理 + 系统监控） */
export const AUTH_AND_MONITOR_MENU_IDS = [
  MENU_IDS.auth,
  MENU_IDS.accountManage,
  MENU_IDS.roleManage,
  MENU_IDS.menuMange,
  MENU_IDS.monitor,
  MENU_IDS.operlogManage,
  MENU_IDS.loginlogManage
];

/**
 * 根据 roleKey 计算该角色的菜单 ID 列表
 */
export function getMenuIdsByRoleKey(roleKey: string): number[] {
  const base = [...BASE_MENU_IDS];
  if (ROLES_WITH_AUTH_AND_OPERLOG.includes(roleKey as any)) {
    return [...base, ...AUTH_AND_MONITOR_MENU_IDS];
  }
  return base;
}

/**
 * 根据 roleKey 判断是否包含权限管理/操作日志（用于 functionalPermissions）
 */
export function hasAuthAndOperLog(roleKey: string): boolean {
  return (ROLES_WITH_AUTH_AND_OPERLOG as readonly string[]).includes(roleKey);
}

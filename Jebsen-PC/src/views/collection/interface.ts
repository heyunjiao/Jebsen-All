// 数据催收管理相关类型定义

// 收件人角色类型
export type RecipientRole = "owner" | "manager" | "dept_head";

// 数据平台类型
export type DataPlatform =
  | "DMS" // DMS（每日导出 CSV）
  | "POAS" // POAS
  | "WWS" // WWS（手动导出文件）
  | "C@P系统" // C@P系统（手动导出文件）
  | "Voucher" // Voucher (Marketing)
  | "Manual Files"; // Manual Files (General)

// 平台分类
export type PlatformCategory = "手动上传";

// 员工信息
export interface Employee {
  id: number;
  name: string;
  email: string;
  department?: string;
  position?: string;
  status?: "active" | "resigned";
}

// 平台时间节点配置
export interface PlatformSchedule {
  stage: string; // 催收阶段名称（可配置，如 "T+0"、"T+1"、"T+2" 等）
  time: string; // 时间点，如 "18:00" 或 "9:00"
  employeeIds: number[]; // 选择的员工ID列表
  description: string; // 阶段描述
}

// 平台配置
export interface PlatformConfig {
  platform: DataPlatform;
  category: PlatformCategory;
  reportId?: string; // 具体报表ID
  reportName?: string; // 具体报表名称
  schedules: PlatformSchedule[]; // 该平台的时间节点配置（T+0, T+1, T+2）
}

// 全局监控规则 Key（不绑定具体报表）
export type GlobalRuleKey = "auto_source_stopped" | "data_quality_fatal" | "system_capacity_threshold";

// 全局监控规则配置（对应图片中后面三行）
export interface GlobalRuleConfig {
  key: GlobalRuleKey;
  enabled: boolean;
  // 系统性能 / 扩容类规则的资源阈值（百分比），其他规则可忽略
  thresholdPercent?: number;
  // 额外抄送收件人（例如固定邮箱列表），运行时动态收件人由后端判定
  extraRecipients?: string;
}

// 催收时间节点配置（保留兼容性）
export interface CollectionSchedule {
  stage: "T+0" | "T+1" | "T+2"; // 催收阶段
  time: string; // 时间点，如 "18:00" 或 "9:00"
  recipientType: "owner" | "manager" | "dept_head"; // 收件人类型
  recipientEmail: string; // 收件人邮箱（唯一：单个邮箱；多个：逗号分隔的多个邮箱）
  description: string; // 阶段描述
}

// 数据催收配置
export interface CollectionConfig {
  id?: number;
  platforms: PlatformConfig[]; // 按平台配置
  schedules?: CollectionSchedule[]; // 催收时间节点配置（T+0, T+1, T+2）- 保留兼容性
  ccEmail: string; // 兜底抄送邮箱
  // 全局监控规则（自动数据源监控 / 数据质量检测 / 系统性能与扩容）
  globalRules?: GlobalRuleConfig[];
  createdAt?: string;
  updatedAt?: string;
}

// 员工状态
export type EmployeeStatus = "active" | "resigned";

// 数据上传状态
export type UploadStatus = "pending" | "overdue" | "completed";

// 数据催收监控记录
export interface CollectionMonitor {
  id: number;
  employeeName: string; // 数据负责人姓名
  email: string; // 邮箱
  dataSource: string; // 数据源（如：DMS、BDC、CRM等）
  uploadStatus: UploadStatus; // 上传状态：待上传/已逾期/已完成
  deadline: string; // 截止时间（如：T+1 18:00）
  overdueDays?: number; // 逾期天数
  status: EmployeeStatus; // 员工状态：在职/离职
  department?: string; // 部门
  position?: string; // 职位
  lastNudgeTime?: string; // 最后催收时间
  nudgeCount?: number; // 催收次数
  createdAt?: string;
  updatedAt?: string;
}

// 催收通知表单
export interface NudgeForm {
  email: string; // 收件人邮箱
  message?: string; // 消息内容
}

// API 响应类型
export interface CollectionConfigResponse {
  code: number;
  msg: string;
  data: CollectionConfig;
}

// 监控维度类型（统一的邮件规则视图）
export type MonitorType = "manual_upload" | "auto_source" | "data_quality" | "system_capacity";

// 统一的邮件通知规则实体（用于规则总览页）
export interface NotificationRule {
  id: string;
  monitorType: MonitorType;
  scenarioKey: string;
  scenarioLabel: string;
  platformKey: string;
  platformLabel: string;
  stage?: string;
  triggerTimingText: string;
  recipientsText: string;
  sourceBasisText: string;
  enabled: boolean;
  configEntry: null | {
    type: "collection_config";
    platformKey: string;
    reportId?: string;
  };
}

export interface CollectionMonitorListResponse {
  code: number;
  msg: string;
  data: {
    list: CollectionMonitor[];
    total: number;
  };
}

export interface NudgeResponse {
  code: number;
  msg: string;
  data: {
    success: boolean;
    message?: string;
  };
}

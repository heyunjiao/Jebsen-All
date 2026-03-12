import http from "@/api";
import { ResPage } from "@/api/interface";
import { PORT1 } from "@/api/config/servicePort";

/**
 * 商机管理接口类型定义
 */
export namespace Lead {
  // 商机状态
  export type LeadStatus = "pending" | "pushed" | "processing" | "completed" | "rejected" | "failed";

  // 推送目标系统
  export type PushTarget = "BDC外呼系统";

  // 商机信息
  export interface LeadInfo {
    id: string;
    oneId: string;
    customerName: string;
    phone?: string;
    leadType: string; // 商机类型：维保到期、代金券到期、高价值客户等
    ruleId: string; // 触发规则ID
    ruleName: string; // 触发规则名称
    priority: "low" | "medium" | "high"; // 优先级
    status: LeadStatus;
    pushTarget?: PushTarget; // 推送目标系统
    pushStatus?: "pending" | "success" | "failed"; // 推送状态
    pushTime?: string; // 推送时间
    assignedAdvisor?: string; // 推送至的SA/SC（服务顾问/销售顾问）
    payload: Record<string, any>; // 商机负载数据
    createdAt: string;
    updatedAt?: string;
    processedBy?: string; // 处理人
    processedAt?: string; // 处理时间
    feedback?: string; // 反馈结果
  }

  // 商机列表查询参数
  export interface ReqLeadParams {
    pageNum?: number;
    pageSize?: number;
    oneId?: string;
    leadType?: string;
    status?: LeadStatus;
    ruleId?: string;
    pushTarget?: PushTarget;
    pushStatus?: "pending" | "success" | "failed";
    startDate?: string;
    endDate?: string;
  }

  // 商机表单
  export interface ReqLeadForm {
    id?: string;
    oneId: string;
    leadType: string;
    ruleId?: string;
    priority?: "low" | "medium" | "high";
    pushTarget?: PushTarget;
    payload?: Record<string, any>;
  }

  // 推送参数
  export interface ReqPushParams {
    leadIds: string[];
    target: PushTarget;
    force?: boolean; // 是否强制推送（忽略去重）
  }

  // 看板统计数据
  export interface DashboardStats {
    todayTotal: number; // 今日生成总数
    todayPushed: number; // 今日已推送
    pendingCount: number; // 待处理数
    processingCount: number; // 处理中数
    completedCount: number; // 已完成数
    successRate: number; // 推送成功率
    byType: Array<{
      type: string;
      count: number;
    }>; // 按类型统计
    byStatus: Array<{
      status: LeadStatus;
      count: number;
    }>; // 按状态统计
  }

  // 规则配置
  export interface RuleConfig {
    id?: string;
    name: string;
    description?: string;
    // 批次号（用于标识一次规则生成或导入的业务批次）
    batchNo?: string;
    triggerType: "segment" | "event" | "schedule"; // 触发类型：分群、事件、定时
    triggerConfig: {
      segmentId?: string; // 分群ID
      eventType?: string; // 事件类型
      schedule?: string; // 定时表达式（cron）
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
      }>; // 触发条件
    };
    leadType: string; // 生成的商机类型
    priority: "low" | "medium" | "high";
    pushTarget: PushTarget;
    // 推送人数（该分发对应的已推送商机数量）
    pushCount?: number;
    pushConfig?: {
      apiUrl?: string;
      headers?: Record<string, string>;
      retryTimes?: number;
    };
    enabled: boolean;
    creator: string;
    createdAt?: string;
    updatedAt?: string;
    auditStatus?: "pending" | "approved" | "rejected"; // 审核状态
    // 创建方式：手工上传 / 平台生成
    createMethod?: "manual_upload" | "system_generated";
  }

  // 联系人信息
  export interface ContactInfo {
    name: string; // 联系人姓名
    phone: string; // 联系电话
    relation?: string; // 关系标签（如：本人、妻子、配偶等）
    isPrimary?: boolean; // 是否为主联系人
  }

  // 地址信息
  export interface AddressInfo {
    province?: string; // 省份
    city?: string; // 城市
    district?: string; // 区县
    detail?: string; // 详细地址
    fullAddress?: string; // 完整地址
  }

  // 数据负载详情
  export interface PayloadDetail {
    contacts?: ContactInfo[]; // 联系人数组（支持多值合并）
    addresses?: AddressInfo[]; // 地址数组
    vehicleInfo?: {
      brand?: string; // 品牌
      model?: string; // 车型
      plateNumber?: string; // 车牌号
      vin?: string; // 车架号
    };
    businessInfo?: {
      maintenanceExpiryDate?: string; // 维保到期日
      couponBalance?: number; // 优惠券余量
      lastServiceDate?: string; // 上次服务日期
      nextServiceDate?: string; // 下次服务日期
      [key: string]: any; // 其他业务属性
    };
    [key: string]: any; // 其他字段
  }

  // 审计日志
  export interface AuditLog {
    id: string; // 审计实例ID（唯一审计流水号）
    leadId: string; // 商机ID
    oneId: string; // 关联客户OneID
    customerName?: string; // 客户姓名
    leadType?: string; // 商机类型
    operation: "create" | "push" | "update" | "reload" | "delete"; // 操作类型
    operator: string; // 操作人
    operateTime: string; // 提供时间（精确到秒的商机下发时间戳）
    targetSystem?: PushTarget; // 推送目标系统
    ruleId?: string; // 触发规则ID
    ruleName?: string; // 触发规则名称（自动化规则名称或手动操作）
    payload: PayloadDetail | Record<string, any>; // 操作时的数据负载（详细记录推送到BDC或企微的完整JSON报文）
    result: "success" | "failed" | "pending"; // 推送状态：成功、失败、待重试
    errorMessage?: string; // 错误信息
    responseData?: {
      statusCode?: number; // 下游系统返回的状态码
      message?: string; // 响应消息
      data?: any; // 响应数据
      [key: string]: any;
    }; // 下游系统响应反馈（记录BDC API返回的原始状态码和错误信息）
    reloadCount?: number; // 重载次数
    lastReloadTime?: string; // 最后一次重载的时间
    masked?: boolean; // 是否执行了脱敏处理
    maskLevel?: string; // 脱敏级别（RBAC掩码规则）
    batchCount?: number; // 批量数量（如果是批量操作）
  }

  // 商机追踪统计
  export interface LeadTrackingStats {
    totalGenerated: number; // 生成商机总数
    totalPushed: number; // 已推送的商机数
    convertedCount: number; // 成交数量
    orderCount: number; // 订单数量
    totalOrderAmount: number; // 订单总金额
    conversionRate: number; // 成交率
    avgOrderAmount: number; // 平均订单金额
    byType: Array<{
      type: string;
      pushed: number;
      converted: number;
      orderCount: number;
      orderAmount: number;
    }>; // 按类型统计
    byDate: Array<{
      date: string;
      pushed: number;
      converted: number;
      orderCount: number;
      orderAmount: number;
    }>; // 按日期统计
  }

  // 商机追踪列表项
  export interface LeadTrackingItem {
    id: string;
    leadId: string;
    oneId: string;
    customerName: string;
    phone?: string;
    leadType: string;
    ruleName: string;
    pushTime: string;
    pushTarget: PushTarget;
    converted: boolean; // 是否成交
    convertedTime?: string; // 成交时间
    orderCount: number; // 订单数量
    totalOrderAmount: number; // 订单总金额
    firstOrderTime?: string; // 首单时间
    lastOrderTime?: string; // 末单时间
    advisorName?: string; // 顾问姓名
    storeName?: string; // 保时捷中心
    status: LeadStatus;
  }

  // 商机追踪查询参数
  export interface ReqLeadTrackingParams {
    pageNum?: number;
    pageSize?: number;
    leadType?: string;
    pushTarget?: PushTarget;
    converted?: boolean;
    startDate?: string;
    endDate?: string;
    oneId?: string;
    customerName?: string;
    advisorName?: string;
    storeName?: string;
  }
}

// 商机列表
export const getLeadList = (params: Lead.ReqLeadParams) => {
  return http.post<ResPage<Lead.LeadInfo>>(`${PORT1}/lead/list`, params);
};

// 商机详情
export const getLeadDetail = (id: string) => {
  return http.get<Lead.LeadInfo>(`${PORT1}/lead/detail/${id}`);
};

// 创建商机
export const createLead = (params: Lead.ReqLeadForm) => {
  return http.post(`${PORT1}/lead/create`, params);
};

// 批量推送
export const pushLeads = (params: Lead.ReqPushParams) => {
  return http.post(`${PORT1}/lead/push`, params);
};

// 重载商机
export const reloadLead = (id: string) => {
  return http.post(`${PORT1}/lead/reload/${id}`);
};

// 看板统计
export const getDashboardStats = (params?: { startDate?: string; endDate?: string }) => {
  return http.get<Lead.DashboardStats>(`${PORT1}/lead/dashboard/stats`, { params });
};

// 规则列表
export const getRuleList = (params?: { pageNum?: number; pageSize?: number; enabled?: boolean }) => {
  return http.post<ResPage<Lead.RuleConfig>>(`${PORT1}/lead/rule/list`, params || {});
};

// 规则详情
export const getRuleDetail = (id: string) => {
  return http.get<Lead.RuleConfig>(`${PORT1}/lead/rule/detail/${id}`);
};

// 保存规则
export const saveRule = (params: Lead.RuleConfig) => {
  if (params.id) {
    return http.put(`${PORT1}/lead/rule/edit`, params);
  }
  return http.post(`${PORT1}/lead/rule/add`, params);
};

// 启用/禁用规则
export const toggleRule = (id: string, enabled: boolean) => {
  return http.put(`${PORT1}/lead/rule/toggle/${id}`, { enabled });
};

// 删除规则
export const deleteRule = (id: string) => {
  return http.delete(`${PORT1}/lead/rule/delete/${id}`);
};

// 审计日志列表
export const getAuditLogList = (params: {
  pageNum?: number;
  pageSize?: number;
  leadId?: string;
  oneId?: string;
  operation?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return http.post<ResPage<Lead.AuditLog>>(`${PORT1}/lead/audit/list`, params);
};

// 审计日志详情
export const getAuditLogDetail = (id: string) => {
  return http.get<Lead.AuditLog>(`${PORT1}/lead/audit/detail/${id}`);
};

// 重载审计记录（重新推送）
export const reloadAuditLog = (id: string) => {
  return http.post(`${PORT1}/lead/audit/reload/${id}`);
};

// 导出审计记录
export const exportAuditLog = (id: string, format: "pdf" | "excel" = "pdf") => {
  return http.download(`${PORT1}/lead/audit/export/${id}`, { format });
};

// 获取商机追踪统计
export const getLeadTrackingStats = (params?: { startDate?: string; endDate?: string; leadType?: string }) => {
  return http.get<Lead.LeadTrackingStats>(`${PORT1}/lead/tracking/stats`, { params });
};

// 获取商机追踪列表
export const getLeadTrackingList = (params: Lead.ReqLeadTrackingParams) => {
  return http.post<ResPage<Lead.LeadTrackingItem>>(`${PORT1}/lead/tracking/list`, params);
};

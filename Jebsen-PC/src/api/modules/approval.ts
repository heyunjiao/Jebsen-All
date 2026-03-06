import http from "@/api";

/**
 * @description 审批请求接口
 */

// 审批请求列表项
export interface ApprovalRequest {
  reqId: string;
  sourceName: string;
  targetName: string;
  operator: string;
  submitTime: string;
  status: "Pending" | "Approved" | "Rejected";
  hasManual: boolean;
  confidence?: number; // 置信度分数 (0-100)，未达到95分需要人工审核
}

// 字段项
export interface FieldItem {
  label: string;
  oldVal: string;
  newVal: string;
  isKey?: boolean;
  isManual?: boolean;
  isChanged?: boolean;
  isRisk?: boolean;
}

// 字段分组
export interface FieldGroup {
  groupName: string;
  fields: FieldItem[];
}

// 审批详情响应
export interface ApprovalDetailResponse {
  reqId: string;
  fieldGroups: FieldGroup[];
}

/**
 * @description 获取审批列表
 */
export const getApprovalList = () => {
  return http.get<ApprovalRequest[]>("/approval/list");
};

/**
 * @description 获取审批详情
 */
export const getApprovalDetail = (reqId: string) => {
  return http.get<ApprovalDetailResponse>(`/approval/detail/${reqId}`);
};

/**
 * @description 批准请求
 */
export const approveRequest = (reqId: string) => {
  return http.post(`/approval/approve/${reqId}`);
};

/**
 * @description 驳回请求
 */
export const rejectRequest = (reqId: string, reason: string) => {
  return http.post(`/approval/reject/${reqId}`, { reason });
};

/**
 * @description 规则配置相关接口
 */

// 规则项接口
export interface RuleItem {
  id: number;
  ruleName: string;
  desc: string;
  threshold: number; // 置信度阈值（0-100），当前编辑值
  savedThreshold?: number; // 已保存的阈值，用于显示标签状态
  enabled: boolean;
  lastUpdate: string;
  operator: string;
}

/**
 * @description 获取规则列表
 */
export const getRuleList = (params?: any) => {
  return http.get<{ list: RuleItem[]; total: number }>("/approval/rule/list", params);
};

/**
 * @description 保存规则配置（更新阈值）
 */
export const saveRuleConfig = (ruleId: number, threshold: number) => {
  return http.post(`/approval/rule/save/${ruleId}`, { threshold });
};

/**
 * @description 启用/停用规则
 */
export const toggleRuleStatus = (ruleId: number, enabled: boolean) => {
  return http.post(`/approval/rule/toggle/${ruleId}`, { enabled });
};

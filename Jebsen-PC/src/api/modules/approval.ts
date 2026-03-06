import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * 合并规则项（OneID 匹配规则配置）
 */
export interface RuleItem {
  id: string;
  ruleName: string;
  desc: string;
  threshold: number;
  savedThreshold?: number;
  enabled: boolean;
  lastUpdate?: string;
  operator?: string;
}

/**
 * 获取合并规则列表
 */
export const getRuleList = (params?: { pageNum?: number; pageSize?: number; enabled?: boolean }) => {
  return http.post<{ code: number; msg: string; data: { list: RuleItem[]; total?: number } }>(
    `${PORT1}/merge/rule/list`,
    params || {}
  );
};

/**
 * 保存规则阈值配置
 */
export const saveRuleConfig = (id: string, threshold: number) => {
  return http.put<{ code: number; msg: string }>(`${PORT1}/merge/rule/saveThreshold/${id}`, {
    threshold
  });
};

/**
 * 启用/停用规则
 */
export const toggleRuleStatus = (id: string, enabled: boolean) => {
  return http.put<{ code: number; msg: string }>(`${PORT1}/merge/rule/toggle/${id}`, { enabled });
};

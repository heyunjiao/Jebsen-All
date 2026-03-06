import http from "@/api";
import { ResPage } from "@/api/interface";
import type { TagManage } from "@/api/modules/tagManage";

export namespace Segment {
  export type SegmentStatus = "draft" | "running" | "active" | "failed" | "inactive";

  // 分群分类（根据分群名称前缀动态生成）
  export type SegmentCategory = string;

  export interface SegmentInfo {
    id: string;
    name: string;
    category?: SegmentCategory;
    status: SegmentStatus;
    memberCount: number;
    snapshotCount: number;
    lastExportAt?: string;
    creator: string;
    createdAt: string;
    updatedAt?: string;
    description?: string;
    ruleConfig: TagManage.RuleConfig | null;
  }

  export interface ReqSegmentParams {
    pageNum?: number;
    pageSize?: number;
    name?: string;
    category?: SegmentCategory;
    status?: SegmentStatus;
    creator?: string;
  }

  export interface ReqSegmentForm {
    id?: string;
    name: string;
    category?: SegmentCategory;
    status?: SegmentStatus;
    description?: string;
    ruleConfig: TagManage.RuleConfig | null;
    triggerCalc?: boolean;
  }

  export interface ResEstimate {
    estimatedCount: number;
    estimatedRate: string;
    sampleData: Array<{
      oneId: string;
      name: string;
      matchReason: string;
    }>;
  }
}

// 列表
export const getSegmentList = (params: Segment.ReqSegmentParams) => {
  return http.post<ResPage<Segment.SegmentInfo>>("/segment/list", params);
};

// 详情
export const getSegmentDetail = (id: string) => {
  return http.get<Segment.SegmentInfo>("/segment/detail/" + id);
};

// 新增 / 修改
export const saveSegment = (params: Segment.ReqSegmentForm) => {
  if (params.id) {
    return http.put("/segment/edit", params);
  }
  return http.post("/segment/add", params);
};

// 估算
export const estimateSegment = (ruleConfig: TagManage.RuleConfig | TagManage.RuleNode) => {
  return http.post<Segment.ResEstimate>("/segment/estimate", { ruleConfig });
};

// 快照
export const createSnapshot = (id: string) => http.post("/segment/" + id + "/snapshot");

// 导出
export const exportSegment = (id: string, fields: string[]) => http.post("/segment/" + id + "/export", { fields });

// 停用分群
export const disableSegment = (params: { id: string }) => {
  return http.post("/segment/disable", params);
};

// 启用分群
export const enableSegment = (params: { id: string }) => {
  return http.post("/segment/enable", params);
};

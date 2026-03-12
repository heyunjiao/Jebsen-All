import http from "@/api";
import { ResPage } from "@/api/interface";
import type { TagManage } from "@/api/modules/tagManage";

export namespace CustomerSegmentation {
  export type SegmentStatus = "draft" | "pending" | "active" | "inactive";

  export interface SegmentInfo {
    id: string;
    name: string;
    description?: string;
    businessReason: string;
    status: SegmentStatus;
    rulePayload: TagManage.RuleConfig | null;
    estimatedCount: number;
    version: string;
    validityPeriod?: {
      start: string;
      end: string;
    };
    creator: string;
    createdAt: string;
    updatedAt?: string;
  }

  export interface ReqSegmentParams extends ResPage {
    name?: string;
    status?: SegmentStatus;
    creator?: string;
  }

  export interface ReqSegmentForm {
    id?: string;
    name: string;
    description?: string;
    businessReason: string;
    rulePayload: TagManage.RuleConfig | null;
    validityPeriod?: {
      start: string;
      end: string;
    };
  }

  export interface ResEstimate {
    estimatedCount: number;
    estimatedRate: string;
    changeFromLast?: {
      count: number;
      rate: string;
    };
  }

  export interface SampleData {
    oneId: string;
    name: string;
    phone: string;
    vin: string;
    gender: string;
    ageGroup: string;
    city: string;
    carSeriesModel: string;
    lastVisitTime: string;
    annualSpend: number;
    tags: string[];
  }

  export interface FieldOption {
    field: string;
    label: string;
    operators: string[];
    inputType: "checkbox" | "radio" | "cascader" | "treeselect" | "daterange" | "number" | "numberrange" | "select" | "tagselect";
    options?: Array<{ label: string; value: any }>;
    asyncSearch?: boolean;
    unit?: string; // 单位（如：万元、元、次、单等）
    multiple?: boolean; // 是否支持多选（用于 select 类型）
  }

  // 模拟验证参数
  export interface ReqSimulateParams {
    ruleConfig: TagManage.RuleConfig | TagManage.RuleNode;
  }

  // 模拟验证结果
  export interface ResSimulate {
    estimatedCount: number;
    estimatedRate: string;
  }
}

// 获取字段选项列表
export const getFieldOptions = () => {
  return http.get<CustomerSegmentation.FieldOption[]>("/customer-segmentation/fields");
};

// 获取分群列表
export const getSegmentList = (params: CustomerSegmentation.ReqSegmentParams) => {
  return http.post<ResPage<CustomerSegmentation.SegmentInfo>>("/customer-segmentation/list", params);
};

// 获取分群详情
export const getSegmentDetail = (id: string) => {
  return http.get<CustomerSegmentation.SegmentInfo>("/customer-segmentation/detail/" + id);
};

// 保存草稿
export const saveDraft = (params: CustomerSegmentation.ReqSegmentForm) => {
  return http.post("/customer-segmentation/draft", params);
};

// 提交审核
export const submitForApproval = (params: CustomerSegmentation.ReqSegmentForm) => {
  return http.post("/customer-segmentation/submit", params);
};

// 预估人数
export const estimateCount = (rulePayload: TagManage.RuleConfig) => {
  return http.post<CustomerSegmentation.ResEstimate>("/customer-segmentation/estimate", { rulePayload });
};

// 获取样本数据
export const getSampleData = (rulePayload: TagManage.RuleConfig, pageNum: number = 1, pageSize: number = 10) => {
  return http.post<ResPage<CustomerSegmentation.SampleData>>("/customer-segmentation/sample", {
    rulePayload,
    pageNum,
    pageSize
  });
};

// 导出分群
export const exportSegment = (id: string, fields: string[]) => {
  return http.post("/customer-segmentation/" + id + "/export", { fields });
};

// 推送到 BDC
export const pushToBDC = (id: string) => {
  return http.post("/customer-segmentation/" + id + "/push/BDC外呼系统");
};

// 推送到企微营销台
export const pushToWeCom = (id: string) => {
  return http.post("/customer-segmentation/" + id + "/push/wecom");
};

// 获取版本历史
export const getVersionHistory = (id: string) => {
  return http.get<CustomerSegmentation.SegmentInfo[]>("/customer-segmentation/" + id + "/versions");
};

// 模拟验证规则
export const simulateRule = (params: CustomerSegmentation.ReqSimulateParams) => {
  return http.post<CustomerSegmentation.ResSimulate>("/customer-segmentation/simulate", params);
};

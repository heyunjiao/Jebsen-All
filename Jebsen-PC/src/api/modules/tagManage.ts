import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * 标签管理接口类型定义
 */
export namespace TagManage {
  // 标签状态
  export type TagStatus = "draft" | "active" | "inactive" | "abandoned";

  // 标签类型
  export type TagType = "auto" | "manual" | "file_upload";

  // 标签分类（根据标签名称前缀动态生成）
  export type TagCategory = string;

  // 规则节点
  export interface RuleNode {
    id: string;
    type: "group" | "predicate";
    operator?: "AND" | "OR";
    field?: string;
    operatorType?: string;
    value?: any;
    children?: RuleNode[];
  }

  // 规则配置（兼容旧格式和新格式）
  export interface RuleConfig {
    // 旧格式（扁平结构）
    logic?: "AND" | "OR" | "NOT";
    conditions?: Array<{
      field: string;
      operator: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "not in" | "contains" | "not contains";
      value: any;
    }>;
    // 新格式（树状结构）
    root?: RuleNode;
  }

  // 标签信息
  export interface TagInfo {
    tagId: string;
    tagName: string;
    category: TagCategory;
    tagType: TagType;
    status: TagStatus;
    coverageCount: number;
    coverageRate: string;
    creator: string;
    createTime: string;
    updateTime: string;
    publishTime: string | null;
    version: string;
    description: string;
    ruleConfig: RuleConfig | null;
    versionHistory?: VersionHistory[];
  }

  // 版本历史
  export interface VersionHistory {
    version: string;
    updateTime: string;
    operator: string;
    changeLog: string;
  }

  // 查询参数
  export interface ReqTagParams {
    pageNum?: number;
    pageSize?: number;
    tagName?: string;
    category?: TagCategory;
    tagType?: TagType;
    status?: TagStatus;
  }

  // 创建/更新标签参数
  export interface ReqTagForm {
    tagId?: string;
    tagName: string;
    category: TagCategory;
    tagType: TagType;
    status?: TagStatus;
    description: string;
    ruleConfig?: RuleConfig | null;
  }

  // 模拟验证参数
  export interface ReqSimulateParams {
    ruleConfig: RuleConfig | RuleNode;
  }

  // 模拟验证结果
  export interface ResSimulate {
    estimatedCount: number;
    estimatedRate: string;
    sampleData: Array<{
      oneId: string;
      name: string;
      matchReason: string;
    }>;
  }
}

/**
 * @name 标签管理模块
 */

// 获取标签列表
export const getTagList = (params: TagManage.ReqTagParams) => {
  return http.post<ResPage<TagManage.TagInfo>>(PORT1 + `/tag/list`, params);
};

// 获取标签详情
export const getTagDetail = (tagId: string) => {
  return http.get<TagManage.TagInfo>(PORT1 + `/tag/${tagId}`);
};

// 新增标签
export const addTag = (params: TagManage.ReqTagForm) => {
  return http.post(PORT1 + `/tag/add`, params);
};

// 编辑标签
export const editTag = (params: TagManage.ReqTagForm) => {
  return http.put(PORT1 + `/tag/edit`, params);
};

// 删除标签
export const deleteTag = (params: { tagIds: string[] }) => {
  return http.delete(PORT1 + `/tag/delete`, params);
};

// 发布标签
export const publishTag = (params: { tagId: string }) => {
  return http.post(PORT1 + `/tag/publish`, params);
};

// 停用标签
export const disableTag = (params: { tagId: string }) => {
  return http.post(PORT1 + `/tag/disable`, params);
};

// 废弃标签
export const abandonTag = (params: { tagId: string }) => {
  return http.post(PORT1 + `/tag/abandon`, params);
};

// 模拟验证规则
export const simulateRule = (params: TagManage.ReqSimulateParams) => {
  return http.post<TagManage.ResSimulate>(PORT1 + `/tag/simulate`, params);
};

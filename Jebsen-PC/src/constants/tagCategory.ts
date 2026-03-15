/**
 * 标签多级分类配置（系统内所有涉及标签的地方统一使用多级分类）
 */
export type CategoryOption = { value: string; label: string; children?: CategoryOption[] };

export interface CategoryMeta {
  value: string;
  label: string;
  level: number;
  parentValue?: string;
  isLeaf: boolean;
  pathValues: string[];
  pathLabels: string[];
}

export interface CategoryExplorerBranch {
  value: string;
  label: string;
  pathValues: string[];
  pathLabels: string[];
  leafCount: number;
  leaves: CategoryMeta[];
}

export interface CategoryExplorerRoot {
  value: string;
  label: string;
  pathValues: string[];
  pathLabels: string[];
  branchCount: number;
  leafCount: number;
  branches: CategoryExplorerBranch[];
}

/** 多级分类树（仅保留系统默认标签分类：会员分层、售后行为、活跃度相关、本年内购买过粘性产品、投诉相关） */
export const TAG_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "业务",
    label: "业务",
    children: [
      {
        value: "会员分层",
        label: "会员分层",
        children: [
          { value: "会员分层-销售钻石客户", label: "销售钻石客户" },
          { value: "会员分层-售后钻石客户", label: "售后钻石客户" },
          { value: "会员分层-普通活跃售后客户", label: "普通活跃售后客户" },
          { value: "会员分层-休眠客户", label: "休眠客户" },
          { value: "会员分层-流失客户", label: "流失客户" }
        ]
      },
      {
        value: "售后行为",
        label: "售后行为",
        children: [
          { value: "售后行为-12个月内完成首保", label: "12个月内完成首保" },
          { value: "售后行为-12个月内完成首次回厂", label: "12个月内完成首次回厂" },
          { value: "售后行为-12个月内回厂", label: "12个月内回厂" },
          { value: "售后行为-13-24个月回厂", label: "13-24个月回厂" }
        ]
      },
      {
        value: "活跃度相关",
        label: "活跃度相关",
        children: [
          { value: "活跃度-购买附加产品", label: "购买附加产品" },
          { value: "活跃度-推荐其他客户", label: "推荐其他客户" },
          { value: "活跃度-有增购换购", label: "有增购/换购" },
          { value: "活跃度-参加社群市场活动", label: "参加社群/市场活动" }
        ]
      },
      {
        value: "粘性产品",
        label: "本年内购买过粘性产品",
        children: [{ value: "粘性产品-粘性产品", label: "本年内购买过粘性产品" }]
      },
      {
        value: "投诉相关",
        label: "投诉相关",
        children: [{ value: "投诉相关-6个月内有投诉", label: "6个月内有投诉" }]
      },
      {
        value: "定保相关",
        label: "定保相关",
        children: [{ value: "定保相关-达标定保", label: "达标定保" }]
      }
    ]
  }
];

function flattenCategoryNodes(
  options: CategoryOption[],
  level = 1,
  pathValues: string[] = [],
  pathLabels: string[] = [],
  parentValue?: string
): CategoryMeta[] {
  return options.flatMap(option => {
    const nextPathValues = [...pathValues, option.value];
    const nextPathLabels = [...pathLabels, option.label];
    const current: CategoryMeta = {
      value: option.value,
      label: option.label,
      level,
      parentValue,
      isLeaf: !option.children?.length,
      pathValues: nextPathValues,
      pathLabels: nextPathLabels
    };

    return [current, ...(option.children?.length ? flattenCategoryNodes(option.children, level + 1, nextPathValues, nextPathLabels, option.value) : [])];
  });
}

const FLATTENED_CATEGORY_META = flattenCategoryNodes(TAG_CATEGORY_OPTIONS);

/** 规则配置中「条件」可选的默认标签字段（下拉选中后操作符固定为「等于」，值为「是/否」） */
export const DEFAULT_TAG_FIELDS: { value: string; label: string }[] = FLATTENED_CATEGORY_META.filter(
  m => m.isLeaf
).map(m => ({ value: `tag_${m.value}`, label: m.label }));

export function getCategoryMeta(
  options: CategoryOption[],
  value?: string
): CategoryMeta | null {
  if (!value) return null;
  const target = flattenCategoryNodes(options).find(item => item.value === value);
  return target || null;
}

/** 根据标签 value 返回展示用 label（用于客户列表、360 视图等标签展示） */
export function getTagDisplayLabel(value: string): string {
  const meta = getCategoryMeta(TAG_CATEGORY_OPTIONS, value);
  return meta?.label ?? value;
}

export function getFlattenedCategoryMeta(options: CategoryOption[]): CategoryMeta[] {
  return flattenCategoryNodes(options);
}

export function buildCategoryExplorer(options: CategoryOption[]): CategoryExplorerRoot[] {
  return options.map(root => {
    const branches: CategoryExplorerBranch[] = (root.children || []).map(child => {
      const childMeta = getCategoryMeta(options, child.value);
      const leaves = child.children?.length
        ? child.children
            .map(item => getCategoryMeta(options, item.value))
            .filter((item): item is CategoryMeta => Boolean(item))
        : (childMeta ? [childMeta] : []);

      return {
        value: child.value,
        label: child.label,
        pathValues: childMeta?.pathValues || [root.value, child.value],
        pathLabels: childMeta?.pathLabels || [root.label, child.label],
        leafCount: leaves.length,
        leaves
      };
    });

    return {
      value: root.value,
      label: root.label,
      pathValues: [root.value],
      pathLabels: [root.label],
      branchCount: branches.length,
      leafCount: branches.reduce((count, item) => count + item.leafCount, 0),
      branches
    };
  });
}

/**
 * 根据叶子值从多级选项中解析完整路径（用于多级别分类展示）
 */
export function getCategoryFullPath(
  options: CategoryOption[],
  value: string,
  path: string[] = []
): string {
  if (!value) return "";
  for (const opt of options) {
    const currentPath = [...path, opt.label];
    if (opt.value === value) return currentPath.join(" / ");
    if (opt.children?.length) {
      const found = getCategoryFullPath(opt.children, value, currentPath);
      if (found) return found;
    }
  }
  return value;
}

/** 分类对应 el-tag 的 type（取最后一级匹配，仅默认标签分类） */
const CATEGORY_TYPE_MAP: Record<string, string> = {
  会员分层: "primary",
  售后行为: "success",
  活跃度相关: "warning",
  粘性产品: "success",
  投诉相关: "danger",
  定保相关: "warning"
};

/**
 * 获取分类的 tag 类型（支持完整路径，取最后一级）
 */
export function getCategoryType(category: string | undefined): string {
  if (!category) return "info";
  const lastPart = String(category).split(" / ").pop() || category;
  return CATEGORY_TYPE_MAP[lastPart] || "info";
}

export const TAG_CATEGORY_META = FLATTENED_CATEGORY_META;

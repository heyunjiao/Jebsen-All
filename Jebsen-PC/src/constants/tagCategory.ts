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

/** 多级分类树（与标签管理、分群管理等保持一致） */
export const TAG_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "人",
    label: "人",
    children: [
      {
        value: "人口学",
        label: "人口学",
        children: [
          { value: "性别", label: "性别" },
          { value: "年龄段", label: "年龄段" }
        ]
      },
      {
        value: "爱好",
        label: "爱好",
        children: [
          {
            value: "运动",
            label: "运动",
            children: [
              { value: "运动-球类-足球", label: "球类 / 足球" },
              { value: "运动-球类-篮球", label: "球类 / 篮球" },
              { value: "运动-户外-越野跑", label: "户外 / 越野跑" }
            ]
          },
          {
            value: "旅游",
            label: "旅游",
            children: [
              { value: "旅游-国内-海岛", label: "国内 / 海岛游" },
              { value: "旅游-国外-欧洲", label: "出境 / 欧洲" }
            ]
          }
        ]
      }
    ]
  },
  {
    value: "车",
    label: "车",
    children: [
      {
        value: "车牌类型",
        label: "车牌类型",
        children: [
          { value: "车牌-新能源-绿牌", label: "新能源 / 绿牌" },
          { value: "车牌-普通-蓝牌", label: "普通 / 蓝牌" }
        ]
      },
      {
        value: "所在城市",
        label: "所在城市",
        children: [
          { value: "城市-一线-上海", label: "一线 / 上海" },
          { value: "城市-一线-北京", label: "一线 / 北京" }
        ]
      },
      {
        value: "保时捷",
        label: "保时捷",
        children: [
          { value: "保时捷-跑车-911", label: "跑车 / 911" },
          { value: "保时捷-SUV-卡宴", label: "SUV / 卡宴" }
        ]
      },
      { value: "新能源", label: "新能源" }
    ]
  },
  {
    value: "业务",
    label: "业务",
    children: [
      {
        value: "意向级别",
        label: "意向级别",
        children: [
          { value: "意向-高", label: "高意向" },
          { value: "意向-中", label: "中意向" },
          { value: "意向-低", label: "低意向" }
        ]
      },
      {
        value: "特殊标识",
        label: "特殊标识",
        children: [
          { value: "特殊-限时优惠", label: "限时优惠" },
          { value: "特殊-VIP", label: "VIP 身份" }
        ]
      },
      {
        value: "续保",
        label: "续保",
        children: [
          { value: "续保-到期-3个月内", label: "到期前 3 个月内" },
          { value: "续保-到期-已过期", label: "续保已过期" }
        ]
      },
      {
        value: "保险到期月份",
        label: "保险到期月份",
        children: [
          { value: "保险到期-本月", label: "本月到期" },
          { value: "保险到期-本季度", label: "本季度到期" }
        ]
      },
      {
        value: "POC",
        label: "POC",
        children: [
          { value: "POC-高", label: "高价值 POC" },
          { value: "POC-中", label: "中价值 POC" }
        ]
      },
      {
        value: "线上活动",
        label: "线上活动",
        children: [
          { value: "线上-试驾活动", label: "线上试驾活动" },
          { value: "线上-金融活动", label: "线上金融活动" }
        ]
      },
      {
        value: "SC",
        label: "SC",
        children: [
          { value: "SC-高", label: "高 SC 等级" },
          { value: "SC-中", label: "中 SC 等级" },
          { value: "SC-低", label: "低 SC 等级" }
        ]
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

export function getCategoryMeta(
  options: CategoryOption[],
  value?: string
): CategoryMeta | null {
  if (!value) return null;
  const target = flattenCategoryNodes(options).find(item => item.value === value);
  return target || null;
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

/** 分类对应 el-tag 的 type（取最后一级匹配） */
const CATEGORY_TYPE_MAP: Record<string, string> = {
  意向级别: "primary",
  车牌类型: "success",
  所在城市: "warning",
  特殊标识: "danger",
  爱好: "info",
  SC: "success",
  续保: "warning",
  保险到期月份: "info",
  POC: "primary",
  线上活动: "success",
  保时捷: "warning",
  新能源: "success",
  性别: "primary",
  年龄段: "info",
  人口学: "info",
  运动: "success",
  旅游: "warning"
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

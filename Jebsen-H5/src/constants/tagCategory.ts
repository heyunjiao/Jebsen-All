/**
 * 标签多级分类配置（与 PC 标签管理一致，系统内画像标签统一使用）
 * 来源：Jebsen-PC src/constants/tagCategory.ts
 */
export type CategoryOption = { value: string; label: string; children?: CategoryOption[] }

export interface CategoryMeta {
  value: string
  label: string
  level: number
  parentValue?: string
  isLeaf: boolean
  pathValues: string[]
  pathLabels: string[]
}

/** 多级分类树（与 PC 一致：业务 -> 会员分层、售后行为、活跃度相关、本年内购买过粘性产品、投诉相关、定保相关） */
export const TAG_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: '业务',
    label: '业务',
    children: [
      {
        value: '会员分层',
        label: '会员分层',
        children: [
          { value: '会员分层-销售钻石客户', label: '销售钻石客户' },
          { value: '会员分层-售后钻石客户', label: '售后钻石客户' },
          { value: '会员分层-普通活跃售后客户', label: '普通活跃售后客户' },
          { value: '会员分层-休眠客户', label: '休眠客户' },
          { value: '会员分层-流失客户', label: '流失客户' },
        ],
      },
      {
        value: '售后行为',
        label: '售后行为',
        children: [
          { value: '售后行为-12个月内完成首保', label: '12个月内完成首保' },
          { value: '售后行为-12个月内完成首次回厂', label: '12个月内完成首次回厂' },
          { value: '售后行为-12个月内回厂', label: '12个月内回厂' },
          { value: '售后行为-13-24个月回厂', label: '13-24个月回厂' },
        ],
      },
      {
        value: '活跃度相关',
        label: '活跃度相关',
        children: [
          { value: '活跃度-购买附加产品', label: '购买附加产品' },
          { value: '活跃度-推荐其他客户', label: '推荐其他客户' },
          { value: '活跃度-有增购换购', label: '有增购/换购' },
          { value: '活跃度-参加社群市场活动', label: '参加社群/市场活动' },
        ],
      },
      {
        value: '粘性产品',
        label: '本年内购买过粘性产品',
        children: [{ value: '粘性产品-粘性产品', label: '本年内购买过粘性产品' }],
      },
      {
        value: '投诉相关',
        label: '投诉相关',
        children: [{ value: '投诉相关-6个月内有投诉', label: '6个月内有投诉' }],
      },
      {
        value: '定保相关',
        label: '定保相关',
        children: [{ value: '定保相关-达标定保', label: '达标定保' }],
      },
    ],
  },
]

function flattenCategoryNodes(
  options: CategoryOption[],
  level = 1,
  pathValues: string[] = [],
  pathLabels: string[] = [],
  parentValue?: string,
): CategoryMeta[] {
  return options.flatMap(option => {
    const nextPathValues = [...pathValues, option.value]
    const nextPathLabels = [...pathLabels, option.label]
    const current: CategoryMeta = {
      value: option.value,
      label: option.label,
      level,
      parentValue,
      isLeaf: !option.children?.length,
      pathValues: nextPathValues,
      pathLabels: nextPathLabels,
    }
    return [
      current,
      ...(option.children?.length
        ? flattenCategoryNodes(option.children, level + 1, nextPathValues, nextPathLabels, option.value)
        : []),
    ]
  })
}

/**
 * 根据叶子值从多级选项中解析完整路径（用于多级别分类展示，与 PC 一致）
 */
export function getCategoryFullPath(
  options: CategoryOption[],
  value: string,
  path: string[] = [],
): string {
  if (!value) return ''
  for (const opt of options) {
    const currentPath = [...path, opt.label]
    if (opt.value === value) return currentPath.join(' / ')
    if (opt.children?.length) {
      const found = getCategoryFullPath(opt.children, value, currentPath)
      if (found) return found
    }
  }
  return value
}

export function getCategoryMeta(options: CategoryOption[], value?: string): CategoryMeta | null {
  if (!value) return null
  const target = flattenCategoryNodes(options).find(item => item.value === value)
  return target || null
}

/** 根据标签 value 返回展示用 label（与 TAG_CATEGORY_OPTIONS 一致，用于 H5 标签芯片等展示） */
export function getTagDisplayLabel(value: string): string {
  const meta = getCategoryMeta(TAG_CATEGORY_OPTIONS, value)
  return meta?.label ?? value
}

export function getFlattenedCategoryMeta(options: CategoryOption[]): CategoryMeta[] {
  return flattenCategoryNodes(options)
}

/** 分类对应展示用颜色（莫兰迪色系，与 PC 语义一致） */
const CATEGORY_COLOR_MAP: Record<string, string> = {
  会员分层: '#B8D4E8',
  售后行为: '#B8D8C8',
  活跃度相关: '#E8D8B8',
  粘性产品: '#D8C8E8',
  投诉相关: '#E8C8C8',
  定保相关: '#E0D8C8',
}

export function getCategoryColor(category: string | undefined): string {
  if (!category) return '#E2E8F0'
  return CATEGORY_COLOR_MAP[category] ?? '#E2E8F0'
}

/** 分类对应 el-tag 的 type（保留用于兼容） */
const CATEGORY_TYPE_MAP: Record<string, string> = {
  会员分层: 'primary',
  售后行为: 'success',
  活跃度相关: 'warning',
  粘性产品: 'success',
  投诉相关: 'danger',
  定保相关: 'warning',
}

export function getCategoryType(category: string | undefined): string {
  if (!category) return 'info'
  const lastPart = String(category).split(' / ').pop() || category
  return CATEGORY_TYPE_MAP[lastPart] || 'info'
}

/** 与 PC 画像标签一致：低饱和度浅底深字（Steel Blue / Sage / Lavender / Rose / Sand / Teal） */
const TAG_MUTED_STYLES: Record<string, { background: string; color: string; border: string }> = {
  primary: { background: '#f0f4f8', color: '#4a5c7a', border: '#d1d9e6' },   // 会员分层 - 灰蓝
  success: { background: '#f1f8f3', color: '#527a61', border: '#d2e4d9' },   // 售后行为 - 灰绿
  warning: { background: '#f4f2f8', color: '#6a5e8c', border: '#dcd7e8' },   // 活跃度 - 灰紫
  danger: { background: '#f9f2f2', color: '#8c5e5e', border: '#e8d2d2' },   // 投诉相关 - 灰玫
  info: { background: '#f7f6f0', color: '#7a7352', border: '#e6e3d2' },     // 定保/其他 - 沙色
}

/** 分类 -> 上述样式的 key（粘性产品用 success 同款绿，定保用 info） */
const CATEGORY_STYLE_KEY: Record<string, keyof typeof TAG_MUTED_STYLES> = {
  会员分层: 'primary',
  售后行为: 'success',
  活跃度相关: 'warning',
  粘性产品: 'success',
  投诉相关: 'danger',
  定保相关: 'info',
}

/** 根据标签值解析分类并返回低饱和度配色（与 PC 画像标签一致） */
export function getTagStyleByValue(tagValue: string): { background: string; color: string; border: string } {
  const category = tagValue.includes('-') ? tagValue.split('-')[0] : tagValue
  const normalized = category === '活跃度' ? '活跃度相关' : category
  const key = CATEGORY_STYLE_KEY[normalized] ?? 'info'
  return TAG_MUTED_STYLES[key]
}

/** 从 TAG_CATEGORY_OPTIONS 展开的默认标签池（与 PC 画像标签 allCategoryTags 一致，用于 fallback/mock） */
export interface DefaultTagPoolItem {
  id: string
  name: string
  category: string
  categoryPath: string[]
  color?: string
  required?: boolean
  minSelect?: number
}

export function buildDefaultTagPoolFromCategory(): DefaultTagPoolItem[] {
  const list: DefaultTagPoolItem[] = []
  const root = TAG_CATEGORY_OPTIONS[0]
  if (!root?.children) return list
  for (const second of root.children) {
    const categoryPath = [root.value, second.value]
    const color = getCategoryColor(second.value)
    const children = second.children ?? []
    for (const leaf of children) {
      list.push({
        id: leaf.value,
        name: leaf.value,
        category: second.value,
        categoryPath: [...categoryPath],
        color,
      })
    }
  }
  return list
}

export const DEFAULT_TAG_POOL_PC = buildDefaultTagPoolFromCategory()

/** Mock 画像标签：从标签池中选取的示例标签名（保证画像标签 mock 与标签池一致） */
export const MOCK_PORTRAIT_TAG_NAMES: string[] = [
  '会员分层-销售钻石客户',
  '会员分层-普通活跃售后客户',
  '售后行为-12个月内完成首保',
  '活跃度-购买附加产品',
  '粘性产品-粘性产品',
  '投诉相关-6个月内有投诉',
  '定保相关-达标定保',
  '会员分层-休眠客户',
]

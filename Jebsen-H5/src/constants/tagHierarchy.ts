import type { TagPool } from '@/types/customer'

type TagPoolLike = Pick<TagPool, 'id' | 'name' | 'category' | 'required' | 'minSelect'> & {
  categoryPath?: string[]
}

interface RootConfig {
  key: string
  label: string
  description: string
  categories: string[]
  order: number
}

interface CategoryConfig {
  rootKey: string
  label: string
  description: string
  order: number
}

interface SubgroupConfig {
  key: string
  label: string
  order: number
  matcher: (tag: TagPoolLike) => boolean
}

export interface TagHierarchyMeta {
  rootKey: string
  rootLabel: string
  rootDescription: string
  categoryKey: string
  categoryLabel: string
  categoryDescription: string
  categoryOrder: number
  subgroupKey: string
  subgroupLabel: string
  subgroupOrder: number
  pathLabels: string[]
}

export interface TagHierarchyItem extends TagPool {
  meta: TagHierarchyMeta
  selected: boolean
}

export interface TagHierarchySubgroup {
  key: string
  label: string
  order: number
  tags: TagHierarchyItem[]
  totalCount: number
  selectedCount: number
}

export interface TagHierarchyCategory {
  key: string
  label: string
  description: string
  order: number
  pathLabels: string[]
  required: boolean
  minSelect: number
  subgroups: TagHierarchySubgroup[]
  totalCount: number
  selectedCount: number
}

export interface TagHierarchyRoot {
  key: string
  label: string
  description: string
  order: number
  categories: TagHierarchyCategory[]
  totalCount: number
  selectedCount: number
}

const ROOT_CONFIGS: RootConfig[] = [
  {
    key: 'business',
    label: '业务标签',
    description: '反映线索、续保、评估与活动状态',
    categories: ['意向级别', 'SC【必选】', 'SA【必选】', '续保【必选】', 'POC【必选】', '线上活动'],
    order: 1,
  },
  {
    key: 'identity',
    label: '身份标签',
    description: '反映客户身份和触达控制',
    categories: ['客户类型', '免打扰车主'],
    order: 2,
  },
  {
    key: 'interest',
    label: '兴趣标签',
    description: '反映兴趣偏好与长期特征',
    categories: ['爱好(≥1项)'],
    order: 3,
  },
  {
    key: 'other',
    label: '其他标签',
    description: '未归类或待补充的标签',
    categories: [],
    order: 99,
  },
]

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  意向级别: {
    rootKey: 'business',
    label: '意向级别',
    description: '快速判断线索热度',
    order: 1,
  },
  'SC【必选】': {
    rootKey: 'business',
    label: 'SC【必选】',
    description: '线索来源类标签，至少选 1 项',
    order: 2,
  },
  'SA【必选】': {
    rootKey: 'business',
    label: 'SA【必选】',
    description: '区域属性类标签，至少选 1 项',
    order: 3,
  },
  '续保【必选】': {
    rootKey: 'business',
    label: '续保【必选】',
    description: '续保公司、到期月份与状态标签',
    order: 4,
  },
  'POC【必选】': {
    rootKey: 'business',
    label: 'POC【必选】',
    description: '评估方式类标签，至少选 1 项',
    order: 5,
  },
  线上活动: {
    rootKey: 'business',
    label: '线上活动',
    description: '活动参与或触达记录',
    order: 6,
  },
  客户类型: {
    rootKey: 'identity',
    label: '客户类型',
    description: '标记准车主、转介绍、再购等身份',
    order: 1,
  },
  客户状态: {
    rootKey: 'identity',
    label: '客户状态',
    description: '标记投诉、预约等服务状态',
    order: 3,
  },
  免打扰车主: {
    rootKey: 'identity',
    label: '免打扰车主',
    description: '用于限制外呼或触达',
    order: 2,
  },
  '爱好(≥1项)': {
    rootKey: 'interest',
    label: '爱好(≥1项)',
    description: '兴趣标签，至少选择 1 项',
    order: 1,
  },
}

const DEFAULT_SUBGROUP: SubgroupConfig = {
  key: 'all',
  label: '全部标签',
  order: 99,
  matcher: () => true,
}

const SUBGROUP_CONFIGS: Record<string, SubgroupConfig[]> = {
  意向级别: [
    {
      key: 'intent-level',
      label: '热度分层',
      order: 1,
      matcher: () => true,
    },
  ],
  'SC【必选】': [
    {
      key: 'source',
      label: '线索来源',
      order: 1,
      matcher: () => true,
    },
  ],
  'SA【必选】': [
    {
      key: 'territory',
      label: '区域属性',
      order: 1,
      matcher: () => true,
    },
  ],
  '续保【必选】': [
    {
      key: 'company',
      label: '保险公司',
      order: 1,
      matcher: tag =>
        ['人保', '人寿', '太保', '平安', '新保', '续保', '太平', '大地', '其他'].includes(tag.name),
    },
    {
      key: 'expire-month',
      label: '到期月份',
      order: 2,
      matcher: tag => tag.name.startsWith('保险到期月份-'),
    },
    {
      key: 'status',
      label: '续保状态',
      order: 3,
      matcher: tag => ['在修不在保'].includes(tag.name),
    },
  ],
  'POC【必选】': [
    {
      key: 'assessment',
      label: '评估方式',
      order: 1,
      matcher: () => true,
    },
  ],
  线上活动: [
    {
      key: 'campaign',
      label: '活动标签',
      order: 1,
      matcher: () => true,
    },
  ],
  客户类型: [
    {
      key: 'customer-state',
      label: '客户身份',
      order: 1,
      matcher: () => true,
    },
  ],
  免打扰车主: [
    {
      key: 'do-not-disturb',
      label: '触达控制',
      order: 1,
      matcher: () => true,
    },
  ],
  '爱好(≥1项)': [
    {
      key: 'interest',
      label: '兴趣偏好',
      order: 1,
      matcher: () => true,
    },
  ],
}

const ROOT_CONFIG_MAP = ROOT_CONFIGS.reduce<Record<string, RootConfig>>((result, item) => {
  result[item.key] = item
  return result
}, {})

function getCategoryLabel(tag: TagPoolLike): string {
  const path = tag.categoryPath?.filter(Boolean) || []
  const fromPath = path[path.length - 1]
  return fromPath || tag.category || '其他'
}

function getRootConfigByCategory(categoryLabel: string): RootConfig {
  const categoryConfig = CATEGORY_CONFIGS[categoryLabel]
  if (categoryConfig && ROOT_CONFIG_MAP[categoryConfig.rootKey]) {
    return ROOT_CONFIG_MAP[categoryConfig.rootKey]
  }

  const fallback = ROOT_CONFIGS.find(item => item.categories.includes(categoryLabel))
  return fallback || ROOT_CONFIG_MAP.other
}

function getSubgroupConfig(categoryLabel: string, tag: TagPoolLike): SubgroupConfig {
  const configs = SUBGROUP_CONFIGS[categoryLabel] || [DEFAULT_SUBGROUP]
  return configs.find(item => item.matcher(tag)) || DEFAULT_SUBGROUP
}

export function getTagHierarchyMeta(tag: TagPoolLike): TagHierarchyMeta {
  const explicitPath = tag.categoryPath?.filter(Boolean) || []
  const categoryLabel = getCategoryLabel(tag)
  const rootConfig = getRootConfigByCategory(categoryLabel)
  const categoryConfig = CATEGORY_CONFIGS[categoryLabel] || {
    rootKey: rootConfig.key,
    label: categoryLabel,
    description: '补充分组后可进一步细化',
    order: 99,
  }
  const subgroupConfig = getSubgroupConfig(categoryLabel, tag)
  const pathLabels = explicitPath.length > 0 ? explicitPath : [rootConfig.label, categoryConfig.label]
  const categoryKey = explicitPath.length > 0 ? explicitPath.join(' / ') : `${rootConfig.key}-${categoryConfig.label}`
  const categoryLabelDisplay = pathLabels.length > 1 ? pathLabels.slice(1).join(' / ') : categoryConfig.label

  return {
    rootKey: rootConfig.key,
    rootLabel: pathLabels[0] || rootConfig.label,
    rootDescription: rootConfig.description,
    categoryKey,
    categoryLabel: categoryLabelDisplay,
    categoryDescription: categoryConfig.description,
    categoryOrder: categoryConfig.order,
    subgroupKey: `${categoryKey}-${subgroupConfig.key}`,
    subgroupLabel: subgroupConfig.label,
    subgroupOrder: subgroupConfig.order,
    pathLabels,
  }
}

export function buildTagHierarchy(tags: TagPoolLike[], selectedNames: string[] = []): TagHierarchyRoot[] {
  const selectedSet = new Set(selectedNames)
  const rootMap = new Map<string, TagHierarchyRoot>()

  tags.forEach(tag => {
    const meta = getTagHierarchyMeta(tag)
    const rootKey = meta.rootKey
    const root = rootMap.get(rootKey) || {
      key: rootKey,
      label: meta.rootLabel,
      description: meta.rootDescription,
      order: ROOT_CONFIG_MAP[rootKey]?.order ?? 99,
      categories: [],
      totalCount: 0,
      selectedCount: 0,
    }

    let category = root.categories.find(item => item.key === meta.categoryKey)
    if (!category) {
      category = {
        key: meta.categoryKey,
        label: meta.categoryLabel,
        description: meta.categoryDescription,
        order: meta.categoryOrder,
        pathLabels: meta.pathLabels,
        required: false,
        minSelect: 0,
        subgroups: [],
        totalCount: 0,
        selectedCount: 0,
      }
      root.categories.push(category)
    }

    let subgroup = category.subgroups.find(item => item.key === meta.subgroupKey)
    if (!subgroup) {
      subgroup = {
        key: meta.subgroupKey,
        label: meta.subgroupLabel,
        order: meta.subgroupOrder,
        tags: [],
        totalCount: 0,
        selectedCount: 0,
      }
      category.subgroups.push(subgroup)
    }

    const selected = selectedSet.has(tag.name)
    const tagItem: TagHierarchyItem = {
      ...tag,
      meta,
      selected,
    }

    subgroup.tags.push(tagItem)
    subgroup.totalCount += 1
    subgroup.selectedCount += selected ? 1 : 0

    category.totalCount += 1
    category.selectedCount += selected ? 1 : 0
    category.required = category.required || Boolean(tag.required)
    category.minSelect = Math.max(category.minSelect, tag.minSelect || 0)

    root.totalCount += 1
    root.selectedCount += selected ? 1 : 0

    rootMap.set(rootKey, root)
  })

  return Array.from(rootMap.values())
    .sort((a, b) => a.order - b.order)
    .map(root => ({
      ...root,
      categories: root.categories
        .sort((a, b) => a.order - b.order)
        .map(category => ({
          ...category,
          subgroups: category.subgroups
            .sort((a, b) => a.order - b.order)
            .map(subgroup => ({
              ...subgroup,
              tags: subgroup.tags.sort((a, b) => Number(b.selected) - Number(a.selected) || a.name.localeCompare(b.name, 'zh-CN')),
            })),
        })),
    }))
}

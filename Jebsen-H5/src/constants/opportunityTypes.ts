export const BOARD_OPPORTUNITY_TYPES = [
  '售后满意度回访',
  '新车满意度回访',
  'BDC Campaign',
  'CM 自定义',
  'PCN售后 Campaign',
  'TTR调研',
  '新转续',
  '续转续',
  '在修不在保',
  'PSP到期',
  '保养潜在流失',
  '365天未进店',
  '定保客户365天未保养',
  '定期保养',
  '首保2年',
  '首次保养',
  '新车365天未保养',
  '新车保修到期',
  '延保到期',
  '新车交付90天回访',
] as const

const LEGACY_OPPORTUNITY_TYPE_MAP: Record<string, typeof BOARD_OPPORTUNITY_TYPES[number]> = {
  '钻石客户': 'CM 自定义',
  'VIP 车主': 'CM 自定义',
  '高价值商机': 'CM 自定义',
  '高价值客户': 'CM 自定义',
  'CM自定义': 'CM 自定义',
  '置换需求': 'CM 自定义',
  '大客户': 'CM 自定义',
  '高价值客户': 'CM 自定义',
  '商务合作伙伴': 'CM 自定义',
  '年度采购意向': 'CM 自定义',
  '重点维护': 'CM 自定义',
  '车队升级机会': 'CM 自定义',
  '保养关怀活动': '定期保养',
  '轮胎关怀计划': 'PCN售后 Campaign',
  '首保流失15个月': '保养潜在流失',
  'PCN售后Campaign': 'PCN售后 Campaign',
  'PCN 售后增项': 'PCN售后 Campaign',
  'PCN售后': 'PCN售后 Campaign',
}

const OPPORTUNITY_TAG_TYPE_MAP: Record<typeof BOARD_OPPORTUNITY_TYPES[number], string> = {
  '售后满意度回访': 'primary',
  '新车满意度回访': 'success',
  'BDC Campaign': 'primary',
  'CM 自定义': 'danger',
  'PCN售后 Campaign': 'warning',
  'TTR调研': 'warning',
  '新转续': 'primary',
  '续转续': 'success',
  '在修不在保': 'warning',
  'PSP到期': 'warning',
  '保养潜在流失': 'danger',
  '365天未进店': 'default',
  '定保客户365天未保养': 'primary',
  '定期保养': 'success',
  '首保2年': 'primary',
  '首次保养': 'success',
  '新车365天未保养': 'warning',
  '新车保修到期': 'primary',
  '延保到期': 'success',
  '新车交付90天回访': 'primary',
}

const OPPORTUNITY_THEME_CLASS_MAP: Record<typeof BOARD_OPPORTUNITY_TYPES[number], string> = {
  '售后满意度回访': 'opp-tag-green',
  '新车满意度回访': 'opp-tag-green',
  'BDC Campaign': 'opp-tag-blue',
  'CM 自定义': 'opp-tag-gold',
  'PCN售后 Campaign': 'opp-tag-purple',
  'TTR调研': 'opp-tag-purple',
  '新转续': 'opp-tag-blue',
  '续转续': 'opp-tag-blue',
  '在修不在保': 'opp-tag-warning',
  'PSP到期': 'opp-tag-teal',
  '保养潜在流失': 'opp-tag-warning',
  '365天未进店': 'opp-tag-warning',
  '定保客户365天未保养': 'opp-tag-teal',
  '定期保养': 'opp-tag-green',
  '首保2年': 'opp-tag-teal',
  '首次保养': 'opp-tag-green',
  '新车365天未保养': 'opp-tag-warning',
  '新车保修到期': 'opp-tag-teal',
  '延保到期': 'opp-tag-teal',
  '新车交付90天回访': 'opp-tag-green',
}

const OPPORTUNITY_ICON_MAP: Partial<Record<typeof BOARD_OPPORTUNITY_TYPES[number], string>> = {
  'PSP到期': 'clock-o',
  '保养潜在流失': 'warning-o',
  '新车保修到期': 'clock-o',
  '延保到期': 'clock-o',
}

export const normalizeOpportunityType = (type?: string | null) => {
  const rawType = String(type || '').trim()
  if (!rawType)
    return ''
  return LEGACY_OPPORTUNITY_TYPE_MAP[rawType] || rawType
}

export const normalizeOpportunityField = <T extends { value?: any, sources?: Array<{ value: any }> }>(field?: T) => {
  if (!field)
    return field

  return {
    ...field,
    value: typeof field.value === 'string' ? normalizeOpportunityType(field.value) : field.value,
    sources: Array.isArray(field.sources)
      ? field.sources.map(source => ({
        ...source,
        value: typeof source.value === 'string' ? normalizeOpportunityType(source.value) : source.value,
      }))
      : field.sources,
  }
}

export const normalizeOpportunities = <T extends { type?: string }>(items: T[]) =>
  (items || []).map(item => ({
    ...item,
    type: normalizeOpportunityType(item.type),
  }))

export const getOpportunityThemeClass = (type?: string | null) => {
  const normalizedType = normalizeOpportunityType(type) as typeof BOARD_OPPORTUNITY_TYPES[number]
  const themeClass = OPPORTUNITY_THEME_CLASS_MAP[normalizedType]
  return themeClass ? `biz-badge ${themeClass}` : 'biz-badge'
}

export const getOpportunityIcon = (type?: string | null) => {
  const normalizedType = normalizeOpportunityType(type) as typeof BOARD_OPPORTUNITY_TYPES[number]
  return OPPORTUNITY_ICON_MAP[normalizedType] || null
}

export const getOpportunityTagType = (type?: string | null) => {
  const normalizedType = normalizeOpportunityType(type) as typeof BOARD_OPPORTUNITY_TYPES[number]
  return OPPORTUNITY_TAG_TYPE_MAP[normalizedType] || 'primary'
}

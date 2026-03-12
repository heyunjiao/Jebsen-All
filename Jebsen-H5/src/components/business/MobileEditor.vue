<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    :style="showOnlyForm ? { height: 'auto', maxHeight: '70%' } : { height: '80%' }"
    round
    lock-scroll
    @close="handleClose"
  >
    <div class="mobile-editor">
      <!-- 从当前 tab 点编辑进入：只显示红框内容（号码+主副号+姓名+关系+取消保存） -->
      <template v-if="showOnlyForm">
        <div class="popup-header">
          <h3>编辑号码</h3>
          <van-icon name="cross" @click="handleClose" />
        </div>
        <div class="popup-content form-only-content">
          <div class="mobile-item form-only-card">
            <div class="mobile-item-content">
              <div class="form-only-number-row">
                <van-field
                  v-model="editForm.mobile"
                  placeholder="请输入手机号"
                  :rules="mobileRules"
                  clearable
                  class="form-only-mobile-field"
                  :border="false"
                />
                <div class="number-type-selector-compact">
                  <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                    <van-radio
                      name="primary"
                      :disabled="mobileItems.some(i => i.isPrimary && i.id !== editingItem?.id)"
                    >主号</van-radio>
                    <van-radio name="secondary">副号</van-radio>
                  </van-radio-group>
                </div>
              </div>
              <div class="contact-name-section">
                <div class="section-label">联系人姓名：</div>
                <van-field
                  v-model="editForm.contactName"
                  placeholder="请输入联系人姓名"
                  clearable
                  class="contact-name-field"
                  :border="false"
                />
              </div>
              <div class="relation-tag-section">
                <div class="section-label">联系人标签（关系）：</div>
                <div v-if="tagPool.length === 0" class="tag-empty">
                  <span class="empty-text">暂无标签数据</span>
                </div>
                <div v-else class="tag-options">
                  <van-tag
                    v-for="tag in tagPool"
                    :key="tag.id"
                    :type="editForm.relationTagId === tag.id ? 'primary' : 'default'"
                    size="small"
                    plain
                    class="tag-option"
                    :class="{ 'tag-selected': editForm.relationTagId === tag.id }"
                    @click="handleSelectRelationTag(tag.id)"
                  >
                    {{ tag.name }}
                    <van-icon
                      v-if="editForm.relationTagId === tag.id"
                      name="success"
                      class="tag-check-icon"
                    />
                  </van-tag>
                </div>
              </div>
              <div class="mobile-actions-bottom">
                <van-button type="default" size="small" @click="handleCancelEdit">取消</van-button>
                <van-button
                  type="primary"
                  size="small"
                  :loading="saving"
                  @click="handleSaveEdit"
                >
                  保存
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 完整管理弹窗：列表 + 新增（从默认 tab 进入时为「查看全部」） -->
      <template v-else>
        <div class="popup-header">
          <h3>查看全部联系电话</h3>
          <van-icon name="cross" @click="handleClose" />
        </div>

        <div class="popup-content">
          <!-- 号码列表视图 -->
          <div v-if="currentView === 'list'" class="view-content">
            <!-- 电话号码列表 -->
            <div class="mobile-list">
              <!-- 按人分组遍历 -->
              <div
                v-for="group in groupedIdentities"
                :key="group.key"
                class="mobile-person-group"
              >
                <!-- 分组头部：展示姓名和最右侧的关系标签 -->
                <div class="person-group-header">
                  <div class="header-left">
                    <span class="person-name">{{ group.contactName || '未知联系人' }}</span>
                    <van-tag
                      v-if="group.relationTagName"
                      type="default"
                      size="small"
                      plain
                      class="person-relation-tag"
                    >
                      {{ group.relationTagName }}
                    </van-tag>
                  </div>
                  <van-icon name="plus" class="add-number-icon" @click="handleAdd(group)" />
                </div>
                
                <!-- 该人名下的号码列表 -->
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="mobile-item"
                  :class="{ 'is-primary': item.isPrimary }"
                >
                  <div class="mobile-item-header">
                    <div class="mobile-number">
                      <!-- 编辑模式：显示输入框和类型选择 -->
                      <div v-if="editingItemId === item.id" class="mobile-row-inline">
                        <van-field
                          v-model="editForm.mobile"
                          placeholder="请输入手机号"
                          :rules="mobileRules"
                          clearable
                          class="mobile-input-field"
                          :border="false"
                        />
                        <div class="number-type-selector-compact">
                          <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                            <van-radio 
                              name="primary" 
                              :disabled="mobileItems.some(i => i.isPrimary && i.id !== item.id)"
                            >主号</van-radio>
                            <van-radio name="secondary">副号</van-radio>
                          </van-radio-group>
                        </div>
                      </div>
                      <!-- 非编辑模式：只显示号码和标签（姓名与关系已在分组头部展示） -->
                      <template v-else>
                        <span class="number">{{ item.mobile }}</span>
                        <van-tag v-if="item.isPrimary" type="primary" size="small" color="#94724A" plain>主号</van-tag>
                        <van-tag v-if="item.source" type="default" size="small" class="source-tag">{{ item.source }}</van-tag>
                      </template>
                    </div>
                    <div v-if="editingItemId !== item.id && !item.readonly" class="mobile-actions">
                      <!-- 非编辑模式：显示操作图标 -->
                      <van-icon
                        v-if="!item.isPrimary && item.id"
                        name="delete"
                        class="action-icon delete-icon"
                        @click="handleDelete(item.id)"
                      />
                      <van-icon
                        name="edit"
                        class="action-icon edit-icon"
                        @click="handleEditItem(item)"
                      />
                    </div>
                  </div>
                  <div v-if="item.readonly" class="readonly-hint" style="font-size: 12px; color: #9ca3af; margin-top: 4px; padding-bottom: 2px;">该号码来自售后订单同步，仅支持查看</div>
                  
                  <!-- 编辑模式：在当前号码下方展开表单 -->
                  <div v-if="editingItemId === item.id" class="mobile-item-inline-form editing-mode">
                    <div class="mobile-item-header">
                      <div class="mobile-number">
                        <div class="mobile-row-inline">
                          <van-field
                            v-model="editForm.mobile"
                            placeholder="请输入手机号"
                            :rules="mobileRules"
                            clearable
                            class="mobile-input-field"
                            :border="false"
                          />
                          <div class="number-type-selector-compact">
                            <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                              <van-radio name="primary">主号</van-radio>
                              <van-radio name="secondary">副号</van-radio>
                            </van-radio-group>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mobile-actions-bottom">
                      <van-button type="default" size="small" @click="handleCancelEdit">取消</van-button>
                      <van-button type="primary" size="small" :loading="saving" @click="handleSaveEdit">保存</van-button>
                    </div>
                  </div>
                </div>

                <!-- 在目标人卡片下方展开“新增号码”表单 -->
                <div v-if="editingItemId === 'new' && editForm.contactName === group.contactName" class="mobile-item-inline-form">
                  <div class="mobile-item-header">
                    <div class="mobile-number">
                      <div class="mobile-row-inline">
                        <van-field
                          v-model="editForm.mobile"
                          placeholder="请输入手机号"
                          :rules="mobileRules"
                          clearable
                          class="mobile-input-field"
                          :border="false"
                        />
                        <div class="number-type-selector-compact">
                          <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                            <van-radio 
                              name="primary" 
                              :disabled="mobileItems.some(i => i.isPrimary)"
                            >主号</van-radio>
                            <van-radio name="secondary">副号</van-radio>
                          </van-radio-group>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mobile-actions-bottom">
                    <van-button type="default" size="small" @click="handleCancelEdit">取消</van-button>
                    <van-button type="primary" size="small" :loading="saving" @click="handleSaveEdit">保存</van-button>
                  </div>
                </div>
              </div>

              <!-- 全局新增购车人表单（不在现有分组内） -->
              <div v-if="editingItemId === 'new' && !groupedIdentities.some(g => g.contactName === editForm.contactName)" class="mobile-person-group edit-form-new">
                <div class="person-group-header">
                  <span class="person-name">新增购车人</span>
                </div>
                <div class="mobile-item-header">
                  <div class="mobile-number mobile-row-inline">
                     <van-field
                      v-model="editForm.contactName"
                      placeholder="姓名"
                      class="contact-name-field-inline"
                      :border="false"
                    />
                    <van-field
                      v-model="editForm.mobile"
                      placeholder="手机号"
                      :rules="mobileRules"
                      clearable
                      class="mobile-input-field"
                      :border="false"
                    />
                  </div>
                </div>
                <div class="relation-tag-section" style="margin-top: 12px;">
                  <div class="section-label">联系人标签：</div>
                  <div class="tag-options">
                    <van-tag
                      v-for="tag in tagPool"
                      :key="tag.id"
                      :type="editForm.relationTagId === tag.id ? 'primary' : 'default'"
                      size="small"
                      plain
                      class="tag-option"
                      :class="{ 'tag-selected': editForm.relationTagId === tag.id }"
                      @click="handleSelectRelationTag(tag.id)"
                    >
                      {{ tag.name }}
                    </van-tag>
                  </div>
                </div>
                <div class="mobile-actions-bottom">
                  <van-button type="default" size="small" @click="handleCancelEdit">取消</van-button>
                  <van-button type="primary" size="small" :loading="saving" @click="handleSaveEdit">保存</van-button>
                </div>
              </div>
            </div> <!-- End mobile-list -->

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <van-button
                v-if="editingItemId !== 'new'"
                type="primary"
                size="large"
                icon="plus"
                @click="handleAdd()"
                block
              >
                新增购车人
              </van-button>
            </div>
          </div> <!-- End view-content -->
        </div> <!-- End popup-content -->
      </template>
    </div> <!-- End mobile-editor -->
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import type { MobileItem, MobileData, TagPool } from '@/types/customer'
import { customerApi } from '@/api/customer'

interface Props {
  modelValue: boolean
  mobileData: MobileData
  customerType?: 'individual' | 'company'
  /** 打开弹窗时直接进入该条号码的编辑（与当前 tab/行 关联） */
  initialEditItemId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  customerType: 'individual',
  initialEditItemId: null,
})

// 关系标签池
const relationTagPool = ref<TagPool[]>([])

// 实际使用的标签池（关系标签池）
const PERSONAL_RELATION_TAGS = ['本人', '配偶', '子女', '父母', '亲戚', '朋友', '其他']
const COMPANY_RELATION_TAGS = ['法人', '股东', '总经理', '采购', '财务', '司机', '助理', '其他']
const tagPool = computed(() =>
  relationTagPool.value.filter(tag =>
    props.customerType === 'company'
      ? COMPANY_RELATION_TAGS.includes(tag.name)
      : PERSONAL_RELATION_TAGS.includes(tag.name)
  )
)

// 获取关系标签池
const fetchRelationTagPool = async () => {
  // 如果已经有数据，直接返回
  if (relationTagPool.value.length > 0) {
    return
  }
  
  try {
    console.log('[MobileEditor] 开始获取关系标签池')
    const res = await customerApi.getRelationTagPool()
    console.log('[MobileEditor] 关系标签池响应:', res)
    if (res.code === 200 && res.data) {
      relationTagPool.value = res.data
      console.log('[MobileEditor] 关系标签池已设置:', relationTagPool.value)
    } else {
      throw new Error('获取关系标签池失败')
    }
  } catch (error: any) {
    console.warn('[MobileEditor] 获取关系标签池失败，使用默认标签:', error)
    // Fallback: 使用默认关系标签
    relationTagPool.value = [
      { id: 'relation1', name: '本人', color: '#94724A' },
      { id: 'relation2', name: '配偶', color: '#ff6b9d' },
      { id: 'relation3', name: '家庭联系人', color: '#52c41a' },
      { id: 'relation4', name: '其他个人关系', color: '#8c8c8c' },
      { id: 'relation5', name: '公司总机', color: '#B8865B' },
      { id: 'relation6', name: '采购联系人', color: '#13c2c2' },
      { id: 'relation7', name: '财务联系人', color: '#722ed1' },
      { id: 'relation8', name: '行政联系人', color: '#fa8c16' },
      { id: 'relation9', name: '其他公司关系', color: '#8c8c8c' },
    ]
    console.log('[MobileEditor] 使用默认关系标签池:', relationTagPool.value)
  }
}

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update': [data: MobileData]
}>()

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

/** 从当前 tab 点编辑进入时只显示红框表单（号码+主副号+姓名+关系+取消保存），不显示完整列表 */
const showOnlyForm = computed(
  () => !!show.value && !!props.initialEditItemId && editingItemId.value === props.initialEditItemId
)

const mobileItems = ref<MobileItem[]>([...props.mobileData.items])
const currentView = ref<'list'>('list')
const editingItemId = ref<string | 'new' | null>(null) // null: 无编辑, 'new': 新增, string: 编辑的ID
const editingItem = ref<MobileItem | null>(null)
const saving = ref(false)

// 按人分组号码
const groupedIdentities = computed(() => {
  const items = mobileItems.value
  const personKey = (item: MobileItem) => item.contactName || item.relationTagName || item.id
  const groups = new Map<string, MobileItem[]>()
  
  for (const item of items) {
    const key = personKey(item)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  
  return Array.from(groups.entries()).map(([key, groupItems]) => {
    const first = groupItems[0]
    return {
      key,
      contactName: first.contactName,
      relationTagName: first.relationTagName,
      items: groupItems,
    }
  })
})

const editForm = ref({
  mobile: '',
  contactName: '',
  relationTagId: '' as string,
  businessTags: [] as string[],
  isPrimary: 'secondary' as 'primary' | 'secondary',
})

// 手机号或座机：11位手机 / 带区号座机(0开头10-11位) / 7-8位本地
const isPhoneOrLandline = (val: string) => /^(1[3-9]\d{9}|0\d{2,3}\d{7,8}|\d{7,8})$/.test((val || '').replace(/[\s-]/g, ''))
const mobileRules = [
  { required: true, message: '请输入手机号 or 座机号' },
  { validator: (val: string) => isPhoneOrLandline(val), message: '手机号或座机号格式不正确' },
]

// 切换关系标签（单选，列表视图）
const toggleRelationTag = async (item: MobileItem, tagId: string) => {
  const selectedTag = tagPool.value.find(t => t.id === tagId)
  if (!selectedTag) return
  
  // 如果点击的是已选中的标签，则取消选择；否则选择新标签
  const newRelationTagId = item.relationTagId === tagId ? undefined : tagId
  const newRelationTagName = newRelationTagId ? selectedTag.name : undefined
  
  // 更新本地数据
  const index = mobileItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    mobileItems.value[index] = {
      ...mobileItems.value[index],
      relationTagId: newRelationTagId,
      relationTagName: newRelationTagName,
    }
    
    // 保存到后端
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
      duration: 0,
    })
    
    try {
      const res = await customerApi.updateMobileItem({
        id: String(item.id),
        mobile: item.mobile,
        relationTagId: newRelationTagId,
        relationTagName: newRelationTagName,
        businessTags: item.businessTags,
        isPrimary: item.isPrimary,
      })
      
      if (res.code === 200) {
        mobileItems.value[index] = res.data
        emitUpdate()
      }
    } catch (error: any) {
      showToast(error.message || '保存失败，请重试')
      // 保存失败，还原本地数据
      mobileItems.value[index] = item
    } finally {
      closeToast()
    }
  }
}

// 选择关系标签（编辑表单，单选）
const handleSelectRelationTag = (tagId: string) => {
  editForm.value.relationTagId = editForm.value.relationTagId === tagId ? '' : tagId
}

// 监听 mobileData 变化，同步号码列表
watch(
  () => props.mobileData,
  (newData) => {
    mobileItems.value = [...newData.items]
  },
  { deep: true }
)

// 监听 show 变化：打开时拉取关系标签池；若传入 initialEditItemId 则直接展开该条编辑
watch(
  () => show.value,
  (isShow) => {
    if (isShow) {
      if (relationTagPool.value.length === 0) fetchRelationTagPool()
      const id = props.initialEditItemId
      if (id && mobileItems.value.some((i) => i.id === id)) {
        const item = mobileItems.value.find((i) => i.id === id)!
        handleEditItem(item)
      }
    }
  }
)

onMounted(() => {
  // 获取关系标签池
  fetchRelationTagPool()
})

// 关闭弹窗
const handleClose = () => {
  editingItemId.value = null
  editingItem.value = null
  show.value = false
}

// 新增号码
const handleAdd = (group?: any) => {
  editingItem.value = null
  const hasPrimary = mobileItems.value.some(item => item.isPrimary)
  editForm.value = {
    mobile: '',
    contactName: group ? group.contactName : '',
    relationTagId: group ? group.items[0]?.relationTagId : '',
    businessTags: group ? (group.items[0]?.businessTags || []) : ['购车人'],
    isPrimary: hasPrimary ? 'secondary' : 'primary',
  }
  editingItemId.value = 'new'
}

// 编辑号码
const handleEditItem = (item: MobileItem) => {
  if (item.readonly) {
    showToast('送修人信息由售后订单同步，当前不可修改')
    return
  }
  editingItem.value = item
  editForm.value = {
    mobile: item.mobile,
    contactName: item.contactName || '',
    relationTagId: item.relationTagId || '',
    businessTags: item.businessTags ? [...item.businessTags] : [],
    isPrimary: item.isPrimary ? 'primary' : 'secondary',
  }
  editingItemId.value = item.id
}

// 取消编辑
const handleCancelEdit = () => {
  if (props.initialEditItemId) {
    emit('update:modelValue', false)
  }
  editingItemId.value = null
  editingItem.value = null
  editForm.value = {
    mobile: '',
    contactName: '',
    relationTagId: '',
    businessTags: [],
    isPrimary: 'secondary',
  }
}

// 保存编辑（联系电话只维护号码+联系人+关系；人-车关联在「车辆信息」弹窗里设置，更新时保留原有关联）
const handleSaveEdit = async () => {
  if (editingItem.value?.readonly) {
    showToast('送修人信息由售后订单同步，当前不可修改')
    return
  }
  const raw = (editForm.value.mobile || '').trim().replace(/[\s-]/g, '')
  if (!raw || !isPhoneOrLandline(editForm.value.mobile)) {
    showToast('请输入正确的手机号或座机号')
    return
  }
  const mobileToSave = raw
  const contactNameToSave = (editForm.value.contactName || '').trim()
  // 新增号码时姓名必填
  if (!editingItem.value && !contactNameToSave) {
    showToast('请输入姓名')
    return
  }

  saving.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    const selectedTag = tagPool.value.find(tag => tag.id === editForm.value.relationTagId)
    const isPrimary = editForm.value.isPrimary === 'primary'
    
    // 如果设置为主号，需要先将原来的主号改为副号
    if (isPrimary) {
      const currentPrimary = mobileItems.value.find(item => item.isPrimary && item.id !== editingItem.value?.id)
      if (currentPrimary) {
        // 将原主号改为副号
        await customerApi.updateMobileItem({
          id: String(currentPrimary.id),
          mobile: currentPrimary.mobile,
          relationTagId: currentPrimary.relationTagId,
          relationTagName: currentPrimary.relationTagName,
          businessTags: currentPrimary.businessTags,
          vehicleLabel: currentPrimary.vehicleLabel,
          isPrimary: false,
        })
      }
    }
    
    if (editingItem.value) {
      // 更新现有号码
      const res = await customerApi.updateMobileItem({
        id: String(editingItem.value.id),
        mobile: mobileToSave,
        contactName: contactNameToSave || undefined,
        relationTagId: editForm.value.relationTagId || undefined,
        relationTagName: selectedTag?.name,
        businessTags: editingItem.value.businessTags,
        vehicleLabel: editingItem.value.vehicleLabel,
        isPrimary,
      })
      
      if (res.code === 200) {
        const index = mobileItems.value.findIndex((item) => item.id === editingItem.value!.id)
        if (index > -1) {
          mobileItems.value[index] = res.data
        }
        // 如果设置为主号，更新原主号状态
        if (isPrimary) {
          const currentPrimaryIndex = mobileItems.value.findIndex(item => item.isPrimary && item.id !== editingItem.value!.id)
          if (currentPrimaryIndex > -1) {
            mobileItems.value[currentPrimaryIndex] = {
              ...mobileItems.value[currentPrimaryIndex],
              isPrimary: false,
            }
          }
        }
        showToast('更新成功')
        editingItemId.value = null
        editingItem.value = null
        if (props.initialEditItemId) emit('update:modelValue', false)
        emitUpdate()
      }
    } else {
      // 新增号码
      const res = await customerApi.addMobileItem({
        mobile: mobileToSave,
        contactName: contactNameToSave,
        relationTagId: editForm.value.relationTagId || undefined,
        relationTagName: selectedTag?.name,
        // 如果是全局新增，或者该人在分组中标记过购车人，则确保带上标签
        businessTags: editForm.value.businessTags.includes('购车人') ? editForm.value.businessTags : [...editForm.value.businessTags, '购车人'],
        isPrimary,
      })
      
      if (res.code === 200) {
        mobileItems.value.push(res.data)
        // 如果设置为主号，更新原主号状态
        if (isPrimary) {
          const currentPrimaryIndex = mobileItems.value.findIndex(item => item.isPrimary && item.id !== res.data.id)
          if (currentPrimaryIndex > -1) {
            mobileItems.value[currentPrimaryIndex] = {
              ...mobileItems.value[currentPrimaryIndex],
              isPrimary: false,
            }
          }
        }
        showToast('添加成功')
        editingItemId.value = null
        editingItem.value = null
        editForm.value = {
          mobile: '',
          contactName: '',
          relationTagId: '',
          businessTags: [],
          isPrimary: 'secondary',
        }
        if (props.initialEditItemId) emit('update:modelValue', false)
        emitUpdate()
      }
    }
  } catch (error: any) {
    showToast(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
    closeToast()
  }
}

// 删除号码
const handleDelete = async (id: string) => {
  if (!id) {
    showToast('无效的电话号码ID')
    return
  }

  const item = mobileItems.value.find((i) => i.id === id)
  if (!item) {
    showToast('电话号码不存在')
    return
  }

  if (item.readonly) {
    showToast('送修人信息由售后订单同步，当前不可删除')
    return
  }

  if (item.isPrimary) {
    showToast('不能删除主号码')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除号码 ${item.mobile} 吗？`,
    })

    showLoadingToast({
      message: '删除中...',
      forbidClick: true,
    })

    const res = await customerApi.deleteMobileItem(id)
    if (res.code === 200) {
      mobileItems.value = mobileItems.value.filter((i) => i.id !== id)
      showToast('删除成功')
      emitUpdate()
    } else {
      showToast(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast(error.message || '删除失败，请重试')
    }
  } finally {
    closeToast()
  }
}

// 触发更新事件
const emitUpdate = () => {
  const updatedData: MobileData = {
    items: mobileItems.value,
    isConflict: mobileItems.value.length > 1,
    editable: props.mobileData.editable,
  }
  emit('update', updatedData)
}
</script>

<style scoped lang="scss">
.mobile-editor {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: Porsche Next, -apple-system, PingFang SC, sans-serif;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    padding-bottom: 12px;
    border-bottom: none;
    background: white;
    margin-bottom: 8px;
    flex-shrink: 0;
    border-radius: 6px 6px 0 0;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .van-icon {
      font-size: 16px;
      color: var(--text-sub);
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s;
      
      &:active {
        opacity: 0.7;
      }
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 0 12px 12px;

    &.form-only-content {
      padding: 16px;
      background: var(--bg-slate);
    }
  }

  .view-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .mobile-list {
    flex: 1;
    margin-bottom: 12px;

    /* 个人分组卡片 */
    .mobile-person-group {
      background: white;
      border-radius: 8px;
      border: 1px solid var(--accent-gold);
      padding: 12px 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      .person-group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px dashed #e5e7eb;

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .person-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
        }
        
        .person-relation-tag {
          border: 1px solid #d1d5db;
          background: #f3f4f6;
          color: #6b7280;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .add-number-icon {
          font-size: 18px;
          color: var(--accent-gold);
          cursor: pointer;
          padding: 4px;
          transition: opacity 0.2s;
          &:active {
            opacity: 0.7;
          }
        }
      }

      .mobile-item {
        padding: 8px 0;
        margin-bottom: 0;
        border-bottom: 1px solid #f3f4f6;
        background: transparent;
        box-shadow: none;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .mobile-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0;

          .mobile-number {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            flex-wrap: wrap;

            .number {
              font-size: 16px;
              font-weight: 700;
              color: var(--text-main);
              letter-spacing: 0.3px;
              font-family: "Monaco", "Menlo", "Consolas", monospace;
              margin-right: 4px;
            }
            
            .source-tag {
              background: #f5f6f7;
              color: #9ca3af;
              border: none;
              font-size: 10px;
              border-radius: 2px;
              padding: 1px 4px;
            }
            
            .mobile-input-field {
              padding: 0;
              :deep(.van-field__control) {
                font-size: 14px;
                font-weight: 400;
                color: var(--text-main);
                line-height: 1.5;
              }
            }
            
            .mobile-row-inline {
              display: flex;
              align-items: center;
              width: 100%;
              gap: 8px;
              flex-wrap: nowrap;
            }
            
            .number-type-selector-compact {
              flex-shrink: 0;
              .van-radio-group {
                display: flex;
                gap: 12px;
                .van-radio {
                  :deep(.van-radio__label) {
                    font-size: 13px;
                    color: var(--text-main);
                    margin-left: 4px;
                  }
                }
              }
            }
          }

          .mobile-actions {
            display: flex;
            gap: 8px;
            align-items: center;

            .action-icon {
              font-size: 18px;
              cursor: pointer;
              transition: opacity 0.2s;

              &.edit-icon {
                color: var(--accent-gold);
              }

              &.delete-icon {
                color: #E53E3E;
              }
              
              &:active {
                opacity: 0.7;
              }
            }
          }
        }

        .readonly-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
          padding-bottom: 2px;
        }

        .mobile-item-inline-form {
          margin-top: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          &.editing-mode {
            border: 1px solid #e5e7eb;
            margin-bottom: 8px;
          }
        }
      }
    }
  }

  /* 仅红框表单模式核心样式 */
  .form-only-card {
    margin: 0;
    padding: 14px 16px 18px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid var(--accent-gold);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  .form-only-number-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .form-only-mobile-field {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    background: #f5f6f7;
    border-radius: 6px;
  }
  .contact-name-section {
    margin-bottom: 14px;
    .section-label {
      font-size: 14px;
      color: var(--text-main);
      font-weight: 500;
      margin-bottom: 8px;
    }
    .contact-name-field {
      padding: 10px 12px;
      background: #f5f6f7;
      border-radius: 6px;
    }
  }
  .relation-tag-section {
    margin-bottom: 16px;
    .section-label {
      font-size: 14px;
      color: var(--text-main);
      font-weight: 500;
      margin-bottom: 10px;
    }
    .tag-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      .tag-option {
        padding: 4px 10px;
        background: #f0f0f0 !important;
        border: 1px solid #e0e0e0 !important;
        &.tag-selected {
          background: var(--accent-gold) !important;
          border-color: var(--accent-gold) !important;
          color: #fff !important;
        }
      }
    }
  }

  .mobile-actions-bottom {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);

    .van-button {
      min-width: 80px;
      height: 32px;
      font-size: 14px;
    }
  }

  .action-buttons {
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
    margin-top: auto;
  }
}
</style>

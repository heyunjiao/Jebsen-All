<template>
  <van-popup
    :show="show"
    @update:show="(value: boolean) => emit('update:show', value)"
    position="bottom"
    :style="{ height: '80%' }"
    round
    :lock-scroll="true"
  >
    <div class="platform-flow">
      <div class="popup-header">
        <h3>身份血缘溯源</h3>
        <div class="oneid-pill">
          <span class="oneid-label-text">{{ oneIdDisplay }}</span>
        </div>
        <van-icon name="cross" @click="close" />
      </div>
      <div class="popup-content">
        <!-- 日志表头 -->
        <div class="log-table-header">
          <div class="col col-time">合并时间</div>
          <div class="col col-operator">合并人</div>
          <div class="col col-system">系统名称</div>
          <div class="col col-field">变更字段</div>
          <div class="col col-old">原值</div>
          <div class="col col-new">新值</div>
        </div>

        <!-- 日志列表（滚动加载） -->
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="log in visibleLogs"
            :key="log.id"
            class="log-row"
          >
            <div class="col col-time">{{ log.mergeTime }}</div>
            <div class="col col-operator">{{ log.operator || '系统自动合并' }}</div>
            <div class="col col-system">{{ log.systemName }}</div>
            <div class="col col-field">{{ log.fieldLabel }}</div>
            <div class="col col-old" :title="log.oldValue || '-'">
              {{ log.oldValue || '-' }}
            </div>
            <div class="col col-new" :title="log.newValue || '-'">
              {{ log.newValue || '-' }}
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="!loading && visibleLogs.length === 0"
            class="empty-state"
          >
            <van-empty description="暂无溯源日志" />
          </div>
        </van-list>
      </div>
      <div class="popup-footer">
        <van-button
          type="primary"
          size="large"
          block
          @click="close"
        >
          关闭
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PlatformSource } from '@/types/customer'

interface Props {
  show: boolean
  sources: PlatformSource[]
  customerId?: string // 客户ID，用于显示 OneID
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

interface TraceLogRow {
  id: string
  mergeTime: string
  operator: string
  systemName: string
  fieldLabel: string
  oldValue?: string
  newValue?: string
}

// 所有溯源日志（由平台源数据映射而来）
const allLogs = computed<TraceLogRow[]>(() => {
  const result: TraceLogRow[] = []

  props.sources.forEach((source) => {
    const entries = Object.entries(source.keyInfo || {})
      .filter(([, value]) => value !== undefined && value !== null)

    if (entries.length === 0) {
      result.push({
        id: `${source.id}-summary`,
        mergeTime: source.mergeTime,
        operator: '',
        systemName: source.name,
        fieldLabel: '关键信息',
        oldValue: '',
        newValue: '',
      })
      return
    }

    entries.forEach(([key, value], index) => {
      result.push({
        id: `${source.id}-${key}-${index}`,
        mergeTime: source.mergeTime,
        operator: '',
        systemName: source.name,
        fieldLabel: getLabel(key),
        oldValue: '',
        newValue: value != null ? String(value) : '',
      })
    })
  })

  // 按时间倒序展示（最近的在上方）
  return result.sort((a, b) => {
    const t1 = new Date(a.mergeTime).getTime()
    const t2 = new Date(b.mergeTime).getTime()
    return t2 - t1
  })
})

// 滚动加载状态
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(10)
const visibleLogs = ref<TraceLogRow[]>([])

const resetList = () => {
  page.value = 1
  finished.value = false
  visibleLogs.value = []
}

// 弹窗打开或数据变化时重置列表
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      resetList()
    }
  },
  { immediate: true },
)

watch(
  () => props.sources,
  () => {
    if (props.show) {
      resetList()
    }
  },
  { deep: true },
)

// 加载下一页日志
const onLoad = () => {
  if (finished.value) {
    loading.value = false
    return
  }

  loading.value = true

  // 模拟异步加载，保持与真实接口行为一致
  setTimeout(() => {
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    const nextItems = allLogs.value.slice(start, end)

    if (nextItems.length === 0) {
      finished.value = true
      loading.value = false
      return
    }

    visibleLogs.value = [...visibleLogs.value, ...nextItems]
    page.value += 1

    if (end >= allLogs.value.length) {
      finished.value = true
    }

    loading.value = false
  }, 400)
}

// OneID 显示值
const oneIdDisplay = computed(() => {
  if (props.customerId) {
    // 如果客户ID是数字，格式化为 ONEID + 8位数字
    const num = props.customerId.replace(/\D/g, '')
    if (num) {
      return `ONEID${num.padStart(8, '0').slice(-8)}`
    }
    return props.customerId
  }
  return 'ONEID00000001'
})

const close = () => {
  emit('update:show', false)
}

const getLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    name: '姓名',
    mobile: '手机号',
    age: '年龄',
    gender: '性别',
    city: '城市',
  }
  return labelMap[key] || key
}
</script>

<style scoped lang="scss">
.platform-flow {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  margin-bottom: 0;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: -0.01em;
  }

  .oneid-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: #f5f7fa;
    border: 1px solid var(--border-color);

    .oneid-label-text {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-gold);
      letter-spacing: 0.2px;
    }
  }

  .van-icon {
    margin-left: auto;
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
  padding-top: 10px;
}

.log-table-header {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 1.2fr 1fr 1fr;
  padding: 6px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 11px;
  color: var(--text-sub);
  margin-bottom: 6px;
}

.log-row {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 1.2fr 1fr 1fr;
  padding: 8px 8px;
  font-size: 11px;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  background: #fff;
  align-items: start;
  gap: 4px;

  &:nth-child(2n) {
    background: #fcfcfc;
  }
}

.col {
  padding-right: 4px;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}

.col-time {
  color: var(--text-sub);
}

.col-new {
  font-weight: 600;
}

.empty-state {
  padding: 20px 0;
}

.popup-footer {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  margin-top: auto;

  .van-button {
    flex: 1;
    font-size: 14px !important;
    height: 40px;
  }
}
</style>


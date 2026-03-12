<template>
  <div class="communication-records-container">
    <van-nav-bar
      title="沟通记录"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <!-- 数据同步提示 -->
    <van-notice-bar
      left-icon="info-o"
      text="数据由业务系统 T+1 同步，本平台仅供查看。"
      class="sync-notice-bar"
    />

    <!-- 沟通记录列表（使用 van-list 实现滚动加载） -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 沟通记录卡片 -->
      <div
        v-for="record in communicationRecords"
        :key="record.id"
        class="communication-card"
      >
        <div class="card-header">
          <div class="record-title">{{ record.channel }}</div>
          <van-tag :type="getTypeTag(record.channel)" :size="'small' as any">
            {{ record.channel }}
          </van-tag>
        </div>
        <div class="card-content">
          <div class="info-row">
            <span class="label">时间：</span>
            <span class="value">{{ record.time }}</span>
          </div>
          <div class="info-row">
            <span class="label">渠道：</span>
            <span class="value">{{ record.channel }}</span>
          </div>
          <div class="info-row">
            <span class="label">沟通内容：</span>
            <span class="value">{{ record.content }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && communicationRecords.length === 0" class="empty-state">
        <van-empty description="暂无沟通记录" />
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customer'

const customerStore = useCustomerStore()
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(5) // 每页加载 5 条

// 沟通记录列表（暂时使用 mock 数据，后续从 store 获取）
const communicationRecords = ref([
  {
    id: 'COMM001',
    channel: '电话',
    time: '2025-01-16 14:30:00',
    content: '客户咨询车辆保养事宜，已安排预约',
  },
  {
    id: 'COMM002',
    channel: '微信',
    time: '2025-01-15 10:20:00',
    content: '发送保养提醒信息',
  },
  {
    id: 'COMM003',
    channel: '到店',
    time: '2025-01-14 16:45:00',
    content: '客户到店咨询新车购买事宜',
  },
])

// 获取类型标签样式
const getTypeTag = (type: string): any => {
  const typeMap: Record<string, any> = {
    电话: 'primary',
    微信: 'success',
    到店: 'warning',
  }
  return typeMap[type] || 'default'
}

// 滚动加载数据
const onLoad = async () => {
  try {
    loading.value = true
    
    if (!customerStore.profile) {
      await customerStore.fetchProfile()
    }
    
    // TODO: 后续从 store 获取沟通记录数据
    // await customerStore.fetchCommunicationRecords(page.value, pageSize.value)
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    finished.value = true
  } catch (error) {
    console.error('加载沟通记录失败:', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  // 重置分页状态
  page.value = 1
  finished.value = false
})
</script>

<style scoped lang="scss">
.communication-container {
  min-height: 200px;
  background: transparent;
  padding: 0;
  max-width: 100%;
  box-sizing: border-box;
  
  // van-list 样式
  :deep(.van-list) {
    min-height: 100%;
  }
  
  :deep(.van-list__finished-text) {
    padding: 12px 0;
    color: #969799;
    font-size: 12px;
    text-align: center;
  }
  
  :deep(.van-list__loading) {
    padding: 12px 0;
    text-align: center;
  }
}

.communication-card {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
  border: 1px solid var(--border-color);

  .card-header {
    padding: 6px 10px;
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .record-title {
      font-size: 12px;
      font-weight: 600;
      color: #323233;
    }
  }

  .card-content {
    padding: 6px 10px;

    .info-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 11px;
      line-height: 1.3;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
        min-width: 70px;
        flex-shrink: 0;
      }

      .value {
        color: #323233;
        flex: 1;
        word-break: break-word;
      }
    }
  }
}

.empty-state {
  padding: 20px 0;
  text-align: center;
}
</style>

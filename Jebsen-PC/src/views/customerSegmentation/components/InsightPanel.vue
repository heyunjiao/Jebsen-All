<template>
  <div class="insight-panel">
    <!-- 实时漏斗计数器 -->
    <div class="funnel-section">
      <!-- 总基盘数 -->
      <div class="stat-card base-count">
        <div class="stat-label">
          <el-icon><User /></el-icon>
          {{ $t("customerSegmentation.insightPanel.totalBase") }}
        </div>
        <div class="stat-value">{{ formatNumber(totalBaseCount) }}</div>
      </div>

      <!-- 分隔符 -->
      <div class="funnel-arrow">
        <el-icon><ArrowDown /></el-icon>
      </div>

      <!-- 命中预估 -->
      <div class="stat-card estimate-count" :class="{ loading: loading }">
        <div class="stat-label">
          <el-icon><Aim /></el-icon>
          {{ $t("customerSegmentation.insightPanel.estimatedHits") }}
        </div>

        <!-- 骨架屏 -->
        <template v-if="loading">
          <el-skeleton :rows="1" animated class="skeleton-loader">
            <template #template>
              <el-skeleton-item variant="h1" style="width: 60%; height: 48px" />
            </template>
          </el-skeleton>
          <div class="calculating-text">
            <el-icon class="is-loading"><Loading /></el-icon>
            {{ $t("customerSegmentation.estimatePanel.calculating") }}
          </div>
        </template>

        <!-- 预估结果 -->
        <template v-else-if="estimateResult">
          <div class="estimate-value">
            <span class="big-number">{{ formatNumber(estimateResult.estimatedCount) }}</span>
            <span class="unit">{{ $t("customerSegmentation.estimatePanel.people") }}</span>
          </div>
        </template>

        <!-- 无数据 -->
        <template v-else>
          <div class="no-data">--</div>
        </template>
      </div>

      <!-- 占比分析 -->
      <div v-if="estimateResult && !loading" class="rate-analysis">
        <div class="rate-row">
          <span class="rate-label">{{ $t("customerSegmentation.insightPanel.hitRate") }}</span>
          <el-tag :type="getRateTagType(hitRateValue)" size="large" class="rate-tag">
            {{ estimateResult.estimatedRate }}
          </el-tag>
        </div>

        <!-- 进度条 -->
        <el-progress
          :percentage="hitRateValue"
          :stroke-width="8"
          :color="getProgressColor(hitRateValue)"
          :show-text="false"
          class="rate-progress"
        />
      </div>

      <!-- Warning 提示 -->
      <el-alert
        v-if="showHighCoverageWarning"
        :title="$t('customerSegmentation.insightPanel.highCoverageWarning', { rate: hitRateValue.toFixed(1) })"
        type="warning"
        :closable="false"
        show-icon
        class="coverage-alert"
      />

      <el-alert
        v-else-if="showZeroCoverageWarning"
        :title="$t('customerSegmentation.insightPanel.zeroCoverageWarning')"
        type="error"
        :closable="false"
        show-icon
        class="coverage-alert"
      />

      <el-alert
        v-if="isTimeout"
        :title="$t('customerSegmentation.insightPanel.calculationTimeout')"
        type="info"
        :closable="false"
        show-icon
        class="timeout-alert"
      />

      <!-- 环比变动 -->
      <div v-if="changeFromLast && !loading" class="change-info">
        <div class="change-label">{{ $t("customerSegmentation.estimatePanel.changeFromLast") }}</div>
        <div class="change-value" :class="changeFromLast.count >= 0 ? 'increase' : 'decrease'">
          <el-icon v-if="changeFromLast.count >= 0"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
          {{ formatNumber(Math.abs(changeFromLast.count)) }}
          <span class="change-unit">{{ $t("customerSegmentation.estimatePanel.people") }}</span>
          <span class="change-rate">({{ changeFromLast.count >= 0 ? "+" : "" }}{{ changeFromLast.rate }})</span>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <el-divider />

    <!-- 样本数据预览区域 -->
    <div class="sample-section">
      <div class="section-header">
        <span class="section-title">
          <el-icon><List /></el-icon>
          {{ $t("customerSegmentation.samplePreview.title") }}
        </span>
        <el-button type="primary" link size="small" :icon="Refresh" :loading="sampleLoading" @click="handleRefreshSample">
          刷新
        </el-button>
      </div>

      <div v-loading="sampleLoading" class="sample-content">
        <el-empty
          v-if="!sampleData || sampleData.length === 0"
          :description="$t('customerSegmentation.samplePreview.noData')"
          :image-size="60"
        />

        <div v-else class="sample-list">
          <div v-for="(item, index) in sampleData" :key="index" class="sample-item">
            <div class="sample-avatar">
              <el-avatar :size="36" :icon="UserFilled" />
            </div>
            <div class="sample-info">
              <div class="sample-name">{{ maskName(item.name) }}</div>
              <div class="sample-phone">{{ maskPhone(item.phone) }}</div>
            </div>
            <div class="sample-tags">
              <el-tag v-for="tag in item.tags?.slice(0, 2)" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 隐私提示 -->
        <div class="privacy-notice">
          <el-icon><Warning /></el-icon>
          {{ $t("customerSegmentation.insightPanel.privacyNotice") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { User, Aim, ArrowDown, ArrowUp, Loading, List, Refresh, UserFilled, Warning } from "@element-plus/icons-vue";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";
import { getSampleData } from "@/api/modules/customerSegmentation";
import type { TagManage } from "@/api/modules/tagManage";

const { t } = useI18n();

const props = defineProps<{
  estimateResult: CustomerSegmentation.ResEstimate | null;
  loading: boolean;
  changeFromLast?: { count: number; rate: string } | null;
  rulePayload?: TagManage.RuleConfig | null;
  isTimeout?: boolean;
  hasConflict?: boolean;
}>();

const emit = defineEmits<{
  refreshSample: [];
}>();

// Mock 总基盘数
const totalBaseCount = ref(1200000);

// 样本数据
const sampleData = ref<CustomerSegmentation.SampleData[]>([]);
const sampleLoading = ref(false);

// 计算命中率数值
const hitRateValue = computed(() => {
  if (!props.estimateResult?.estimatedRate) return 0;
  return parseFloat(props.estimateResult.estimatedRate.replace("%", ""));
});

// 是否显示高覆盖 Warning
const showHighCoverageWarning = computed(() => {
  return !props.loading && hitRateValue.value > 50;
});

// 是否显示零命中 Warning
const showZeroCoverageWarning = computed(() => {
  return !props.loading && props.estimateResult && props.estimateResult.estimatedCount === 0;
});

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const getRateTagType = (rate: number) => {
  if (rate === 0) return "danger";
  if (rate > 50) return "warning";
  if (rate > 30) return "info";
  return "success";
};

const getProgressColor = (rate: number) => {
  if (rate === 0) return "#ef4444";
  if (rate > 50) return "#f59e0b";
  if (rate > 30) return "#3b82f6";
  return "#22c55e";
};

// 脱敏函数
const maskPhone = (phone: string) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

const maskName = (name: string) => {
  if (!name || name.length <= 1) return name;
  return name.substring(0, 1) + "**";
};

// 加载样本数据
const loadSampleData = async () => {
  if (!props.rulePayload) {
    sampleData.value = [];
    return;
  }

  sampleLoading.value = true;
  try {
    // 使用 mock 数据
    const mockData = await import("@/assets/json/customerSegmentationMockData.json");
    await new Promise(resolve => setTimeout(resolve, 600)); // 模拟网络延迟

    if (mockData.default?.sample?.data?.list) {
      // 只取前 5 条作为预览
      sampleData.value = mockData.default.sample.data.list.slice(0, 5);
    } else {
      // 尝试调用真实 API
      const res = await getSampleData(props.rulePayload, 1, 5);
      sampleData.value = res.data.list || [];
    }
  } catch (error) {
    console.error("加载样本数据失败:", error);
    // Mock data fallback
    const mockData = await import("@/assets/json/customerSegmentationMockData.json");
    if (mockData.default?.sample?.data?.list) {
      sampleData.value = mockData.default.sample.data.list.slice(0, 5);
    } else {
      sampleData.value = [
        {
          oneId: "O001",
          name: "陈建华",
          phone: "138****1234",
          vin: "WVWZZZ3CZ",
          gender: "男",
          ageGroup: "30-40",
          city: "北京市/北京市/朝阳区",
          carSeriesModel: "BMW 5系",
          lastVisitTime: "2024-01-10",
          annualSpend: 25000,
          tags: ["高价值", "活跃"]
        },
        {
          oneId: "O002",
          name: "王芳",
          phone: "139****4321",
          vin: "WVWZZZ4DZ",
          gender: "男",
          ageGroup: "40-50",
          city: "上海市/上海市/浦东新区",
          carSeriesModel: "BMW X5",
          lastVisitTime: "2024-01-08",
          annualSpend: 35000,
          tags: ["VIP"]
        },
        {
          oneId: "O003",
          name: "周杰",
          phone: "150****5678",
          vin: "WVWZZZ5EZ",
          gender: "女",
          ageGroup: "25-30",
          city: "广东省/深圳市/南山区",
          carSeriesModel: "BMW 3系",
          lastVisitTime: "2024-01-05",
          annualSpend: 18000,
          tags: ["新客户"]
        }
      ];
    }
  } finally {
    sampleLoading.value = false;
  }
};

const handleRefreshSample = () => {
  loadSampleData();
  emit("refreshSample");
};

// 监听规则变化
watch(
  () => props.rulePayload,
  () => {
    loadSampleData();
  },
  { deep: true }
);

onMounted(() => {
  loadSampleData();
});
</script>

<style scoped lang="scss">
.insight-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .funnel-section {
    .stat-card {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;

      &.base-count {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);

        .stat-label {
          color: #64748b;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #475569;
        }
      }

      &.estimate-count {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 2px solid #3b82f6;

        &.loading {
          opacity: 0.8;
        }

        .stat-label {
          color: #1e40af;
        }

        .estimate-value {
          display: flex;
          align-items: baseline;
          gap: 4px;

          .big-number {
            font-size: 36px;
            font-weight: 700;
            color: #1d4ed8;
            line-height: 1.2;
          }

          .unit {
            font-size: 16px;
            color: #3b82f6;
          }
        }

        .no-data {
          font-size: 36px;
          font-weight: 600;
          color: #94a3b8;
        }
      }

      .stat-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        margin-bottom: 8px;
      }

      .skeleton-loader {
        margin-bottom: 8px;
      }

      .calculating-text {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #64748b;
      }
    }

    .funnel-arrow {
      display: flex;
      justify-content: center;
      margin: 8px 0;
      color: #94a3b8;
    }

    .rate-analysis {
      padding: 12px 16px;
      background-color: #fafafa;
      border-radius: 8px;
      margin-bottom: 12px;

      .rate-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .rate-label {
          font-size: 13px;
          color: #64748b;
        }

        .rate-tag {
          font-weight: 600;
        }
      }

      .rate-progress {
        margin-top: 8px;
      }
    }

    .coverage-alert,
    .timeout-alert {
      margin-bottom: 12px;
    }

    .change-info {
      padding: 12px 16px;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;

      .change-label {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 6px;
      }

      .change-value {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 16px;
        font-weight: 600;

        &.increase {
          color: #22c55e;
        }

        &.decrease {
          color: #ef4444;
        }

        .change-unit,
        .change-rate {
          font-size: 14px;
          font-weight: normal;
        }
      }
    }
  }

  .sample-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #475569;
      }
    }

    .sample-content {
      flex: 1;
      overflow-y: auto;
      min-height: 150px;

      .sample-list {
        .sample-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background-color: #fafafa;
          border-radius: 6px;
          margin-bottom: 8px;
          transition: background-color 0.2s;

          &:hover {
            background-color: #f1f5f9;
          }

          .sample-avatar {
            flex-shrink: 0;
          }

          .sample-info {
            flex: 1;
            min-width: 0;

            .sample-name {
              font-size: 14px;
              font-weight: 500;
              color: #1e293b;
              margin-bottom: 2px;
            }

            .sample-phone {
              font-size: 12px;
              color: #64748b;
            }
          }

          .sample-tags {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
          }
        }
      }

      .privacy-notice {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 12px;
        margin-top: 12px;
        font-size: 12px;
        color: #94a3b8;
        background-color: #fef3c7;
        border-radius: 6px;

        .el-icon {
          color: #f59e0b;
        }
      }
    }
  }
}
</style>

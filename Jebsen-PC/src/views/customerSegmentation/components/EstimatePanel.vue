<template>
  <div class="estimate-panel">
    <div v-loading="loading" class="estimate-content">
      <div v-if="!estimateResult && !loading" class="empty-state">
        <el-empty :description="$t('customerSegmentation.estimatePanel.noData')" :image-size="80" />
      </div>

      <div v-else-if="estimateResult" class="estimate-result">
        <!-- 预估总数 -->
        <div class="estimate-total">
          <div class="total-label">{{ $t("customerSegmentation.estimatePanel.totalCount") }}</div>
          <div class="total-value">{{ formatNumber(estimateResult.estimatedCount) }}</div>
          <div class="total-unit">{{ $t("customerSegmentation.estimatePanel.people") }}</div>
        </div>

        <!-- 预估覆盖率 -->
        <div class="estimate-rate" v-if="estimateResult.estimatedRate">
          <span class="rate-label">预估覆盖率：</span>
          <span class="rate-value">{{ estimateResult.estimatedRate }}</span>
        </div>

        <!-- 环比变动 -->
        <div v-if="changeFromLast" class="change-info">
          <div class="change-label">{{ $t("customerSegmentation.estimatePanel.changeFromLast") }}</div>
          <div class="change-value" :class="changeFromLast.count >= 0 ? 'increase' : 'decrease'">
            <el-icon v-if="changeFromLast.count >= 0"><ArrowUp /></el-icon>
            <el-icon v-else><ArrowDown /></el-icon>
            {{ formatNumber(Math.abs(changeFromLast.count)) }}
            <span class="change-unit">{{ $t("customerSegmentation.estimatePanel.people") }}</span>
            <span class="change-rate">({{ changeFromLast.count >= 0 ? "+" : "" }}{{ changeFromLast.rate }})</span>
          </div>
        </div>

        <!-- 预警提示 -->
        <el-alert
          v-if="isHighCoverage"
          :title="
            $t('customerSegmentation.validation.coverageWarning', {
              count: formatNumber(estimateResult.estimatedCount),
              rate: estimateResult.estimatedRate
            })
          "
          type="warning"
          :closable="false"
          show-icon
          class="coverage-warning"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";

const { t } = useI18n();

const props = defineProps<{
  estimateResult: CustomerSegmentation.ResEstimate | null;
  loading: boolean;
  changeFromLast?: { count: number; rate: string } | null;
}>();

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const isHighCoverage = computed(() => {
  if (!props.estimateResult?.estimatedRate) return false;
  const rate = parseFloat(props.estimateResult.estimatedRate.replace("%", ""));
  return rate > 30;
});
</script>

<style scoped lang="scss">
.estimate-panel {
  .estimate-content {
    min-height: 200px;

    .empty-state {
      padding: 40px 0;
    }

    .estimate-result {
      .estimate-total {
        text-align: center;
        padding: 24px 0;
        border-bottom: 1px solid #ebeef5;
        margin-bottom: 16px;

        .total-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .total-value {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
          line-height: 1.2;
        }

        .total-unit {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }

      .estimate-rate {
        text-align: center;
        padding: 12px 0;
        margin-bottom: 16px;

        .rate-label {
          font-size: 14px;
          color: #606266;
        }

        .rate-value {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-left: 8px;
        }
      }

      .change-info {
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 16px;

        .change-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 8px;
        }

        .change-value {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 16px;
          font-weight: 600;

          &.increase {
            color: #67c23a;
          }

          &.decrease {
            color: #f56c6c;
          }

          .change-unit {
            font-size: 14px;
            font-weight: normal;
          }

          .change-rate {
            font-size: 14px;
            font-weight: normal;
            margin-left: 4px;
          }
        }
      }

      .coverage-warning {
        margin-top: 16px;
      }
    }
  }
}
</style>

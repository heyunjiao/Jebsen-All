<template>
  <div class="stats-panel">
    <!-- 异常类型统计卡片 -->
    <div v-for="stat in statItems" :key="stat.key" class="stats-card" :class="`${stat.key}-card`">
      <div class="stats-icon-wrapper" :style="{ backgroundColor: stat.iconBg }">
        <el-icon :size="24" :color="stat.color">
          <component :is="stat.icon" />
        </el-icon>
      </div>
      <div class="stats-content">
        <div class="stats-number" :style="{ color: stat.color }">
          {{ stat.value }}
        </div>
        <div class="stats-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Warning,
  CopyDocument,
  Document,
  CircleCheck,
  Lock,
  TrendCharts,
  Odometer,
  Files,
  Select,
  Connection,
  MagicStick
} from "@element-plus/icons-vue";
import { EXCEPTION_TAXONOMY } from "../utils/exceptionTaxonomy";

interface Stats {
  validity: number;
  uniqueness: number;
  completeness: number;
  consistency: number;
  compliance: number;
  autoMergeRate: string;
  totalProcessed?: number;
  totalVolume?: string;
  successCount?: number;
  manualMergeNeeded?: number;
  autoMergedCount?: number;
}

const props = defineProps<{
  stats: Stats;
}>();

const { t } = useI18n();

// 统计项配置
const statItems = computed(() => {
  const globalStats = [
    {
      key: "totalProcessed",
      label: t("errorCorrection.stats.totalProcessed"),
      value: props.stats.totalProcessed?.toLocaleString(),
      color: "#409EFF",
      icon: Odometer,
      iconBg: "rgba(64, 158, 255, 0.12)"
    },
    {
      key: "totalVolume",
      label: t("errorCorrection.stats.totalVolume"),
      value: props.stats.totalVolume,
      color: "#909399",
      icon: Files,
      iconBg: "rgba(144, 147, 153, 0.12)"
    },
    {
      key: "successCount",
      label: t("errorCorrection.stats.successCount"),
      value: props.stats.successCount?.toLocaleString(),
      color: "#67C23A",
      icon: Select,
      iconBg: "rgba(103, 194, 58, 0.12)"
    },
    {
      key: "manualMergeNeeded",
      label: t("errorCorrection.stats.mergeNeeded"),
      value: props.stats.manualMergeNeeded,
      color: "#E6A23C",
      icon: Connection,
      iconBg: "rgba(230, 162, 60, 0.12)"
    },
    {
      key: "autoMergedCount",
      label: t("errorCorrection.stats.autoMerged"),
      value: props.stats.autoMergedCount?.toLocaleString(),
      color: "#8e44ad",
      icon: MagicStick,
      iconBg: "rgba(142, 68, 173, 0.12)"
    }
  ];

  const categories = [
    {
      key: "validity",
      label: t("errorCorrection.taxonomy.validity.name"),
      value: props.stats.validity,
      color: EXCEPTION_TAXONOMY.validity.color,
      icon: Warning,
      iconBg: "rgba(230, 162, 60, 0.12)"
    },
    {
      key: "uniqueness",
      label: t("errorCorrection.taxonomy.uniqueness.name"),
      value: props.stats.uniqueness,
      color: EXCEPTION_TAXONOMY.uniqueness.color,
      icon: CopyDocument,
      iconBg: "rgba(245, 108, 108, 0.12)"
    },
    {
      key: "completeness",
      label: t("errorCorrection.taxonomy.completeness.name"),
      value: props.stats.completeness,
      color: EXCEPTION_TAXONOMY.completeness.color,
      icon: Document,
      iconBg: "rgba(144, 147, 153, 0.12)"
    },
    {
      key: "autoMerge",
      label: t("errorCorrection.autoMergeSuccessRate"),
      value: props.stats.autoMergeRate,
      color: "#67C23A",
      icon: TrendCharts,
      iconBg: "rgba(103, 194, 58, 0.12)"
    }
  ];

  return [...globalStats, ...categories];
});
</script>

<style scoped lang="scss">
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.stats-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }

  .stats-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .stats-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .stats-number {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .stats-label {
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 1.5;
    word-break: break-word;
  }

  // 各类型卡片颜色配置
  &.validity-card {
    .stats-icon-wrapper {
      background-color: rgba(230, 162, 60, 0.12);
    }
    .stats-number {
      color: #e6a23c;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(230, 162, 60, 0.2);
    }
  }

  &.uniqueness-card {
    .stats-icon-wrapper {
      background-color: rgba(245, 108, 108, 0.12);
    }
    .stats-number {
      color: #f56c6c;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(245, 108, 108, 0.2);
    }
  }

  &.completeness-card {
    .stats-icon-wrapper {
      background-color: rgba(144, 147, 153, 0.12);
    }
    .stats-number {
      color: #909399;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(144, 147, 153, 0.2);
    }
  }

  &.consistency-card {
    .stats-icon-wrapper {
      background-color: rgba(64, 158, 255, 0.12);
    }
    .stats-number {
      color: #409eff;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(64, 158, 255, 0.2);
    }
  }

  &.compliance-card {
    .stats-icon-wrapper {
      background-color: rgba(103, 194, 58, 0.12);
    }
    .stats-number {
      color: #67c23a;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(103, 194, 58, 0.2);
    }
  }

  &.autoMerge-card {
    .stats-icon-wrapper {
      background-color: rgba(103, 194, 58, 0.12);
    }
    .stats-number {
      color: #67c23a;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(103, 194, 58, 0.2);
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .stats-panel {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .stats-card {
    padding: 14px 16px;
    gap: 12px;

    .stats-number {
      font-size: 24px;
    }

    .stats-icon-wrapper {
      width: 44px;
      height: 44px;

      .el-icon {
        font-size: 22px;
      }
    }

    .stats-label {
      font-size: 13px;
    }
  }
}

@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stats-card {
    padding: 12px 14px;
    gap: 12px;

    .stats-number {
      font-size: 22px;
    }

    .stats-icon-wrapper {
      width: 40px;
      height: 40px;

      .el-icon {
        font-size: 20px;
      }
    }

    .stats-label {
      font-size: 12px;
      line-height: 1.4;
    }
  }
}

@media (max-width: 480px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stats-card {
    padding: 10px 12px;
    gap: 10px;

    .stats-number {
      font-size: 20px;
    }

    .stats-icon-wrapper {
      width: 36px;
      height: 36px;

      .el-icon {
        font-size: 18px;
      }
    }

    .stats-label {
      font-size: 11px;
    }
  }
}
</style>

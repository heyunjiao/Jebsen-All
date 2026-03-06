<template>
  <div class="monitor-dashboard-pro">
    <!-- Enhanced Header with Time Range & Actions -->
    <div class="dashboard-header-pro animate__animated animate__fadeInDown">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ t("dashboard.dataMonitor.title") }}</h1>
          <span class="subtitle">{{ t("dashboard.dataMonitor.subtitle") }}</span>
        </div>
        <div class="header-actions">
          <!-- Time Range Selector -->
          <el-select
            v-model="selectedTimeRange"
            :placeholder="t('dashboard.dataMonitor.timeRange')"
            size="default"
            class="time-range-selector"
            @change="handleTimeRangeChange"
          >
            <el-option :label="t('dashboard.dataMonitor.today')" value="today" />
            <el-option :label="t('dashboard.dataMonitor.yesterday')" value="yesterday" />
            <el-option :label="t('dashboard.dataMonitor.last7Days')" value="last7Days" />
            <el-option :label="t('dashboard.dataMonitor.last30Days')" value="last30Days" />
            <el-option :label="t('dashboard.dataMonitor.custom')" value="custom" />
          </el-select>

          <!-- Custom Date Range Picker -->
          <el-date-picker
            v-if="selectedTimeRange === 'custom'"
            v-model="customDateRange"
            type="datetimerange"
            :range-separator="t('dashboard.dataMonitor.to') || '至'"
            :start-placeholder="t('dashboard.dataMonitor.startDate') || '开始日期'"
            :end-placeholder="t('dashboard.dataMonitor.endDate') || '结束日期'"
            size="default"
            class="custom-date-picker"
            @change="handleCustomDateChange"
          />

          <!-- Last Update Time -->
          <div class="last-update-display">
            <el-icon class="update-icon"><Timer /></el-icon>
            <span class="update-label">{{ t("dashboard.dataMonitor.lastUpdate") }}:</span>
            <span class="update-time">{{ lastUpdateTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Integrated Data Statistics -->
    <div class="integrated-stats-row animate__animated animate__fadeInDown">
      <!-- Backend Credit Stats -->
      <div class="credit-card flat-card">
        <div class="credit-icon primary-bg">
          <el-icon><Odometer /></el-icon>
        </div>
        <div class="credit-info">
          <div class="credit-label">{{ t("dashboard.dataMonitor.backendCredit.totalProcessed") }}</div>
          <div class="credit-value">{{ formatNumber(backendCreditData.totalProcessed) }}</div>
        </div>
      </div>
      <div class="credit-card flat-card">
        <div class="credit-icon info-bg">
          <el-icon><Files /></el-icon>
        </div>
        <div class="credit-info">
          <div class="credit-label">{{ t("dashboard.dataMonitor.backendCredit.totalVolume") }}</div>
          <div class="credit-value">{{ backendCreditData.totalVolume }}</div>
        </div>
      </div>
      <div class="credit-card flat-card">
        <div class="credit-icon success-bg">
          <el-icon><Select /></el-icon>
        </div>
        <div class="credit-info">
          <div class="credit-label">{{ t("dashboard.dataMonitor.backendCredit.successCount") }}</div>
          <div class="credit-value">{{ formatNumber(backendCreditData.successCount) }}</div>
        </div>
      </div>
      <div class="credit-card flat-card">
        <div class="credit-icon warning-bg">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="credit-info">
          <div class="credit-label">{{ t("dashboard.dataMonitor.backendCredit.mergeNeeded") }}</div>
          <div class="credit-value">{{ backendCreditData.mergeNeeded }}</div>
        </div>
      </div>
      <div class="credit-card flat-card">
        <div class="credit-icon purple-bg">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="credit-info">
          <div class="credit-label">{{ t("dashboard.dataMonitor.backendCredit.autoMerged") }}</div>
          <div class="credit-value">{{ formatNumber(backendCreditData.autoMerged) }}</div>
        </div>
      </div>
      <!-- Key Metrics Cards -->
      <div
        v-for="(card, index) in metricsCards"
        :key="`metric-${index}`"
        class="stat-card-pro box-card-glass"
        :class="{ 'no-click': !card.onClick }"
        @click="card.onClick && card.onClick()"
      >
        <div class="card-header">
          <span class="card-label">{{ card.label }}</span>
          <el-icon v-if="card.trend" :class="['trend-icon', card.trendType]">
            <component :is="card.trendIcon" />
          </el-icon>
        </div>
        <div class="card-body">
          <div :class="['stat-icon', card.bgClass]">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="value-group">
              <span class="value">
                <span v-if="!isNaN(Number(card.value))">{{ formatNumber(card.value) }}</span>
                <span v-else>{{ card.value }}</span>
                <small v-if="card.suffix">{{ card.suffix }}</small>
              </span>
              <span v-if="card.trend" :class="['trend-badge', card.trendType]">
                <el-icon><component :is="card.trendIcon" /></el-icon>
                {{ card.trendVal }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="card.action" class="card-footer">
          <el-button link :type="card.actionType as any" size="small" @click.stop="card.actionHandler">
            {{ card.actionText || t("common.operation") }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Left Column: Pipeline & Charts -->
      <div class="main-col-left">
        <!-- Enhanced Pipeline Visualization -->
        <div class="pipeline-card-pro box-card-glass">
          <div class="card-header-pro">
            <div class="header-left">
              <el-icon class="header-icon"><Operation /></el-icon>
              <span class="title">{{ t("dashboard.dataMonitor.pipelineTitle") }}</span>
            </div>
            <div class="header-right">
              <el-tag size="small" :type="getPipelineStatusType()" effect="dark">
                {{ pipelineStatusText }}
              </el-tag>
              <span class="meta-info">
                <span class="dot-online"></span>
                {{ t("dashboard.dataMonitor.pipelineStart") }}: {{ pipelineData.startTime }}
              </span>
            </div>
          </div>
          <div class="pipeline-steps-wrapper">
            <el-steps
              :active="pipelineData.currentStep"
              :process-status="pipelineStatus === 'error' ? 'error' : 'process'"
              finish-status="success"
              align-center
              class="pipeline-steps"
              :class="{ 'status-warning': pipelineStatus === 'warning' }"
            >
              <el-step
                v-for="(step, index) in pipelineSteps"
                :key="index"
                :title="step.title"
                :description="step.desc"
                :status="getStepStatusForElSteps(index)"
              >
                <template #icon>
                  <div class="step-icon-custom" :class="getStepStatus(index)">
                    <el-icon><component :is="step.icon" /></el-icon>
                    <div v-if="getStepStatus(index) === 'active'" class="step-pulse"></div>
                  </div>
                </template>
                <template #description>
                  <div class="step-description">
                    <div class="step-desc-text">{{ step.desc }}</div>
                    <div v-if="getStepStatus(index) === 'active'" class="step-processing">
                      {{ t("dashboard.dataMonitor.processing") }}...
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>
        </div>

        <!-- Enhanced Data Quality Chart -->
        <div class="chart-card-pro box-card-glass">
          <div class="card-header-pro">
            <div class="header-left">
              <el-icon class="header-icon"><Histogram /></el-icon>
              <span class="title">{{ t("dashboard.dataMonitor.qualityTitle") }}</span>
            </div>
            <div class="chart-actions-pro">
              <el-radio-group v-model="qualityChartType" size="small" @change="updateQualityChart">
                <el-radio-button value="volume">{{ t("dashboard.dataMonitor.dataVolume") }}</el-radio-button>
                <el-radio-button value="quality">{{ t("dashboard.dataMonitor.cleanRate") }}</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-body-pro">
            <ECharts :option="sourceChartOption" :height="320" />
          </div>
          <div class="chart-footer">
            <div class="quality-stats">
              <div class="stat-item">
                <span class="stat-label">{{ t("dashboard.dataMonitor.intercepted") }}</span>
                <span class="stat-value error">{{ qualityData.errorCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ t("dashboard.dataMonitor.totalRecords") }}</span>
                <span class="stat-value">{{ formatNumber(qualityData.sourceData.reduce((a, b) => a + b, 0)) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ t("dashboard.dataMonitor.cleanRate") }}</span>
                <span class="stat-value">{{ qualityData.rate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Identity & Business -->
      <div class="main-col-right">
        <!-- Enhanced Identity Governance -->
        <div class="identity-governance-card box-card-glass">
          <div class="card-header-pro">
            <div class="header-left">
              <div class="header-icon-wrapper">
                <el-icon class="header-icon"><UserFilled /></el-icon>
              </div>
              <span class="title">{{ t("dashboard.dataMonitor.identityTitle") }}</span>
            </div>
            <el-button link type="primary" size="small" @click="handleViewConflicts">
              {{ t("dashboard.dataMonitor.viewConflicts") }}
            </el-button>
          </div>

          <div class="identity-stats-grid">
            <div class="identity-stat-item">
              <div class="stat-icon-wrapper primary">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info-wrapper">
                <span class="stat-value highlight">{{ formatNumber(identityData.newCustomers) }}</span>
                <span class="stat-label">{{ t("dashboard.dataMonitor.newCustomers") }}</span>
              </div>
            </div>
            <div class="identity-stat-item">
              <div class="stat-icon-wrapper warning">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="stat-info-wrapper">
                <span class="stat-value">{{ formatNumber(identityData.manualMerges) }}</span>
                <span class="stat-label">{{ t("dashboard.dataMonitor.manualMerges") }}</span>
              </div>
            </div>
            <div class="identity-stat-item" @click="handleViewConflicts" style="cursor: pointer">
              <div class="stat-icon-wrapper danger">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info-wrapper">
                <span class="stat-value">{{ formatNumber(identityData.conflictCount) }}</span>
                <span class="stat-label">{{ t("dashboard.dataMonitor.conflictPending") }}</span>
              </div>
            </div>
          </div>

          <div class="governance-records-section">
            <div class="section-header">
              <span class="section-title">{{ t("dashboard.dataMonitor.governanceRecords") }}</span>
              <el-button link type="primary" size="small" @click="loadMoreRecords">
                {{ t("dashboard.dataMonitor.viewMore") }}
              </el-button>
            </div>
            <div class="records-list-enhanced">
              <transition-group tag="div">
                <div v-for="(rec, i) in identityData.records" :key="rec.id || i" class="record-item-enhanced list-fade-item">
                  <div class="record-status-bar" :style="{ background: rec.color }"></div>
                  <div class="record-content">
                    <div class="record-text">{{ rec.content }}</div>
                    <div class="record-footer">
                      <span class="record-time">{{ rec.time }}</span>
                      <el-tag v-if="rec.type" size="small" :type="getRecordTagType(rec.type)" round>
                        {{ rec.type }}
                      </el-tag>
                    </div>
                  </div>
                  <el-icon class="record-arrow"><ArrowRight /></el-icon>
                </div>
              </transition-group>
              <div v-if="identityData.records.length === 0" class="empty-state-enhanced">
                <el-empty :description="t('dashboard.dataMonitor.noData')" :image-size="60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Refresh,
  Filter,
  Connection,
  Timer,
  Warning,
  ArrowRight,
  Download,
  User,
  Cpu,
  BellFilled,
  Histogram,
  UserFilled,
  Check,
  CircleClose,
  Odometer,
  Files,
  MagicStick,
  Select,
  Operation,
  Promotion
} from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { getPipelineStatus, getDataQuality, getIdentityGovernance, getSystemHealth } from "@/api/modules/monitor/dataMonitor";

const { t } = useI18n();
const router = useRouter();

// --- State Management ---
const loading = ref(false);
const selectedTimeRange = ref("today");
const customDateRange = ref<any>(null);
const qualityChartType = ref("volume");
const lastUpdateTime = ref("");
let simulationTimer: NodeJS.Timeout | null = null;

const pipelineStatus = ref<"normal" | "warning" | "error">("normal");
const pipelineData = reactive({
  currentStep: 2,
  startTime: "02:00:00",
  currentProcess: "OneID Alignment",
  remainingTime: "15 min"
});

const qualityData = reactive({
  rate: 92.5,
  errorCount: 1240,
  sourceData: [1200, 932, 2013, 934, 1290, 430, 220],
  qualityData: [95.2, 93.1, 91.8, 94.5, 92.3, 89.7, 90.2]
});

const identityData = reactive({
  newCustomers: 856,
  manualMerges: 45,
  conflictCount: 12,
  records: [
    { id: 1, time: "10:23", color: "#67C23A", content: "Auto-merged: [Zhang San]", type: "merge" },
    { id: 2, time: "09:45", color: "#E6A23C", content: "Conflict: [Li Si] - Family share?", type: "conflict" }
  ]
});

const systemHealth = reactive({
  alerts: []
});

const backendCreditData = reactive({
  totalProcessed: 125890,
  totalVolume: "850 GB",
  successCount: 125600,
  mergeNeeded: 45,
  autoMerged: 8560
});

// --- Computed Properties ---
const pipelineStatusText = computed(() => t("dashboard.dataMonitor.processing"));

const pipelineSteps = computed(() => [
  { title: t("dashboard.dataMonitor.steps.ingestion") || "Ingestion", desc: "100/100", icon: Download },
  { title: t("dashboard.dataMonitor.steps.cleaning") || "Cleaning", desc: "99/100", icon: Filter },
  { title: t("dashboard.dataMonitor.steps.identify") || "Identify", desc: "98/100", icon: User },
  { title: t("dashboard.dataMonitor.steps.tagging") || "Tagging", desc: "97/100", icon: Cpu },
  { title: t("dashboard.dataMonitor.steps.dispatch") || "Dispatch", desc: "96/100", icon: Connection }
]);

const metricsCards = computed(() => [
  {
    label: t("dashboard.dataMonitor.cleanRate"),
    value: qualityData.rate,
    suffix: "%",
    icon: Filter,
    bgClass: "primary-bg",
    trend: qualityData.errorCount > 0,
    trendType: "down",
    trendIcon: Warning,
    trendVal: qualityData.errorCount,
    description: t("dashboard.dataMonitor.qualityDescription") || "Data quality monitoring",
    action: false
  },
  {
    label: t("dashboard.dataMonitor.conflictPending"),
    value: identityData.conflictCount,
    icon: Connection,
    bgClass: "warning-bg",
    trend: false,
    description: t("dashboard.dataMonitor.conflictDescription") || "Identity conflicts pending resolution",
    action: identityData.conflictCount > 0,
    actionType: "warning",
    actionText: t("dashboard.dataMonitor.viewConflicts"),
    actionHandler: handleViewConflicts,
    onClick: handleViewConflicts
  }
]);

// --- Chart Options ---
const sourceChartOption = computed<ECOption>(() => {
  const isVolume = qualityChartType.value === "volume";
  const chartData = isVolume ? qualityData.sourceData : qualityData.qualityData;

  // 确保数据存在且有效
  if (!chartData || chartData.length === 0) {
    return {
      title: {
        text: t("dashboard.dataMonitor.noData"),
        left: "center",
        top: "middle",
        textStyle: {
          color: "#909399",
          fontSize: 14
        }
      }
    };
  }

  // 计算数据比例
  const systemNames = ["DMS", "BDC", "WeCom", "App", "MiniP", "Evt", "3rd"];
  let xAxisData: string[] = [];

  if (isVolume) {
    // 数据量模式：计算每个系统数据量占总数据量的百分比
    const total = chartData.reduce((sum: number, val: number) => sum + val, 0);
    xAxisData = chartData.map((val: number, index: number) => {
      const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
      return `${percentage}%`;
    });
  } else {
    // 完成率模式：直接使用完成率作为比例
    xAxisData = chartData.map((val: number) => {
      return `${val.toFixed(1)}%`;
    });
  }

  return {
    grid: { top: 50, right: 30, bottom: 40, left: 60, containLabel: false },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "rgba(0,0,0,0.1)",
      borderWidth: 1,
      shadowColor: "rgba(0,0,0,0.1)",
      shadowBlur: 10,
      textStyle: { color: "#333", fontSize: 12 },
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: "rgba(150,150,150,0.1)"
        }
      },
      formatter: (params: any) => {
        if (Array.isArray(params)) {
          const param = params[0];
          const value = param.value;
          const dataIndex = param.dataIndex;
          const systemName = systemNames[dataIndex] || "";
          return `${systemName}<br/>${isVolume ? t("dashboard.dataMonitor.dataVolume") : t("dashboard.dataMonitor.cleanRate")}: ${isVolume ? formatNumber(value) : value + "%"}`;
        }
        return "";
      }
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLine: {
        show: true,
        lineStyle: { color: "#E4E7ED" }
      },
      axisTick: { show: false },
      axisLabel: {
        color: "#909399",
        fontSize: 11,
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: "value",
      name: isVolume ? t("dashboard.dataMonitor.dataVolume") : "%",
      nameTextStyle: {
        color: "#909399",
        fontSize: 11,
        padding: [0, 0, 0, 10]
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#E4E7ED"
        }
      },
      axisLabel: {
        color: "#909399",
        fontSize: 11,
        formatter: (value: number) => {
          return isVolume ? formatNumber(value) : value + "%";
        }
      }
    },
    series: [
      {
        name: isVolume ? t("dashboard.dataMonitor.dataVolume") : t("dashboard.dataMonitor.cleanRate"),
        type: "bar",
        data: chartData,
        barWidth: "50%",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.08)",
          borderRadius: [8, 8, 0, 0]
        },
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: isVolume ? "#409EFF" : "#67C23A" },
              { offset: 1, color: isVolume ? "#a0cfff" : "#b3e19d" }
            ]
          }
        },
        label: {
          show: true,
          position: "top",
          color: "#606266",
          fontSize: 11,
          formatter: (params: any) => {
            const value = params.value;
            return isVolume ? formatNumber(value) : value + "%";
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  };
});

// --- Methods ---
const formatNumber = (num: number | string): string => {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
};

const getStepStatus = (index: number) => {
  if (index < pipelineData.currentStep) return "completed";
  if (index === pipelineData.currentStep) return "active";
  return "pending";
};

const getStepStatusForElSteps = (index: number): "wait" | "process" | "finish" | "error" | "success" => {
  if (index < pipelineData.currentStep) return "finish";
  if (index === pipelineData.currentStep) {
    if (pipelineStatus.value === "error") return "error";
    return "process";
  }
  return "wait";
};

const getPipelineStatusType = (): "success" | "warning" | "danger" => {
  return pipelineStatus.value === "normal" ? "success" : pipelineStatus.value === "warning" ? "warning" : "danger";
};

const getRecordTagType = (type: string): "success" | "warning" | "danger" | "info" => {
  const typeMap: Record<string, "success" | "warning" | "danger" | "info"> = {
    merge: "success",
    conflict: "warning",
    error: "danger"
  };
  return typeMap[type] || "info";
};

const getLogIcon = (status: string) => {
  return status === "Success" ? Check : CircleClose;
};

const getLogIconClass = (status: string) => {
  return status === "Success" ? "success" : "error";
};

const updateLastUpdateTime = () => {
  const now = new Date();
  lastUpdateTime.value = now.toLocaleTimeString();
};

const handleRefresh = async () => {
  loading.value = true;
  try {
    await loadAllData();
    updateLastUpdateTime();
    ElMessage.success(t("dashboard.dataMonitor.refreshSuccess"));
  } catch (error: any) {
    ElMessage.error(error?.message || t("dashboard.dataMonitor.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const handleTimeRangeChange = (value: string) => {
  // Handle time range change logic
  loadAllData();
};

const handleCustomDateChange = (dates: any) => {
  if (dates && Array.isArray(dates) && dates.length === 2) {
    // Handle custom date range logic
    loadAllData();
  }
};

const handleExport = async () => {
  try {
    ElMessage.info(t("dashboard.dataMonitor.export") + " " + t("dashboard.dataMonitor.loading"));
    // Implement export logic
    setTimeout(() => {
      ElMessage.success(t("dashboard.dataMonitor.exportSuccess"));
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error?.message || t("dashboard.dataMonitor.error"));
  }
};

const exportQualityData = () => {
  handleExport();
};

const handleViewConflicts = () => {
  // 跳转到纠错处理管理（处理冲突）
  router.push("/errorCorrection");
};

const handleViewQualityDetails = () => {
  // 跳转到系统监控-数据监控
  router.push("/monitor/druid");
};

const handleRecordClick = (record: any) => {
  // 记录项点击不跳转，只有"待处理冲突"可以点击跳转
  // 如果需要查看详情，可以通过其他方式
};

const loadMoreRecords = () => {
  // 查看更多记录跳转到审计日志
  router.push("/dataProcess/audit");
};

const updateQualityChart = () => {
  // Chart will update automatically via computed property
};

const loadAllData = async () => {
  try {
    await Promise.all([
      getPipelineStatus()
        .then(res => {
          if (res.data) {
            const data = res.data as any;
            if (data.status) {
              pipelineStatus.value = data.status;
            }
            if (data.currentStep !== undefined) {
              Object.assign(pipelineData, data);
            }
          }
        })
        .catch(() => {}),
      getDataQuality()
        .then(res => res.data && Object.assign(qualityData, res.data))
        .catch(() => {}),
      getIdentityGovernance()
        .then(res => res.data && Object.assign(identityData, res.data))
        .catch(() => {}),
      getSystemHealth()
        .then(res => res.data && Object.assign(systemHealth, res.data))
        .catch(() => {})
    ]);
  } catch (e) {
    console.error("Load data error:", e);
  }
};

// --- Lifecycle ---
onMounted(() => {
  loadAllData();
  updateLastUpdateTime();

  // Simulated live data updates
  simulationTimer = setInterval(() => {
    qualityData.sourceData = qualityData.sourceData.map(v => Math.max(0, v + Math.floor(Math.random() * 20 - 5)));
  }, 5000);
});

onBeforeUnmount(() => {
  if (simulationTimer) clearInterval(simulationTimer);
});
</script>

<style scoped lang="scss">
// Enhanced Variables
$primary: #409eff;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$info: #909399;
$text-main: #303133;
$text-sub: #606266;
$bg-color: #f2f3f5;
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: 1px solid rgba(255, 255, 255, 0.8);
$glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);

.monitor-dashboard-pro {
  padding: 20px 24px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  min-height: 100vh;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: $text-main;
  margin: 0 auto;

  // Glass Card Mixin
  .box-card-glass {
    background: $glass-bg;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: $glass-border;
    box-shadow: $glass-shadow;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px 0 rgba(31, 38, 135, 0.15);
      border-color: rgba(255, 255, 255, 0.9);
    }
  }

  // Enhanced Header
  .dashboard-header-pro {
    margin-bottom: 20px;
    background: $glass-bg;
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 20px 24px;
    border: $glass-border;
    box-shadow: $glass-shadow;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-section {
        h1 {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 14px;
          color: $text-sub;
          font-weight: 500;
          margin-top: 6px;
          display: block;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;

        .time-range-selector {
          width: 140px;
        }

        .custom-date-picker {
          width: 360px;
        }

        .last-update-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
          border-radius: 8px;
          border: 1px solid rgba(64, 158, 255, 0.2);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
          transition: all 0.3s;

          &:hover {
            background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.08) 100%);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
          }

          .update-icon {
            font-size: 16px;
            color: $primary;
          }

          .update-label {
            font-size: 13px;
            color: $text-sub;
            font-weight: 500;
          }

          .update-time {
            font-size: 14px;
            color: $primary;
            font-weight: 700;
            font-family: "SF Mono", "Monaco", "Consolas", monospace;
            letter-spacing: 0.5px;
          }
        }
      }
    }
  }

  // Integrated Data Statistics
  .integrated-stats-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card-pro {
      padding: 16px 20px;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &:not(.no-click) {
        cursor: pointer;
      }

      &.no-click {
        cursor: default;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-label {
          font-size: 12px;
          color: $text-sub;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1.4;
        }

        .trend-icon {
          font-size: 16px;
          &.down {
            color: $danger;
          }
          &.up {
            color: $success;
          }
        }
      }

      .card-body {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 1;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;

          &.primary-bg {
            background: linear-gradient(135deg, #ecf5ff, #c6e2ff);
            color: $primary;
          }
          &.warning-bg {
            background: linear-gradient(135deg, #fdf6ec, #faecd8);
            color: $warning;
          }
          &.info-bg {
            background: linear-gradient(135deg, #f4f4f5, #e9e9eb);
            color: $info;
          }
          &.success-bg {
            background: linear-gradient(135deg, #f0f9eb, #d1edc4);
            color: $success;
          }
        }

        .stat-info {
          flex: 1;
          min-width: 0;

          .value-group {
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 6px;
            flex-wrap: wrap;

            .value {
              font-size: 24px;
              font-weight: 800;
              color: $text-main;
              letter-spacing: -0.5px;
              line-height: 1.2;
              white-space: nowrap;

              small {
                font-size: 16px;
                color: $text-sub;
                font-weight: 600;
                margin-left: 2px;
              }
            }

            .trend-badge {
              font-size: 11px;
              display: inline-flex;
              align-items: center;
              gap: 3px;
              padding: 3px 8px;
              border-radius: 10px;
              font-weight: 600;
              white-space: nowrap;

              &.down {
                color: $danger;
                background: rgba($danger, 0.1);
              }
              &.up {
                color: $success;
                background: rgba($success, 0.1);
              }
            }
          }

          .sub-label {
            font-size: 11px;
            color: $info;
            font-weight: 500;
            margin-bottom: 2px;
            line-height: 1.4;
          }

          .description {
            font-size: 10px;
            color: $text-sub;
            opacity: 0.7;
            line-height: 1.4;
            display: none; // 隐藏描述以节省空间
          }
        }
      }

      .card-footer {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
    }
  }

  // Main Grid
  .main-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 20px;
    align-items: stretch;

    .main-col-left,
    .main-col-right {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 0;
      align-items: stretch;
    }

    // Enhanced Card Header
    .card-header-pro {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .header-icon {
          font-size: 18px;
          color: $primary;
        }

        .title {
          font-size: 16px;
          font-weight: 700;
          color: $text-main;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .meta-info {
          font-size: 12px;
          color: $text-sub;
          display: flex;
          align-items: center;
          gap: 6px;

          .dot-online {
            width: 6px;
            height: 6px;
            background: $success;
            border-radius: 50%;
            animation: pulse-green 2s infinite;
          }
        }
      }
    }

    // Enhanced Pipeline - 使用 Element Plus Steps 组件
    .pipeline-card-pro {
      padding: 20px 24px;
      margin-bottom: 20px;

      .pipeline-steps-wrapper {
        padding: 16px 0 24px;

        .pipeline-steps {
          // 警告状态样式
          &.status-warning {
            :deep(.el-step__head.is-process) {
              border-color: $warning;
              color: $warning;
            }
            :deep(.el-step__title.is-process) {
              color: $warning;
            }
          }

          // 单独设置 main 区域的上边距，放在最外层
          :deep(.el-step__main) {
            margin-top: 20px !important;
            padding-top: 0 !important;
          }

          // 自定义步骤条样式
          :deep(.el-steps) {
            .el-step {
              .el-step__head {
                margin-right: 16px !important;

                .el-step__icon {
                  width: 36px !important;
                  height: 36px !important;
                  min-width: 36px !important;
                  min-height: 36px !important;
                  border-width: 2px;
                  font-size: 16px;
                  border-radius: 50% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;

                  &.is-process {
                    border-color: $primary;
                    color: $primary;
                  }

                  &.is-finish {
                    border-color: $success;
                    background-color: $success;
                    color: #fff;
                  }

                  &.is-wait {
                    border-color: #e4e7ed;
                    background-color: #fff;
                    color: #cbd5e0;
                  }
                }
              }
            }

            .el-step__title {
              font-size: 14px;
              font-weight: 700;
              color: $text-main;
              line-height: 1.5;

              &.is-process {
                color: $primary;
                font-weight: 800;
              }

              &.is-finish {
                color: $text-main;
              }

              &.is-wait {
                color: #a0aec0;
              }
            }

            .el-step__description {
              font-size: 12px;
              color: $text-sub;
              margin-top: 6px;
              line-height: 1.6;

              &.is-process {
                color: $text-sub;
              }

              &.is-finish {
                color: $text-sub;
              }

              &.is-wait {
                color: #cbd5e0;
              }
            }

            .el-step__line {
              top: 18px;
              height: 2px;

              &.el-step__line--inner {
                background: linear-gradient(90deg, $success 0%, $primary 100%);
                border-radius: 2px;
              }
            }
          }

          // 自定义图标容器
          .step-icon-custom {
            position: relative;
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            min-height: 36px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50% !important;
            transition: all 0.3s ease;
            flex-shrink: 0;

            &.active {
              .step-pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid $primary;
                opacity: 0.6;
                animation: step-pulse 2s ease-out infinite;
              }
            }

            &.completed {
              background: $success;
              color: #fff;
            }

            &.active {
              background: $primary;
              color: #fff;
              box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
            }

            &.pending {
              background: #fff;
              color: #cbd5e0;
            }
          }

          // 步骤描述区域
          .step-description {
            .step-desc-text {
              font-size: 11px;
              color: inherit;
              margin-bottom: 4px;
            }

            .step-processing {
              font-size: 10px;
              color: $primary;
              font-weight: 600;
              animation: pulse-text 1.5s ease-in-out infinite;
              margin-top: 2px;
            }
          }
        }
      }

      .pipeline-footer {
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        margin-top: 8px;

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: $text-sub;
          gap: 16px;
        }
      }
    }

    // Enhanced Chart Card
    .chart-card-pro {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;

      .chart-actions-pro {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }

      .chart-body-pro {
        flex: 1;
        width: 100%;
        min-height: 300px;
        position: relative;
        display: flex;
        align-items: stretch;

        // 确保 ECharts 容器有正确的尺寸
        :deep(#echarts) {
          width: 100% !important;
          height: 100% !important;
        }
      }

      .chart-footer {
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        margin-top: 16px;
        flex-shrink: 0;

        .quality-stats {
          display: flex;
          justify-content: space-around;
          gap: 16px;

          .stat-item {
            text-align: center;
            flex: 1;
            min-width: 0;

            .stat-label {
              display: block;
              font-size: 11px;
              color: $text-sub;
              margin-bottom: 6px;
            }
            .stat-value {
              display: block;
              font-size: 20px;
              font-weight: 700;
              color: $text-main;

              &.error {
                color: $danger;
              }
            }
          }
        }
      }
    }

    // Enhanced Action Cards
    .action-card-pro {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    // Enhanced Identity Governance Card
    .identity-governance-card {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;

      .card-header-pro {
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;

          .header-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
            display: flex;
            align-items: center;
            justify-content: center;

            .header-icon {
              font-size: 20px;
              color: $success;
            }
          }

          .title {
            font-size: 16px;
            font-weight: 700;
            color: $text-main;
          }
        }
      }

      .identity-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;

        .identity-stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.95);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .stat-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;

            &.primary {
              background: linear-gradient(135deg, #ecf5ff, #c6e2ff);
              color: $primary;
            }
            &.warning {
              background: linear-gradient(135deg, #fdf6ec, #faecd8);
              color: $warning;
            }
            &.danger {
              background: linear-gradient(135deg, #fef0f0, #fde2e2);
              color: $danger;
            }
          }

          .stat-info-wrapper {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-value {
              font-size: 20px;
              font-weight: 800;
              color: $text-main;
              line-height: 1.2;
              white-space: nowrap;

              &.highlight {
                color: $primary;
              }
            }

            .stat-label {
              font-size: 11px;
              font-weight: 600;
              color: $text-sub;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              line-height: 1.3;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .governance-records-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        margin-top: 4px;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-shrink: 0;

          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: $text-main;
          }
        }

        .records-list-enhanced {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 4px;

          &::-webkit-scrollbar {
            width: 4px;
          }
          &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.03);
            border-radius: 2px;
          }
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 2px;

            &:hover {
              background: rgba(0, 0, 0, 0.25);
            }
          }
        }

        .record-item-enhanced {
          display: flex;
          align-items: stretch;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          cursor: default;

          &:hover {
            background: rgba(255, 255, 255, 0.95);
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            border-color: rgba(103, 194, 58, 0.2);
          }

          .record-status-bar {
            width: 3px;
            flex-shrink: 0;
            transition: all 0.3s;
          }

          .record-content {
            flex: 1;
            padding: 12px 14px;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;

            .record-text {
              font-size: 13px;
              font-weight: 500;
              color: $text-main;
              line-height: 1.5;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .record-footer {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;

              .record-time {
                font-size: 11px;
                color: $info;
                font-family: "SF Mono", "Monaco", "Consolas", monospace;
                white-space: nowrap;
              }
            }
          }

          .record-arrow {
            color: $text-sub;
            font-size: 16px;
            margin: 0 12px;
            flex-shrink: 0;
            align-self: center;
            transition: all 0.3s;
          }

          &:hover .record-arrow {
            color: $primary;
            transform: translateX(4px);
          }
        }

        .empty-state-enhanced {
          padding: 60px 20px;
          text-align: center;
        }
      }
    }
  }

  // Enhanced Alerts
  .alerts-container-pro {
    position: fixed;
    bottom: 30px;
    right: 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    z-index: 999;
    max-width: 400px;
  }

  .alert-toast-pro {
    background: white;
    padding: 16px 20px;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: flex-start;
    gap: 14px;
    pointer-events: auto;
    border-left: 4px solid;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateX(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
    }

    &.warning {
      border-left-color: $warning;
    }
    &.error {
      border-left-color: $danger;
    }
    &.info {
      border-left-color: $info;
    }

    .icon-box-pro {
      font-size: 20px;
      margin-top: 2px;
    }

    .alert-content {
      flex: 1;
      min-width: 0;

      .alert-title {
        font-size: 14px;
        font-weight: 700;
        color: $text-main;
        margin-bottom: 4px;
      }
      .alert-message {
        font-size: 12px;
        color: $text-sub;
        line-height: 1.5;
      }
    }
  }

  // Integrated Stats Row - Unified Style
  .integrated-stats-row {
    .credit-card {
      background: $glass-bg;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      border: $glass-border;
      box-shadow: $glass-shadow;
      padding: 16px 20px;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      min-height: 110px;
      display: flex;
      align-items: center;
      gap: 16px;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 48px 0 rgba(31, 38, 135, 0.15);
        border-color: rgba(255, 255, 255, 0.9);
      }

      .credit-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

        &.primary-bg {
          background: linear-gradient(135deg, #ecf5ff, #c6e2ff);
          color: $primary;
        }
        &.info-bg {
          background: linear-gradient(135deg, #f4f4f5, #e9e9eb);
          color: $info;
        }
        &.success-bg {
          background: linear-gradient(135deg, #f0f9eb, #d1edc4);
          color: $success;
        }
        &.warning-bg {
          background: linear-gradient(135deg, #fdf6ec, #faecd8);
          color: $warning;
        }
        &.purple-bg {
          background: linear-gradient(135deg, #f8effc, #e5d4f5);
          color: #8e44ad;
        }
      }

      .credit-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .credit-label {
          font-size: 12px;
          color: $text-sub;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .credit-value {
          font-size: 24px;
          font-weight: 800;
          color: $text-main;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
      }
    }
  }
}

// Enhanced Animations
@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba($success, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba($success, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($success, 0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes pulse-text {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes step-pulse {
  0% {
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }
  100% {
    width: 150%;
    height: 150%;
    opacity: 0;
  }
}

@keyframes progress-glow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes progress-flow {
  0% {
    box-shadow: 0 0 12px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 12px rgba(64, 158, 255, 0.4);
  }
}

@keyframes ripple-ring {
  0% {
    width: 72px;
    height: 72px;
    opacity: 0.4;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

@keyframes check-pop {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes progress-ring-rotate {
  0% {
    stroke-dashoffset: 283;
  }
  50% {
    stroke-dashoffset: 141;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes progress-line {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@keyframes progress-ring {
  0% {
    stroke-dashoffset: 157;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -157;
  }
}

// List Transitions
.list-fade-item {
  transition: all 0.4s ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.list-fade-leave-active {
  position: absolute;
  width: 100%;
}

// Toast Transitions
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// Responsive Design
@media (max-width: 1600px) {
  .monitor-dashboard-pro {
    padding: 16px 20px;

    .integrated-stats-row {
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .main-grid {
      gap: 12px;

      .main-col-left,
      .main-col-right {
        gap: 12px;
      }
    }
  }
}

@media (max-width: 1280px) {
  .monitor-dashboard-pro {
    padding: 16px;

    .dashboard-header-pro {
      padding: 16px 20px;
      margin-bottom: 16px;

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        .header-actions {
          width: 100%;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }

    .integrated-stats-row {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .main-grid {
      grid-template-columns: 1fr;
      gap: 12px;

      .main-col-left,
      .main-col-right {
        gap: 12px;
      }
    }

    // 卡片内边距调整
    .pipeline-card-pro,
    .chart-card-pro,
    .action-card-pro {
      padding: 16px 20px;
    }
  }
}

@media (max-width: 768px) {
  .monitor-dashboard-pro {
    padding: 12px;

    .dashboard-header-pro {
      padding: 16px;
      border-radius: 12px;

      .header-content {
        .title-section h1 {
          font-size: 24px;
        }

        .header-actions {
          .time-range-selector,
          .custom-date-picker {
            width: 100%;
          }

          .action-btn,
          .glass-btn {
            width: 36px;
            height: 36px;
          }
        }
      }
    }

    .integrated-stats-row {
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-card-pro {
      padding: 16px;
      min-height: 120px;
    }

    .main-grid {
      gap: 12px;
    }

    .pipeline-card-pro,
    .chart-card-pro,
    .action-card-pro {
      padding: 16px;
      border-radius: 12px;
    }
  }
}
</style>

<template>
  <div class="dashboard-overview">
    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :range-separator="t('leadManagement.overview.to')"
            :start-placeholder="t('leadManagement.overview.startDate')"
            :end-placeholder="t('leadManagement.overview.endDate')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            clearable
          />
          <el-select
            v-model="filters.leadType"
            :placeholder="t('leadManagement.overview.selectLeadType')"
            clearable
            style="width: 180px"
            @change="handleFilterChange"
          >
            <el-option v-for="option in LEAD_TYPE_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <el-select
            v-model="filters.status"
            :placeholder="t('leadManagement.overview.selectStatus')"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option v-for="option in LEAD_STATUS_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <el-select
            v-model="filters.pushTarget"
            :placeholder="t('leadManagement.overview.selectPushTarget')"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option v-for="option in PUSH_TARGET_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :icon="Refresh" @click="handleRefresh" :loading="loading">
            {{ t("leadManagement.overview.refresh") }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据概览 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="section-title">{{ t("leadManagement.overview.title") }}</div>
      </template>
      <!-- 提示信息：标注哪些数据不随搜索条件过滤 -->
      <el-alert :title="t('leadManagement.overview.filterNote')" type="info" :closable="false" show-icon class="filter-note" />
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="stat in statsList" :key="stat.key">
          <el-card shadow="hover" class="stat-card" style="height: 100%">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon :size="24">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value">{{ stat.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 商机类型分布 - 饼图 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t("leadManagement.overview.typeDistribution") }}</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts
              v-if="typeChartOption && stats.byType && stats.byType.length > 0 && chartReady"
              :option="typeChartOption"
              :height="300"
            />
            <el-empty
              v-else-if="!loading && (!stats.byType || stats.byType.length === 0)"
              :description="t('leadManagement.overview.noData')"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 商机状态分布 - 饼图 -->

      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t("leadManagement.overview.statusDistribution") }}</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts
              v-if="statusChartOption && stats.byStatus && stats.byStatus.length > 0 && chartReady"
              :option="statusChartOption"
              :height="300"
            />
            <el-empty v-else-if="!loading && (!stats.byStatus || stats.byStatus.length === 0)" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 商机类型趋势 - 柱状图 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t("leadManagement.overview.typeTrend") }}</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts
              v-if="typeTrendOption && stats.byType && stats.byType.length > 0 && chartReady"
              :option="typeTrendOption"
              :height="300"
            />
            <el-empty
              v-else-if="!loading && (!stats.byType || stats.byType.length === 0)"
              :description="t('leadManagement.overview.noData')"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 商机状态趋势 - 柱状图 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t("leadManagement.overview.statusTrend") }}</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts
              v-if="statusTrendOption && stats.byStatus && stats.byStatus.length > 0 && chartReady"
              :option="statusTrendOption"
              :height="300"
            />
            <el-empty v-else-if="!loading && (!stats.byStatus || stats.byStatus.length === 0)" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, computed, nextTick, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { DataAnalysis, Document, Clock, CircleCheck, Refresh, TrendCharts } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { getDashboardStats } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { LEAD_STATUS_OPTIONS, LEAD_TYPE_OPTIONS, PUSH_TARGET_OPTIONS } from "../interface";

const { t } = useI18n();

const emit = defineEmits<{
  refresh: [];
  navigate: [tab: string, filters?: Record<string, any>];
}>();

const loading = ref(false);
const dateRange = ref<string[] | undefined>(undefined);
const chartReady = ref(false);

// 搜索条件（仅用于展示，实际API只支持日期范围）
const filters = reactive<{
  leadType?: string;
  status?: Lead.LeadStatus;
  pushTarget?: Lead.PushTarget;
}>({
  leadType: undefined,
  status: undefined,
  pushTarget: undefined
});

const stats = ref<Lead.DashboardStats>({
  todayTotal: 0,
  todayPushed: 0,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 0,
  successRate: 0,
  byType: [],
  byStatus: []
});

// 统计卡片列表
const statsList = computed(() => {
  return [
    {
      key: "todayTotal",
      label: t("leadManagement.overview.todayTotal"),
      value: stats.value.todayTotal,
      icon: DataAnalysis,
      color: "#409eff"
    },
    {
      key: "todayPushed",
      label: t("leadManagement.overview.todayPushed"),
      value: stats.value.todayPushed,
      icon: Document,
      color: "#67c23a"
    },
    {
      key: "pendingCount",
      label: t("leadManagement.overview.pendingCount"),
      value: stats.value.pendingCount,
      icon: Clock,
      color: "#e6a23c"
    },
    {
      key: "processingCount",
      label: t("leadManagement.overview.processingCount"),
      value: stats.value.processingCount,
      icon: TrendCharts,
      color: "#409eff"
    },
    {
      key: "completedCount",
      label: t("leadManagement.overview.completedCount"),
      value: stats.value.completedCount,
      icon: CircleCheck,
      color: "#67c23a"
    },
    {
      key: "successRate",
      label: t("leadManagement.overview.successRate"),
      value: `${stats.value.successRate.toFixed(1)}%`,
      icon: CircleCheck,
      color: "#67c23a"
    }
  ];
});

// 商机类型饼图配置
const typeChartOption = computed<ECOption | null>(() => {
  if (!stats.value.byType || stats.value.byType.length === 0) return null;

  const colors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399", "#606266"];

  return {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: {
        color: "#606266"
      }
    },
    series: [
      {
        name: "商机类型",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold"
          }
        },
        data: stats.value.byType.map((item, index) => ({
          value: item.count,
          name: getTypeLabel(item.type),
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  };
});

// 商机状态饼图配置
const statusChartOption = computed<ECOption | null>(() => {
  if (!stats.value.byStatus || stats.value.byStatus.length === 0) return null;

  const statusColors: Record<Lead.LeadStatus, string> = {
    pending: "#909399",
    pushed: "#e6a23c",
    processing: "#409eff",
    completed: "#67c23a",
    rejected: "#f56c6c",
    failed: "#f56c6c"
  };

  return {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: {
        color: "#606266"
      }
    },
    series: [
      {
        name: "商机状态",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold"
          }
        },
        data: stats.value.byStatus.map(item => ({
          value: item.count,
          name: getStatusLabel(item.status),
          itemStyle: {
            color: statusColors[item.status] || "#909399"
          }
        }))
      }
    ]
  };
});

// 商机类型趋势柱状图
const typeTrendOption = computed<ECOption | null>(() => {
  if (!stats.value.byType || stats.value.byType.length === 0) return null;

  const colors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399", "#606266"];

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: stats.value.byType.map(item => getTypeLabel(item.type)),
      axisLabel: {
        color: "#606266",
        rotate: 0
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#606266"
      }
    },
    series: [
      {
        name: "数量",
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          color: (params: any) => colors[params.dataIndex % colors.length],
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: "top",
          color: "#606266"
        },
        data: stats.value.byType.map(item => item.count)
      }
    ]
  };
});

// 商机状态趋势柱状图
const statusTrendOption = computed<ECOption | null>(() => {
  if (!stats.value.byStatus || stats.value.byStatus.length === 0) return null;

  const statusColors: Record<Lead.LeadStatus, string> = {
    pending: "#909399",
    pushed: "#e6a23c",
    processing: "#409eff",
    completed: "#67c23a",
    rejected: "#f56c6c",
    failed: "#f56c6c"
  };

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: stats.value.byStatus.map(item => getStatusLabel(item.status)),
      axisLabel: {
        color: "#606266",
        rotate: 0
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#606266"
      }
    },
    series: [
      {
        name: "数量",
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          color: (params: any) => {
            const status = stats.value.byStatus[params.dataIndex]?.status;
            return status ? statusColors[status] : "#909399";
          },
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: "top",
          color: "#606266"
        },
        data: stats.value.byStatus.map(item => item.count)
      }
    ]
  };
});

// 获取类型标签
const getTypeLabel = (type: string) => {
  // 优先通过 i18n 获取翻译（支持多语言）
  const i18nKey = `leadManagement.enums.leadType.${type}`;
  const i18nLabel = t(i18nKey);
  if (i18nLabel !== i18nKey) {
    return i18nLabel;
  }

  // 如果 i18n 中没有，尝试从 LEAD_TYPE_OPTIONS 中查找
  const option = LEAD_TYPE_OPTIONS.find(opt => opt.value === type);
  if (option) return option.label;

  // 历史类型映射（已移除但看板需要显示的类型）
  const historicalTypeMap: Record<string, string> = {
    diamond: "钻石客户",
    gold: "黄金客户",
    silver: "白银客户",
    bdc_aftersales_churn_15m: "BDC售后流失-15个月",
    segment_template_validation: "客群模板核验"
  };

  // 如果找不到，尝试从历史类型映射中查找
  if (historicalTypeMap[type]) {
    return historicalTypeMap[type];
  }

  // 如果都找不到，直接返回原值
  return type;
};

// 获取状态标签
const getStatusLabel = (status: Lead.LeadStatus) => {
  const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.label || status;
};

// 加载统计数据
const loadStats = async () => {
  loading.value = true;
  chartReady.value = false;
  try {
    const params =
      dateRange.value && dateRange.value.length === 2
        ? {
            startDate: dateRange.value[0],
            endDate: dateRange.value[1]
          }
        : undefined;
    const res = await getDashboardStats(params);
    if (String(res.code) === "200") {
      // 确保数据完整赋值，防止数据缺失
      if (res.data) {
        stats.value = {
          todayTotal: res.data.todayTotal ?? 0,
          todayPushed: res.data.todayPushed ?? 0,
          pendingCount: res.data.pendingCount ?? 0,
          processingCount: res.data.processingCount ?? 0,
          completedCount: res.data.completedCount ?? 0,
          successRate: res.data.successRate ?? 0,
          byType: res.data.byType ?? [],
          byStatus: res.data.byStatus ?? []
        };
      }
      // 等待 DOM 更新后再渲染图表
      await nextTick();
      // 延迟一下确保容器已渲染，增加延迟时间确保 tab 切换完成
      setTimeout(() => {
        chartReady.value = true;
      }, 200);
    } else {
      ElMessage.error(res.msg || t("leadManagement.overview.loadFailed"));
    }
  } catch (error: any) {
    console.error("加载统计数据失败:", error);
    ElMessage.error(error.message || t("leadManagement.overview.loadFailed"));
  } finally {
    loading.value = false;
  }
};

// 日期变化处理
const handleDateChange = () => {
  loadStats();
};

// 筛选条件变化处理（仅用于展示，实际不影响API调用）
const handleFilterChange = () => {
  // 注意：这些筛选条件仅用于展示，实际统计数据只按日期范围筛选
  // 如果需要按这些条件筛选，需要修改后端API支持
};

// 刷新处理
const handleRefresh = () => {
  loadStats();
  emit("refresh");
};

// 初始化数据
const initData = async () => {
  // 如果数据为空，则加载数据
  if (stats.value.byType.length === 0 && stats.value.byStatus.length === 0) {
    await loadStats();
  } else {
    // 如果已有数据，只需要重新渲染图表
    chartReady.value = false;
    await nextTick();
    setTimeout(() => {
      chartReady.value = true;
    }, 150);
  }
};

onMounted(() => {
  initData();
});

// 当组件被激活时（tab 切换时）重新初始化图表
onActivated(() => {
  initData();
});
</script>

<style scoped lang="scss">
.dashboard-overview {
  .toolbar-card {
    margin-bottom: 20px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .toolbar-right {
        display: flex;
        gap: 12px;
      }
    }
  }

  .section-card {
    margin-bottom: 20px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .filter-note {
      margin-bottom: 20px;
    }
  }

  .stats-row {
    margin-bottom: -20px; // 负 margin 抵消最后一行的 margin-bottom

    :deep(.el-col) {
      margin-bottom: 20px;
    }

    .stat-card {
      transition: all 0.3s;
      cursor: pointer;
      height: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          min-width: 0;

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--el-text-color-primary);
            line-height: 1.2;
            margin-bottom: 4px;
          }
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-card {
      .card-header {
        font-weight: 600;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      .chart-container {
        min-height: 300px;
        padding: 10px 0;
        position: relative;
      }
    }
  }
}
</style>

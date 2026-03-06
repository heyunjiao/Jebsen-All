<template>
  <div class="lead-dashboard">
    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            clearable
          />
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :icon="Refresh" @click="handleRefresh" :loading="loading"> 刷新 </el-button>
        </div>
      </div>
    </el-card>

    <!-- 容器A：客户生命周期监控 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="section-title">客户生命周期监控</div>
      </template>
      <el-row :gutter="16" class="lifecycle-row">
        <el-col v-for="item in lifecycleData" :key="item.category" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <LifecycleCard
            :title="item.title"
            :icon="item.icon"
            :icon-color="item.iconColor"
            :total-count="item.totalCount"
            :today-new="item.todayNew"
            :latest-time="item.latestTime"
            :completed-count="item.completedCount"
            :category="item.category"
            @view-detail="handleViewDetail"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 容器B：客户价值分层 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="section-title">客户价值分层</div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="item in valueTierData" :key="item.category">
          <ValueTierCard
            :title="item.title"
            :emoji="item.emoji"
            :bg-color="item.bgColor"
            :total-count="item.totalCount"
            :today-new="item.todayNew"
            :latest-time="item.latestTime"
            :completed-count="item.completedCount"
            :category="item.category"
            @view-detail="handleViewDetail"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 保留原有的统计卡片（可选，用于快速概览） -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="section-title">数据概览</div>
      </template>
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6" v-for="stat in statsList" :key="stat.key">
          <el-card shadow="hover" class="stat-card">
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
              <span>商机类型分布</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts v-if="typeChartOption && stats.byType && stats.byType.length > 0" :option="typeChartOption" :height="300" />
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 商机状态分布 - 饼图 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商机状态分布</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts
              v-if="statusChartOption && stats.byStatus && stats.byStatus.length > 0"
              :option="statusChartOption"
              :height="300"
            />
            <el-empty v-else description="暂无数据" />
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
              <span>商机类型趋势</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts v-if="typeTrendOption && stats.byType && stats.byType.length > 0" :option="typeTrendOption" :height="300" />
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 商机状态趋势 - 柱状图 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商机状态趋势</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <ECharts
              v-if="statusTrendOption && stats.byStatus && stats.byStatus.length > 0"
              :option="statusTrendOption"
              :height="300"
            />
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  DataAnalysis,
  Document,
  Clock,
  CircleCheck,
  Refresh,
  ArrowUp,
  ArrowDown,
  TrendCharts,
  User,
  ShoppingCart,
  Tools,
  Sunset,
  BellFilled,
  Star
} from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { getDashboardStats } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { LEAD_STATUS_OPTIONS, LEAD_TYPE_OPTIONS } from "../interface";
import LifecycleCard from "./LifecycleCard.vue";
import ValueTierCard from "./ValueTierCard.vue";

const { t } = useI18n();

const emit = defineEmits<{
  refresh: [];
  navigate: [tab: string, filters?: Record<string, any>];
}>();

const loading = ref(false);
const dateRange = ref<string[] | undefined>(undefined);

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

// 客户生命周期数据
const lifecycleData = computed(() => {
  return [
    {
      title: t("leadManagement.enums.leadType.new_to_renew"),
      icon: User,
      iconColor: "#409eff",
      totalCount: 1245,
      todayNew: 12,
      latestTime: "10分钟前",
      completedCount: 50,
      category: "new_to_renew"
    },
    {
      title: t("leadManagement.enums.leadType.renew_to_renew"),
      icon: ShoppingCart,
      iconColor: "#67c23a",
      totalCount: 856,
      todayNew: 8,
      latestTime: "15分钟前",
      completedCount: 32,
      category: "renew_to_renew"
    },
    {
      title: t("leadManagement.enums.leadType.in_repair_no_insurance"),
      icon: Tools,
      iconColor: "#e6a23c",
      totalCount: 642,
      todayNew: 15,
      latestTime: "5分钟前",
      completedCount: 28,
      category: "in_repair_no_insurance"
    },
    {
      title: t("leadManagement.enums.leadType.dormant"),
      icon: Sunset,
      iconColor: "#909399",
      totalCount: 1834,
      todayNew: 6,
      latestTime: "30分钟前",
      completedCount: 120,
      category: "dormant"
    },
    {
      title: t("leadManagement.enums.leadType.pending_activation"),
      icon: BellFilled,
      iconColor: "#f56c6c",
      totalCount: 523,
      todayNew: 20,
      latestTime: "2分钟前",
      completedCount: 45,
      category: "pending_activation"
    },
    {
      title: t("leadManagement.enums.leadType.active"),
      icon: Star,
      iconColor: "#67c23a",
      totalCount: 2156,
      todayNew: 35,
      latestTime: "1分钟前",
      completedCount: 8,
      category: "active"
    }
  ];
});

// 客户价值分层数据
const valueTierData = computed(() => {
  return [
    {
      title: "钻石客户",
      emoji: "💎",
      bgColor: "#e6f7ff",
      totalCount: 156,
      todayNew: 3,
      latestTime: "5分钟前",
      completedCount: 2,
      category: "diamond"
    },
    {
      title: "黄金客户",
      emoji: "🥇",
      bgColor: "#fff7e6",
      totalCount: 523,
      todayNew: 12,
      latestTime: "8分钟前",
      completedCount: 15,
      category: "gold"
    },
    {
      title: "白银客户",
      emoji: "🥈",
      bgColor: "#f5f5f5",
      totalCount: 1245,
      todayNew: 28,
      latestTime: "12分钟前",
      completedCount: 45,
      category: "silver"
    }
  ];
});

// 统计卡片列表
const statsList = computed(() => {
  return [
    {
      key: "todayTotal",
      label: "今日生成总数",
      value: stats.value.todayTotal,
      icon: DataAnalysis,
      color: "#409eff",
      trend: undefined
    },
    {
      key: "todayPushed",
      label: "今日已推送",
      value: stats.value.todayPushed,
      icon: Document,
      color: "#67c23a",
      trend: undefined
    },
    {
      key: "completedCount",
      label: "已成交数",
      value: stats.value.completedCount,
      icon: Clock,
      color: "#e6a23c",
      trend: undefined
    },
    {
      key: "processingCount",
      label: "处理中数",
      value: stats.value.processingCount,
      icon: TrendCharts,
      color: "#409eff",
      trend: undefined
    },
    {
      key: "completedCount",
      label: "已完成数",
      value: stats.value.completedCount,
      icon: CircleCheck,
      color: "#67c23a",
      trend: undefined
    },
    {
      key: "successRate",
      label: "推送成功率",
      value: `${stats.value.successRate.toFixed(1)}%`,
      icon: CircleCheck,
      color: "#67c23a",
      trend: undefined
    }
  ];
});

// 商机类型饼图配置
const typeChartOption = computed<ECOption | null>(() => {
  if (!stats.value.byType || stats.value.byType.length === 0) return null;

  const total = stats.value.byType.reduce((sum, item) => sum + item.count, 0);
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

// 获取类型标签（包含所有历史类型）
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
      stats.value = res.data;
    } else {
      ElMessage.error(res.msg || "加载统计数据失败");
    }
  } catch (error: any) {
    console.error("加载统计数据失败:", error);
    ElMessage.error(error.message || "加载统计数据失败");
  } finally {
    loading.value = false;
  }
};

// 日期变化处理
const handleDateChange = () => {
  loadStats();
};

// 刷新处理
const handleRefresh = () => {
  loadStats();
  emit("refresh");
};

// 查看详情
const handleViewDetail = (category: string) => {
  // 跳转到列表页面，并应用筛选条件
  const filters: Record<string, any> = {
    category
  };
  emit("navigate", "list", filters);
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.lead-dashboard {
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

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .lifecycle-row {
    margin-bottom: 0;

    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }

  .stats-row {
    margin-bottom: 0;

    .stat-card {
      transition: all 0.3s;
      cursor: pointer;

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

          .stat-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            margin-top: 4px;

            &.trend-up {
              color: #67c23a;
            }

            &.trend-down {
              color: #f56c6c;
            }
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

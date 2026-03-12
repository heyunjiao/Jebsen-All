<template>
  <div class="dashboard-lifecycle">
    <el-row :gutter="16" class="lifecycle-row">
      <el-col v-for="item in lifecycleData" :key="item.category" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
        <LifecycleCard
          :title="item.title"
          :icon="item.icon"
          :icon-color="item.iconColor"
          :total-count="item.totalCount"
          :today-new="item.todayNew"
          :latest-time="item.latestTime"
          :pushed-count="item.pushedCount"
          :completed-count="item.completedCount"
          :category="item.category"
          @view-detail="handleViewDetail"
          @today-new="handleTodayNew"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { User, ShoppingCart, Tools, Sunset, BellFilled, Star, Calendar, Warning } from "@element-plus/icons-vue";
import { getDashboardStats } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { LEAD_TYPE_OPTIONS } from "../interface";
import { mergeLeadTypeMetrics } from "@/constants/leadTypes";
import LifecycleCard from "./LifecycleCard.vue";

interface Props {
  dateRange?: string[] | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  dateRange: undefined
});

const emit = defineEmits<{
  refresh: [];
  navigate: [tab: string, filters?: Record<string, any>];
}>();

const loading = ref(false);

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

// 客户生命周期数据 - 从 API 数据动态生成
const lifecycleData = computed(() => {
  // 图标映射
  const iconMap: Record<string, any> = {
    new_to_renew: User,
    renew_to_renew: ShoppingCart,
    in_repair_no_insurance: Tools,
    bdc_campaign: ShoppingCart,
    cm_custom: User,
    pcn_aftersales_campaign: ShoppingCart,
    ttr_survey: BellFilled,
    aftersales_cs: BellFilled,
    newcar_cs: Star,
    psp_expiry: Calendar,
    maintenance_churn: Warning,
    no_visit_365d: Sunset,
    regular_maintenance_365d: Tools,
    periodic_maintenance: Tools,
    first_insurance_2y: Calendar,
    first_maintenance: Tools,
    newcar_365d_no_maintenance: Tools,
    newcar_warranty_expiry: Calendar,
    extended_warranty_expiry: Calendar,
    newcar_delivery_90d_revisit: BellFilled
  };

  // 图标颜色映射
  const iconColorMap: Record<string, string> = {
    new_to_renew: "#409eff",
    renew_to_renew: "#67c23a",
    in_repair_no_insurance: "#e6a23c",
    bdc_campaign: "#409eff",
    cm_custom: "#409eff",
    pcn_aftersales_campaign: "#67c23a",
    ttr_survey: "#f56c6c",
    aftersales_cs: "#409eff",
    newcar_cs: "#67c23a",
    psp_expiry: "#e6a23c",
    maintenance_churn: "#f56c6c",
    no_visit_365d: "#909399",
    regular_maintenance_365d: "#409eff",
    periodic_maintenance: "#67c23a",
    first_insurance_2y: "#409eff",
    first_maintenance: "#67c23a",
    newcar_365d_no_maintenance: "#e6a23c",
    newcar_warranty_expiry: "#409eff",
    extended_warranty_expiry: "#67c23a",
    newcar_delivery_90d_revisit: "#f56c6c"
  };

  const allLifecycleTypes = LEAD_TYPE_OPTIONS.map(opt => opt.value);

  // 不同商机类型的成交率映射
  const conversionRateMap: Record<string, number> = {
    new_to_renew: 0.35, // 新转续成交率较高
    renew_to_renew: 0.3, // 续转续成交率较高
    in_repair_no_insurance: 0.25,
    bdc_campaign: 0.25,
    cm_custom: 0.22,
    pcn_aftersales_campaign: 0.24,
    ttr_survey: 0.18,
    aftersales_cs: 0.25,
    newcar_cs: 0.3,
    psp_expiry: 0.2,
    maintenance_churn: 0.18,
    no_visit_365d: 0.15,
    regular_maintenance_365d: 0.22,
    periodic_maintenance: 0.25,
    first_insurance_2y: 0.2,
    first_maintenance: 0.28,
    newcar_365d_no_maintenance: 0.2,
    newcar_warranty_expiry: 0.22,
    extended_warranty_expiry: 0.2,
    newcar_delivery_90d_revisit: 0.25
  };

  return allLifecycleTypes.map(type => {
    const typeData = stats.value.byType.find(item => item.type === type);
    const totalCount = typeData?.count || 0;
    const typeOption = LEAD_TYPE_OPTIONS.find(opt => opt.value === type);
    const title = typeOption?.label || type;

    // 计算今日新增（从总数中估算，实际应该从API获取）
    const todayNew = Math.floor(totalCount * 0.01) || 0;
    // 计算已推送数量（根据总数和推送率估算，实际应该从API获取）
    const pushRate = stats.value.todayPushed / (stats.value.todayTotal || 1);
    const pushedCount = Math.floor(totalCount * pushRate) || 0;
    // 计算已成交数量（根据已推送数量和成交率估算，实际应该从API获取）
    const conversionRate = conversionRateMap[type] || 0.2;
    const completedCount = Math.floor(pushedCount * conversionRate) || 0;

    return {
      title,
      icon: iconMap[type] || User,
      iconColor: iconColorMap[type] || "#409eff",
      totalCount,
      todayNew,
      latestTime: "", // 不再使用
      pushedCount,
      completedCount,
      category: type
    };
  });
});

/**
 * 加载统计数据
 * 时间区间搜索用于查看历史某个时间段内的统计数据
 * 例如：查看上个月、上周或某个特定时间段的商机统计情况
 * 注意：时间区间只影响仪表盘的统计数据展示，不影响列表页的过滤
 */
const loadStats = async () => {
  loading.value = true;
  try {
    const params =
      props.dateRange && props.dateRange.length === 2
        ? {
            startDate: props.dateRange[0],
            endDate: props.dateRange[1]
          }
        : undefined;
    const res = await getDashboardStats(params);
    if (String(res.code) === "200") {
      stats.value = {
        ...res.data,
        byType: mergeLeadTypeMetrics(res.data?.byType || [], ["count"])
      };
    }
  } catch (error: any) {
    console.error("加载统计数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 监听日期范围变化，自动重新加载数据
watch(
  () => props.dateRange,
  () => {
    loadStats();
  },
  { deep: true }
);

// 刷新处理
const handleRefresh = () => {
  loadStats();
  emit("refresh");
};

// 查看详情
const handleViewDetail = (category: string) => {
  const filters: Record<string, any> = {
    category
  };
  emit("navigate", "list", filters);
};

// 查看今日新增
const handleTodayNew = (category: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const filters: Record<string, any> = {
    category,
    startDate: todayStr,
    endDate: todayStr
  };
  emit("navigate", "list", filters);
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.dashboard-lifecycle {
  .lifecycle-row {
    margin-bottom: 0;

    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }
}
</style>

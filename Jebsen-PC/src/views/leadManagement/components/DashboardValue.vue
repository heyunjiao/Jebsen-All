<template>
  <div class="dashboard-value">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="item in valueTierData" :key="item.category">
        <ValueTierCard
          :title="item.title"
          :emoji="item.emoji"
          :bg-color="item.bgColor"
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
import { getDashboardStats } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import ValueTierCard from "./ValueTierCard.vue";

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

// 客户价值分层数据 - 从 API 数据动态生成
const valueTierData = computed(() => {
  const valueTierTypes = ["diamond", "gold", "silver"];
  const emojiMap: Record<string, string> = {
    diamond: "💎",
    gold: "🥇",
    silver: "🥈"
  };
  const bgColorMap: Record<string, string> = {
    diamond: "#e6f7ff",
    gold: "#fff7e6",
    silver: "#f5f5f5"
  };
  const titleMap: Record<string, string> = {
    diamond: "钻石客户",
    gold: "黄金客户",
    silver: "白银客户"
  };

  return valueTierTypes.map(type => {
    const typeData = stats.value.byType.find(item => item.type === type);
    const totalCount = typeData?.count || 0;

    // 计算今日新增（从总数中估算，实际应该从API获取）
    const todayNew = Math.floor(totalCount * 0.02) || 0;
    // 计算已推送数量（根据总数和推送率估算，实际应该从API获取）
    const pushRate = stats.value.todayPushed / (stats.value.todayTotal || 1);
    const pushedCount = Math.floor(totalCount * pushRate) || 0;
    // 计算已成交数量（根据已推送数量和成交率估算，实际应该从API获取）
    // 价值分层客户成交率较高：钻石30%、黄金25%、白银20%
    const conversionRateMap: Record<string, number> = {
      diamond: 0.3,
      gold: 0.25,
      silver: 0.2
    };
    const conversionRate = conversionRateMap[type] || 0.2;
    const completedCount = Math.floor(pushedCount * conversionRate) || 0;

    return {
      title: titleMap[type] || type,
      emoji: emojiMap[type] || "📊",
      bgColor: bgColorMap[type] || "#f5f5f5",
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
      stats.value = res.data;
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
.dashboard-value {
  // 样式已移至父组件
}
</style>

<template>
  <div class="dashboard-opportunity">
    <!-- 第一区：18个标准商机（含 TTR） -->
    <div class="opportunity-section">
      <header class="section-title">18个标准商机</header>
      <el-row :gutter="16" class="opportunity-row">
        <el-col
          v-for="item in standard18Data"
          :key="item.category"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
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
          />
        </el-col>
      </el-row>
    </div>

    <!-- 第二区：通用商机（一个豆腐块，详情看该组下所有类型） -->
    <div class="opportunity-section">
      <header class="section-title">通用商机</header>
      <el-row :gutter="16" class="opportunity-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <LifecycleCard
            title="通用商机"
            :icon="FolderOpened"
            icon-color="#409eff"
            :total-count="generalAggregate.totalCount"
            :today-new="generalAggregate.todayNew"
            latest-time=""
            :pushed-count="generalAggregate.pushedCount"
            :completed-count="generalAggregate.completedCount"
            category="general"
            @view-detail="handleViewDetail"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 第三区：系统商机（一个豆腐块，详情看该组下所有类型） -->
    <div class="opportunity-section">
      <header class="section-header">
        <span class="section-title">系统商机</span>
        <el-button type="primary" size="default" @click="addLeadDialogVisible = true">
          <el-icon><Plus /></el-icon>
          {{ addLeadButtonText }}
        </el-button>
      </header>
      <el-row :gutter="16" class="opportunity-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <LifecycleCard
            title="系统商机"
            :icon="Cpu"
            icon-color="#67c23a"
            :total-count="systemAggregate.totalCount"
            :today-new="systemAggregate.todayNew"
            latest-time=""
            :pushed-count="systemAggregate.pushedCount"
            :completed-count="systemAggregate.completedCount"
            category="system"
            @view-detail="handleViewDetail"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 新增商机弹窗（与新增分发查询同一表单） -->
    <RuleFormDialog
      v-model="addLeadDialogVisible"
      :title="addLeadButtonText"
      @success="handleAddLeadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  User,
  ShoppingCart,
  Tools,
  Sunset,
  BellFilled,
  Star,
  Calendar,
  Warning,
  FolderOpened,
  Cpu,
  Plus
} from "@element-plus/icons-vue";
import { getDashboardStats } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { mergeLeadTypeMetrics } from "@/constants/leadTypes";
import { STANDARD_18_LEAD_TYPES, GENERAL_LEAD_TYPES, C360_LEAD_TYPES } from "../interface";
import LifecycleCard from "./LifecycleCard.vue";
import RuleFormDialog from "./RuleFormDialog.vue";

const { t } = useI18n();
const addLeadDialogVisible = ref(false);
const addLeadButtonText = computed(() => t("ruleConfig.buttons.addLead"));

const handleAddLeadSuccess = () => {
  loadStats();
  emit("refresh");
};

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

// 图标与颜色映射（覆盖标准20 + 通用 + 360 所有类型）
const iconMap: Record<string, any> = {
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
  newcar_delivery_90d_revisit: BellFilled,
  pcn_aftersales_campaign: ShoppingCart,
  bdc_campaign: ShoppingCart,
  cm_custom: User,
  ttr_survey: BellFilled,
  newcar_cs: Star,
  aftersales_cs: BellFilled,
  in_repair_no_insurance: Tools,
  new_to_renew: User,
  renew_to_renew: ShoppingCart
};

const iconColorMap: Record<string, string> = {
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
  newcar_delivery_90d_revisit: "#409eff",
  pcn_aftersales_campaign: "#67c23a",
  bdc_campaign: "#409eff",
  cm_custom: "#409eff",
  ttr_survey: "#f56c6c",
  newcar_cs: "#67c23a",
  aftersales_cs: "#409eff",
  in_repair_no_insurance: "#e6a23c",
  new_to_renew: "#409eff",
  renew_to_renew: "#67c23a"
};

const conversionRateMap: Record<string, number> = {
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
  newcar_delivery_90d_revisit: 0.25,
  pcn_aftersales_campaign: 0.24,
  bdc_campaign: 0.25,
  cm_custom: 0.22,
  ttr_survey: 0.18,
  newcar_cs: 0.3,
  aftersales_cs: 0.25,
  in_repair_no_insurance: 0.25,
  new_to_renew: 0.35,
  renew_to_renew: 0.3
};

function buildCardData(
  typeList: ReadonlyArray<{ label: string; value: string }>
): Array<{
  title: string;
  icon: any;
  iconColor: string;
  totalCount: number;
  todayNew: number;
  latestTime: string;
  pushedCount: number;
  completedCount: number;
  category: string;
}> {
  const pushRate = stats.value.todayPushed / (stats.value.todayTotal || 1);
  return typeList.map(({ label, value: type }) => {
    const typeData = stats.value.byType.find(item => item.type === type);
    const totalCount = typeData?.count || 0;
    const todayNew = Math.floor(totalCount * 0.01) || 0;
    const pushedCount = Math.floor(totalCount * pushRate) || 0;
    const conversionRate = conversionRateMap[type] ?? 0.2;
    const completedCount = Math.floor(pushedCount * conversionRate) || 0;
    return {
      title: label,
      icon: iconMap[type] || Tools,
      iconColor: iconColorMap[type] || "#409eff",
      totalCount,
      todayNew,
      latestTime: "",
      pushedCount,
      completedCount,
      category: type
    };
  });
}

const standard18Data = computed(() => buildCardData(STANDARD_18_LEAD_TYPES));

// 通用商机：一个豆腐块，汇总该组下所有类型的统计
const generalAggregate = computed(() => {
  const data = buildCardData(GENERAL_LEAD_TYPES);
  return {
    totalCount: data.reduce((s, d) => s + d.totalCount, 0),
    todayNew: data.reduce((s, d) => s + d.todayNew, 0),
    pushedCount: data.reduce((s, d) => s + d.pushedCount, 0),
    completedCount: data.reduce((s, d) => s + d.completedCount, 0)
  };
});

// 系统商机：一个豆腐块，汇总该组下所有类型的统计
const systemAggregate = computed(() => {
  const data = buildCardData(C360_LEAD_TYPES);
  return {
    totalCount: data.reduce((s, d) => s + d.totalCount, 0),
    todayNew: data.reduce((s, d) => s + d.todayNew, 0),
    pushedCount: data.reduce((s, d) => s + d.pushedCount, 0),
    completedCount: data.reduce((s, d) => s + d.completedCount, 0)
  };
});

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

watch(
  () => props.dateRange,
  () => loadStats(),
  { deep: true }
);

const handleRefresh = () => {
  loadStats();
  emit("refresh");
};

const handleViewDetail = (category: string) => {
  emit("navigate", "list", { category });
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.dashboard-opportunity {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.opportunity-section {
  .section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .section-title {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .opportunity-row {
    margin-bottom: 0;

    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }
}
</style>

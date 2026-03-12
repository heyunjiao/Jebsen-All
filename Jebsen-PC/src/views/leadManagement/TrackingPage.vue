<template>
  <div class="lead-tracking-page">
    <el-alert type="info" :closable="false" show-icon class="sync-notice-alert" style="margin-bottom: 16px">
      <template #title> 数据同步提示：本模块数据为只读状态，通过源平台 T+1 同步，若与源平台有差异属正常现象。 </template>
    </el-alert>
    <!-- 商机类型 Tab -->
    <el-card shadow="hover" class="type-tabs-card" style="margin-bottom: 20px">
      <el-tabs v-model="activeTypeTab" @tab-change="handleTypeTabChange" class="type-tabs">
        <el-tab-pane :name="''">
          <template #label>
            <span class="tab-label">
              {{ $t("leadManagement.tracking.allTab") }}
              <el-badge v-if="getTypeStats('').pushed > 0" :value="getTypeStats('').pushed" :max="9999" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane v-for="type in leadTypeOptions" :key="type.value" :name="type.value">
          <template #label>
            <span class="tab-label">
              {{ getLeadTypeLabel(type.value) }}
              <el-badge
                v-if="getTypeStats(type.value).pushed > 0"
                :value="getTypeStats(type.value).pushed"
                :max="9999"
                class="tab-badge"
              />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(stats.totalGenerated) }}</div>
          <div class="stats-label">{{ $t("leadManagement.tracking.totalGenerated") }}</div>
        </div>
      </div>
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><Upload /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(stats.totalPushed) }}</div>
          <div class="stats-label">{{ $t("leadManagement.tracking.totalPushed") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(stats.convertedCount) }}</div>
          <div class="stats-label">{{ $t("leadManagement.tracking.convertedCount") }}</div>
        </div>
      </div>
      <div class="stats-card warning-card">
        <div class="stats-icon-wrapper">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(stats.orderCount) }}</div>
          <div class="stats-label">{{ $t("leadManagement.tracking.orderCount") }}</div>
        </div>
      </div>
      <div class="stats-card info-card">
        <div class="stats-icon-wrapper">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatCurrency(stats.totalOrderAmount) }}</div>
          <div class="stats-label">{{ $t("leadManagement.tracking.totalOrderAmount") }}</div>
        </div>
      </div>
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ (stats.conversionRate * 100).toFixed(2) }}%</div>
          <div class="stats-label">{{ $t("leadManagement.tracking.conversionRate") }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-bottom: 20px" v-if="false">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ $t("leadManagement.tracking.typeDistribution") }}</span>
            </div>
          </template>
          <ECharts v-if="typeChartOption" :option="typeChartOption as any" :height="300" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ $t("leadManagement.tracking.trendChart") }}</span>
            </div>
          </template>
          <ECharts v-if="trendChartOption" :option="trendChartOption as any" :height="300" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-card">
      <pro-table
        ref="proTableRef"
        :columns="columns"
        :request-api="loadData"
        :init-param="initParam"
        :pagination="true"
        :tool-button="false"
        :border="true"
        row-key="id"
      >
        <template #tableHeader>
          <el-date-picker
            v-model="dateRange as any"
            type="daterange"
            range-separator="-"
            :start-placeholder="$t('customer.profile360.startDate')"
            :end-placeholder="$t('customer.profile360.endDate')"
            size="default"
            style="width: 240px; margin-right: 12px"
            @change="handleDateRangeChange"
          />
          <el-select
            v-model="initParam.pushTarget"
            :placeholder="$t('leadManagement.tracking.filterByTarget')"
            clearable
            style="width: 150px; margin-right: 12px"
            @change="handleFilterChange"
          >
            <el-option :label="$t('leadManagement.tracking.all')" value="" />
            <el-option v-for="target in pushTargetOptions" :key="target.value" :label="target.label" :value="target.value" />
          </el-select>
          <el-select
            v-model="initParam.converted"
            :placeholder="$t('leadManagement.tracking.filterByConverted')"
            clearable
            style="width: 150px; margin-right: 12px"
            @change="handleFilterChange"
          >
            <el-option :label="$t('leadManagement.tracking.all')" value="" />
            <el-option :label="$t('leadManagement.tracking.converted')" :value="true" />
            <el-option :label="$t('leadManagement.tracking.notConverted')" :value="false" />
          </el-select>
          <el-button type="primary" :icon="Refresh" @click="handleRefresh">{{ $t("leadManagement.overview.refresh") }}</el-button>
        </template>

        <!-- 推送目标列 -->
        <template #pushTarget="scope">
          <el-tag type="info" size="small">
            {{ getPushTargetLabel(scope.row.pushTarget) }}
          </el-tag>
        </template>

        <!-- 成交状态列 -->
        <template #converted="scope">
          <el-tag :type="scope.row.converted ? 'success' : 'danger'" size="small">
            {{ scope.row.converted ? $t("leadManagement.tracking.converted") : $t("leadManagement.tracking.notConverted") }}
          </el-tag>
        </template>

        <!-- 战败原因列 -->
        <template #lostReason="scope">
          <span v-if="!scope.row.converted">{{ scope.row.lostReason || "-" }}</span>
          <span v-else>-</span>
        </template>

        <!-- 订单金额列 -->
        <template #totalOrderAmount="scope">
          <span class="amount-text">{{ formatCurrency(scope.row.totalOrderAmount) }}</span>
        </template>

        <!-- 操作列 -->
        <template #operation="scope">
          <el-button link type="primary" :icon="View" @click="viewDetail(scope.row)">
            {{ $t("leadManagement.buttons.view") }}
          </el-button>
        </template>
      </pro-table>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" :title="$t('leadManagement.tracking.detailTitle')" width="800px" append-to-body>
      <div v-if="currentItem" class="tracking-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('leadManagement.columns.oneId')">{{ currentItem.oneId }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.customerName')">{{
            currentItem.customerName
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customer.phone')">{{ currentItem.phone || "-" }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.leadType')">
            <el-tag :type="getTypeTagType(currentItem.leadType) as any" size="small">
              {{ getLeadTypeLabel(currentItem.leadType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.ruleName')">{{ currentItem.ruleName }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.tracking.pushTime')">{{
            formatDateTime(currentItem.pushTime)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.pushTarget')">
            <el-tag type="info" size="small">{{ getPushTargetLabel(currentItem.pushTarget) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.tracking.converted')">
            <el-tag :type="currentItem.converted ? 'success' : 'info'" size="small">
              {{ currentItem.converted ? $t("leadManagement.tracking.converted") : $t("leadManagement.tracking.notConverted") }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.convertedTime" :label="$t('leadManagement.tracking.convertedTime')">
            {{ formatDateTime(currentItem.convertedTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.tracking.orderCount')">{{
            currentItem.orderCount
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.tracking.totalOrderAmount')">
            <span class="amount-text">{{ formatCurrency(currentItem.totalOrderAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.firstOrderTime" :label="$t('leadManagement.tracking.firstOrderTime')">
            {{ formatDateTime(currentItem.firstOrderTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.lastOrderTime" :label="$t('leadManagement.tracking.lastOrderTime')">
            {{ formatDateTime(currentItem.lastOrderTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.advisorName" :label="$t('leadManagement.tracking.advisorName')">
            {{ currentItem.advisorName }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.storeName" :label="$t('customer.profile360.storeName')">
            {{ currentItem.storeName }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { View, Refresh, Upload, CircleCheck, ShoppingCart, Money, TrendCharts, Document } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";
import { getLeadTrackingList, getLeadTrackingStats } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { LEAD_TYPE_OPTIONS, PUSH_TARGET_OPTIONS } from "./interface";
import {
  getLeadTypeLabel,
  getLeadTypeTagType,
  mergeLeadTypeMetrics,
  normalizeLeadTypeList
} from "@/constants/leadTypes";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import leadTrackingMockData from "@/assets/json/leadTrackingMockData.json";

const { t } = useI18n();
const proTableRef = ref();
const detailVisible = ref(false);
const currentItem = ref<Lead.LeadTrackingItem | null>(null);
const dateRange = ref<[Date, Date] | null>(null);
const activeTypeTab = ref<string>("");

// 统计数据
const stats = reactive<Lead.LeadTrackingStats>({
  totalGenerated: 0,
  totalPushed: 0,
  convertedCount: 0,
  orderCount: 0,
  totalOrderAmount: 0,
  conversionRate: 0,
  avgOrderAmount: 0,
  byType: [],
  byDate: []
});

// 初始化参数
const initParam = reactive<Lead.ReqLeadTrackingParams>({
  pageNum: 1,
  pageSize: 10,
  leadType: "",
  pushTarget: "" as any,
  converted: undefined,
  startDate: "",
  endDate: ""
});

// 选项数据
const leadTypeOptions = LEAD_TYPE_OPTIONS;
const pushTargetOptions = PUSH_TARGET_OPTIONS;
const trackingMockList = normalizeLeadTypeList((leadTrackingMockData as any).trackingList.data.list || [], "leadType");

// 表格列配置
const columns: ColumnProps[] = [
  {
    prop: "oneId",
    label: t("leadManagement.columns.oneId"),
    width: 150
  },
  {
    prop: "customerName",
    label: t("leadManagement.columns.customerName"),
    minWidth: 120
  },
  {
    prop: "phone",
    label: t("customer.phone"),
    width: 120
  },
  {
    prop: "ruleName",
    label: t("leadManagement.columns.ruleName"),
    width: 150
  },
  {
    prop: "pushTime",
    label: t("leadManagement.tracking.pushTime"),
    width: 160,
    sortable: true
  },
  {
    prop: "pushTarget",
    label: t("leadManagement.columns.pushTarget"),
    width: 120
  },
  {
    prop: "converted",
    label: t("leadManagement.tracking.converted"),
    width: 100
  },
  {
    prop: "convertedTime",
    label: t("leadManagement.tracking.convertedTime"),
    width: 160,
    sortable: true
  },
  {
    prop: "lostReason",
    label: t("leadManagement.tracking.lostReason"),
    width: 150
  },
  {
    prop: "orderCount",
    label: t("leadManagement.tracking.orderCount"),
    width: 100,
    align: "right",
    sortable: true
  },
  {
    prop: "totalOrderAmount",
    label: t("leadManagement.tracking.totalOrderAmount"),
    width: 150,
    align: "right",
    sortable: true
  },
  {
    prop: "advisorName",
    label: t("leadManagement.tracking.advisorName"),
    width: 120
  },
  {
    prop: "storeName",
    label: t("customer.profile360.storeName"),
    width: 150
  },
  {
    prop: "operation",
    label: t("common.operation"),
    width: 100,
    fixed: "right"
  }
];

// 加载数据
const loadData = async (params: any) => {
  const queryParams: Lead.ReqLeadTrackingParams = {
    ...params,
    ...initParam
  };

  // 开发环境直接使用mock数据，生产环境尝试调用API
  const useMockData = import.meta.env.MODE === "development" || import.meta.env.DEV;

  if (useMockData) {
    // 直接使用mock数据
    let mockList = [...trackingMockList];

    // Add mock lostReason for demo purpose
    mockList.forEach((item: any) => {
      if (!item.converted && !item.lostReason) {
        const reasons = ["价格因素", "已购竞品", "无购车指标", "暂缓购车", "联系不上"];
        item.lostReason = reasons[Math.floor(Math.random() * reasons.length)];
      }
    });

    // 应用筛选条件
    if (queryParams.leadType) {
      mockList = mockList.filter(item => item.leadType === queryParams.leadType);
    }
    if (queryParams.pushTarget) {
      mockList = mockList.filter(item => item.pushTarget === queryParams.pushTarget);
    }
    if (queryParams.converted !== undefined) {
      mockList = mockList.filter(item => item.converted === queryParams.converted);
    }
    if (queryParams.oneId) {
      mockList = mockList.filter(item => item.oneId.includes(queryParams.oneId));
    }
    if (queryParams.customerName) {
      mockList = mockList.filter(item => item.customerName.includes(queryParams.customerName));
    }

    // 分页
    const pageNum = queryParams.pageNum || 1;
    const pageSize = queryParams.pageSize || 10;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;

    // 返回与API相同的格式
    return {
      code: 200,
      msg: "操作成功",
      data: {
        list: mockList.slice(start, end),
        total: mockList.length
      }
    };
  }

  // 生产环境调用真实API
  try {
    const res = await getLeadTrackingList(queryParams);
    return {
      ...res,
      data: {
        ...res.data,
        list: normalizeLeadTypeList(res.data?.list || [], "leadType")
      }
    };
  } catch (error) {
    console.error("API调用失败:", error);
    // API失败时也使用mock数据作为降级方案
    let mockList = [...trackingMockList];
    const pageNum = queryParams.pageNum || 1;
    const pageSize = queryParams.pageSize || 10;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;

    return {
      code: 200,
      msg: "操作成功",
      data: {
        list: mockList.slice(start, end),
        total: mockList.length
      }
    };
  }
};

// 加载统计数据
const loadStats = async () => {
  const params: any = {};
  if (dateRange.value) {
    params.startDate = dateRange.value[0].toISOString().split("T")[0];
    params.endDate = dateRange.value[1].toISOString().split("T")[0];
  }
  if (initParam.leadType) {
    params.leadType = initParam.leadType;
  }

  // 开发环境直接使用mock数据，生产环境尝试调用API
  const useMockData = import.meta.env.MODE === "development" || import.meta.env.DEV;

  if (useMockData) {
    // 使用 mock 列表数据动态计算统计信息，确保与业务数据一致
    const allList = trackingMockList as Lead.LeadTrackingItem[];

    // 按筛选条件过滤
    const filteredList = allList.filter(item => {
      const itemDate = item.pushTime?.slice(0, 10);
      const matchType = !initParam.leadType || item.leadType === initParam.leadType;
      const matchDate = !dateRange.value || (!itemDate ? false : itemDate >= params.startDate && itemDate <= params.endDate);
      return matchType && matchDate;
    });

    const totalPushed = filteredList.length;
    const convertedItems = filteredList.filter(item => item.converted);
    const convertedCount = convertedItems.length;
    const orderCount = filteredList.reduce((sum, item) => sum + (item.orderCount || 0), 0);
    const totalOrderAmount = filteredList.reduce((sum, item) => sum + (item.totalOrderAmount || 0), 0);

    // 按类型统计
    const byTypeMap = new Map<string, { pushed: number; converted: number; orderCount: number; orderAmount: number }>();
    filteredList.forEach(item => {
      const key = item.leadType;
      const stat = byTypeMap.get(key) || {
        pushed: 0,
        converted: 0,
        orderCount: 0,
        orderAmount: 0
      };
      stat.pushed += 1;
      if (item.converted) stat.converted += 1;
      stat.orderCount += item.orderCount || 0;
      stat.orderAmount += item.totalOrderAmount || 0;
      byTypeMap.set(key, stat);
    });

    const byType = Array.from(byTypeMap.entries()).map(([type, value]) => ({
      type,
      pushed: value.pushed,
      converted: value.converted,
      orderCount: value.orderCount,
      orderAmount: value.orderAmount
    }));

    // 按日期统计
    const byDateMap = new Map<string, { pushed: number; converted: number; orderCount: number; orderAmount: number }>();
    filteredList.forEach(item => {
      const dateKey = item.pushTime?.slice(0, 10);
      if (!dateKey) return;
      const stat = byDateMap.get(dateKey) || {
        pushed: 0,
        converted: 0,
        orderCount: 0,
        orderAmount: 0
      };
      stat.pushed += 1;
      if (item.converted) stat.converted += 1;
      stat.orderCount += item.orderCount || 0;
      stat.orderAmount += item.totalOrderAmount || 0;
      byDateMap.set(dateKey, stat);
    });

    const byDate = Array.from(byDateMap.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, value]) => ({
        date,
        pushed: value.pushed,
        converted: value.converted,
        orderCount: value.orderCount,
        orderAmount: value.orderAmount
      }));

    const conversionRate = totalPushed ? convertedCount / totalPushed : 0;
    const avgOrderAmount = orderCount ? totalOrderAmount / orderCount : 0;

    Object.assign(stats, {
      totalGenerated: totalPushed, // mock 场景下 1:1 视为都已推送
      totalPushed,
      convertedCount,
      orderCount,
      totalOrderAmount,
      conversionRate,
      avgOrderAmount,
      byType,
      byDate
    } as Lead.LeadTrackingStats);
    return;
  }

  // 生产环境调用真实API
  try {
    const res = await getLeadTrackingStats(params);
    Object.assign(stats, {
      ...res.data,
      byType: mergeLeadTypeMetrics(res.data?.byType || [], ["pushed", "converted", "orderCount", "orderAmount"])
    });
  } catch (error) {
    console.error("加载统计数据失败，使用mock数据:", error);
    // API失败时使用mock数据
    const mockData = (leadTrackingMockData as any).trackingStats.data;
    Object.assign(stats, {
      ...mockData,
      byType: mergeLeadTypeMetrics(mockData?.byType || [], ["pushed", "converted", "orderCount", "orderAmount"])
    });
  }
};

// 日期范围变化
const handleDateRangeChange = () => {
  if (dateRange.value) {
    initParam.startDate = dateRange.value[0].toISOString().split("T")[0];
    initParam.endDate = dateRange.value[1].toISOString().split("T")[0];
  } else {
    initParam.startDate = "";
    initParam.endDate = "";
  }
  handleRefresh();
};

// 筛选变化
const handleFilterChange = () => {
  handleRefresh();
};

// 刷新（表格 + 统计）
const handleRefresh = () => {
  // ProTable 对外暴露的是 getTableList 方法
  proTableRef.value?.getTableList();
  loadStats();
};

// 查看详情
const viewDetail = (row: Lead.LeadTrackingItem) => {
  currentItem.value = row;
  detailVisible.value = true;
};

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

// 格式化货币
const formatCurrency = (amount: number) => {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN");
};

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  return getLeadTypeTagType(type);
};

// 获取推送目标标签
const getPushTargetLabel = (target: string) => {
  const option = pushTargetOptions.find(opt => opt.value === target);
  return option ? option.label : target;
};

// 获取类型的统计数据
const getTypeStats = (type: string) => {
  if (!type) {
    // 全部类型，返回总计
    return {
      pushed: stats.totalPushed,
      converted: stats.convertedCount,
      orderCount: stats.orderCount,
      orderAmount: stats.totalOrderAmount
    };
  }
  // 查找对应类型的统计数据
  const typeStat = stats.byType.find(item => item.type === type);
  return (
    typeStat || {
      pushed: 0,
      converted: 0,
      orderCount: 0,
      orderAmount: 0
    }
  );
};

// Tab 切换处理
const handleTypeTabChange = (tabName: string | number) => {
  initParam.leadType = String(tabName);
  handleRefresh();
};

// 按类型统计图表配置
const typeChartOption = computed<ECOption | null>(() => {
  if (!stats.byType || stats.byType.length === 0) return null;

  const typeLabels = stats.byType.map(item => {
    const typeOption = leadTypeOptions.find(opt => opt.value === item.type);
    return typeOption ? getLeadTypeLabel(item.type) : getLeadTypeLabel(item.type);
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" }
    },
    legend: {
      data: [
        t("leadManagement.tracking.totalPushed"),
        t("leadManagement.tracking.convertedCount"),
        t("leadManagement.tracking.orderCount")
      ]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: typeLabels
    },
    yAxis: [
      {
        type: "value",
        name: t("leadManagement.tracking.totalPushed"),
        position: "left"
      },
      {
        type: "value",
        name: t("leadManagement.tracking.orderCount"),
        position: "right"
      }
    ],
    series: [
      {
        name: t("leadManagement.tracking.totalPushed"),
        type: "bar",
        data: stats.byType.map(item => item.pushed),
        itemStyle: { color: "#409eff" }
      },
      {
        name: t("leadManagement.tracking.convertedCount"),
        type: "bar",
        data: stats.byType.map(item => item.converted),
        itemStyle: { color: "#67c23a" }
      },
      {
        name: t("leadManagement.tracking.orderCount"),
        type: "line",
        yAxisIndex: 1,
        data: stats.byType.map(item => item.orderCount),
        itemStyle: { color: "#e6a23c" }
      }
    ]
  };
});

// 趋势图表配置
const trendChartOption = computed<ECOption | null>(() => {
  if (!stats.byDate || stats.byDate.length === 0) return null;

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" }
    },
    legend: {
      data: [
        t("leadManagement.tracking.totalPushed"),
        t("leadManagement.tracking.convertedCount"),
        t("leadManagement.tracking.orderCount")
      ]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: stats.byDate.map(item => item.date)
    },
    yAxis: [
      {
        type: "value",
        name: t("leadManagement.tracking.totalPushed"),
        position: "left"
      },
      {
        type: "value",
        name: t("leadManagement.tracking.orderCount"),
        position: "right"
      }
    ],
    series: [
      {
        name: t("leadManagement.tracking.totalPushed"),
        type: "line",
        smooth: true,
        data: stats.byDate.map(item => item.pushed),
        itemStyle: { color: "#409eff" },
        areaStyle: { opacity: 0.3 }
      },
      {
        name: t("leadManagement.tracking.convertedCount"),
        type: "line",
        smooth: true,
        data: stats.byDate.map(item => item.converted),
        itemStyle: { color: "#67c23a" },
        areaStyle: { opacity: 0.3 }
      },
      {
        name: t("leadManagement.tracking.orderCount"),
        type: "bar",
        yAxisIndex: 1,
        data: stats.byDate.map(item => item.orderCount),
        itemStyle: { color: "#e6a23c" }
      }
    ]
  };
});

onMounted(() => {
  // 初始化 tab 状态
  activeTypeTab.value = initParam.leadType || "";
  loadStats();
});
</script>

<style scoped lang="scss">
.lead-tracking-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  box-sizing: border-box;

  .stats-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
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
      font-size: 24px;
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

      .sub-value {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        margin-left: 4px;
      }
    }

    .stats-label {
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 1.5;
      word-break: break-word;
    }

    // 各类型卡片颜色配置
    &.primary-card {
      .stats-icon-wrapper {
        background-color: rgba(64, 158, 255, 0.12);
        color: #409eff;
      }
      .stats-number {
        color: #409eff;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(64, 158, 255, 0.2);
      }
    }

    &.success-card {
      .stats-icon-wrapper {
        background-color: rgba(103, 194, 58, 0.12);
        color: #67c23a;
      }
      .stats-number {
        color: #67c23a;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(103, 194, 58, 0.2);
      }
    }

    &.warning-card {
      .stats-icon-wrapper {
        background-color: rgba(230, 162, 60, 0.12);
        color: #e6a23c;
      }
      .stats-number {
        color: #e6a23c;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(230, 162, 60, 0.2);
      }
    }

    &.info-card {
      .stats-icon-wrapper {
        background-color: rgba(144, 147, 153, 0.12);
        color: #909399;
      }
      .stats-number {
        color: #909399;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(144, 147, 153, 0.2);
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
        font-size: 22px;
      }
    }
  }

  @media (max-width: 768px) {
    .stats-panel {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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
        font-size: 20px;
      }

      .stats-label {
        font-size: 12px;
      }
    }
  }

  @media (max-width: 480px) {
    .stats-panel {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
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
        font-size: 18px;
      }
    }
  }

  .table-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.pro-table-container) {
      padding: 20px;
    }
  }

  .amount-text {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .tracking-detail {
    :deep(.el-descriptions__label) {
      font-weight: 500;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .type-tabs-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 16px 20px;
    }
  }

  .type-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        height: 1px;
        background-color: #e4e7ed;
      }
    }

    :deep(.el-tabs__item) {
      padding: 0 20px;
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;

      &:hover {
        color: #409eff;
      }

      &.is-active {
        color: #409eff;
        font-weight: 500;
      }
    }

    .tab-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .tab-badge {
      :deep(.el-badge__content) {
        font-size: 12px;
        height: 18px;
        line-height: 18px;
        padding: 0 6px;
        min-width: 18px;
        border-radius: 9px;
      }
    }
  }
}
</style>

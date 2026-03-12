<template>
  <div class="welcome-container">
    <!-- 页面头部：问候 + 系统最后更新时间 + 引导 -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="animate__animated animate__fadeInLeft">
          {{ timePeriod }},
          <span class="user-name">{{ userInfo?.name }}</span>
        </h1>
        <p class="subtitle animate__animated animate__fadeInLeft animate__delay-1s">
          {{ welcomeMessage }}
        </p>
      </div>
      <div class="header-action animate__animated animate__fadeInRight">
        <template v-if="getRoleFromStorage() === 'admin'">
          <span class="global-update">
            <span class="global-update-label">系统最后更新</span>
            <span class="global-update-time">{{ sourceMonitorBrief.lastUpdate }}</span>
          </span>
        </template>
        <el-button type="primary" size="large" round icon="Guide" @click="startTour">
          {{ $t("welcome.startTour") }}
        </el-button>
      </div>
      <div class="header-bg"></div>
    </div>

    <!-- 管理员视图：按区块顺序排列 -->
    <template v-if="getRoleFromStorage() === 'admin'">
      <!-- 区块一：客户库与源数据（融合为一块，全量 + 增量紧凑展示） -->
      <section class="page-section" id="step-admin-customer-stats">
        <h2 class="section-title">客户库 · 源数据</h2>
        <div class="indicator-block">
          <div class="indicator-group">
            <h3 class="indicator-group-title">全量</h3>
            <div class="indicator-grid">
              <div
                v-for="(item, index) in fullVolumeIndicators"
                :key="'full-' + index"
                class="indicator-mini-card"
                :class="item.iconClass"
              >
                <span class="indicator-label">{{ item.label }}</span>
                <span class="indicator-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <div class="indicator-group">
            <h3 class="indicator-group-title">增量</h3>
            <div class="indicator-grid">
              <div
                v-for="(item, index) in incrementalIndicators"
                :key="'inc-' + index"
                class="indicator-mini-card"
                :class="item.iconClass"
              >
                <span class="indicator-label">{{ item.label }}</span>
                <span class="indicator-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-card shadow="hover" class="pipeline-card-welcome section-card">
          <template #header>
            <div class="pipeline-card-header">
              <div class="header-left">
                <el-icon class="header-icon"><Operation /></el-icon>
                <div class="title-wrap">
                  <span class="title">{{ $t("dashboard.dataMonitor.pipelineTitle") }}</span>
                  <span class="title-desc">{{ $t("dashboard.dataMonitor.pipelineResultDesc") }}</span>
                </div>
              </div>
              <div class="header-right">
                <el-tag size="small" :type="pipelineStatusType" effect="dark">
                  {{ $t("dashboard.dataMonitor.processing") }}
                </el-tag>
                <span class="meta-info">
                  <span class="dot-online"></span>
                  {{ $t("dashboard.dataMonitor.pipelineStart") }}: {{ pipelineData.startTime }}
                </span>
              </div>
            </div>
          </template>
          <div class="pipeline-steps-wrapper">
            <el-steps
              :active="pipelineData.currentStep"
              process-status="process"
              finish-status="success"
              align-center
              class="pipeline-steps"
            >
              <el-step
                v-for="(step, index) in pipelineSteps"
                :key="index"
                :title="step.title"
                :description="step.desc"
                :status="getStepStatusForElSteps(index)"
              >
                <template #icon>
                  <div class="step-icon-custom" :class="getPipelineStepStatus(index)">
                    <el-icon><component :is="step.icon" /></el-icon>
                    <div v-if="getPipelineStepStatus(index) === 'active'" class="step-pulse"></div>
                  </div>
                </template>
                <template #description>
                  <div class="step-description">
                    <div class="step-desc-text">{{ step.desc }}</div>
                    <div v-if="getPipelineStepStatus(index) === 'active'" class="step-processing">
                      {{ $t("dashboard.dataMonitor.processing") }}...
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>
        </el-card>
      </section>

      <!-- 区块二：今日数据采集状态（放在上面） -->
      <section class="page-section">
        <h2 class="section-title">今日数据采集状态</h2>
        <el-card shadow="hover" class="status-card" id="step-admin-system">
          <template #header>
            <div class="card-header">
              <span><el-icon><Monitor /></el-icon> {{ $t("welcome.systemStatus") }}</span>
              <el-tag :type="systemStatusSummary.type" effect="dark">{{ systemStatusSummary.text }}</el-tag>
            </div>
          </template>
          <div class="system-grid">
            <div
              v-for="sys in sourceSystems"
              :key="sys.name"
              class="system-item"
              :class="{ 'is-clickable': sys.type === 'manual' && sys.status !== 'gray' }"
              @click="sys.status !== 'gray' ? handleSystemClick(sys) : null"
            >
              <div v-if="sys.status === 'gray'" class="upload-btn-wrapper">
                <el-button type="primary" :icon="Upload" size="small" class="upload-btn" @click.stop="handleUpload(sys)">
                  {{ $t("welcome.data.upload") }}
                </el-button>
              </div>
              <div v-else class="sys-icon" :class="sys.status">
                <component :is="sys.icon" />
              </div>
              <div class="sys-info">
                <span class="sys-name">{{ sys.name }}</span>
                <span class="sys-desc">{{ sys.desc }}</span>
                <div class="sys-status-row">
                  <span class="sys-status">{{ sys.statusText }}</span>
                  <span class="sys-time" v-if="sys.uploadTime">{{ sys.uploadTime }}</span>
                </div>
                <span class="sys-type-tag" v-if="sys.type === 'manual'">{{ $t("welcome.data.manual") }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </section>

      <!-- 区块三：快捷导航（放在上面） -->
      <section class="page-section" v-if="quickNavItems.length > 0">
        <h2 class="section-title">{{ $t("welcome.quickNavigation") }}</h2>
        <div class="quick-nav-container">
          <div class="quick-nav-grid">
            <div v-for="item in quickNavItems" :key="item.path" class="nav-item" @click="handleNavClick(item)">
              <div class="nav-icon" :class="item.iconClass">
                <el-icon :size="22"><component :is="item.icon" /></el-icon>
              </div>
              <div class="nav-content">
                <div class="nav-title">{{ item.title }}</div>
                <div class="nav-desc" v-if="item.desc">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 区块四：数据接入与质量（图表放在最下方） -->
      <section class="page-section">
        <h2 class="section-title">{{ $t("dashboard.dataMonitor.qualityTitle") }}（{{ $t("dashboard.dataMonitor.dataVolume") }}）</h2>
        <el-card shadow="hover" class="chart-card-welcome">
          <div class="chart-body-welcome">
            <ECharts :option="dataVolumeChartOption" :height="280" />
          </div>
        </el-card>
      </section>
    </template>

    <!-- 业务用户视图 -->
    <template v-else>
      <section class="page-section">
        <h2 class="section-title">业务概览</h2>
        <div class="metrics-grid" id="step-user-metrics">
              <div class="metric-card">
                <div class="metric-icon blue">
                  <el-icon><User /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="label">{{ $t("welcome.totalClients") }}</div>
                  <div class="value">12,543</div>
                  <div class="trend up">
                    +12% <el-icon><Top /></el-icon>
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon purple">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="label">{{ $t("welcome.highIntent") }}</div>
                  <div class="value">856</div>
                  <div class="trend up">
                    +5% <el-icon><Top /></el-icon>
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon orange">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="label">{{ $t("welcome.conversionRate") }}</div>
                  <div class="value">24.5%</div>
                  <div class="trend down">
                    -2% <el-icon><Bottom /></el-icon>
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon green">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="label">{{ $t("welcome.revenueEst") }}</div>
                  <div class="value">¥2.4M</div>
                  <div class="trend up">
                    +18% <el-icon><Top /></el-icon>
                  </div>
                </div>
              </div>
        </div>
      </section>

      <section class="page-section">
        <h2 class="section-title">{{ $t("welcome.opportunityPipeline") }}</h2>
        <el-card shadow="hover" class="funnel-card" id="step-user-opportunities">
          <template #header>
            <div class="card-header">
              <span><el-icon><TrendCharts /></el-icon> {{ $t("welcome.opportunityPipeline") }}</span>
            </div>
          </template>
          <div class="opportunity-list">
            <div v-for="opp in opportunities" :key="opp.name" class="opp-item">
              <div class="opp-info">
                <span class="opp-name">{{ opp.name }}</span>
                <span class="opp-desc">{{ opp.desc }}</span>
              </div>
              <div class="opp-action">
                <el-button type="primary" plain size="small" @click="handlePush(opp)">
                  {{ $t("welcome.pushToBDC") }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </section>

      <section class="page-section" v-if="quickNavItems.length > 0">
        <h2 class="section-title">{{ $t("welcome.quickNavigation") }}</h2>
        <div class="quick-nav-container">
          <div class="quick-nav-grid">
            <div v-for="item in quickNavItems" :key="item.path" class="nav-item" @click="handleNavClick(item)">
              <div class="nav-icon" :class="item.iconClass">
                <el-icon :size="22"><component :is="item.icon" /></el-icon>
              </div>
              <div class="nav-content">
                <div class="nav-title">{{ item.title }}</div>
                <div class="nav-desc" v-if="item.desc">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  Guide,
  Monitor,
  List,
  User,
  Star,
  Trophy,
  Money,
  TrendCharts,
  Top,
  Bottom,
  VideoCamera,
  Connection,
  Iphone,
  Service,
  Menu,
  ArrowRight,
  Odometer,
  UserFilled,
  HomeFilled,
  Opportunity,
  DocumentChecked,
  PriceTag,
  Setting,
  Document,
  DataAnalysis,
  Tools,
  Tickets,
  WarningFilled,
  Avatar,
  Grid,
  Collection,
  Lock,
  SwitchButton,
  Stamp,
  Promotion,
  DocumentCopy,
  Operation,
  Refresh,
  Ticket,
  Van,
  Upload,
  Download,
  Filter,
  Cpu,
  Histogram,
  Files,
  Select,
  MagicStick
} from "@element-plus/icons-vue";
import { ElMessage, ElNotification } from "element-plus";
import { useI18n } from "vue-i18n";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const userInfo = computed(() => userStore.userInfo);

// 从 localStorage 中读取角色信息
const getRoleFromStorage = (): string => {
  try {
    const storageData = localStorage.getItem("geeker-user");
    if (storageData) {
      const parsed = JSON.parse(storageData);
      return parsed?.userInfo?.role || parsed?.state?.userInfo?.role || "admin";
    }
  } catch (error) {
    console.warn("读取 localStorage 角色信息失败:", error);
  }
  return "admin";
};

// 角色信息通过 getRoleFromStorage() 函数动态获取，不存储为响应式变量

const timePeriod = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return t("welcome.morning");
  if (hour < 18) return t("welcome.afternoon");
  return t("welcome.evening");
});

const welcomeMessage = computed(() => {
  const role = getRoleFromStorage();
  return role === "admin" ? t("welcome.adminMessage") : t("welcome.businessMessage");
});

// Mock Data
// Mock Data
const sourceSystems = computed(() => [
  {
    name: "DMS",
    type: "manual",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: t("welcome.data.desc.dms"),
    uploadTime: "10:30",
    icon: Monitor
  },
  {
    name: "POAS",
    type: "manual",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: t("welcome.data.desc.poas"),
    uploadTime: "11:15",
    icon: Tickets
  },
  {
    name: "WWS",
    type: "manual",
    status: "gray",
    statusText: t("welcome.data.status.pendingUpload"),
    desc: t("welcome.data.desc.wws"),
    icon: Upload
  },
  {
    name: "C@P",
    type: "manual",
    status: "gray",
    statusText: t("welcome.data.status.pendingUpload"),
    desc: t("welcome.data.desc.cap"),
    icon: Upload
  },
  {
    name: "BDC",
    type: "auto",
    status: "success",
    statusText: t("welcome.data.status.synced"),
    desc: t("welcome.data.desc.BDC外呼系统"),
    icon: Service
  },
  {
    name: "Voucher",
    type: "auto",
    status: "success",
    statusText: t("welcome.data.status.synced"),
    desc: t("welcome.data.desc.voucher"),
    icon: Ticket
  }
]);

const systemStatusSummary = computed(() => {
  const systems = sourceSystems.value;
  const errorCount = systems.filter(s => s.status === "error" || s.status === "warning").length;
  const pendingCount = systems.filter(s => s.status === "gray").length;

  if (errorCount > 0) {
    return {
      text: t("welcome.systemSummary.abnormal"),
      type: "danger"
    };
  }

  if (pendingCount > 0) {
    return {
      text: t("welcome.systemSummary.incomplete", { count: pendingCount }),
      type: "warning"
    };
  }

  return {
    text: t("welcome.systemSummary.normal"),
    type: "success"
  };
});

const handleSystemClick = (sys: any) => {
  if (sys.type === "manual") {
    // Navigate to Data Quality Workbench for manual upload systems
    router.push("/dataProcess/dataQualityWorkbench");
  }
};

const handleUpload = (sys: any) => {
  // Navigate to Data Quality Workbench for upload
  router.push("/dataProcess/dataQualityWorkbench");
  ElMessage.info(t("welcome.data.upload.clickUpload"));
};

const opportunities = computed(() => [
  { name: t("welcome.data.opportunity.renewal"), desc: t("welcome.data.opportunity.renewalDesc") },
  { name: t("welcome.data.opportunity.birthday"), desc: t("welcome.data.opportunity.birthdayDesc") },
  { name: t("welcome.data.opportunity.serviceDue"), desc: t("welcome.data.opportunity.serviceDueDesc") },
  { name: t("welcome.data.opportunity.lostLead"), desc: t("welcome.data.opportunity.lostLeadDesc") }
]);

// 客户库统计数据
const customerStats = ref({
  total: 1342001,
  incremental: 1245,
  mergedCount: 85600,
  updatedCount: 234500,
  newMerged: 124,
  newUpdated: 532
});

// 源数据采集看板关键指标（合并自 dataMonitor，仅做首页概览）
const sourceMonitorBrief = ref({
  lastUpdate: "11:10:46",
  totalProcessed: 125890,
  totalVolume: "850 GB",
  successCount: 125600,
  mergeNeeded: 45,
  autoMerged: 8560,
  incremental: 1248,
  pipelineStep: "批处理进行中",
  pipelineStart: "02:00:00",
  pipelineRemaining: "约 15 分钟",
  dataVolume: "850 GB"
});

// 融合块：全量指标（4–8 个，紧凑展示）
const fullVolumeIndicators = computed(() => {
  const c = customerStats.value;
  const b = sourceMonitorBrief.value;
  return [
    { label: t("customer.stats.total"), value: formatNumber(c.total), iconClass: "primary-bg" },
    { label: t("customer.stats.mergedCount"), value: formatNumber(c.mergedCount), iconClass: "success-bg" },
    { label: t("customer.stats.updatedCount"), value: formatNumber(c.updatedCount), iconClass: "info-bg" },
    { label: t("dashboard.dataMonitor.backendCredit.totalProcessed"), value: formatNumber(b.totalProcessed), iconClass: "primary-bg" },
    { label: t("dashboard.dataMonitor.backendCredit.totalVolume"), value: b.totalVolume, iconClass: "info-bg" },
    { label: t("dashboard.dataMonitor.backendCredit.successCount"), value: formatNumber(b.successCount), iconClass: "success-bg" }
  ];
});

// 融合块：增量指标（4–8 个，紧凑展示）
const incrementalIndicators = computed(() => {
  const c = customerStats.value;
  const b = sourceMonitorBrief.value;
  return [
    { label: t("customer.stats.incremental"), value: "+" + formatNumber(c.incremental), iconClass: "warning-bg" },
    { label: t("customer.stats.newMerged"), value: "+" + formatNumber(c.newMerged), iconClass: "purple-bg" },
    { label: t("customer.stats.newUpdated"), value: "+" + formatNumber(c.newUpdated), iconClass: "primary-bg" },
    { label: t("dashboard.dataMonitor.backendCredit.incremental"), value: "+" + formatNumber(b.incremental), iconClass: "warning-bg" },
    { label: t("dashboard.dataMonitor.backendCredit.autoMerged"), value: formatNumber(b.autoMerged), iconClass: "purple-bg" },
    { label: t("dashboard.dataMonitor.backendCredit.mergeNeeded"), value: String(b.mergeNeeded), iconClass: "info-bg" }
  ];
});

// 全链路批处理（静态展示，不刷新）
const pipelineData = ref({
  currentStep: 2,
  startTime: "02:00:00"
});
const pipelineStatusType = "success" as const;
const pipelineSteps = computed(() => [
  { title: t("dashboard.dataMonitor.steps.ingestion"), desc: "100/100", icon: Download },
  { title: t("dashboard.dataMonitor.steps.cleaning"), desc: "99/100", icon: Filter },
  { title: t("dashboard.dataMonitor.steps.identify"), desc: "98/100", icon: User },
  { title: t("dashboard.dataMonitor.steps.tagging"), desc: "97/100", icon: Cpu },
  { title: t("dashboard.dataMonitor.steps.dispatch"), desc: "96/100", icon: Connection }
]);
const getPipelineStepStatus = (index: number) => {
  if (index < pipelineData.value.currentStep) return "completed";
  if (index === pipelineData.value.currentStep) return "active";
  return "pending";
};
const getStepStatusForElSteps = (index: number): "wait" | "process" | "finish" | "error" | "success" => {
  if (index < pipelineData.value.currentStep) return "finish";
  if (index === pipelineData.value.currentStep) return "process";
  return "wait";
};

// 数据接入与质量 - 仅数据量柱状图（静态假数据）
const dataVolumeSourceData = [1200, 932, 2013, 934, 1290, 430, 220];
const dataVolumeSystemNames = ["DMS", "BDC", "WeCom", "App", "MiniP", "Evt", "3rd"];
const dataVolumeChartOption = computed<ECOption>(() => {
  const chartData = dataVolumeSourceData;
  const total = chartData.reduce((sum: number, val: number) => sum + val, 0);
  const xAxisData = chartData.map((val: number) => {
    const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
    return `${percentage}%`;
  });
  return {
    grid: { top: 40, right: 24, bottom: 32, left: 56, containLabel: false },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        if (Array.isArray(params) && params[0]) {
          const dataIndex = params[0].dataIndex;
          const value = params[0].value;
          const name = dataVolumeSystemNames[dataIndex] || "";
          return `${name}<br/>${t("dashboard.dataMonitor.dataVolume")}: ${formatNumber(value)}`;
        }
        return "";
      }
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLine: { show: true, lineStyle: { color: "#E4E7ED" } },
      axisTick: { show: false },
      axisLabel: { color: "#909399", fontSize: 11, interval: 0 }
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: "dashed", color: "#E4E7ED" } },
      axisLabel: { color: "#909399", fontSize: 11, formatter: (v: number) => formatNumber(v) }
    },
    series: [
      {
        name: t("dashboard.dataMonitor.dataVolume"),
        type: "bar",
        data: chartData,
        barWidth: "50%",
        showBackground: true,
        backgroundStyle: { color: "rgba(180, 180, 180, 0.08)", borderRadius: [8, 8, 0, 0] },
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#409EFF" },
              { offset: 1, color: "#a0cfff" }
            ]
          }
        },
        label: {
          show: true,
          position: "top",
          color: "#606266",
          fontSize: 11,
          formatter: (params: any) => formatNumber(params.value)
        }
      }
    ]
  };
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

// 图标映射
const iconMap: Record<string, any> = {
  HomeFilled: HomeFilled,
  Odometer: Odometer,
  Monitor: Monitor,
  UserFilled: UserFilled,
  List: List,
  Opportunity: Opportunity,
  DataAnalysis: DataAnalysis,
  TrendCharts: TrendCharts,
  Tickets: Tickets,
  Tools: Tools,
  Document: Document,
  DocumentChecked: DocumentChecked,
  PriceTag: PriceTag,
  Setting: Setting,
  Menu: Menu,
  WarningFilled: WarningFilled,
  Avatar: Avatar,
  Grid: Grid,
  Collection: Collection,
  Lock: Lock,
  SwitchButton: SwitchButton,
  Stamp: Stamp,
  Promotion: Promotion,
  DocumentCopy: DocumentCopy,
  Operation: Operation,
  User: User
};

// 根据角色过滤菜单并生成快捷导航
const quickNavItems = computed(() => {
  const menuList = authStore.showMenuListGet || [];
  const items: Array<{
    path: string;
    title: string;
    icon: any;
    iconClass: string;
    desc?: string;
  }> = [];

  // Define specific paths for quick navigation based on role
  const role = getRoleFromStorage();

  const adminTargets = [
    "/dashboard/dataMonitor",
    "/dataProcess/dataQualityWorkbench",
    "/dataProcess/errorCorrection",
    "/system/accountManage",
    "/system/roleManage",
    "/system/menuMange",
    "/system/operlogManage"
  ];

  const userTargets = [
    "/customer/list",
    "/customer/segmentation",
    "/leadManagement/dashboard",
    "/leadManagement/list",
    "/tagManage",
    "/segmentManage"
  ];

  const targetPaths = role === "admin" ? adminTargets : userTargets;

  // 图标样式映射
  const iconClassMap: Record<string, string> = {
    "/dashboard": "icon-blue",
    "/customer": "icon-purple",
    "/leadManagement": "icon-orange",
    "/system": "icon-green",
    "/auth": "icon-red",
    "/dataProcess": "icon-cyan",
    "/errorCorrection": "icon-yellow",
    "/tagManage": "icon-pink",
    "/segmentManage": "icon-indigo",
    "/collection": "icon-teal"
  };

  // Helper to get icon class
  const getIconClass = (path: string) => {
    const key = Object.keys(iconClassMap).find(k => path.startsWith(k));
    return key ? iconClassMap[key] : "icon-default";
  };

  // Flatten the menu tree to find matching items
  const findMenuByPath = (menus: Menu.MenuOptions[], path: string): Menu.MenuOptions | null => {
    const stack = [...menus];
    while (stack.length > 0) {
      const menu = stack.pop()!;
      if (menu.path === path) return menu;
      if (menu.children && menu.children.length > 0) {
        stack.push(...menu.children);
      }
    }
    return null;
  };

  // Build the items list based on targetPaths order
  targetPaths.forEach(path => {
    const menu = findMenuByPath(menuList, path);
    if (menu && !menu.meta?.isHide) {
      const iconName = menu.meta?.icon || "Menu";
      items.push({
        path: menu.path!,
        title: menu.meta?.title || "",
        icon: iconMap[iconName] || Menu,
        iconClass: getIconClass(menu.path!),
        desc: menu.meta?.title // Simple desc for now
      });
    }
  });

  return items;
});

// 处理导航点击
const handleNavClick = (item: { path: string; title: string }) => {
  if (item.path) {
    router.push(item.path);
  }
};

const handlePush = (opp: any) => {
  ElMessage.success(t("welcome.pushingToBDC", { name: opp.name }));
};

// Onboarding Tour
const startTour = () => {
  const adminSteps = [
    {
      element: "#step-admin-system",
      popover: { title: t("welcome.tour.systemHealth"), description: t("welcome.tour.systemHealthDesc") }
    }
  ];

  const userSteps = [
    {
      element: "#step-user-metrics",
      popover: { title: t("welcome.tour.keyMetrics"), description: t("welcome.tour.keyMetricsDesc") }
    },
    {
      element: "#step-user-opportunities",
      popover: { title: t("welcome.tour.smartOpp"), description: t("welcome.tour.smartOppDesc") }
    }
  ];

  const driverObj = driver({
    showProgress: true,
    steps: getRoleFromStorage() === "admin" ? adminSteps : userSteps
  });

  driverObj.drive();
};

onMounted(() => {
  // 页面加载时，角色信息会自动从 localStorage 读取
});
</script>

<style scoped lang="scss">
.welcome-container {
  min-height: 100%;
  padding: 20px;
  background-color: var(--el-bg-color-page);
  overflow: visible;
}

.dashboard-content {
  /* 整页滚动：不设固定高度与内部滚动，由外层页面滚动 */
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 30px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: var(--el-color-primary);
    filter: blur(80px);
    opacity: 0.1;
    border-radius: 50%;
  }

  .header-content {
    h1 {
      font-size: 32px;
      margin: 0 0 12px 0;
      color: var(--el-text-color-primary);
      font-weight: 600;

      .user-name {
        color: var(--el-color-primary);
      }
    }
    .subtitle {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      margin: 0;
      max-width: 600px;
    }
  }

  .header-action {
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .global-update {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    .global-update-label {
      font-weight: 500;
    }
    .global-update-time {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}

/* 统一区块与标题 */
.page-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 客户库·源数据 融合块：全量/增量紧凑指标，不占大块 */
.indicator-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}
.indicator-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.indicator-group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin: 0;
  padding: 0 0 4px 0;
}
.indicator-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}
.indicator-mini-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-overlay);
  min-height: 52px;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .indicator-label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    line-height: 1.3;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .indicator-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  &.primary-bg { border-left: 3px solid var(--el-color-primary); }
  &.success-bg { border-left: 3px solid var(--el-color-success); }
  &.info-bg { border-left: 3px solid var(--el-color-info); }
  &.warning-bg { border-left: 3px solid var(--el-color-warning); }
  &.purple-bg { border-left: 3px solid #8e44ad; }
}
@media (max-width: 1200px) {
  .indicator-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 768px) {
  .indicator-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .indicator-mini-card {
    padding: 8px 12px;
    min-height: 48px;
    .indicator-value { font-size: 14px; }
  }
}

.section-card {
  margin-top: 16px;
  &:first-of-type {
    margin-top: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

/* 数据统计 - 6 个独立卡片 */
.source-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.credit-card-welcome {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-overlay);
  transition: all 0.3s ease;
  min-height: 88px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

    .el-icon {
      font-size: 22px;
    }
  }

  &.primary-bg .credit-icon {
    background: linear-gradient(135deg, #ecf5ff, #c6e2ff);
    color: var(--el-color-primary);
  }
  &.info-bg .credit-icon {
    background: linear-gradient(135deg, #f4f4f5, #e9e9eb);
    color: #909399;
  }
  &.success-bg .credit-icon {
    background: linear-gradient(135deg, #f0f9eb, #d1edc4);
    color: var(--el-color-success);
  }
  &.warning-bg .credit-icon {
    background: linear-gradient(135deg, #fdf6ec, #faecd8);
    color: var(--el-color-warning);
  }
  &.purple-bg .credit-icon {
    background: linear-gradient(135deg, #f8effc, #e5d4f5);
    color: #8e44ad;
  }

  .credit-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .credit-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .credit-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
}

@media (max-width: 1200px) {
  .source-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .source-stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .credit-card-welcome {
    min-height: 76px;
    padding: 12px 16px;
    .credit-icon {
      width: 42px;
      height: 42px;
      font-size: 20px;
    }
    .credit-value {
      font-size: 18px;
    }
  }
}

/* 全链路批处理结果 - 沿用原看板样式 */
.pipeline-card-welcome {
  .pipeline-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      .header-icon {
        font-size: 18px;
        color: var(--el-color-primary);
      }
      .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .title {
        font-size: 16px;
        font-weight: 700;
        color: var(--el-text-color-primary);
      }
      .title-desc {
        font-size: 12px;
        font-weight: 400;
        color: var(--el-text-color-secondary);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      .meta-info {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
        .dot-online {
          width: 6px;
          height: 6px;
          background: var(--el-color-success);
          border-radius: 50%;
          animation: step-pulse-glow 2s infinite;
        }
      }
    }
  }

  .pipeline-steps-wrapper {
    padding: 16px 0 8px;
  }

  .pipeline-steps {
    :deep(.el-step__main) {
      margin-top: 20px !important;
      padding-top: 0 !important;
    }
    :deep(.el-steps .el-step__head) {
      margin-right: 16px !important;
    }
    :deep(.el-step__icon) {
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
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }
      &.is-finish {
        border-color: var(--el-color-success);
        background-color: var(--el-color-success);
        color: #fff;
      }
      &.is-wait {
        border-color: #e4e7ed;
        background-color: #fff;
        color: #cbd5e0;
      }
    }
    :deep(.el-step__title) {
      font-size: 14px;
      font-weight: 700;
      &.is-process {
        color: var(--el-color-primary);
      }
      &.is-wait {
        color: #a0aec0;
      }
    }
    :deep(.el-step__line--inner) {
      background: linear-gradient(90deg, var(--el-color-success) 0%, var(--el-color-primary) 100%);
      border-radius: 2px;
    }
  }

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
    flex-shrink: 0;
    &.completed {
      background: var(--el-color-success);
      color: #fff;
    }
    &.active {
      background: var(--el-color-primary);
      color: #fff;
      box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
    }
    &.pending {
      background: #fff;
      color: #cbd5e0;
    }
    .step-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid var(--el-color-primary);
      opacity: 0.6;
      animation: step-pulse 2s ease-out infinite;
    }
  }

  .step-description {
    .step-desc-text {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      margin-bottom: 4px;
    }
    .step-processing {
      font-size: 10px;
      color: var(--el-color-primary);
      font-weight: 600;
      animation: pulse-text 1.5s ease-in-out infinite;
      margin-top: 2px;
    }
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
@keyframes step-pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(103, 194, 58, 0);
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

/* 数据接入与质量 - 仅数据量图表 */
.chart-card-welcome {
  .chart-body-welcome {
    width: 100%;
    min-height: 280px;
  }
}

.mt-20 {
  margin-top: 20px;
}

.mt-10 {
  margin-top: 10px;
}

/* System Grid */
.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;

  .system-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow-light);
    }

    .sys-icon {
      font-size: 24px;
      margin-bottom: 8px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--el-bg-color);

      &.normal {
        color: var(--el-color-success);
      }
      &.warning {
        color: var(--el-color-warning);
      }
      &.error {
        color: var(--el-color-danger);
      }
    }

    .sys-info {
      display: flex;
      flex-direction: column;
      align-items: center;

      .sys-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 2px;
      }

      .sys-desc {
        font-size: 11px;
        color: var(--el-text-color-secondary);
        margin-bottom: 2px;
      }

      .sys-status-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
      }

      .sys-status {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .sys-time {
        font-size: 12px;
        color: var(--el-color-success);
        font-weight: 500;
      }

      .sys-type-tag {
        font-size: 10px;
        color: var(--el-color-info);
        background: var(--el-fill-color);
        padding: 0 4px;
        border-radius: 4px;
        margin-top: 2px;
      }
    }
  }

  .system-item.is-clickable {
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color);
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow-light);

      .sys-icon {
        background: var(--el-bg-color-overlay);
      }
    }
  }

  .sys-icon {
    &.success {
      color: var(--el-color-success);
    }
    &.gray {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9) !important;
      border: 1.5px solid var(--el-color-primary-light-7);
      animation: pulse-upload 2s ease-in-out infinite;

      &:hover {
        background: var(--el-color-primary-light-8) !important;
        border-color: var(--el-color-primary-light-5);
        animation: none;
      }
    }
    // Keep existing classes if needed or override
  }

  // 上传按钮容器
  .upload-btn-wrapper {
    width: 100%;
    margin-bottom: 8px;
    display: flex;
    justify-content: center;
  }

  // 上传按钮样式 - 精致现代设计
  .upload-btn {
    width: 70%;
    height: 40px;
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.3px;
    border-radius: 8px;
    border: none;
    background: var(--el-color-primary);
    color: #ffffff;
    box-shadow: 0 2px 4px var(--el-color-primary-light-8);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    // 光泽效果
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    &:hover {
      transform: translateY(-1px);
      background: var(--el-color-primary-light-3);
      box-shadow: 0 4px 8px var(--el-color-primary-light-7);

      &::after {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px var(--el-color-primary-light-8);
    }

    // 图标样式
    :deep(.el-icon) {
      margin-right: 4px;
      font-size: 15px;
      vertical-align: middle;
    }
  }

  @keyframes pulse-upload {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--el-color-primary-light-6);
    }
    50% {
      box-shadow: 0 0 0 4px transparent;
    }
  }
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  .metric-card {
    background: var(--el-bg-color-overlay);
    padding: 24px;
    border-radius: 12px;
    box-shadow: var(--el-box-shadow-light);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s;
    border: 1px solid var(--el-border-color-light);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--el-box-shadow);
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;

      &.blue {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
      &.purple {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
      }
      &.orange {
        background: rgba(249, 115, 22, 0.1);
        color: #f97316;
      }
      &.green {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }
    }

    .metric-info {
      flex: 1;

      .label {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 4px;
      }
      .value {
        font-size: 24px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }
      .trend {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        &.up {
          color: var(--el-color-success);
        }
        &.down {
          color: var(--el-color-danger);
        }
      }
    }
  }
}

/* Opportunity List */
.opportunity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .opp-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    border-left: 4px solid var(--el-color-primary);

    .opp-info {
      .opp-name {
        display: block;
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 4px;
      }
      .opp-desc {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

/* 快捷导航 */
.quick-nav-container {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
}

.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--el-bg-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid var(--el-border-color-lighter);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: transparent;
      transition: all 0.3s;
    }

    &:hover {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-color-primary-light-7);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      &::before {
        background: var(--el-color-primary);
      }

      .nav-icon {
        transform: scale(1.1);
      }
    }

    .nav-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s;

      &.icon-blue {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }

      &.icon-purple {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
      }

      &.icon-orange {
        background: rgba(249, 115, 22, 0.1);
        color: #f97316;
      }

      &.icon-green {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      &.icon-red {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      &.icon-cyan {
        background: rgba(6, 182, 212, 0.1);
        color: #06b6d4;
      }

      &.icon-yellow {
        background: rgba(234, 179, 8, 0.1);
        color: #eab308;
      }

      &.icon-pink {
        background: rgba(236, 72, 153, 0.1);
        color: #ec4899;
      }

      &.icon-indigo {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
      }

      &.icon-default {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-regular);
      }
    }

    .nav-content {
      flex: 1;
      min-width: 0;

      .nav-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

@media screen and (max-width: 1400px) {
  .quick-nav-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media screen and (max-width: 1200px) {
  .quick-nav-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;

    .nav-item {
      padding: 12px;
      flex-direction: column;
      text-align: center;
      gap: 8px;

      .nav-icon {
        width: 36px;
        height: 36px;
      }

      .nav-content {
        .nav-title {
          font-size: 13px;
        }

        .nav-desc {
          font-size: 11px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .quick-nav-container {
    padding: 16px;

    .section-title {
      font-size: 14px;
      margin-bottom: 16px;
      padding-bottom: 12px;
    }
  }

  .quick-nav-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;

    .nav-item {
      padding: 12px 8px;

      .nav-icon {
        width: 32px;
        height: 32px;
      }

      .nav-content {
        .nav-title {
          font-size: 12px;
        }

        .nav-desc {
          display: none;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;

    .header-action {
      align-items: flex-start;
      margin-top: 20px;
    }
  }
}

.mb-20 {
  margin-bottom: 20px;
}

/* 统一统计面板样式 - 独立卡片风格 */
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
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(255, 255, 255, 0.4));
    border: 1px solid rgba(64, 158, 255, 0.2);
    .stats-icon-wrapper {
      color: var(--el-color-primary);
      background: rgba(64, 158, 255, 0.15);
    }
    .stats-main .stats-content .stats-number {
      color: var(--el-color-primary);
    }
  }

  &.success-card {
    background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(255, 255, 255, 0.4));
    border: 1px solid rgba(103, 194, 58, 0.2);
    .stats-icon-wrapper {
      color: var(--el-color-success);
      background: rgba(103, 194, 58, 0.15);
    }
    .stats-main .stats-content .stats-number {
      color: var(--el-color-success);
    }
  }

  &.warning-card {
    background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(255, 255, 255, 0.4));
    border: 1px solid rgba(230, 162, 60, 0.2);
    .stats-icon-wrapper {
      color: var(--el-color-warning);
      background: rgba(230, 162, 60, 0.15);
    }
    &:hover .stats-icon-wrapper {
      background-color: rgba(230, 162, 60, 0.2);
    }
  }

  .stats-main {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
  }

  .stats-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .stats-content {
    flex: 1;
    min-width: 0;

    .stats-number {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      line-height: 1.2;
    }

    .stats-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .stats-sub {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    width: 100%;

    .sub-item {
      display: flex;
      flex-direction: column;

      .sub-label {
        font-size: 11px;
        color: var(--el-text-color-secondary);
        margin-bottom: 2px;
      }
      .sub-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-regular);
      }
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

</style>

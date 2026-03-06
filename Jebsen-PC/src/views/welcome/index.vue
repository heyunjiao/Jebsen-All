<template>
  <div class="welcome-container no-scroll">
    <!-- Header Section -->
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
        <el-button type="primary" size="large" round icon="Guide" @click="startTour">
          {{ $t("welcome.startTour") }}
        </el-button>
      </div>
      <div class="header-bg"></div>
    </div>

    <!-- Stats Panel at the Top -->
    <template v-if="getRoleFromStorage() === 'admin'">
      <div class="stats-panel mb-20" id="step-admin-customer-stats">
        <div class="stats-card primary-card">
          <div class="stats-icon-wrapper">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ formatNumber(customerStats.total) }}</div>
            <div class="stats-label">{{ $t("customer.stats.total") }}</div>
          </div>
        </div>
        <div class="stats-card warning-card">
          <div class="stats-icon-wrapper">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">+{{ formatNumber(customerStats.incremental) }}</div>
            <div class="stats-label">{{ $t("customer.stats.incremental") }}</div>
          </div>
        </div>
        <div class="stats-card success-card">
          <div class="stats-icon-wrapper">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ formatNumber(customerStats.mergedCount) }}</div>
            <div class="stats-label">{{ $t("customer.stats.mergedCount") }}</div>
          </div>
        </div>
        <div class="stats-card primary-card">
          <div class="stats-icon-wrapper">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ formatNumber(customerStats.updatedCount) }}</div>
            <div class="stats-label">{{ $t("customer.stats.updatedCount") }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Quick Navigation Section -->
    <div class="quick-nav-section animate__animated animate__fadeInUp" v-if="quickNavItems.length > 0">
      <div class="quick-nav-container">
        <div class="section-title">
          <el-icon><Menu /></el-icon>
          <span>{{ $t("welcome.quickNavigation") }}</span>
        </div>
        <div class="quick-nav-grid">
          <div v-for="item in quickNavItems" :key="item.path" class="nav-item" @click="handleNavClick(item)">
            <div class="nav-icon" :class="item.iconClass">
              <el-icon :size="22">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="nav-content">
              <div class="nav-title">{{ item.title }}</div>
              <div class="nav-desc" v-if="item.desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="dashboard-content animate__animated animate__fadeInUp animate__delay-1s">
      <!-- Admin Dashboard -->
      <template v-if="getRoleFromStorage() === 'admin'">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card shadow="hover" class="status-card" id="step-admin-system">
              <template #header>
                <div class="card-header">
                  <span
                    ><el-icon><Monitor /></el-icon> {{ $t("welcome.systemStatus") }}</span
                  >
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
                  <!-- 灰色状态显示上传按钮 -->
                  <div v-if="sys.status === 'gray'" class="upload-btn-wrapper">
                    <el-button type="primary" :icon="Upload" size="small" class="upload-btn" @click.stop="handleUpload(sys)">
                      {{ $t("welcome.data.upload") }}
                    </el-button>
                  </div>
                  <!-- 其他状态显示图标 -->
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

            <el-card shadow="hover" class="governance-card mt-20" id="step-admin-governance">
              <template #header>
                <div class="card-header">
                  <span
                    ><el-icon><List /></el-icon> {{ $t("welcome.governanceTasks") }}</span
                  >
                  <el-button link type="primary">{{ $t("welcome.viewAll") }}</el-button>
                </div>
              </template>
              <ProTable
                :columns="governanceColumns"
                :data="governanceTasks"
                :pagination="false"
                :border="false"
                :tool-button="false"
              />
            </el-card>
          </el-col>

          <el-col :span="8">
            <!-- Data Governance Impact Card -->
            <el-card shadow="hover" class="impact-card mb-20" id="step-admin-impact">
              <template #header>
                <div class="card-header">
                  <span
                    ><el-icon><DataLine /></el-icon> {{ $t("welcome.impact.title") }}</span
                  >
                </div>
              </template>
              <div class="impact-content">
                <div class="impact-metrics">
                  <div class="impact-item">
                    <div class="impact-label">{{ $t("welcome.impact.cleanedData") }}</div>
                    <div class="impact-value error">
                      12,500 <el-icon><Bottom /></el-icon>
                    </div>
                  </div>
                  <div class="impact-item">
                    <div class="impact-label">{{ $t("welcome.impact.tagCoverage") }}</div>
                    <div class="impact-value success">
                      +35% <el-icon><Top /></el-icon>
                    </div>
                  </div>
                </div>
                <div class="impact-chart">
                  <ECharts :option="impactChartOption" :height="200" />
                </div>
              </div>
            </el-card>

            <el-card shadow="hover" class="audit-card" id="step-admin-audit">
              <template #header>
                <div class="card-header">
                  <span
                    ><el-icon><Timer /></el-icon> {{ $t("welcome.recentSensitiveOperations") }}</span
                  >
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in auditLog"
                  :key="index"
                  :type="activity.type"
                  :timestamp="activity.timestamp"
                  :hollow="true"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- Business User Dashboard -->
      <template v-else>
        <el-row :gutter="20">
          <el-col :span="24">
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
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mt-20">
          <el-col :span="16">
            <el-card shadow="hover" class="funnel-card" id="step-user-opportunities">
              <template #header>
                <div class="card-header">
                  <span
                    ><el-icon><TrendCharts /></el-icon> {{ $t("welcome.opportunityPipeline") }}</span
                  >
                </div>
              </template>
              <div class="opportunity-list">
                <div v-for="opp in opportunities" :key="opp.name" class="opp-item">
                  <div class="opp-info">
                    <span class="opp-name">{{ opp.name }}</span>
                    <span class="opp-desc">{{ opp.desc }}</span>
                  </div>
                  <div class="opp-action">
                    <el-button type="primary" plain size="small" @click="handlePush(opp)">{{
                      $t("welcome.pushToBDC")
                    }}</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="tasks-card">
              <template #header>
                <div class="card-header">
                  <span
                    ><el-icon><Bell /></el-icon> {{ $t("welcome.myTasks") }}</span
                  >
                </div>
              </template>
              <div class="task-list">
                <div class="task-item" v-for="i in 5" :key="i">
                  <el-checkbox>{{ $t("welcome.data.task.followUp", { id: 202400 + i }) }}</el-checkbox>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  Guide,
  Monitor,
  List,
  Timer,
  User,
  Star,
  Trophy,
  Money,
  TrendCharts,
  Bell,
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
  DataLine,
  Upload
} from "@element-plus/icons-vue";
import { ElMessage, ElNotification, ElTag, ElButton } from "element-plus";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
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

const governanceTasks = computed(() => [
  { title: t("welcome.data.governance.mergeConflict"), priority: "High", time: "10m ago" },
  { title: t("welcome.data.governance.dataQuality"), priority: "Medium", time: "1h ago" },
  { title: t("welcome.data.governance.missingField"), priority: "Medium", time: "2h ago" }
]);

const auditLog = computed(() => [
  { type: "warning" as const, content: t("welcome.data.audit.exported"), timestamp: "10:30" },
  { type: "success" as const, content: t("welcome.data.audit.backup"), timestamp: "09:00" },
  { type: "primary" as const, content: t("welcome.data.audit.policyUpdate"), timestamp: "Yesterday" }
]);

const opportunities = computed(() => [
  { name: t("welcome.data.opportunity.renewal"), desc: t("welcome.data.opportunity.renewalDesc") },
  { name: t("welcome.data.opportunity.birthday"), desc: t("welcome.data.opportunity.birthdayDesc") },
  { name: t("welcome.data.opportunity.serviceDue"), desc: t("welcome.data.opportunity.serviceDueDesc") },
  { name: t("welcome.data.opportunity.lostLead"), desc: t("welcome.data.opportunity.lostLeadDesc") }
]);

// Impact Chart Option
const impactChartOption = computed<ECOption>(() => {
  return {
    tooltip: {
      trigger: "axis",
      formatter: "{b}: {c} records"
    },
    grid: {
      top: 10,
      right: 10,
      bottom: 20,
      left: 40
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#909399", fontSize: 10 }
    },
    yAxis: {
      type: "value",
      splitLine: { show: true, lineStyle: { type: "dashed", color: "#E4E7ED" } },
      axisLabel: { color: "#909399", fontSize: 10 }
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        smooth: true,
        showSymbol: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64, 158, 255, 0.2)" },
              { offset: 1, color: "rgba(64, 158, 255, 0)" }
            ]
          }
        },
        itemStyle: { color: "#409EFF" }
      }
    ]
  };
});

// 客户库统计数据
const customerStats = ref({
  total: 1342001,
  incremental: 1245,
  mergedCount: 85600,
  updatedCount: 234500,
  newMerged: 124,
  newUpdated: 532
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

// ProTable 列配置
const governanceColumns = computed<ColumnProps[]>(() => [
  {
    prop: "title",
    label: t("welcome.data.columns.task"),
    align: "left"
  },
  {
    prop: "priority",
    label: t("welcome.data.columns.priority"),
    width: 100,
    render: ({ row }) => {
      return h(
        ElTag,
        {
          type: row.priority === "High" ? "danger" : "warning",
          size: "small"
        },
        () => row.priority
      );
    }
  },
  {
    prop: "time",
    label: t("welcome.data.columns.time"),
    width: 120,
    align: "right"
  },
  {
    prop: "operation",
    label: t("welcome.data.action.fix"),
    width: 80,
    align: "right",
    render: () => {
      return h(
        ElButton,
        {
          link: true,
          type: "primary",
          size: "small"
        },
        () => t("welcome.data.action.fix")
      );
    }
  }
]);

const handlePush = (opp: any) => {
  ElMessage.success(t("welcome.pushingToBDC", { name: opp.name }));
};

// Onboarding Tour
const startTour = () => {
  const adminSteps = [
    {
      element: "#step-admin-system",
      popover: { title: t("welcome.tour.systemHealth"), description: t("welcome.tour.systemHealthDesc") }
    },
    {
      element: "#step-admin-governance",
      popover: { title: t("welcome.tour.governance"), description: t("welcome.tour.governanceDesc") }
    },
    {
      element: "#step-admin-audit",
      popover: { title: t("welcome.tour.audit"), description: t("welcome.tour.auditDesc") }
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
  height: 100%;
  padding: 20px;
  background-color: var(--el-bg-color-page);
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.welcome-container.no-scroll {
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.mt-20 {
  margin-top: 20px;
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

/* Tasks */
.task-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child {
    border-bottom: none;
  }
}

/* Quick Navigation - Professional To B Style */
.quick-nav-section {
  margin-bottom: 32px;
}

.quick-nav-container {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }
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

/* ProTable 样式优化 */
.governance-card {
  :deep(.table-main) {
    box-shadow: none;
    border: none;
    padding: 0;
  }

  :deep(.el-table) {
    background: transparent;
  }

  :deep(.el-table__body) {
    tr {
      background: transparent;
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

.impact-content {
  .impact-metrics {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .impact-item {
      flex: 1;
      text-align: center;
      padding: 0 10px;

      .impact-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .impact-value {
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        &.error {
          color: var(--el-color-danger);
        }
        &.success {
          color: var(--el-color-success);
        }
      }
    }
  }
}
</style>

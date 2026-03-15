<template>
  <div class="welcome-container">
    <div class="welcome-shell">
      <section class="welcome-hero">
        <div class="hero-main">
          <div class="hero-copy">
            <h1 class="hero-title animate__animated animate__fadeInLeft">
              {{ timePeriod }},
              <span class="hero-user-name">{{ userInfo?.name }}</span>
            </h1>
            <p class="hero-subtitle animate__animated animate__fadeInLeft animate__delay-1s">
              {{ welcomeMessage }}
            </p>
          </div>

          <div class="hero-toolbar animate__animated animate__fadeInRight">
            <el-tag size="small" :type="heroStatus.type" effect="light">{{ heroStatus.text }}</el-tag>
            <div class="hero-meta">
              <span class="meta-pill">
                <el-icon><User /></el-icon>
                {{ isAdmin ? "管理端" : "业务端" }}
              </span>
              <span class="meta-pill" v-if="isAdmin">
                <el-icon><Refresh /></el-icon>
                更新 {{ sourceMonitorBrief.lastUpdate }}
              </span>
              <span class="meta-pill" v-else>
                <el-icon><MagicStick /></el-icon>
                新增商机 {{ formatNumber(opportunityStats.incremental) }}
              </span>
            </div>
            <div class="hero-actions">
              <el-button type="primary" size="large" round :icon="Guide" @click="startTour">
                {{ $t("welcome.startTour") }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="hero-orb hero-orb-primary"></div>
        <div class="hero-orb hero-orb-warm"></div>
      </section>

      <section class="page-section">
        <div class="section-heading">
          <div>
            <h2 class="section-title">核心经营指标</h2>
          </div>
        </div>

        <div class="indicator-board" id="step-user-metrics">
          <div class="indicator-row">
            <div class="indicator-side">
              <span class="indicator-side-label">全量</span>
            </div>
            <div class="indicator-grid indicator-grid-4">
              <div
                v-for="(item, index) in topFullIndicators"
                :key="'top-full-' + index"
                class="indicator-mini-card"
                :class="item.iconClass"
              >
                <span class="indicator-label">{{ item.label }}</span>
                <span class="indicator-value">{{ item.value }}</span>
              </div>
            </div>
          </div>

          <div class="indicator-row">
            <div class="indicator-side">
              <span class="indicator-side-label">今日新增</span>
            </div>
            <div class="indicator-grid indicator-grid-4">
              <div
                v-for="(item, index) in topIncrementalIndicators"
                :key="'top-inc-' + index"
                class="indicator-mini-card"
                :class="item.iconClass"
              >
                <span class="indicator-label">{{ item.label }}</span>
                <span class="indicator-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <template v-if="isAdmin">
        <section class="page-section">
          <div class="section-heading">
            <div>
              <h2 class="section-title">今日数据采集状态</h2>
            </div>
          </div>

          <el-card shadow="hover" class="content-card status-card" id="step-admin-system">
            <div class="system-section system-section-split">
              <div class="system-group">
                <div class="system-group-header">
                  <div>
                    <div class="system-group-title">{{ $t("welcome.data.manualGroupTitle") }}</div>
                    <div class="system-group-meta">昨日本批到位 {{ manualUploadedCount }} / {{ manualSystems.length }}</div>
                  </div>
                  <span class="group-badge group-badge-primary">{{ $t("welcome.data.manual") }}</span>
                </div>

                <div class="system-grid">
                  <div
                    v-for="sys in manualSystems"
                    :key="`manual-${sys.name}-${sys.desc}`"
                    class="system-item"
                    :class="{ 'is-clickable': sys.type === 'manual' && sys.status !== 'gray' }"
                    @click="sys.status !== 'gray' ? handleSystemClick(sys) : null"
                  >
                    <div class="sys-icon" :class="sys.status">
                      <component :is="sys.icon" />
                    </div>
                    <div class="sys-info">
                      <div class="sys-main-line">
                        <span class="sys-name">{{ sys.desc }}</span>

                        <span class="sys-sep">/</span>
                        <span class="sys-desc">{{ sys.name }}</span>

                      </div>
                      <div class="sys-status-row">
                        <span class="sys-status">{{ sys.statusText }}</span>
                        <span class="sys-time" v-if="sys.uploadTime">{{ sys.uploadTime }}</span>
                        <span
                          v-if="sys.uploadCycle"
                          class="sys-upload-cycle"
                          :class="{ 'sys-upload-cycle-weak': sys.uploadCycleWeak }"
                          :title="sys.uploadCycleWeak ? sys.uploadCycle : undefined"
                        >
                          {{ sys.uploadCycleWeak ? "按需" : sys.uploadCycle }}
                        </span>
                        <span class="sys-type-tag">{{ $t("welcome.data.manual") }}</span>
                        <el-button
                          v-if="sys.status === 'gray'"
                          text
                          type="primary"
                          size="small"
                          class="sys-upload-link"
                          :icon="Upload"
                          @click.stop="handleUpload(sys)"
                        >
                          {{ $t("welcome.data.upload") }}
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="system-group system-group-auto">
                <div class="system-group-header">
                  <div>
                    <div class="system-group-title">{{ $t("welcome.data.autoGroupTitle") }}</div>
                    <div class="system-group-meta">昨日本批同步 {{ autoSyncedCount }} / {{ autoSystems.length }}</div>
                  </div>
                  <span class="group-badge group-badge-success">{{ $t("welcome.data.auto") }}</span>
                </div>

                <div class="system-grid">
                  <div v-for="sys in autoSystems" :key="`auto-${sys.name}`" class="system-item">
                    <div class="sys-icon" :class="sys.status">
                      <component :is="sys.icon" />
                    </div>
                    <div class="sys-info">
                      <div class="sys-main-line">
                        <span class="sys-name">{{ sys.name }}</span>
                        <!-- <span class="sys-sep">/</span> -->
                        <!-- <span class="sys-desc">{{ sys.desc }}</span> -->
                      </div>
                      <div class="sys-status-row">
                        <span class="sys-status">{{ sys.statusText }}</span>
                        <span class="sys-time" v-if="sys.uploadTime">{{ sys.uploadTime }}</span>
                        <span
                          v-if="sys.uploadCycle"
                          class="sys-upload-cycle"
                          :class="{ 'sys-upload-cycle-weak': sys.uploadCycleWeak }"
                          :title="sys.uploadCycleWeak ? sys.uploadCycle : undefined"
                        >
                          {{ sys.uploadCycleWeak ? "按需" : sys.uploadCycle }}
                        </span>
                        <span class="sys-type-tag sys-type-tag-auto">{{ $t("welcome.data.auto") }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </section>

      </template>

      <template v-else>
        <section class="page-section">
          <div class="section-heading">
            <h2 class="section-title">{{ $t("welcome.opportunityPipeline") }}</h2>
          </div>

          <el-card shadow="hover" class="content-card funnel-card" id="step-user-opportunities">
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
      </template>

     

      <section class="page-section" v-if="isAdmin">
        <div class="section-heading">
          <div class="section-title-row">
            <h2 class="section-title">{{ $t("dashboard.dataMonitor.qualityTitle") }}</h2>
            <span class="section-desc-inline">统计范围为过去 7 天，按日汇总展示</span>
          </div>
        </div>

        <el-card shadow="hover" class="content-card chart-card-welcome">
          <div class="chart-body-welcome">
            <ECharts :option="dataVolumeChartOption" :height="320" />
          </div>
        </el-card>
      </section>
    </div>
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
  TrendCharts,
  Connection,
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
  Upload,
  Download,
  Filter,
  MagicStick
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const userInfo = computed(() => userStore.userInfo);
type StatusTagType = "success" | "warning" | "info" | "primary" | "danger";

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

const isAdmin = computed(() => getRoleFromStorage() === "admin");

// 上传频率排序权重：数字越小越靠前（频率越高越靠前）
const UPLOAD_CYCLE_ORDER: Record<string, number> = {
  每天: 1,
  每周五: 2,
  每周五上传: 2,
  "每周五上传": 2,
  每月第二个周五: 3,
  "T+1 同步": 4,
  按需: 5
};

const getUploadCycleSortKey = (sys: { uploadCycle?: string; uploadCycleWeak?: boolean }) => {
  if (sys.uploadCycleWeak) return UPLOAD_CYCLE_ORDER["按需"] ?? 99;
  const key = sys.uploadCycle?.trim() || "";
  if (key.includes("按需")) return UPLOAD_CYCLE_ORDER["按需"] ?? 99;
  return UPLOAD_CYCLE_ORDER[key] ?? 99;
};

// 当日数据采集来源（按上传频率排序：每天 → 每周五 → 每月第二个周五 → 按需）
// - type = "manual" 表示当日手工上传，点击需要跳转到数据质量工作台并自动弹出对应报表的上传框
// - type = "auto" 表示 T+1 / 实时系统同步结果，只查看同步状态
const sourceSystems = computed(() => [
  // 手工表（Manual）- 按上传频率从高到低排列
  {
    name: "WWS",
    type: "manual",
    reportSource: "wws",
    reportId: "wws_activity",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "活动列表",
    uploadTime: "昨日 18:00",
    uploadCycle: "每天",
    icon: Monitor
  },
  {
    name: "Voucher",
    type: "manual",
    reportSource: "voucher",
    reportId: "voucher_member_benefit_stats",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "会员优惠信息统计表",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Ticket
  },
  {
    name: "Voucher",
    type: "manual",
    reportSource: "voucher",
    reportId: "voucher_balance_detail",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "优惠券余额报表明细",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Ticket
  },
  {
    name: "Voucher",
    type: "manual",
    reportSource: "voucher",
    reportId: "voucher_member_addon_sales",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "会员附加销售报表",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Ticket
  },
  {
    name: "POAS",
    type: "manual",
    reportSource: "poas",
    reportId: "poas_opp",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "商机表",
    uploadTime: "昨日 18:00",
    uploadCycle: "每周五",
    icon: Tickets
  },
  {
    name: "C@P系统",
    type: "manual",
    reportSource: "cap",
    reportId: "cap_vehicle",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "车辆报告",
    uploadTime: "昨日 18:00",
    uploadCycle: "每周五",
    icon: Upload
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_ins_renewal_sales",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "续保销售记录",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Document
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_ins_new_sales",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "新保销售记录",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Document
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_client_base_table",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "客户基盘表",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Document
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_replace_approval",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "推荐置换再购审批记录",
    uploadTime: "昨日 18:00",
    uploadCycle: "每月第二个周五",
    icon: Document
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_offline_marketing_segment",
    status: "success",
    statusText: t("welcome.data.status.uploaded"),
    desc: "线下营销/社群活动分群",
    uploadTime: "昨日 18:00",
    uploadCycle: "按需上传,上传后T+1生效",
    uploadCycleWeak: true,
    icon: Document
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_generic_opportunity",
    status: "gray",
    statusText: t("welcome.data.status.pendingUpload"),
    desc: "自定义通用商机",
    uploadCycle: "按需上传,上传后T+1生效",
    uploadCycleWeak: true,
    icon: Upload
  },
  {
    name: "Manual Files",
    type: "manual",
    reportSource: "manual",
    reportId: "manual_ttr",
    status: "gray",
    statusText: t("welcome.data.status.pendingUpload"),
    desc: "TTR",
    uploadCycle: "按需上传,上传后T+1生效",
    uploadCycleWeak: true,
    icon: Upload
  },

  // 直连数据库（Auto）
  {
    name: "BDC",
    type: "auto",
    status: "success",
    statusText: t("welcome.data.status.synced"),
    desc: "BDC 外呼系统数据",
    uploadTime: "T+1 09:00",
    uploadCycle: "T+1 同步",
    icon: Service
  },
  {
    name: "DMS",
    type: "auto",
    status: "success",
    statusText: t("welcome.data.status.synced"),
    desc: "DMS 主数据",
    uploadTime: "T+1 09:00",
    uploadCycle: "T+1 同步",
    icon: Monitor
  },
  {
    name: "WeCom",
    type: "auto",
    status: "success",
    statusText: t("welcome.data.status.synced"),
    desc: "微信互动数据",
    uploadTime: "T+1 09:00",
    uploadCycle: "T+1 同步",
    icon: Connection
  },
  {
    name: "Voucher",
    type: "auto",
    status: "success",
    statusText: t("welcome.data.status.synced"),
    desc: "Voucher 数据",
    uploadTime: "T+1 09:00",
    uploadCycle: "T+1 同步",
    icon: Ticket
  }
]);

const manualSystems = computed(() =>
  sourceSystems.value
    .filter((s): s is (typeof sourceSystems.value)[0] & { type: "manual" } => s.type === "manual")
    .sort((a, b) => getUploadCycleSortKey(a) - getUploadCycleSortKey(b))
);
const autoSystems = computed(() => sourceSystems.value.filter(s => s.type === "auto"));
const manualUploadedCount = computed(() => manualSystems.value.filter(s => s.status === "success").length);
const autoSyncedCount = computed(() => autoSystems.value.filter(s => s.status === "success").length);

const systemStatusSummary = computed<{ text: string; type: StatusTagType }>(() => {
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

const openWorkbenchUpload = (reportId?: string) => {
  const targetReportId = reportId || "manual_generic_opportunity";

  router.push({
    path: "/dataProcess/dataQualityWorkbench",
    query: {
      reportId: targetReportId,
      openPicker: "1",
      // 每次点击都带一个不同的 token，确保路由变更能够触发对端 watcher
      pickerToken: Date.now().toString()
    }
  });
};

const handleSystemClick = (sys: any) => {
  if (sys.type === "manual") {
    openWorkbenchUpload(sys.reportId);
  }
};

const handleUpload = (sys?: any) => {
  openWorkbenchUpload(sys?.reportId);
  ElMessage.info(t("welcome.data.upload.clickUpload"));
};

const opportunities = computed(() => [
  { name: t("welcome.data.opportunity.renewal"), desc: t("welcome.data.opportunity.renewalDesc") },
  { name: t("welcome.data.opportunity.birthday"), desc: t("welcome.data.opportunity.birthdayDesc") },
  { name: t("welcome.data.opportunity.serviceDue"), desc: t("welcome.data.opportunity.serviceDueDesc") },
  { name: t("welcome.data.opportunity.lostLead"), desc: t("welcome.data.opportunity.lostLeadDesc") }
]);

// 顶部业务指标 Mock 数据
// 客户库统计数据（主数据）
const customerStats = ref({
  // 截至当前批次完成后的主数据客户总量
  total: 1342001,
  // 今日客户总量相较于昨日的净增客户数
  incremental: 1245,
  // 以下字段暂未在欢迎页使用，保留给后续扩展
  mergedCount: 85600,
  updatedCount: 234500,
  newMerged: 124,
  newUpdated: 532
});

// 冲突客户统计（待人工 / 规则复核）
const conflictStats = ref({
  // 当前仍未解决、待处理冲突客户总量
  total: 3486,
  // 今日待处理冲突客户数相较于昨日的增量
  incremental: 72
});

// 标签统计（被至少一个标签覆盖的客户）
const tagStats = ref({
  total: 256034,
  incremental: 3210
});

// 分群统计（被纳入任一客户群的客户）
const segmentStats = ref({
  total: 168905,
  incremental: 980
});

// 商机统计（主数据驱动产生的商机）
const opportunityStats = ref({
  total: 4325,
  incremental: 135
});

// 全链路批处理结果 Mock 数据（全部视为已完成状态）
const pipelineSteps = computed(() => {
  return [
    {
      title: "源数据导入",
      main: "8 / 10",
      detail: "本批次计划导入 10 张源表，当前已成功导入 8 张，其余 2 张待下批处理。",
      icon: Download
    },
    {
      title: "清洗通过",
      main: `${formatNumber(118920)} / ${formatNumber(125890)}`,
      detail: "共接收到 125,890 条客户记录，其中 118,920 条通过清洗校验，其余记录存在必填缺失或格式异常。",
      icon: Filter
    },
    {
      title: "参与合并",
      main: `${formatNumber(2345)} / ${formatNumber(9840)}`,
      detail: "识别出 2,345 名新增主数据客户，并对 9,840 名既有客户进行了主数据属性更新。",
      icon: User
    },
    {
      title: "新增冲突",
      main: formatNumber(86),
      detail: "在本批处理中产生 86 名冲突客户，等待人工或规则进一步复核处理。",
      icon: WarningFilled
    }
  ];
});

// 顶部业务指标：全量 & 增量（共 8 个块级元素）
const topFullIndicators = computed(() => {
  return [
    {
      label: "客户总量",
      value: formatNumber(customerStats.value.total),
      iconClass: "primary-bg"
    },
    {
      label: "冲突总量",
      value: formatNumber(conflictStats.value.total),
      iconClass: "warning-bg"
    },
    {
      label: "标签总量",
      value: formatNumber(tagStats.value.total),
      iconClass: "purple-bg"
    },
    {
      label: "分群总量",
      value: formatNumber(segmentStats.value.total),
      iconClass: "success-bg"
    }
  ];
});

const topIncrementalIndicators = computed(() => {
  return [
    {
      label: "客户增量",
      value: "+" + formatNumber(customerStats.value.incremental),
      iconClass: "primary-bg"
    },
    {
      label: "冲突增量",
      value: "+" + formatNumber(conflictStats.value.incremental),
      iconClass: "warning-bg"
    },
    {
      label: "标签增量",
      value: "+" + formatNumber(tagStats.value.incremental),
      iconClass: "purple-bg"
    },
    {
      label: "分群增量",
      value: "+" + formatNumber(segmentStats.value.incremental),
      iconClass: "success-bg"
    }
  ];
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
  dataVolume: "850 GB"
});

const heroStatus = computed<{ text: string; type: StatusTagType }>(() => {
  if (isAdmin.value) return systemStatusSummary.value;

  return {
    text: `新增 ${formatNumber(opportunityStats.value.incremental)} 条`,
    type: "success"
  };
});

// 数据接入与质量 - 过去一周按日期的每日总量柱状图（静态假数据）
const getPastSevenDays = () => {
  const days: { label: string; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    days.push({
      label: `${m}/${day}`,
      date: `${d.getFullYear()}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    });
  }
  return days;
};
const dataVolumeDateLabels = getPastSevenDays();
// 过去七天每天的总量（示例数据，可按接口替换）
const dataVolumeDailyTotals = [1200, 932, 2013, 934, 1290, 1430, 1220];
const dataVolumeChartOption = computed<ECOption>(() => {
  const chartData = dataVolumeDailyTotals;
  const xAxisData = dataVolumeDateLabels.map(d => d.label);
  return {
    grid: { top: 40, right: 24, bottom: 32, left: 56, containLabel: false },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        if (Array.isArray(params) && params[0]) {
          const dataIndex = params[0].dataIndex;
          const value = params[0].value;
          const dateFull = dataVolumeDateLabels[dataIndex]?.date ?? "";
          return `${dateFull}<br/>${t("dashboard.dataMonitor.dataVolume")}: ${formatNumber(value)}`;
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
  padding: 24px;
  background: radial-gradient(circle at top right, rgba(64, 158, 255, 0.06), transparent 26%),
    linear-gradient(180deg, #f8fafc 0%, var(--el-bg-color-page) 38%);
}

.welcome-shell {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px 24px;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(135deg, #fbfdff 0%, #eef5ff 56%, #ffffff 100%);
  border: 1px solid rgba(64, 158, 255, 0.12);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.hero-copy,
.hero-toolbar {
  position: relative;
  z-index: 1;
}

.hero-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.hero-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 38px;
  font-weight: 700;
  line-height: 1.1;
}

.hero-user-name {
  color: var(--el-color-primary);
}

.hero-subtitle {
  max-width: 640px;
  margin: 10px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.hero-toolbar {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  color: #475569;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
  margin-top: 0;

  :deep(.el-button) {
    min-width: 142px;
    box-shadow: 0 8px 18px rgba(64, 158, 255, 0.12);
  }
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(16px);
  opacity: 0.7;
}

.hero-orb-primary {
  top: -88px;
  right: -68px;
  width: 260px;
  height: 260px;
  background: rgba(191, 219, 254, 0.22);
}

.hero-orb-warm {
  bottom: -96px;
  left: 54%;
  width: 180px;
  height: 180px;
  background: rgba(250, 204, 21, 0.1);
}

.page-section {
  margin: 0;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 12px;
}

.section-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.section-desc-inline {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 400;
}

.section-desc {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.indicator-board {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.indicator-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  padding: 14px 4px;

  & + .indicator-row {
    border-top: 1px solid #edf2f7;
  }
}

.indicator-side {
  display: flex;
  align-items: center;
}

.indicator-side-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 8px 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  background: #f8fafc;
  border-radius: 12px;
}

.indicator-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.indicator-mini-card {
  position: relative;
  padding: 14px 16px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);

  &::before {
    position: absolute;
    top: 0;
    left: 16px;
    width: 40px;
    height: 4px;
    content: "";
    border-radius: 999px;
  }

  &.primary-bg {
    background: linear-gradient(180deg, rgba(64, 158, 255, 0.08), #ffffff 62%);

    &::before {
      background: var(--el-color-primary);
    }
  }

  &.warning-bg {
    background: linear-gradient(180deg, rgba(230, 162, 60, 0.1), #ffffff 62%);

    &::before {
      background: var(--el-color-warning);
    }
  }

  &.purple-bg {
    background: linear-gradient(180deg, rgba(142, 68, 173, 0.1), #ffffff 62%);

    &::before {
      background: #8e44ad;
    }
  }

  &.success-bg {
    background: linear-gradient(180deg, rgba(103, 194, 58, 0.1), #ffffff 62%);

    &::before {
      background: var(--el-color-success);
    }
  }
}

.indicator-label {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 600;
}

.indicator-value {
  display: block;
  margin-top: 10px;
  color: var(--el-text-color-primary);
  font-family: DIN, "DIN Alternate", "Arial Narrow", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.content-card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.94);
  border: none;
  border-radius: 22px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);

  :deep(.el-card__body) {
    padding: 22px;
  }
}

.system-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.system-section-split {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 1fr);
  gap: 32px;
  align-items: start;
}

.system-group {
  padding: 20px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid #edf2f7;
  border-radius: 20px;
  height: 100%;
}

.system-group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.system-group-title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
}

.system-group-meta {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.group-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
}

.group-badge-primary {
  color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.12);
}

.group-badge-success {
  color: var(--el-color-success);
  background: rgba(103, 194, 58, 0.12);
}

.system-group-auto {
  background: rgba(103, 194, 58, 0.06);
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.system-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 18px;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  }
}

.system-item.is-clickable {
  cursor: pointer;
}

.sys-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  font-size: 20px;
  border-radius: 14px;
  background: #eff6ff;

  &.success {
    color: var(--el-color-success);
    background: rgba(103, 194, 58, 0.12);
  }

  &.warning {
    color: var(--el-color-warning);
    background: rgba(230, 162, 60, 0.12);
  }

  &.error {
    color: var(--el-color-danger);
    background: rgba(245, 108, 108, 0.12);
  }

  &.gray {
    color: #000;
    background: rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.12);
    animation: pulse-upload 2s ease-in-out infinite;
  }
}

.sys-info {
  flex: 1;
  min-width: 0;
}

.sys-main-line {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.sys-name {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
}

.sys-sep {
  color: var(--el-text-color-placeholder);
}

.sys-desc {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.sys-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
}

.sys-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  color: #475569;
  font-size: 12px;
  background: #f8fafc;
  border-radius: 999px;
}

.sys-time {
  color: var(--el-color-success);
  font-size: 12px;
  font-weight: 700;
}

.sys-upload-cycle {
  color: var(--el-color-danger);
  font-size: 12px;
  font-weight: 500;
}

.sys-upload-cycle-weak {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  font-weight: 400;
}

.sys-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  color: var(--el-color-primary);
  font-size: 12px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 999px;
}

.sys-type-tag-auto {
  color: var(--el-color-success);
  background: rgba(103, 194, 58, 0.12);
}

.sys-upload-link {
  margin-left: auto;
}

.chart-card-welcome {
  :deep(.el-card__body) {
    padding: 20px 24px 16px;
  }
}

.chart-body-welcome {
  width: 100%;
  min-height: 320px;
}

.pipeline-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.pipeline-stage {
  position: relative;
  padding: 18px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);

  &:not(:last-child)::after {
    position: absolute;
    top: 34px;
    right: -14px;
    width: 14px;
    height: 2px;
    content: "";
    background: #d7e5f2;
  }
}

.pipeline-stage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pipeline-stage-index {
  color: #94a3b8;
  font-family: DIN, "DIN Alternate", "Arial Narrow", sans-serif;
  font-size: 16px;
  font-weight: 700;
}

.step-icon-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--el-color-success), #8ad75a);
  border-radius: 999px;
  box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.18);
}

.pipeline-stage-title {
  margin-top: 16px;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 700;
}

.pipeline-stage-main {
  margin-top: 10px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  line-height: 1.65;
}

.pipeline-stage-detail {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.step-detail-icon {
  color: var(--el-color-info);
  font-size: 14px;
  cursor: pointer;
}

.opportunity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.opp-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.08), #ffffff 38%);
  border: 1px solid rgba(64, 158, 255, 0.14);
  border-radius: 20px;
}

.opp-name {
  display: block;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 700;
}

.opp-desc {
  display: block;
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.opp-action {
  :deep(.el-button) {
    min-width: 124px;
  }
}

.quick-nav-panel {
  padding: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.nav-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 18px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid #edf2f7;
  border-radius: 18px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);

    .nav-item-arrow {
      color: var(--el-color-primary);
      transform: translateX(3px);
    }
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;

  &.icon-blue {
    color: #409eff;
    background: rgba(64, 158, 255, 0.12);
  }

  &.icon-purple {
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.12);
  }

  &.icon-orange {
    color: #f97316;
    background: rgba(249, 115, 22, 0.12);
  }

  &.icon-green {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.12);
  }

  &.icon-red {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.12);
  }

  &.icon-cyan {
    color: #06b6d4;
    background: rgba(6, 182, 212, 0.12);
  }

  &.icon-yellow {
    color: #eab308;
    background: rgba(234, 179, 8, 0.12);
  }

  &.icon-pink {
    color: #ec4899;
    background: rgba(236, 72, 153, 0.12);
  }

  &.icon-indigo {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.12);
  }

  &.icon-teal {
    color: #0f766e;
    background: rgba(15, 118, 110, 0.12);
  }

  &.icon-default {
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
  }
}

.nav-content {
  min-width: 0;
}

.nav-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.nav-item-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

@keyframes pulse-upload {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.16);
  }

  50% {
    box-shadow: 0 0 0 6px rgba(64, 158, 255, 0);
  }
}

@media (max-width: 1400px) {
  .pipeline-grid {
    grid-template-columns: 1fr;
  }

  .hero-main {
    grid-template-columns: 1fr;
  }

  .hero-toolbar {
    align-items: flex-start;
  }

  .hero-meta,
  .hero-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  .welcome-container {
    padding: 18px;
  }

  .welcome-hero {
    padding: 22px;
    border-radius: 24px;
  }

  .hero-title {
    font-size: 34px;
  }

  .system-grid,
  .quick-nav-grid {
    grid-template-columns: 1fr;
  }

  .system-section-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .welcome-container {
    padding: 14px;
  }

  .welcome-shell {
    gap: 18px;
  }

  .welcome-hero {
    gap: 16px;
    padding: 18px;
    border-radius: 22px;
  }

  .hero-title {
    font-size: 30px;
  }

  .hero-meta,
  .hero-actions {
    gap: 10px;
  }

  .hero-actions {
    align-items: stretch;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .quick-nav-panel,
  .indicator-board {
    padding: 18px;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-title {
    font-size: 18px;
  }

  .indicator-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .indicator-grid {
    grid-template-columns: 1fr;
  }

  .content-card {
    :deep(.el-card__body) {
      padding: 18px;
    }
  }

  .system-group {
    padding: 16px;
  }

  .system-group-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .system-item,
  .nav-item,
  .opp-item {
    padding: 14px;
  }

  .opp-item {
    grid-template-columns: 1fr;
  }

  .opp-action {
    width: 100%;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .pipeline-stage {
    padding: 16px;

    &::after {
      display: none;
    }
  }

  .nav-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .nav-item-arrow {
    display: none;
  }
}
</style>

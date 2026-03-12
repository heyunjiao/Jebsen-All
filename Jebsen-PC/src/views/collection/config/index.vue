<template>
  <div class="collection-config-container">
    <el-card shadow="hover" class="config-card">
      <template #header>
        <div class="card-header">
          <div class="header-content">
            <h2 class="card-title">{{ $t("collection.config.title") }}</h2>
            <p class="card-subtitle">{{ $t("collection.config.subtitle") }}</p>
          </div>
        </div>
      </template>

      <el-tabs
        v-model="activeTab"
        tab-position="left"
        class="config-tabs"
      >
        <el-tab-pane
          v-for="item in manualReports"
          :key="item.reportId"
          :name="item.reportId"
        >
          <template #label>
            <div class="config-tab-label">
              <div class="config-tab-platform">
                {{ item.platformLabel }}
              </div>
              <div class="config-tab-name">
                {{ item.reportName }}
              </div>
            </div>
          </template>
          <div class="tab-content">
            <el-form
              ref="configFormRef"
              :model="configForm"
              :rules="formRules"
              label-position="left"
              class="config-form"
              :label-width="'120px'"
            >
              <!-- 单报表配置表单：直接平铺在右侧 -->
              <div class="platform-list">
                <div class="platform-item">
                  <PlatformConfigCard
                    :platform="item.platformLabel as DataPlatform"
                    :category="'手动上传'"
                    :report-name="item.reportName"
                    :employees="employeeList"
                    :config="getReportConfig(item.platformKey, item.reportId)"
                    @update="cfg => handleReportUpdate(item.platformKey, item.reportId, item.reportName, cfg)"
                  />
                </div>
              </div>

              <!-- 兜底抄送（仅针对手动上传催收使用） -->
              <div class="common-config-section">
                <div class="section-block">
                  <div class="section-header">
                    <div class="section-title-wrapper">
                      <el-icon class="section-icon"><Message /></el-icon>
                      <h3 class="section-title">{{ $t("collection.config.recipients.hardcodedCC.title") }}</h3>
                    </div>
                    <el-tag type="warning" size="small" effect="plain">兜底保障</el-tag>
                  </div>
                  <p class="section-desc">
                    {{ $t("collection.config.recipients.hardcodedCC.desc") }}
                  </p>

                  <el-form-item prop="ccEmail" :label="$t('collection.config.recipients.hardcodedCC.fallbackEmail')" required>
                    <el-input
                      v-model="configForm.ccEmail"
                      :placeholder="$t('collection.config.recipients.hardcodedCC.placeholder')"
                      clearable
                      class="email-input"
                    >
                      <template #prefix>
                        <el-icon class="el-input__icon"><Message /></el-icon>
                      </template>
                    </el-input>
                    <div class="form-tip">
                      <el-icon><InfoFilled /></el-icon>
                      <span>建议填写数据团队公共邮箱或管理员邮箱，确保告警不遗漏</span>
                    </div>
                  </el-form-item>
                </div>

                <div class="form-actions">
                  <el-button type="primary" :loading="saving" @click="saveConfig">
                    <el-icon><Check /></el-icon>
                    {{ $t("collection.config.recipients.save") }}
                  </el-button>
                  <el-button @click="resetConfig">
                    <el-icon><Refresh /></el-icon>
                    {{ $t("collection.config.recipients.reset") }}
                  </el-button>
                </div>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { Message, Check, Refresh, InfoFilled, Shop } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { getCollectionConfig, saveCollectionConfig, getEmployeeList } from "@/api/modules/collection";
import type { CollectionConfig, PlatformConfig, DataPlatform, Employee } from "../interface";
import { PLATFORM_REPORTS, DATA_PLATFORM_LABELS } from "../constants";
import PlatformConfigCard from "./components/PlatformConfigCard.vue";
import { createDefaultGlobalRules } from "../globalRules";

const { t } = useI18n();

const activeTab = ref("");
const configFormRef = ref<FormInstance>();
const saving = ref(false);
const employeeList = ref<Employee[]>([]);
const loadingEmployees = ref(false);

// 手动上传平台映射 (Key -> Label)
const manualPlatformsMap = computed(() => {
  const map: Record<string, string> = {};
  // 只包含手动上传的平台 key
  const keys = ["poas", "wws", "cap", "voucher", "manual"];
  keys.forEach(key => {
    map[key] = DATA_PLATFORM_LABELS[key] || key.toUpperCase();
  });
  return map;
});

// 标准化姓名（去掉多余空格、忽略大小写）
const normalizeName = (name: string) => name.replace(/\s+/g, " ").trim().toLowerCase();

// 通过姓名查找员工 ID（宽松匹配 "Christopher Xu"）
const findEmployeeIdByName = (name: string) => {
  const target = normalizeName(name);
  const emp = employeeList.value.find(e => normalizeName(e.name) === target);
  return emp ? emp.id : null;
};

// 通过姓名查找员工邮箱（宽松匹配）
const findEmployeeEmailByName = (name: string) => {
  const target = normalizeName(name);
  const emp = employeeList.value.find(e => normalizeName(e.name) === target);
  return emp ? emp.email : "";
};

// 获取默认负责人 ID：只使用 Christopher Xu
const getDefaultEmployeeIdForReport = (platformKey: string | undefined, reportId?: string, reportName?: string) => {
  const chrisId = findEmployeeIdByName("Christopher Xu");

  if (chrisId) {
    return chrisId;
  }

  // 如果找不到 Christopher Xu，则不设置默认负责人
  return null;
};

// 根据平台展示名称反推 key
const getPlatformKeyByLabel = (label: string): string | undefined => {
  const entry = Object.entries(DATA_PLATFORM_LABELS).find(([, val]) => val === label);
  return entry ? entry[0] : undefined;
};

// 手动上传报表扁平列表（用于左侧一级 Tab）
const manualReports = computed(() => {
  const list: {
    platformKey: string;
    platformLabel: string;
    reportId: string;
    reportName: string;
  }[] = [];

  Object.entries(manualPlatformsMap.value).forEach(([platformKey, platformLabel]) => {
    const reports = PLATFORM_REPORTS[platformKey] || [];
    reports.forEach(report => {
      list.push({
        platformKey,
        platformLabel,
        reportId: report.id,
        reportName: report.name
      });
    });
  });

  return list;
});

// 初始化配置表单
const configForm = reactive<CollectionConfig>({
  platforms: [],
  ccEmail: "",
  globalRules: createDefaultGlobalRules()
});

// 获取指定报表的配置
const getReportConfig = (platformKey: string, reportId: string): PlatformConfig | undefined => {
  const platformLabel = manualPlatformsMap.value[platformKey] as DataPlatform;
  return configForm.platforms.find(p => p.platform === platformLabel && p.reportId === reportId);
};

// 处理报表配置更新
const handleReportUpdate = (platformKey: string, reportId: string, reportName: string, updatedConfig: PlatformConfig) => {
  const platformLabel = manualPlatformsMap.value[platformKey] as DataPlatform;
  const index = configForm.platforms.findIndex(p => p.platform === platformLabel && p.reportId === reportId);

  // 确保 updatedConfig 包含必要信息
  const fullConfig: PlatformConfig = {
    ...updatedConfig,
    platform: platformLabel,
    reportId,
    reportName
  };

  if (index >= 0) {
    configForm.platforms[index] = fullConfig;
  } else {
    configForm.platforms.push(fullConfig);
  }
};

// 表单验证规则
const formRules: FormRules = {
  ccEmail: [
    { required: true, message: t("collection.config.recipients.emailRequired"), trigger: "blur" },
    { type: "email", message: t("collection.config.recipients.emailFormat"), trigger: "blur" }
  ]
};

// 确保员工列表中存在 Christopher Xu （前端兜底创建）
const ensureChristopherExists = () => {
  const targetName = "Christopher Xu";
  const targetEmail = "christopher.xu@company.com";
  const exists = employeeList.value.some(emp => normalizeName(emp.name) === normalizeName(targetName));
  if (!exists) {
    const maxId = employeeList.value.reduce((max, emp) => Math.max(max, emp.id || 0), 0);
    employeeList.value.push({
      id: maxId + 1,
      name: targetName,
      email: targetEmail,
      status: "active"
    });
  }
};

// 加载员工列表
const loadEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const res = await getEmployeeList();
    if (res.code === 200 && res.data) {
      employeeList.value = res.data.filter(emp => emp.status !== "resigned"); // 只显示在职员工
      // 前端兜底补充 Christopher Xu
      ensureChristopherExists();
    }
  } catch (error) {
    console.error("加载员工列表失败:", error);
    ElMessage.error("加载员工列表失败");
  } finally {
    loadingEmployees.value = false;
  }
};

// 加载配置
const loadConfig = async () => {
  try {
    const res = await getCollectionConfig();
    if (res.code === 200 && res.data) {
      if (res.data.platforms && res.data.platforms.length > 0) {
        configForm.platforms = res.data.platforms;
        // 如果前两个阶段没有员工，设置默认值
        configForm.platforms.forEach(platform => {
          const platformKey = getPlatformKeyByLabel(platform.platform);
          const defaultEmployeeId = getDefaultEmployeeIdForReport(platformKey, platform.reportId, platform.reportName);

          if (platform.schedules[0] && platform.schedules[0].employeeIds.length === 0 && defaultEmployeeId) {
            platform.schedules[0].employeeIds = [defaultEmployeeId];
          }
          if (platform.schedules[1] && platform.schedules[1].employeeIds.length === 0 && defaultEmployeeId) {
            platform.schedules[1].employeeIds = [defaultEmployeeId];
          }
        });
      } else {
        // 如果没有平台配置，初始化所有平台
        initDefaultPlatforms();
      }
      // 兜底邮箱：如果后端没返回，就默认用 Christopher Xu 的邮箱
      configForm.ccEmail = res.data.ccEmail || findEmployeeEmailByName("Christopher Xu") || "";
      // 全局规则：如果后端没有返回，则使用默认配置
      if (res.data.globalRules && res.data.globalRules.length > 0) {
        configForm.globalRules = res.data.globalRules;
      } else {
        configForm.globalRules = createDefaultGlobalRules();
      }
    }
  } catch (error) {
    console.error("加载配置失败:", error);
    initDefaultPlatforms();
  }
};

// 将所有阶段的默认收件人统一设置为 Christopher Xu（如果存在）
const applyDefaultRecipientToAllSchedules = () => {
  const chrisId = findEmployeeIdByName("Christopher Xu");
  if (!chrisId) return;

  configForm.platforms.forEach(platform => {
    platform.schedules.forEach(schedule => {
      if (!schedule) return;
      schedule.employeeIds = [chrisId];
    });
  });

  // 如果兜底邮箱还没设置，也默认成 Christopher Xu 的邮箱
  if (!configForm.ccEmail) {
    configForm.ccEmail = findEmployeeEmailByName("Christopher Xu") || "";
  }
};

// 初始化默认平台配置
const initDefaultPlatforms = () => {
  const newPlatforms: PlatformConfig[] = [];

  // 获取所有手动上传的平台 Key
  const keys = Object.keys(manualPlatformsMap.value);

  keys.forEach(key => {
    const platformLabel = manualPlatformsMap.value[key] as DataPlatform;
    const reports = PLATFORM_REPORTS[key] || [];

    reports.forEach(report => {
      const defaultEmployeeId = getDefaultEmployeeIdForReport(key, report.id, report.name);
      newPlatforms.push({
        platform: platformLabel,
        category: "手动上传",
        reportId: report.id,
        reportName: report.name,
        schedules: [
          {
            stage: "T+0",
            time: "18:00",
            employeeIds: defaultEmployeeId ? [defaultEmployeeId] : [],
            description: t("collection.config.recipients.scheduleConfig.stageT0Desc")
          },
          {
            stage: "T+1",
            time: "9:00",
            employeeIds: defaultEmployeeId ? [defaultEmployeeId] : [],
            description: t("collection.config.recipients.scheduleConfig.stageT1Desc")
          },
          {
            stage: "T+2",
            time: "9:00",
            employeeIds: [],
            description: t("collection.config.recipients.scheduleConfig.stageT2Desc")
          },
          {
            stage: "T+3",
            time: "18:00",
            employeeIds: defaultEmployeeId ? [defaultEmployeeId] : [],
            description: t("collection.config.recipients.scheduleConfig.stageT3DescPrefix") || ""
          }
        ]
      });
    });
  });

  configForm.platforms = newPlatforms;
};

// 保存配置
const saveConfig = async () => {
  if (!configFormRef.value) return;

  try {
    await configFormRef.value.validate();

    // 验证每个平台的前两个阶段必须配置收件人
    const hasInvalidPlatform = configForm.platforms.some(platform => {
      // 前两个阶段（索引0和1）必须选择员工
      const stage0Empty = !platform.schedules[0] || platform.schedules[0].employeeIds.length === 0;
      const stage1Empty = !platform.schedules[1] || platform.schedules[1].employeeIds.length === 0;
      return stage0Empty || stage1Empty;
    });

    if (hasInvalidPlatform) {
      ElMessage.warning("前两个阶段必须配置收件人");
      return;
    }

    saving.value = true;

    const res = await saveCollectionConfig(configForm);
    if (res.code === 200) {
      ElMessage.success(t("collection.config.recipients.saveSuccess"));
    } else {
      ElMessage.error(res.msg || "保存失败");
    }
  } catch (error: any) {
    if (error?.message) {
      ElMessage.warning(error.message);
    } else {
      ElMessage.error("保存失败");
    }
  } finally {
    saving.value = false;
  }
};

// 重置配置
const resetConfig = () => {
  ElMessageBox.confirm(t("collection.config.recipients.reset"), t("common.confirm"), {
    type: "warning"
  })
    .then(() => {
      initDefaultPlatforms();
      // 重置后，兜底邮箱也默认恢复为 Christopher Xu
      configForm.ccEmail = findEmployeeEmailByName("Christopher Xu") || "";
      ElMessage.info(t("collection.config.recipients.resetSuccess"));
    })
    .catch(() => {
      // 客户取消
    });
};

onMounted(async () => {
  // 先加载员工列表，再加载配置，这样可以设置默认值
  await loadEmployees();
  await loadConfig();

  // 将所有阶段的默认收件人统一设置为 Christopher Xu
  applyDefaultRecipientToAllSchedules();

  // 默认选中第一个报表 Tab
  if (!activeTab.value && manualReports.value.length > 0) {
    activeTab.value = manualReports.value[0].reportId;
  }
});
</script>

<style scoped lang="scss">
.collection-config-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.config-card {
  :deep(.el-card__header) {
    padding: 18px 20px;
    border-bottom: 1px solid #ebeef5;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  }

  :deep(.el-card__body) {
    padding: 20px;
    background: #ffffff;
  }
}

.config-tabs {
  display: flex;

  :deep(.el-tabs__header.is-left) {
    padding-right: 0;
    margin-right: 16px;

    .el-tabs__nav-wrap {
      margin-right: 0;
    }

    .el-tabs__nav-scroll {
      padding: 4px 8px 4px 0;
    }
  }

  :deep(.el-tabs__content) {
    flex: 1;
    height: 100%;
    overflow: auto;

    .el-tab-pane {
      height: 100%;
    }
  }
}

.config-tab-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  line-height: 1.3;

  .config-tab-platform {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 2px;
  }

  .config-tab-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    max-width: 200px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

:deep(.config-tabs .el-tabs__item) {
  height: auto;
  padding: 8px 10px;
  margin: 4px 0;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  align-items: flex-start;
  justify-content: flex-start;
  white-space: normal;
}

:deep(.config-tabs .el-tabs__item:hover) {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color-lighter);
}

:deep(.config-tabs .el-tabs__item.is-active) {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), #ffffff);

  .config-tab-name {
    color: var(--el-color-primary);
    font-weight: 600;
  }

  .config-tab-platform {
    color: var(--el-color-primary);
  }
}

.global-config-card {
  margin-top: 16px;
}

.card-header {
  .card-title {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: "";
      width: 4px;
      height: 18px;
      background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
      border-radius: 2px;
    }
  }

  .card-subtitle {
    margin: 0;
    font-size: 13px;
    color: #909399;
    line-height: 1.5;
  }
}

.config-tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 16px;
  }
}

.tab-content {
  padding: 4px 0 0;
  display: flex;
  flex-direction: column;
}

.config-main-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.platforms-section {
  margin-bottom: 20px;
}

// .platform-list {
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
//   gap: 16px;
//   padding-bottom: 20px;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }

//   .platform-item {
//     width: 100%;
//   }
// }

.common-config-section {
  padding: 20px 0;
}

.section-block {
  margin-bottom: 20px;
  padding: 18px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    border-color: #c0c4cc;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &:last-of-type {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f2f5;

    .section-title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-icon {
      font-size: 18px;
      color: #409eff;
    }

    .section-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }

  .section-desc {
    margin: 0 0 12px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #f0f9ff 0%, #ecf5ff 100%);
    border-left: 3px solid #409eff;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
  }
}

.global-rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.global-rule-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  .rule-info {
    flex: 1 1 60%;

    .rule-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
    }

    .rule-desc {
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .rule-config {
    flex: 0 0 38%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;

    .threshold-input {
      width: 90px;
    }

    .threshold-suffix {
      font-size: 13px;
      color: #606266;
      margin-right: 4px;
    }

    .extra-recipients-input {
      min-width: 260px;
      max-width: 420px;
    }
  }
}

.form-tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;

  .el-icon {
    color: #409eff;
    font-size: 14px;
    flex-shrink: 0;
  }
}

.email-input {
  max-width: 100%;

  @media (min-width: 768px) {
    max-width: 600px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  .el-button {
    min-width: 100px;
    font-weight: 500;

    &.el-button--primary {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      border: none;

      &:hover {
        background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }
    }
  }
}
</style>

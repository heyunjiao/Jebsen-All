<template>
  <div class="global-rules-config">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t("collection.config.globalRules.title") }}</h1>
      <p class="page-desc">{{ $t("collection.config.globalRules.desc") }}</p>
    </div>

    <!-- 规则配置区域 -->
    <el-form :model="form" label-position="left" class="rules-form">
      <el-collapse v-model="activeNames" class="rules-collapse">
        <el-collapse-item v-for="group in ruleGroups" :key="group.id" :name="group.id" class="rule-group-item">
          <template #title>
            <span class="group-title">{{ group.monitorLabel }}</span>
          </template>

          <div class="group-content">
            <div v-for="row in group.rules" :key="row.key" class="rule-item" :class="{ 'rule-disabled': !row.config.enabled }">
              <div class="rule-label-section">
                <span class="rule-label">{{ row.scenarioLabel }}</span>
                <el-tooltip
                  v-if="row.detailDesc"
                  effect="dark"
                  :content="row.detailDesc"
                  placement="top"
                  :show-after="200"
                  popper-class="custom-tooltip-wrap"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>

              <div class="rule-switch-section">
                <el-switch
                  v-model="row.config.enabled"
                  :active-text="$t('collection.config.globalRules.enabled')"
                  :inactive-text="$t('collection.config.globalRules.disabled')"
                  class="rule-switch"
                />
              </div>

              <div class="rule-control-section">
                <el-select
                  :model-value="getEmailArray(row.config.extraRecipients)"
                  @update:model-value="updateEmailArray(row.config, $event)"
                  :placeholder="$t('collection.config.globalRules.extraRecipientsPlaceholder')"
                  :disabled="!row.config.enabled"
                  filterable
                  allow-create
                  default-first-option
                  multiple
                  class="email-select"
                >
                  <el-option
                    v-for="employee in employees"
                    :key="employee.id"
                    :label="`${employee.name} (${employee.email})`"
                    :value="employee.email"
                  >
                    <div class="employee-option">
                      <span class="employee-name">{{ employee.name }}</span>
                      <span class="employee-email">{{ employee.email }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <el-button type="primary" :loading="saving" @click="save">
        {{ $t("collection.config.recipients.save") }}
      </el-button>
      <el-button :loading="saving" @click="reset">
        {{ $t("collection.config.recipients.reset") }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { getCollectionConfig, saveCollectionConfig, getEmployeeList } from "@/api/modules/collection";
import type { CollectionConfig, CollectionConfigResponse, GlobalRuleConfig, GlobalRuleKey, Employee } from "./interface";
import { createDefaultGlobalRules } from "./globalRules";

const { t } = useI18n();

interface RuleRow {
  key: GlobalRuleKey;
  config: GlobalRuleConfig;
  monitorLabel: string;
  scenarioLabel: string;
  detailDesc?: string;
}

interface RuleGroup {
  id: string;
  monitorLabel: string;
  rules: RuleRow[];
}

const saving = ref(false);
const loading = ref(false);
const activeNames = ref<string[]>(["auto_source", "data_quality", "system_capacity"]);
const originalConfig = ref<CollectionConfig | null>(null);
const employees = ref<Employee[]>([]);

const form = reactive<{
  globalRules: GlobalRuleConfig[];
}>({
  globalRules: createDefaultGlobalRules()
});

const getLabelsByKey = (key: GlobalRuleKey) => {
  switch (key) {
    case "auto_source_stopped":
      return {
        monitorLabel: t("collection.rules.monitorType.autoSource"),
        scenarioLabel: t("collection.rules.scenario.autoSourceStopped"),
        detailDesc: t("collection.config.globalRules.rules.auto_source_stopped.desc")
      };
    case "data_quality_fatal":
      return {
        monitorLabel: t("collection.rules.monitorType.dataQuality"),
        scenarioLabel: t("collection.rules.scenario.dataQualityFatal"),
        detailDesc: t("collection.config.globalRules.rules.data_quality_fatal.desc")
      };
    case "system_capacity_threshold":
      return {
        monitorLabel: t("collection.rules.monitorType.systemCapacity"),
        scenarioLabel: t("collection.rules.scenario.systemCapacity"),
        detailDesc: t("collection.config.globalRules.rules.system_capacity_threshold.desc")
      };
    default:
      return {
        monitorLabel: "",
        scenarioLabel: ""
      };
  }
};

const ruleRows = computed<RuleRow[]>(() =>
  form.globalRules.map(rule => {
    const labels = getLabelsByKey(rule.key);
    return {
      key: rule.key,
      config: rule,
      ...labels
    };
  })
);

const ruleGroups = computed<RuleGroup[]>(() => {
  const rows = ruleRows.value;
  const groups: RuleGroup[] = [
    {
      id: "auto_source",
      monitorLabel: t("collection.rules.monitorType.autoSource"),
      rules: rows.filter(row => row.key === "auto_source_stopped")
    },
    {
      id: "data_quality",
      monitorLabel: t("collection.rules.monitorType.dataQuality"),
      rules: rows.filter(row => row.key === "data_quality_fatal")
    },
    {
      id: "system_capacity",
      monitorLabel: t("collection.rules.monitorType.systemCapacity"),
      rules: rows.filter(row => row.key === "system_capacity_threshold")
    }
  ];
  return groups.filter(group => group.rules.length > 0);
});

// 将逗号分隔的字符串转换为数组（用于 el-select）
const getEmailArray = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map(email => email.trim())
    .filter(email => email);
};

// 将数组转换为逗号分隔的字符串（保存到后端）
const updateEmailArray = (config: GlobalRuleConfig, emails: string[]) => {
  config.extraRecipients = emails
    .map(email => email.trim())
    .filter(email => email)
    .join(",");
};

const mergeGlobalRules = (defaults: GlobalRuleConfig[], fromApi: GlobalRuleConfig[] | undefined) => {
  if (!fromApi || fromApi.length === 0) return defaults;
  const map = new Map<GlobalRuleKey, GlobalRuleConfig>();
  fromApi.forEach(item => {
    map.set(item.key, { ...item });
  });
  return defaults.map(def => {
    const exist = map.get(def.key);
    return exist ? { ...def, ...exist } : def;
  });
};

const load = async () => {
  loading.value = true;
  try {
    const res: CollectionConfigResponse = await getCollectionConfig();
    if (res.code === 200 && res.data) {
      originalConfig.value = res.data;
      form.globalRules = mergeGlobalRules(createDefaultGlobalRules(), res.data.globalRules);
    } else {
      ElMessage.error(res.msg || t("common.requestError"));
    }
  } catch (error) {
    ElMessage.error(t("common.requestError"));
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!originalConfig.value) return;
  saving.value = true;
  try {
    const payload: CollectionConfig = {
      ...originalConfig.value,
      globalRules: form.globalRules
    };
    const res: CollectionConfigResponse = await saveCollectionConfig(payload);
    if (res.code === 200) {
      ElMessage.success(t("collection.config.recipients.saveSuccess"));
      originalConfig.value = res.data;
      form.globalRules = mergeGlobalRules(createDefaultGlobalRules(), res.data.globalRules);
    } else {
      ElMessage.error(res.msg || t("common.requestError"));
    }
  } catch (error) {
    ElMessage.error(t("common.requestError"));
  } finally {
    saving.value = false;
  }
};

const reset = () => {
  ElMessageBox.confirm(t("collection.config.recipients.reset"), t("common.confirm"), {
    type: "warning"
  })
    .then(() => {
      form.globalRules = createDefaultGlobalRules();
      ElMessage.info(t("collection.config.recipients.resetSuccess"));
    })
    .catch(() => {});
};

// 加载员工列表
const loadEmployees = async () => {
  try {
    const res = await getEmployeeList();
    if (res.code === 200 && res.data) {
      employees.value = res.data;
    }
  } catch (error) {
    // 静默失败，不影响主流程
    console.error("加载员工列表失败:", error);
  }
};

onMounted(() => {
  load();
  loadEmployees();
});
</script>

<style scoped lang="scss">
.global-rules-config {
  padding: 20px;
  background: var(--el-bg-color-page, #f5f7fa);
  min-height: calc(100vh - 84px);
}

// 页面标题
.page-header {
  margin-bottom: 16px;
  text-align: left;

  .page-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .page-desc {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

// 表单与折叠面板
.rules-form {
  background: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  padding: 12px 16px 4px;

  .rules-collapse {
    border: none;

    :deep(.el-collapse-item__header) {
      padding: 0 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: transparent;
      border-bottom: 1px solid var(--el-border-color-light);
      height: 40px;
    }

    :deep(.el-collapse-item__wrap) {
      border-top: none;
    }

    :deep(.el-collapse-item__content) {
      padding: 0;
    }
  }

  .group-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .group-content {
    padding: 0 20px 16px;
    background: var(--el-bg-color);
  }

  .rule-item {
    display: grid;
    /* 固定三列宽度，保证上下每行严格对齐：左列文案，中列开关，右列邮箱 */
    grid-template-columns: 360px 120px minmax(0, 1fr);
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    column-gap: 24px;

    &:last-child {
      border-bottom: none;
    }

    &.rule-disabled {
      opacity: 0.6;

      .rule-label {
        color: var(--el-text-color-placeholder);
      }
    }
  }

  .rule-label-section {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .rule-label {
      font-size: 14px;
      color: var(--el-text-color-primary);
      line-height: 1.5;
    }

    .info-icon {
      color: var(--el-text-color-placeholder);
      font-size: 14px;
      cursor: pointer;
      transition: color 0.2s;
      flex-shrink: 0;
      margin-left: 2px;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .rule-switch-section {
    display: flex;
    align-items: center;
    justify-content: center;

    .rule-switch {
      flex-shrink: 0;
    }
  }

  .rule-control-section {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .email-select {
    width: 400px;

    :deep(.employee-option) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .employee-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .employee-email {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-left: 8px;
      }
    }
  }
}

// 操作按钮
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);

  .el-button {
    min-width: 100px;
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .global-rules-config {
    padding: 16px;
  }

  .rules-form {
    .rule-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .rule-switch-section {
      justify-content: flex-start;
    }

    .rule-control-section {
      width: 100%;
      flex-wrap: wrap;
    }

    .email-select {
      width: 100%;
    }
  }

  .form-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>

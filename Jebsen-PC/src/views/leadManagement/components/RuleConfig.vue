<template>
  <div class="rule-config-container table-box">
    <el-alert type="info" :closable="false" show-icon class="sync-notice-alert" style="margin-bottom: 16px">
      <template #title> 分发规则提示：规则更新后即时生效，商机匹配逻辑基于源平台 T+1 同步数据。 </template>
    </el-alert>
    <pro-table
      ref="proTableRef"
      :columns="columns"
      :request-api="loadData"
      :init-param="initParam"
      :pagination="true"
      :tool-button="toolButton"
      :border="true"
      row-key="id"
    >
      <!-- 商机类型列：展示商机类型名称 -->
      <template #leadType="scope">
        <span class="text-ellipsis">
          {{ getLeadTypeLabel(scope.row.leadType) }}
        </span>
      </template>

      <!-- 启用状态列：使用标签样式显示 -->
      <template #enabled="scope">
        <div class="status-cell">
          <el-tag :type="scope.row.enabled ? 'success' : 'info'" size="small" effect="plain">
            {{ scope.row.enabled ? t("ruleConfig.enums.status.enable") : t("ruleConfig.enums.status.disable") }}
          </el-tag>
        </div>
      </template>

    </pro-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";
import { getRuleList, toggleRule } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { getLeadTypeLabel as formatLeadTypeLabel, normalizeLeadTypeList } from "@/constants/leadTypes";
import { LEAD_TYPE_OPTIONS } from "../interface";
const { t } = useI18n();
const proTableRef = ref();

const initParam = reactive({
  pageNum: 1,
  pageSize: 10
});

// 从 LEAD_TYPE_OPTIONS 生成所有商机类型选项，并使用 i18n 翻译
const leadTypeOptions = computed(() => {
  return LEAD_TYPE_OPTIONS.map(option => {
    // 尝试从 i18n 获取翻译，如果没有则使用原始 label
    const i18nKey = `ruleConfig.enums.leadType.${option.value}`;
    const translatedLabel = t(i18nKey);
    // 如果翻译返回的是 key 本身，说明没有翻译，使用原始 label
    const label = translatedLabel !== i18nKey ? translatedLabel : option.label;
    return {
      label,
      value: option.value
    };
  });
});

const pushTargetOptions = computed(() => [{ label: t("ruleConfig.enums.pushTarget.BDC外呼系统"), value: "BDC外呼系统" }]);

const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

const columns = computed<ColumnProps<Lead.RuleConfig>[]>(() => [
  // 批次号
  {
    prop: "batchNo",
    label: t("ruleConfig.columns.batchNo"),
    minWidth: 140
  },
  // 商机类型
  {
    prop: "leadType",
    label: t("ruleConfig.columns.leadType"),
    width: 160,
    enum: leadTypeOptions,
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectLeadType") }
    }
  },
  // 推送人数
  {
    prop: "pushCount",
    label: t("ruleConfig.columns.pushCount"),
    width: 100
  },
  // 优先级
  {
    prop: "priority",
    label: t("ruleConfig.columns.priority"),
    width: 90,
    enum: [
      { label: t("ruleConfig.enums.priority.high"), value: "high" },
      { label: t("ruleConfig.enums.priority.medium"), value: "medium" },
      { label: t("ruleConfig.enums.priority.low"), value: "low" }
    ],
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectPriority") }
    }
  },
  // 推送目标
  {
    prop: "pushTarget",
    label: t("ruleConfig.columns.pushTarget"),
    width: 130,
    enum: pushTargetOptions,
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectTarget") }
    }
  },
  // 启用状态
  {
    prop: "enabled",
    label: t("ruleConfig.columns.enabled"),
    width: 100,
    enum: [
      { label: t("ruleConfig.enums.status.enable"), value: true },
      { label: t("ruleConfig.enums.status.disable"), value: false }
    ],
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectStatus") }
    }
  },
  // 创建人
  {
    prop: "creator",
    label: t("ruleConfig.columns.creator"),
    width: 110
  },
  // 创建时间
  {
    prop: "createdAt",
    label: t("ruleConfig.columns.createdAt"),
    minWidth: 170
  },
  // 创建方式（手工上传 / 平台生成）
  {
    prop: "createMethod",
    label: t("ruleConfig.columns.createMethod"),
    width: 120,
    enum: [
      { label: t("ruleConfig.enums.createMethod.manual_upload"), value: "manual_upload" },
      { label: t("ruleConfig.enums.createMethod.system_generated"), value: "system_generated" }
    ]
  },
]);

const getLeadTypeLabel = (type: string) => {
  return formatLeadTypeLabel(type);
};

const loadData = async (params: any) => {
  const res = await getRuleList(params);
  return {
    ...res,
    data: {
      ...res.data,
      list: normalizeLeadTypeList(res.data?.list || [], "leadType")
    }
  };
};
</script>

<style scoped lang="scss">
.rule-config-container {
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
.text-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-text {
  font-size: 14px;
  color: #303133;
  line-height: 22px;
  padding: 0 8px;
}
.start-audit {
  cursor: help;
}
.schedule-input-wrapper {
  width: 100%;
  .schedule-input {
    :deep(.el-input__inner) {
      cursor: default;
    }
  }
}
.cron-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
</style>

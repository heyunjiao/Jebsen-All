<template>
  <div class="platform-config-card">
    <div class="platform-header">
      <div class="platform-name">
        <span class="platform-label">{{ platform }}</span>
        <span v-if="reportName" class="report-name-label">{{ reportName }}</span>
      </div>
    </div>

    <div class="schedules-list">
      <div
        v-for="(schedule, index) in localConfig.schedules"
        :key="index"
        class="schedule-item"
        :class="[`schedule-item-${index}`, { 'schedule-static': index === 3 }]"
      >
        <div class="schedule-header-compact">
          <div class="schedule-stage">
            <el-select
              v-model="localConfig.schedules[index].stage"
              filterable
              allow-create
              :placeholder="$t('collection.config.platforms.stageNamePlaceholder')"
              class="stage-select"
              @change="handleStageChange"
            >
              <el-option v-for="stage in defaultStages" :key="stage" :label="stage" :value="stage" />
            </el-select>
            <el-time-picker
              v-model="localConfig.schedules[index].time"
              format="HH:mm"
              value-format="HH:mm"
              :placeholder="$t('collection.config.platforms.selectTime')"
              class="time-picker"
              @change="handleTimeChange"
            />
          </div>
          <span v-if="index !== 3" class="schedule-desc-compact">
            {{ getStageDayDesc(index) }}{{ localConfig.schedules[index].time || getDefaultTime(index)
            }}{{ getStageDescSuffix(index) }}
          </span>
          <span v-else class="schedule-desc-compact">T+0</span>
        </div>
        <el-form-item
          :label="$t('collection.config.recipients.scheduleConfig.recipientLabel')"
          class="schedule-recipients"
          :required="true"
        >
          <el-select
            v-model="localConfig.schedules[index].employeeIds"
            multiple
            filterable
            :placeholder="$t('collection.config.platforms.selectEmployees')"
            class="employee-select"
            @change="handleEmployeeChange(index, $event)"
          >
            <el-option
              v-for="employee in availableEmployees"
              :key="employee.id"
              :label="`${employee.name} (${employee.email})`"
              :value="employee.id"
            >
              <div class="employee-option">
                <span class="employee-name">{{ employee.name }}</span>
                <span class="employee-email">{{ employee.email }}</span>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t("collection.config.platforms.multipleEmployeesTip") }}</span>
          </div>
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import type { PlatformConfig, DataPlatform, Employee, PlatformCategory } from "../../interface";

const { t } = useI18n();

interface Props {
  platform: DataPlatform;
  category: PlatformCategory;
  reportName?: string;
  employees: Employee[];
  config?: PlatformConfig;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [config: PlatformConfig];
}>();

// 只保留 Christopher Xu 作为可选收件人；如果暂时找不到他，则回退到全部员工，避免下拉为空
const normalizeName = (name: string) => name.replace(/\s+/g, " ").trim().toLowerCase();
const chrisOnlyEmployees = computed(() => props.employees.filter(e => normalizeName(e.name) === normalizeName("Christopher Xu")));
const availableEmployees = computed(() => (chrisOnlyEmployees.value.length > 0 ? chrisOnlyEmployees.value : props.employees));

// 默认阶段选项（只保留 T+0, T+1, T+2, T+3 格式）
const defaultStages = ["T+0", "T+1", "T+2", "T+3"];

// 本地配置副本
const localConfig = ref<PlatformConfig>({
  platform: props.platform,
  category: props.category,
  schedules:
    props.config?.schedules ||
    [
      {
        stage: "T+0",
        time: "18:00",
        employeeIds: [],
        description: t("collection.config.recipients.scheduleConfig.stageT0Desc")
      },
      {
        stage: "T+1",
        time: "9:00",
        employeeIds: [],
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
        employeeIds: [],
        description: t("collection.config.recipients.scheduleConfig.stageT3DescPrefix") || ""
      }
    ].map(s => ({ ...s }))
});

// 监听外部配置变化
watch(
  () => props.config,
  newConfig => {
    if (newConfig) {
      localConfig.value = {
        ...newConfig,
        schedules: newConfig.schedules.map(s => ({ ...s }))
      };
    }
  },
  { deep: true, immediate: true }
);

// 根据阶段名称获取日期描述
const getStageDayDesc = (index: number): string => {
  const stage = localConfig.value.schedules[index]?.stage || "";

  // 根据阶段名称判断
  if (stage.includes("T+0") || stage === "T+0") {
    return t("collection.config.recipients.scheduleConfig.stageT0DescPrefix");
  } else if (stage.includes("T+1") || stage === "T+1") {
    return t("collection.config.recipients.scheduleConfig.stageT1DescPrefix");
  } else if (stage.includes("T+2") || stage === "T+2") {
    return t("collection.config.recipients.scheduleConfig.stageT2DescPrefix");
  } else if (stage.includes("T+3") || stage === "T+3") {
    return t("collection.config.recipients.scheduleConfig.stageT3DescPrefix");
  }

  // 如果阶段名称不匹配，根据索引判断
  const dayDescMap = [
    t("collection.config.recipients.scheduleConfig.stageT0DescPrefix"),
    t("collection.config.recipients.scheduleConfig.stageT1DescPrefix"),
    t("collection.config.recipients.scheduleConfig.stageT2DescPrefix")
  ];

  return dayDescMap[index] || "";
};

// 获取阶段描述后缀
const getStageDescSuffix = (index: number): string => {
  const suffixMap = [
    t("collection.config.recipients.scheduleConfig.stageT0DescSuffix"),
    t("collection.config.recipients.scheduleConfig.stageT1DescSuffix"),
    t("collection.config.recipients.scheduleConfig.stageT2DescSuffix")
  ];
  return suffixMap[index] || "";
};

// 获取默认时间
const getDefaultTime = (index: number): string => {
  const defaultTimes = ["18:00", "9:00", "9:00", "18:00"];
  return defaultTimes[index] || "9:00";
};

// 处理阶段名称变化
const handleStageChange = () => {
  emit("update", { ...localConfig.value });
};

// 处理时间变化
const handleTimeChange = () => {
  emit("update", { ...localConfig.value });
};

// 统一处理员工选择变化（所有阶段均支持多选）
const handleEmployeeChange = (index: number, value: number | number[]) => {
  localConfig.value.schedules[index].employeeIds = (value as number[]) || [];
  emit("update", { ...localConfig.value });
};
</script>

<style scoped lang="scss">
.platform-config-card {
  padding: 0 0 8px;
  background: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;

  .platform-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .platform-name {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .platform-label {
        font-size: 12px;
        font-weight: 400;
        color: #909399;
      }

      :deep(.el-tag) {
        font-weight: 600;
      }

      .report-name-label {
        font-size: 15px;
        color: #303133;
        font-weight: 600;
        line-height: 1;
      }
    }
  }

  .schedules-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .schedule-item {
    padding: 16px;
    background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    position: relative;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #f0f9ff 0%, #ecf5ff 100%);
      border-color: #b3d8ff;
    }

    // 为不同阶段添加左侧颜色指示
    &.schedule-item-0 {
      border-left: 3px solid #909399;

      &:hover {
        border-left-color: #606266;
      }
    }

    &.schedule-item-1 {
      border-left: 3px solid #e6a23c;

      &:hover {
        border-left-color: #cf9236;
      }
    }

    &.schedule-item-2 {
      border-left: 3px solid #f56c6c;

      &:hover {
        border-left-color: #f78989;
      }
    }

    .schedule-header-compact {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .schedule-stage {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        .stage-select {
          width: 90px;
        }

        .time-picker {
          width: 100px;
        }
      }

      .schedule-desc-compact {
        flex: 1;
        font-size: 13px;
        color: #606266;
        line-height: 1.5;
        min-width: 200px;
      }
    }

    .schedule-recipients {
      margin-bottom: 0;

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #303133;
        font-size: 14px;
        width: 100px !important;
        padding-right: 12px;
        white-space: nowrap;
      }
    }
  }

  .employee-select {
    width: 100%;
  }

  .employee-option {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .employee-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }

    .employee-email {
      font-size: 12px;
      color: #909399;
      margin-left: 12px;
    }
  }

  .schedule-static {
    border-left: 3px solid #67c23a;
    order: -1;

    .schedule-static-title {
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }
  }

  @media (max-width: 1024px) {
    .schedule-item {
      flex: 0 0 100%;
    }
  }

  .form-tip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, #ecf5ff 0%, #e1f3ff 100%);
    border: 1px solid #b3d8ff;
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
}
</style>

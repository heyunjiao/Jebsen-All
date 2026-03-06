<template>
  <div class="collection-monitor-container table-box">
    <pro-table
      ref="proTableRef"
      :columns="columns"
      :request-api="loadData"
      :init-param="initParam"
      :pagination="true"
      :tool-button="toolButton"
      :border="true"
      :row-key="'id'"
      :row-class-name="tableRowClassName"
    >
      <template #tableHeader>
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          {{ $t("collection.monitor.refresh") }}
        </el-button>
      </template>

      <!-- 上传状态列 -->
      <template #uploadStatus="scope">
        <el-tag :type="getUploadStatusType(scope.row.uploadStatus)">
          {{ getUploadStatusLabel(scope.row.uploadStatus) }}
        </el-tag>
      </template>

      <!-- 逾期天数列 -->
      <template #overdueDays="scope">
        <span v-if="scope.row.overdueDays && scope.row.overdueDays > 0" class="overdue-days">
          {{ scope.row.overdueDays }} 天
        </span>
        <span v-else class="text-gray-500">-</span>
      </template>

      <!-- 员工状态列 -->
      <template #status="scope">
        <el-tag :type="getStatusType(scope.row.status)" :effect="scope.row.status === 'resigned' ? 'dark' : 'light'">
          {{ getStatusLabel(scope.row.status) }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #operation="scope">
        <el-button link type="primary" @click="handleNudge(scope.row)">
          <el-icon><Bell /></el-icon>
          {{ $t("collection.monitor.nudge") }}
        </el-button>
      </template>
    </pro-table>

    <!-- 智能手动指派弹窗 -->
    <el-dialog v-model="nudgeDialogVisible" :title="$t('collection.monitor.nudgeDialog.title')" width="500px" destroy-on-close>
      <div class="nudge-content">
        <div v-if="currentNudgeRow?.status === 'resigned'" class="alert-box warning">
          <el-icon><WarningFilled /></el-icon>
          <div>
            <p class="alert-title">{{ $t("collection.monitor.nudgeDialog.resignedAlert.title") }}</p>
            <p class="alert-desc">{{ $t("collection.monitor.nudgeDialog.resignedAlert.desc") }}</p>
          </div>
        </div>

        <el-form ref="nudgeFormRef" :model="nudgeForm" :rules="nudgeFormRules" label-position="top">
          <el-form-item prop="email" :label="$t('collection.monitor.nudgeDialog.recipientEmail')">
            <el-input
              v-model="nudgeForm.email"
              :placeholder="$t('collection.monitor.nudgeDialog.recipientEmailPlaceholder')"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('collection.monitor.nudgeDialog.message')">
            <el-input
              v-model="nudgeForm.message"
              type="textarea"
              :rows="3"
              :placeholder="$t('collection.monitor.nudgeDialog.messagePlaceholder')"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="nudgeDialogVisible = false">{{ $t("collection.monitor.nudgeDialog.cancel") }}</el-button>
          <el-button type="primary" :loading="sending" @click="submitNudge">
            {{ $t("collection.monitor.nudgeDialog.send") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Refresh, Bell, Message, WarningFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getCollectionMonitorList, sendNudge } from "@/api/modules/collection";
import type { CollectionMonitor, EmployeeStatus, UploadStatus, NudgeForm } from "../interface";

const { t } = useI18n();

// 初始化参数
const initParam = reactive({});

// 工具栏按钮配置
const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

// 表格列配置
const columns: ColumnProps<CollectionMonitor>[] = [
  {
    prop: "employeeName",
    label: t("collection.monitor.employeeName"),
    minWidth: 150,
    search: {
      el: "input",
      label: t("collection.monitor.employeeName"),
      props: { placeholder: t("collection.monitor.employeeName") }
    }
  },
  {
    prop: "email",
    label: t("collection.monitor.email"),
    minWidth: 200,
    search: {
      el: "input",
      label: t("collection.monitor.email"),
      props: { placeholder: t("collection.monitor.email") }
    }
  },
  {
    prop: "dataSource",
    label: t("collection.monitor.dataSource"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("collection.monitor.dataSource"),
      props: {
        placeholder: t("collection.monitor.dataSource"),
        options: [
          { label: "DMS", value: "DMS" },
          { label: "BDC", value: "BDC" },
          { label: "CRM", value: "CRM" },
          { label: "ERP", value: "ERP" }
        ]
      }
    }
  },
  {
    prop: "uploadStatus",
    label: t("collection.monitor.uploadStatus"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("collection.monitor.uploadStatus"),
      props: {
        placeholder: t("collection.monitor.uploadStatus"),
        options: [
          { label: t("collection.monitor.uploadStatusPending"), value: "pending" },
          { label: t("collection.monitor.uploadStatusOverdue"), value: "overdue" },
          { label: t("collection.monitor.uploadStatusCompleted"), value: "completed" }
        ]
      }
    }
  },
  {
    prop: "deadline",
    label: t("collection.monitor.deadline"),
    minWidth: 160
  },
  {
    prop: "overdueDays",
    label: t("collection.monitor.overdueDays"),
    minWidth: 100,
    align: "right"
  },
  {
    prop: "status",
    label: t("collection.monitor.status"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("collection.monitor.status"),
      props: {
        placeholder: t("collection.monitor.status"),
        options: [
          { label: t("collection.monitor.statusActive"), value: "active" },
          { label: t("collection.monitor.statusResigned"), value: "resigned" }
        ]
      }
    }
  },
  {
    prop: "operation",
    label: t("common.operation"),
    fixed: "right",
    width: 150,
    align: "center"
  }
];

// 表格引用
const proTableRef = ref();

// 获取上传状态类型
const getUploadStatusType = (status: UploadStatus): "success" | "info" | "warning" | "danger" => {
  const map: Record<UploadStatus, "success" | "info" | "warning" | "danger"> = {
    pending: "warning", // 待上传：黄色
    overdue: "danger", // 已逾期：红色
    completed: "success" // 已完成：绿色
  };
  return map[status] || "info";
};

// 获取上传状态标签
const getUploadStatusLabel = (status: UploadStatus) => {
  const map: Record<UploadStatus, string> = {
    pending: t("collection.monitor.uploadStatusPending"),
    overdue: t("collection.monitor.uploadStatusOverdue"),
    completed: t("collection.monitor.uploadStatusCompleted")
  };
  return map[status] || status;
};

// 获取员工状态类型
const getStatusType = (status: EmployeeStatus): "success" | "info" | "warning" | "danger" => {
  if (status === "resigned") return "info"; // 灰色
  return "success";
};

// 获取员工状态标签
const getStatusLabel = (status: EmployeeStatus) => {
  return status === "resigned" ? t("collection.monitor.statusResigned") : t("collection.monitor.statusActive");
};

// 表格行类名（用于离职状态可视化）
const tableRowClassName = ({ row }: { row: CollectionMonitor }) => {
  if (row.status === "resigned") {
    return "resigned-row";
  }
  return "";
};

// 加载数据
const loadData = async (params: any) => {
  try {
    const res = await getCollectionMonitorList(params);
    // ProTable 期望的返回格式是 { data: { list: [...], total: ... } }
    if (res.code === 200 && res.data) {
      return {
        data: {
          list: res.data.list || [],
          total: res.data.total || 0
        }
      };
    }
    return {
      data: {
        list: [],
        total: 0
      }
    };
  } catch (error) {
    console.error("加载数据失败:", error);
    return {
      data: {
        list: [],
        total: 0
      }
    };
  }
};

// 刷新列表
const handleRefresh = () => {
  proTableRef.value?.getTableList();
};

// 催收弹窗
const nudgeDialogVisible = ref(false);
const currentNudgeRow = ref<CollectionMonitor | null>(null);
const nudgeFormRef = ref<FormInstance>();
const sending = ref(false);

const nudgeForm = reactive<NudgeForm>({
  email: "",
  message: t("collection.monitor.nudgeDialog.messagePlaceholder")
});

// 表单验证规则
const nudgeFormRules: FormRules = {
  email: [
    { required: true, message: t("collection.monitor.nudgeDialog.emailRequired"), trigger: "blur" },
    { type: "email", message: t("collection.monitor.nudgeDialog.emailFormat"), trigger: "blur" }
  ]
};

// 处理催收
const handleNudge = (row: CollectionMonitor) => {
  currentNudgeRow.value = row;
  nudgeDialogVisible.value = true;

  // 智能手动指派：如果状态是离职，清空邮箱，强制管理员输入新邮箱
  if (row.status === "resigned") {
    nudgeForm.email = "";
    nudgeForm.message = t("collection.monitor.nudgeDialog.messagePlaceholder");
  } else {
    // 默认使用员工邮箱
    nudgeForm.email = row.email;
    nudgeForm.message = t("collection.monitor.nudgeDialog.messagePlaceholder");
  }
};

// 提交催收
const submitNudge = async () => {
  if (!nudgeFormRef.value || !currentNudgeRow.value) return;

  try {
    await nudgeFormRef.value.validate();
    sending.value = true;

    const res = await sendNudge({
      employeeId: currentNudgeRow.value.id,
      email: nudgeForm.email,
      message: nudgeForm.message
    });

    if (res.code === 200) {
      ElMessage.success(t("collection.monitor.nudgeDialog.sendSuccess", { email: nudgeForm.email }));
      nudgeDialogVisible.value = false;
      // 刷新列表
      proTableRef.value?.getTableList();
    } else {
      ElMessage.error(res.msg || "发送失败");
    }
  } catch (error: any) {
    if (error?.message) {
      ElMessage.warning(error.message);
    } else {
      ElMessage.error("发送失败");
    }
  } finally {
    sending.value = false;
  }
};
</script>

<style scoped lang="scss">
.collection-monitor-container {
  padding: 20px;
  background: #f9fafb;
  min-height: calc(100vh - 84px);
}

.overdue-days {
  font-weight: 600;
  color: #f56c6c;
}

/* 离职状态可视化：灰色行样式 */
:deep(.el-table .resigned-row) {
  background: #f5f7fa !important; // 浅灰色背景
  color: #909399;

  /* 让文本稍微变淡/变灰以表示非活跃状态 */
  .cell {
    opacity: 0.8;
  }
}

/* 离职标签特定样式 */
:deep(.el-tag--info.el-tag--dark) {
  background-color: #909399;
  border-color: #909399;
  color: #fff;
}

.nudge-content {
  .alert-box {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;

    &.warning {
      background-color: #fdf6ec;
      border: 1px solid #faecd8;
      color: #e6a23c;

      .el-icon {
        font-size: 20px;
        margin-top: 2px;
      }
    }

    .alert-title {
      margin: 0 0 4px;
      font-weight: 600;
      font-size: 14px;
    }

    .alert-desc {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}
</style>

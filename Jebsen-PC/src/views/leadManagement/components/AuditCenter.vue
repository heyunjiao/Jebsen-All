<template>
  <div class="audit-center-container table-box">
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
      <template #leadType="scope">
        <el-tag size="small" type="primary">
          {{ getLeadTypeLabel(scope.row.leadType) }}
        </el-tag>
      </template>

      <!-- 操作类型列 -->
      <template #operation="scope">
        <el-tag :type="getOperationTagType(scope.row.operation) as any" size="small">
          {{ getOperationLabel(scope.row.operation) }}
        </el-tag>
      </template>

      <!-- 结果列 -->
      <template #result="scope">
        <el-tag :type="getResultTagType(scope.row.result) as any" size="small">
          {{ getResultLabel(scope.row.result) }}
        </el-tag>
      </template>

      <!-- 触发规则列 -->
      <template #triggerRule="scope">
        <div v-if="scope.row.ruleName" class="trigger-rule-cell">
          <el-tag type="info" size="small">规则</el-tag>
          <span class="rule-name">{{ scope.row.ruleName }}</span>
        </div>
        <span v-else class="operator-name">{{ scope.row.operator }}</span>
      </template>

      <!-- 操作列 -->
      <template #operationColumn="scope">
        <el-button link type="primary" @click="viewDetail(scope.row)">
          <el-icon><View /></el-icon>
          详情
        </el-button>
        <el-button
          v-if="scope.row.result === 'failed' || scope.row.operation === 'push'"
          link
          type="warning"
          @click="handleReload(scope.row)"
          :loading="reloadingIds.includes(scope.row.id)"
        >
          <el-icon><Refresh /></el-icon>
          重载
        </el-button>
      </template>
    </pro-table>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="商机审计详情" width="1200px" append-to-body @open="handleDialogOpen">
      <!-- 合规提示 -->
      <el-alert
        v-if="showComplianceWarning"
        title="合规提示"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          <div class="compliance-warning">
            <p>您正在查看包含敏感数据的审计记录。根据数据安全法规要求，系统将记录您的访问行为。</p>
            <p>请确保：</p>
            <ul>
              <li>仅在授权范围内使用数据</li>
              <li>不得将数据泄露给未授权人员</li>
              <li>遵守公司数据安全政策</li>
            </ul>
          </div>
        </template>
      </el-alert>

      <audit-detail
        v-if="currentLog"
        :audit-log="currentLog"
        @reload="handleDetailReload"
        @jump-to-customer="handleJumpToCustomer"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { View, Refresh } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";
import { getAuditLogList, getAuditLogDetail, reloadAuditLog } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { getLeadTypeLabel, normalizeLeadTypeField, normalizeLeadTypeList } from "@/constants/leadTypes";
import AuditDetail from "./AuditDetail.vue";

const proTableRef = ref();
const detailVisible = ref(false);
const currentLog = ref<Lead.AuditLog | null>(null);
const showComplianceWarning = ref(false);
const reloadingIds = ref<string[]>([]);

const initParam = reactive({
  pageNum: 1,
  pageSize: 10
});

const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

const columns = reactive<ColumnProps<Lead.AuditLog>[]>([
  {
    prop: "operateTime",
    label: "提供时间",
    width: 180,
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        "range-separator": "至",
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        valueFormat: "YYYY-MM-DD HH:mm:ss"
      }
    }
  },
  {
    prop: "operation",
    label: "操作类型",
    width: 120,
    enum: [
      { label: "创建", value: "create" },
      { label: "推送", value: "push" },
      { label: "更新", value: "update" },
      { label: "重载", value: "reload" },
      { label: "删除", value: "delete" }
    ],
    search: {
      el: "select",
      props: { placeholder: "请选择操作类型" }
    }
  },
  {
    prop: "leadId",
    label: "商机ID",
    width: 150,
    search: {
      el: "input",
      props: { placeholder: "请输入商机ID" }
    }
  },
  {
    prop: "oneId",
    label: "OneID",
    width: 150,
    search: {
      el: "input",
      props: { placeholder: "请输入OneID" }
    }
  },
  {
    prop: "customerName",
    label: "客户姓名",
    width: 120
  },
  {
    prop: "leadType",
    label: "商机类型",
    width: 120
  },
  {
    prop: "targetSystem",
    label: "推送目标系统",
    width: 130,
    enum: [{ label: "BDC系统", value: "BDC外呼系统" }],
    search: {
      el: "select",
      props: { placeholder: "请选择目标系统" }
    }
  },
  {
    prop: "triggerRule",
    label: "操作人/触发规则",
    width: 180,
    search: {
      el: "input",
      props: { placeholder: "请输入操作人或规则名称" }
    }
  },
  {
    prop: "result",
    label: "推送状态",
    width: 100
  },
  {
    prop: "operationColumn",
    label: "操作",
    width: 150,
    fixed: "right"
  }
]);

const loadData = async (params: any) => {
  // 处理时间范围参数
  if (params.operateTime && Array.isArray(params.operateTime) && params.operateTime.length === 2) {
    params.startDate = params.operateTime[0];
    params.endDate = params.operateTime[1];
    delete params.operateTime;
  }
  const res = await getAuditLogList(params);
  return {
    ...res,
    data: {
      ...res.data,
      list: normalizeLeadTypeList(res.data?.list || [], "leadType")
    }
  };
};

// 查看详情
const viewDetail = async (row: Lead.AuditLog) => {
  try {
    // 获取完整详情（包含所有字段）
    const response = await getAuditLogDetail(row.id);
    currentLog.value = normalizeLeadTypeField(response.data || response, "leadType");
    detailVisible.value = true;
    // 显示合规提示
    showComplianceWarning.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "获取详情失败");
  }
};

// 对话框打开时记录访问行为
const handleDialogOpen = () => {
  if (currentLog.value) {
    // 这里可以调用API记录访问行为
    // recordAccessLog(currentLog.value.id);
  }
};

// 详情页重载后刷新列表
const handleDetailReload = () => {
  proTableRef.value?.refresh();
  // 重新获取详情
  if (currentLog.value) {
    getAuditLogDetail(currentLog.value.id).then(response => {
      currentLog.value = normalizeLeadTypeField(response.data || response, "leadType");
    });
  }
};

// 跳转到客户360视图
const handleJumpToCustomer = (oneId: string) => {
  // 这里可以实现跳转逻辑
  ElMessage.info(`跳转到客户 ${oneId} 的360视图`);
  // 可以使用路由跳转
  // router.push({ path: `/customer/360/${oneId}` });
};

// 列表中的重载操作
const handleReload = async (row: Lead.AuditLog) => {
  try {
    await ElMessageBox.confirm("确定要重新推送该商机数据吗？重载操作将重新执行推送过程并下发最新数据。", "数据重载确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    reloadingIds.value.push(row.id);
    await reloadAuditLog(row.id);
    ElMessage.success("重载操作已提交，请稍后刷新查看最新状态");
    proTableRef.value?.refresh();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.message || "重载失败，请稍后重试");
    }
  } finally {
    const index = reloadingIds.value.indexOf(row.id);
    if (index > -1) {
      reloadingIds.value.splice(index, 1);
    }
  }
};

// 获取操作类型标签
const getOperationLabel = (operation: string) => {
  const labelMap: Record<string, string> = {
    create: "创建",
    push: "推送",
    update: "更新",
    reload: "重载",
    delete: "删除"
  };
  return labelMap[operation] || operation;
};

// 获取操作类型标签颜色
const getOperationTagType = (operation: string) => {
  const typeMap: Record<string, string> = {
    create: "success",
    push: "primary",
    update: "warning",
    reload: "info",
    delete: "danger"
  };
  return typeMap[operation] || "info";
};

// 获取结果标签
const getResultLabel = (result: string) => {
  const labelMap: Record<string, string> = {
    success: "成功",
    failed: "失败",
    pending: "待重试"
  };
  return labelMap[result] || result;
};

// 获取结果标签颜色
const getResultTagType = (result: string) => {
  const typeMap: Record<string, string> = {
    success: "success",
    failed: "danger",
    pending: "warning"
  };
  return typeMap[result] || "info";
};
</script>

<style scoped lang="scss">
.audit-center-container {
  .trigger-rule-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .rule-name {
      font-weight: 500;
    }
  }

  .operator-name {
    color: #606266;
  }

  .compliance-warning {
    p {
      margin: 8px 0;

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      margin: 8px 0 0 20px;
      padding: 0;

      li {
        margin: 4px 0;
      }
    }
  }
}
</style>

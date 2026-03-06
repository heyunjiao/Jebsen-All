<template>
  <div class="approval-container">
    <!-- 1. 标签页切换 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="approval-tabs">
      <el-tab-pane>
        <template #label>
          <span class="tab-label">
            <el-icon class="tab-icon"><Clock /></el-icon>
            <span>待我审批</span>
            <el-badge :value="stats.pending" :hidden="stats.pending === 0" class="tab-badge" />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <span class="tab-label">已处理历史</span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 2. 信息提示横幅（仅待我审批显示） -->
    <el-alert v-if="activeTab === 'pending'" type="info" show-icon class="info-alert" :closable="false">
      <template #default>
        <span>这里仅展示需人工决策的数据。系统自动合并成功的数据请移步</span>
        <el-link type="primary" :underline="false" style="margin: 0 2px">【审计日志】</el-link>
        <span>查看。</span>
      </template>
    </el-alert>

    <!-- 3. 审批列表 -->
    <el-card shadow="never" class="table-box">
      <ProTable
        ref="proTable"
        :columns="currentColumns"
        :request-api="fetchApprovalList"
        :tool-button="['refresh', 'setting', 'search']"
        row-key="reqId"
      >
        <!-- 待我审批的 slot -->
        <template #reqId="{ row }">
          <span style="font-size: 14px; color: #303133; font-weight: 400; padding: 4px 0; display: inline-block">
            {{ row.reqId }}
          </span>
        </template>

        <template #mergeTarget="{ row }">
          <div style="display: flex; align-items: center; gap: 10px; padding: 4px 0">
            <span style="font-weight: 500; color: #303133; font-size: 14px">{{ row.sourceName }}</span>
            <el-icon style="color: #c0c4cc; font-size: 14px">
              <ArrowRight />
            </el-icon>
            <span style="font-weight: 500; color: #303133; font-size: 14px">{{ row.targetName }}</span>
          </div>
        </template>

        <template #triggerSource="{ row }">
          <div class="trigger-source-cell">
            <div class="trigger-source-avatar">
              <div v-if="getTriggerSourceType(row) === '人工提交'" class="avatar-circle">
                {{ getTriggerSourceName(row).charAt(0).toUpperCase() }}
              </div>
              <div v-else class="avatar-square">
                <span>O</span>
              </div>
            </div>
            <div class="trigger-source-info">
              <div class="trigger-source-name">{{ getTriggerSourceName(row) }}</div>
              <div class="trigger-source-type">{{ getTriggerSourceType(row) }}</div>
            </div>
          </div>
        </template>

        <template #riskAlert="{ row }">
          <div class="risk-alert-cell">
            <div v-if="row.hasManual" class="risk-alert-tag">
              <el-icon class="risk-tag-icon">
                <Warning />
              </el-icon>
              <span>含人工修正 ({{ row.manualCorrectionCount || 1 }}处)</span>
            </div>
            <div v-else :class="`risk-alert-tag risk-alert-tag-${getConfidenceType(row)}`">
              <el-icon class="risk-tag-icon">
                <Warning />
              </el-icon>
              <span>{{ getConfidenceText(row) }}</span>
            </div>
            <div class="risk-alert-reason">{{ getRiskReason(row) }}</div>
          </div>
        </template>

        <template #submitTime="{ row }">
          <span style="font-size: 14px; color: #606266; padding: 4px 0; display: inline-block">{{ row.submitTime }}</span>
        </template>

        <template #operation="{ row }">
          <div v-if="activeTab === 'pending' && row.status === 'Pending'" style="display: flex; gap: 8px; align-items: center">
            <el-button type="success" size="small" @click="handleQuickApprove(row)">批准</el-button>
            <el-button type="danger" size="small" @click="handleQuickReject(row)">驳回</el-button>
            <el-button type="primary" size="small" plain @click="openDetail(row)">详情</el-button>
          </div>
          <el-button v-else-if="activeTab === 'pending'" type="primary" size="small" link @click="openDetail(row)"
            >查看详情</el-button
          >
          <el-button
            v-else-if="activeTab === 'history' && (row.status === 'Approved' || row.status === 'Rejected')"
            type="primary"
            link
            size="small"
            @click="openDetail(row)"
          >
            查看快照
          </el-button>
        </template>

        <!-- 已处理历史的 slot -->
        <template #status="{ row }">
          <div
            v-if="row.status === 'Approved' || row.status === 'Rejected'"
            style="display: flex; align-items: center; gap: 8px; padding: 4px 0"
          >
            <span :class="`status-dot status-${row.status === 'Approved' ? 'approved' : 'rejected'}`"></span>
            <span :style="{ color: row.status === 'Approved' ? '#67C23A' : '#F56C6C', fontSize: '14px', fontWeight: 400 }">
              {{ row.status === "Approved" ? "已批准" : "已驳回" }}
            </span>
          </div>
        </template>

        <template #mergeContent="{ row }">
          <div style="padding: 4px 0">
            <span style="color: #303133; font-size: 14px; font-weight: 400">{{ row.sourceName }}</span>
            <span style="color: #909399; margin: 0 6px; font-size: 13px">合并入</span>
            <span style="color: #303133; font-size: 14px; font-weight: 400">{{ row.targetName }}</span>
          </div>
        </template>

        <template #approver="{ row }">
          <span style="font-size: 14px; color: #303133; padding: 4px 0; display: inline-block">
            {{ row.approver || row.operator || "-" }}
          </span>
        </template>

        <template #processTime="{ row }">
          <span style="font-size: 14px; color: #606266; padding: 4px 0; display: inline-block">
            {{ row.processTime || row.submitTime || "-" }}
          </span>
        </template>

        <template #approvalComment="{ row }">
          <span style="color: #606266; font-size: 14px; line-height: 1.5; padding: 4px 0; display: inline-block">
            {{ row.approvalComment || "-" }}
          </span>
        </template>
      </ProTable>
    </el-card>

    <!-- 3. 核心交互：审核详情抽屉 (Diff Drawer) -->
    <el-drawer v-model="drawerVisible" size="60%" :with-header="false">
      <div style="height: 100%; display: flex; flex-direction: column">
        <!-- 抽屉头部 -->
        <div
          style="
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fafafa;
          "
        >
          <div style="flex: 1">
            <div style="font-size: 18px; font-weight: bold">
              合并请求审核 #{{ currentRequest.reqId }}
              <el-tag v-if="currentRequest.hasManual" type="warning" size="small" style="margin-left: 10px">含人工修正</el-tag>
              <el-tag
                v-else-if="currentRequest.confidence && currentRequest.confidence < 95"
                :type="currentRequest.confidence >= 85 ? 'warning' : 'danger'"
                size="small"
                style="margin-left: 10px"
              >
                置信度: {{ currentRequest.confidence }}% (需审核)
              </el-tag>
            </div>
            <div style="color: #999; font-size: 12px; margin-top: 5px">
              提交人: {{ currentRequest.operator }} | 提交时间: {{ currentRequest.submitTime }}
              <span v-if="!currentRequest.hasManual && currentRequest.confidence" style="margin-left: 10px">
                | 匹配规则置信度:
                <span
                  :style="{
                    color: currentRequest.confidence >= 95 ? '#67C23A' : currentRequest.confidence >= 85 ? '#E6A23C' : '#F56C6C',
                    fontWeight: 500
                  }"
                  >{{ currentRequest.confidence }}%</span
                >
                <span style="color: #909399"> (免检阈值: 95%)</span>
              </span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px">
            <!-- 仅看变更开关 -->
            <div
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-right: 12px;
                padding: 8px 12px;
                background: #f5f7fa;
                border-radius: 4px;
              "
            >
              <span style="font-size: 13px; color: #606266; margin-right: 8px">仅看变更</span>
              <el-switch v-model="onlyShowChanged" size="default" style="--el-switch-on-color: #409eff" />
            </div>
            <!-- 只有在"待我审批"标签页且状态为Pending时才显示审批按钮 -->
            <div v-if="activeTab === 'pending' && currentRequest.status === 'Pending'">
              <el-button @click="drawerVisible = false">取消</el-button>
              <el-button type="danger" :icon="Close" @click="handleReject">驳回</el-button>
              <el-button type="success" :icon="Check" @click="handleApprove">批准合并</el-button>
            </div>
            <div v-else>
              <el-tag :type="currentRequest.status === 'Approved' ? 'success' : 'danger'">
                {{ currentRequest.status === "Pending" ? "待审批" : currentRequest.status === "Approved" ? "已批准" : "已驳回" }}
              </el-tag>
              <el-button style="margin-left: 10px" @click="drawerVisible = false">关闭</el-button>
            </div>
          </div>
        </div>

        <!-- 抽屉内容：字段对比 -->
        <div style="flex: 1; overflow-y: auto; padding: 0">
          <div class="diff-container">
            <el-alert
              v-if="currentRequest.hasManual"
              title="注意：操作员手动修改了部分字段，请重点核对高亮黄色区域。"
              type="warning"
              show-icon
              style="margin: 10px 0"
            ></el-alert>
            <el-alert
              v-else-if="currentRequest.confidence && currentRequest.confidence < 95"
              :type="currentRequest.confidence >= 85 ? 'warning' : 'info'"
              :title="`系统算法匹配置信度为 ${currentRequest.confidence}%，未达到 95% 免检阈值，需要人工审核确认以防止误合并风险。`"
              show-icon
              style="margin: 10px 0"
            ></el-alert>

            <div class="diff-header">
              <div style="width: 140px">字段名</div>
              <div class="diff-col">合并前 (原始数据)</div>
              <div style="width: 40px"></div>
              <div class="diff-col" style="color: #1890ff">合并后 (拟入库数据)</div>
            </div>

            <!-- 当开启"仅看变更"但没有变更字段时的提示 -->
            <div
              v-if="onlyShowChanged && filteredFieldGroups.length === 0"
              style="text-align: center; padding: 40px 20px; color: #909399"
            >
              <el-icon style="font-size: 48px; margin-bottom: 12px"><Document /></el-icon>
              <div style="font-size: 14px">暂无变更字段</div>
            </div>

            <!-- 动态渲染所有字段 -->
            <div v-for="(group, gIdx) in filteredFieldGroups" :key="gIdx">
              <div style="background: #f2f6fc; padding: 8px 10px; font-weight: bold; margin-top: 15px; color: #606266">
                {{ group.groupName }}
              </div>

              <div
                v-for="(field, fIdx) in group.fields"
                :key="fIdx"
                class="field-row"
                :class="{ 'is-changed': isChanged(field) }"
              >
                <div class="field-label">
                  {{ field.label }}
                  <span v-if="field.isKey" style="color: red">*</span>
                </div>

                <!-- 旧值 -->
                <div class="field-val" style="color: #999">{{ field.oldVal || "-" }}</div>

                <div class="field-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>

                <!-- 新值 -->
                <div class="field-val">
                  <span :class="getValueClass(field)">{{ field.newVal || "-" }}</span>
                  <span v-if="field.isManual" class="tag-manual">人工修</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowRight, Close, Check, Document, Clock, Warning } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { getApprovalList, getApprovalDetail, approveRequest, rejectRequest } from "@/api/modules/approval";

interface ApprovalRequest {
  reqId: string;
  sourceName: string;
  targetName: string;
  operator: string;
  submitTime: string;
  status: "Pending" | "Approved" | "Rejected";
  hasManual: boolean;
  confidence?: number; // 置信度分数 (0-100)，未达到95分需要人工审核
  // 新增字段
  triggerSource?: {
    type: "manual" | "rule"; // 人工提交 | 规则引擎
    name: string; // 提交人名称或规则名称
    avatar?: string; // 头像URL或图标
  };
  approver?: string; // 审批人
  processTime?: string; // 处理时间
  approvalComment?: string; // 审批意见
  manualCorrectionCount?: number; // 人工修正数量
  riskReason?: string; // 风险原因说明
}

interface FieldItem {
  label: string;
  oldVal: string;
  newVal: string;
  isKey?: boolean;
  isManual?: boolean;
  isChanged?: boolean;
  isRisk?: boolean;
}

interface FieldGroup {
  groupName: string;
  fields: FieldItem[];
}

const router = useRouter();
const proTable = ref<ProTableInstance>();
const activeTab = ref<"pending" | "history">("pending");
const drawerVisible = ref(false);
const currentRequest = ref<ApprovalRequest>({
  reqId: "",
  sourceName: "",
  targetName: "",
  operator: "",
  submitTime: "",
  status: "Pending",
  hasManual: false,
  confidence: 0
});

// 统计数据
const stats = reactive({
  pending: 12,
  risk: 3,
  approved: 158
});

// 详情页的字段分组数据
const fieldGroups = ref<FieldGroup[]>([]);
// 仅看变更开关
const onlyShowChanged = ref(false);

// 过滤后的字段分组（根据"仅看变更"开关）
const filteredFieldGroups = computed(() => {
  if (!onlyShowChanged.value) {
    return fieldGroups.value;
  }
  // 只显示有变更的字段
  return fieldGroups.value
    .map(group => ({
      ...group,
      fields: group.fields.filter(field => isChanged(field))
    }))
    .filter(group => group.fields.length > 0); // 过滤掉没有变更字段的分组
});

// 跳转到规则配置页面
const goRuleConfig = () => {
  router.push("/dataProcess/approval/rule-config");
};

// 切换标签页
const handleTabChange = (tab: string | number) => {
  activeTab.value = tab as "pending" | "history";
  // 切换标签页时重新加载数据
  proTable.value?.getTableList();
};

// 获取触发来源名称
const getTriggerSourceName = (row: ApprovalRequest) => {
  const source = row.triggerSource || {
    type: row.hasManual ? "manual" : "rule",
    name: row.hasManual ? row.operator : "规则引擎"
  };
  return source.name;
};

// 获取触发来源类型
const getTriggerSourceType = (row: ApprovalRequest) => {
  const source = row.triggerSource || {
    type: row.hasManual ? "manual" : "rule",
    name: row.hasManual ? row.operator : "规则引擎"
  };
  return source.type === "manual" ? "人工提交" : "系统预警";
};

// 获取置信度类型
const getConfidenceType = (row: ApprovalRequest) => {
  const confidence = row.confidence ?? 0;
  return confidence >= 85 ? "warning" : "danger";
};

// 获取置信度文本
const getConfidenceText = (row: ApprovalRequest) => {
  const confidence = row.confidence ?? 0;
  return confidence >= 85 ? `置信度低 (${confidence}%)` : `置信度极低 (${confidence}%)`;
};

// 获取风险原因
const getRiskReason = (row: ApprovalRequest) => {
  if (row.hasManual) {
    return row.riskReason || "含人工修正";
  } else {
    const confidence = row.confidence ?? 0;
    return row.riskReason || (confidence >= 85 ? "手机号一致,但姓名模糊匹配" : "匹配度不足，需人工确认");
  }
};

// 待我审批的表格列配置
const pendingColumns = reactive<ColumnProps<ApprovalRequest>[]>([
  {
    prop: "reqId",
    label: "申请单号",
    width: 140,
    search: {
      el: "input",
      props: { placeholder: "请输入申请单号" }
    }
  },
  {
    prop: "mergeTarget",
    label: "合并对象 (Incoming -> Master)",
    minWidth: 240,
    search: {
      el: "input",
      props: { placeholder: "搜索合并对象" },
      key: "sourceName"
    }
  },
  {
    prop: "triggerSource",
    label: "触发来源",
    width: 200
  },
  {
    prop: "riskAlert",
    label: "风险提示 (为何要审?)",
    minWidth: 280
  },
  {
    prop: "submitTime",
    label: "提交时间",
    width: 180,
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        "value-format": "YYYY-MM-DD HH:mm:ss",
        placeholder: "请选择提交时间"
      }
    }
  },
  {
    prop: "operation",
    label: "操作",
    minWidth: 200,
    fixed: "right"
  }
]);

// 已处理历史的表格列配置
const historyColumns = reactive<ColumnProps<ApprovalRequest>[]>([
  {
    prop: "status",
    label: "处理结果",
    width: 130,
    search: {
      el: "select",
      props: { placeholder: "请选择状态" }
    }
  },
  {
    prop: "reqId",
    label: "原始单号",
    width: 140,
    search: {
      el: "input",
      props: { placeholder: "请输入原始单号" }
    }
  },
  {
    prop: "mergeContent",
    label: "合并内容",
    minWidth: 240
  },
  {
    prop: "approver",
    label: "审批人",
    width: 130,
    search: {
      el: "input",
      props: { placeholder: "请输入审批人" }
    }
  },
  {
    prop: "processTime",
    label: "处理时间",
    width: 180,
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        "value-format": "YYYY-MM-DD HH:mm:ss",
        placeholder: "请选择处理时间"
      }
    }
  },
  {
    prop: "approvalComment",
    label: "审批意见",
    minWidth: 220
  },
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right"
  }
]);

// 根据当前标签页返回对应的列配置
const currentColumns = computed(() => {
  return activeTab.value === "pending" ? pendingColumns : historyColumns;
});

// 快速批准
const handleQuickApprove = async (row: ApprovalRequest) => {
  try {
    await ElMessageBox.confirm("确认批准该合并请求？", "批准确认", {
      confirmButtonText: "批准",
      cancelButtonText: "取消",
      type: "success"
    });

    const res = await approveRequest(row.reqId);
    if (String(res.code) === "200") {
      ElMessage.success("已批准");
      proTable.value?.getTableList();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批准失败:", error);
    }
  }
};

// 快速驳回
const handleQuickReject = async (row: ApprovalRequest) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入驳回原因：", "驳回操作", {
      confirmButtonText: "驳回",
      cancelButtonText: "取消",
      inputPlaceholder: "例如：数据质量太差,建议直接删除"
    });

    const res = await rejectRequest(row.reqId, value);
    if (String(res.code) === "200") {
      ElMessage.warning("请求已驳回");
      proTable.value?.getTableList();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("驳回失败:", error);
    }
  }
};

// 原表格列配置（保留作为参考，实际使用 currentColumns）
const columns = reactive<ColumnProps<ApprovalRequest>[]>([
  {
    prop: "status",
    label: "状态",
    width: 100,
    enum: [
      { label: "待审", value: "Pending", tagType: "warning" },
      { label: "已过", value: "Approved", tagType: "success" },
      { label: "驳回", value: "Rejected", tagType: "danger" }
    ],
    tag: true,
    search: {
      el: "select",
      props: { placeholder: "请选择状态" }
    },
    render: scope => {
      const statusMap = {
        Pending: { dot: "status-pending", text: "待审" },
        Approved: { dot: "status-approved", text: "已过" },
        Rejected: { dot: "status-rejected", text: "驳回" }
      };
      const status = statusMap[scope.row.status as keyof typeof statusMap] || statusMap.Pending;
      return (
        <div>
          <span class={`status-dot ${status.dot}`}></span>
          {status.text}
        </div>
      );
    }
  },
  {
    prop: "reqId",
    label: "申请单号",
    width: 120,
    search: {
      el: "input",
      props: { placeholder: "请输入申请单号" }
    }
  },
  {
    prop: "mergeTarget",
    label: "合并对象",
    search: {
      el: "input",
      props: { placeholder: "搜索合并对象" },
      key: "sourceName"
    },
    render: scope => (
      <div>
        <b>{scope.row.targetName}</b>{" "}
        <el-icon style="color: #999; vertical-align: middle; margin: 0 4px;">
          <ArrowRight />
        </el-icon>{" "}
        <b>{scope.row.sourceName}</b>
      </div>
    )
  },
  {
    prop: "operator",
    label: "提交人",
    width: 100,
    search: {
      el: "input",
      props: { placeholder: "请输入提交人" }
    }
  },
  {
    prop: "submitTime",
    label: "提交时间",
    width: 160,
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        "value-format": "YYYY-MM-DD HH:mm:ss",
        placeholder: "请选择提交时间"
      }
    }
  },
  {
    prop: "hasManual",
    label: "风险提示",
    width: 200,
    search: {
      el: "select",
      props: { placeholder: "请选择风险类型" },
      key: "hasManual"
    },
    enum: [
      { label: "有人工修正", value: true, tagType: "warning" },
      { label: "自动规则匹配", value: false }
    ],
    tag: true,
    render: scope => {
      if (scope.row.hasManual) {
        return (
          <el-tag type="warning" size="small">
            有人工修正
          </el-tag>
        );
      }
      // 显示置信度分数，让客户理解为什么需要审核
      const confidence = scope.row.confidence ?? 0;
      // 对于自动规则匹配，始终显示置信度（如果有值）
      const confidenceColor =
        confidence >= 95 ? "#67C23A" : confidence >= 85 ? "#E6A23C" : confidence > 0 ? "#F56C6C" : "#909399";
      return (
        <span style={{ color: "#606266", fontSize: "13px" }}>
          <span style={{ color: "#909399" }}>自动规则匹配</span>
          {confidence > 0 && (
            <span style={{ color: confidenceColor, fontWeight: 500, marginLeft: "4px" }}>(置信度: {confidence}%)</span>
          )}
        </span>
      );
    }
  },
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    render: scope => (
      <div>
        {scope.row.status === "Pending" ? (
          <el-button type="primary" size="small" onClick={() => openDetail(scope.row)}>
            审核
          </el-button>
        ) : (
          <el-button type="text" size="small" onClick={() => openDetail(scope.row)}>
            查看详情
          </el-button>
        )}
      </div>
    )
  }
]);

// 获取审批列表数据（ProTable 请求函数）
const fetchApprovalList = async (params: any) => {
  try {
    const {
      pageNum = 1,
      pageSize = 10,
      status,
      reqId,
      sourceName,
      operator,
      submitTime,
      hasManual,
      processTime,
      approver
    } = params;

    // 调用 API
    const res = await getApprovalList();
    if (String(res.code) === "200") {
      let list = res.data || [];

      // 根据当前标签页筛选数据
      if (activeTab.value === "pending") {
        // 待我审批：只显示待审批状态
        list = list.filter((item: ApprovalRequest) => item.status === "Pending");
      } else {
        // 已处理历史：只显示已批准或已驳回
        list = list.filter((item: ApprovalRequest) => item.status === "Approved" || item.status === "Rejected");
      }

      // 确保每条数据都有 confidence 字段（如果后端没有返回，添加默认值）
      list = list.map((item: ApprovalRequest) => {
        if (item.confidence === undefined || item.confidence === null) {
          // 如果有人工修正，置信度为0；否则随机生成一个85-94之间的值（需要审核）
          item.confidence = item.hasManual ? 0 : Math.floor(Math.random() * 10) + 85;
        }
        // 如果没有触发来源，根据 hasManual 生成
        if (!item.triggerSource) {
          item.triggerSource = {
            type: item.hasManual ? "manual" : "rule",
            name: item.hasManual ? item.operator : "规则引擎"
          };
        }
        // 如果没有人工修正数量，根据 hasManual 设置
        if (item.hasManual && !item.manualCorrectionCount) {
          item.manualCorrectionCount = Math.floor(Math.random() * 3) + 1;
        }
        // 如果没有风险原因，生成默认原因
        if (!item.riskReason) {
          if (item.hasManual) {
            item.riskReason = "姓名与身份证不一致,手动修正";
          } else if (item.confidence && item.confidence < 95) {
            item.riskReason = item.confidence >= 85 ? "手机号一致,但姓名模糊匹配" : "匹配度不足，需人工确认";
          }
        }
        // 如果没有审批人，使用操作人
        if (!item.approver && item.status !== "Pending") {
          item.approver = item.operator || "Manager";
        }
        // 如果没有处理时间，使用提交时间
        if (!item.processTime && item.status !== "Pending") {
          item.processTime = item.submitTime;
        }
        // 如果没有审批意见，生成默认意见
        if (!item.approvalComment && item.status !== "Pending") {
          item.approvalComment = item.status === "Approved" ? "同意合并" : "数据质量太差,建议直接删除";
        }
        return item;
      });

      // 前端筛选（如果后端不支持筛选，可以在这里处理）
      if (status) {
        list = list.filter((item: ApprovalRequest) => item.status === status);
      }
      if (reqId) {
        list = list.filter((item: ApprovalRequest) => item.reqId.includes(reqId));
      }
      if (sourceName) {
        list = list.filter(
          (item: ApprovalRequest) => item.sourceName.includes(sourceName) || item.targetName.includes(sourceName)
        );
      }
      if (operator) {
        list = list.filter((item: ApprovalRequest) => item.operator.includes(operator));
      }
      if (approver) {
        list = list.filter((item: ApprovalRequest) => (item.approver || "").includes(approver));
      }
      if (hasManual !== undefined && hasManual !== null && hasManual !== "") {
        const hasManualBool = hasManual === true || hasManual === "true" || hasManual === 1;
        list = list.filter((item: ApprovalRequest) => item.hasManual === hasManualBool);
      }
      if (submitTime && Array.isArray(submitTime) && submitTime.length === 2) {
        const [startTime, endTime] = submitTime;
        list = list.filter((item: ApprovalRequest) => {
          const itemTime = new Date(item.submitTime).getTime();
          return itemTime >= new Date(startTime).getTime() && itemTime <= new Date(endTime).getTime();
        });
      }
      if (processTime && Array.isArray(processTime) && processTime.length === 2) {
        const [startTime, endTime] = processTime;
        list = list.filter((item: ApprovalRequest) => {
          const itemTime = new Date(item.processTime || item.submitTime).getTime();
          return itemTime >= new Date(startTime).getTime() && itemTime <= new Date(endTime).getTime();
        });
      }

      // 更新统计数据
      const allList = res.data || [];
      stats.pending = allList.filter((item: ApprovalRequest) => item.status === "Pending").length;
      stats.risk = allList.filter((item: ApprovalRequest) => item.hasManual).length;
      stats.approved = allList.filter((item: ApprovalRequest) => item.status === "Approved").length;

      // 分页处理
      const start = (pageNum - 1) * pageSize;
      const end = pageNum * pageSize;
      const pageList = list.slice(start, end);

      return Promise.resolve({
        data: {
          list: pageList,
          total: list.length
        }
      });
    }
    return Promise.resolve({
      data: {
        list: [],
        total: 0
      }
    });
  } catch (error) {
    console.error("加载审批列表失败:", error);
    return Promise.resolve({
      data: {
        list: [],
        total: 0
      }
    });
  }
};

// 打开审核详情
const openDetail = async (row: ApprovalRequest) => {
  currentRequest.value = { ...row };
  // 重置"仅看变更"开关
  onlyShowChanged.value = false;

  try {
    const res = await getApprovalDetail(row.reqId);
    if (String(res.code) === "200" && res.data) {
      fieldGroups.value = res.data.fieldGroups || [];
    } else {
      // 如果接口没有返回数据，使用默认的 mock 数据
      fieldGroups.value = getDefaultFieldGroups(row);
    }
  } catch (error) {
    console.error("加载详情失败:", error);
    // 使用默认的 mock 数据
    fieldGroups.value = getDefaultFieldGroups(row);
  }

  drawerVisible.value = true;
};

// 获取默认字段分组数据（用于 mock）
const getDefaultFieldGroups = (row: ApprovalRequest): FieldGroup[] => {
  return [
    {
      groupName: "👤 身份信息 (Identity)",
      fields: [
        { label: "客户ID", oldVal: "C360-001", newVal: "C360-001", isKey: true },
        { label: "姓名", oldVal: row.sourceName, newVal: row.targetName, isManual: row.hasManual },
        { label: "性别", oldVal: "男", newVal: "男" },
        { label: "年龄段", oldVal: "35-40", newVal: "35-40" },
        { label: "家庭状态", oldVal: "未知", newVal: "已婚 (2孩)", isChanged: true },
        { label: "手机号码", oldVal: "138****8888", newVal: "138****8888", isKey: true },
        { label: "地址", oldVal: "北京市朝阳区", newVal: "北京市海淀区西二旗", isChanged: true }
      ]
    },
    {
      groupName: "📞 互动偏好 (Preference)",
      fields: [
        { label: "联系偏好时间", oldVal: "工作日", newVal: "周末全天", isChanged: true },
        { label: "服务习惯", oldVal: "", newVal: "需要代步车", isChanged: true },
        { label: "项目偏好", oldVal: "常规保养", newVal: "常规保养, 美容清洗", isChanged: true }
      ]
    },
    {
      groupName: "💰 价值与交易 (Value)",
      fields: [
        { label: "最近到店时间", oldVal: "2024-01-01", newVal: "2025-12-12", isChanged: true },
        { label: "近90天到店", oldVal: "0", newVal: "2", isChanged: true },
        { label: "年度订单频次", oldVal: "1", newVal: "5", isChanged: true },
        { label: "平均消费金额", oldVal: "¥1,000", newVal: "¥3,500", isChanged: true },
        { label: "年度消费金额", oldVal: "¥1,000", newVal: "¥17,500", isChanged: true },
        { label: "忠诚度等级", oldVal: "普卡", newVal: "银卡", isChanged: true },
        { label: "最近一年投诉", oldVal: "否", newVal: "是", isChanged: true, isRisk: true }
      ]
    },
    {
      groupName: "🚗 车辆资产 (Vehicle)",
      fields: [
        { label: "VIN信息", oldVal: "LSV5***88", newVal: "LSV5***88", isKey: true },
        { label: "车牌号", oldVal: "京A****1", newVal: "京A****1" },
        { label: "车系+车型", oldVal: "BMW 3系", newVal: "BMW 325Li M运动" },
        { label: "当前里程", oldVal: "20,000km", newVal: "25,300km", isChanged: true }
      ]
    }
  ];
};

// 判断该行是否需要高亮 (值变了)
const isChanged = (field: FieldItem) => {
  return field.oldVal !== field.newVal || field.isManual;
};

// 获取值的样式
const getValueClass = (field: FieldItem) => {
  if (field.isManual) return "val-manual";
  if (field.oldVal !== field.newVal) return "val-new";
  return "";
};

// 批准逻辑
const handleApprove = async () => {
  try {
    await ElMessageBox.confirm("确认数据无误，批准合并？该操作将写入 OneID 黄金库。", "终审确认", {
      confirmButtonText: "批准 (Approve)",
      cancelButtonText: "取消",
      type: "success"
    });

    const res = await approveRequest(currentRequest.value.reqId);
    if (String(res.code) === "200") {
      currentRequest.value.status = "Approved";
      stats.pending--;
      stats.approved++;
      ElMessage.success("已批准。数据同步任务已下发至 DataWorks。");
      drawerVisible.value = false;
      // 重新加载列表
      proTable.value?.getTableList();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批准失败:", error);
    }
  }
};

// 驳回逻辑
const handleReject = async () => {
  try {
    const { value } = await ElMessageBox.prompt("请输入驳回原因，将通知 Operator 修改：", "驳回操作", {
      confirmButtonText: "驳回 (Reject)",
      cancelButtonText: "取消",
      inputPlaceholder: "例如：人工修改的姓名与身份证不符"
    });

    const res = await rejectRequest(currentRequest.value.reqId, value);
    if (String(res.code) === "200") {
      currentRequest.value.status = "Rejected";
      stats.pending--;
      ElMessage.warning("请求已驳回。");
      drawerVisible.value = false;
      // 重新加载列表
      proTable.value?.getTableList();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("驳回失败:", error);
    }
  }
};

// 初始化统计数据
onMounted(async () => {
  try {
    const res = await getApprovalList();
    if (String(res.code) === "200") {
      let list = res.data || [];
      // 确保每条数据都有 confidence 字段
      list = list.map((item: ApprovalRequest) => {
        if (item.confidence === undefined || item.confidence === null) {
          item.confidence = item.hasManual ? 0 : Math.floor(Math.random() * 10) + 85;
        }
        return item;
      });
      stats.pending = list.filter((item: ApprovalRequest) => item.status === "Pending").length;
      stats.risk = list.filter((item: ApprovalRequest) => item.hasManual).length;
      stats.approved = list.filter((item: ApprovalRequest) => item.status === "Approved").length;
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
  }
});
</script>

<style scoped lang="scss">
.approval-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 标签页样式 - 使用 Element Plus Tabs 组件 */
.approval-tabs {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;

  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    padding: 0 24px;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #606266;
    font-weight: 400;

    &.is-active {
      color: #409eff;
      font-weight: 500;
    }

    &:hover {
      color: #409eff;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #409eff;
    height: 3px;
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .tab-icon {
      font-size: 16px;
    }

    .tab-badge {
      :deep(.el-badge__content) {
        background-color: #f56c6c;
        border-color: #f56c6c;
        font-size: 12px;
        height: 18px;
        min-width: 18px;
        line-height: 18px;
        padding: 0 5px;
        border-radius: 9px;
        margin-left: 4px;
      }
    }
  }
}

/* 信息提示横幅 */
.info-alert {
  margin-bottom: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background-color: #f4f4f5;

  :deep(.el-alert__content) {
    .el-alert__description {
      font-size: 13px;
      line-height: 1.6;
      color: #606266;

      .el-link {
        font-weight: 500;
      }
    }
  }
}

.table-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 20px;
  }

  // 优化表格样式
  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: #fafafa;
        color: #606266;
        font-weight: 500;
        font-size: 14px;
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;
      }
    }

    .el-table__body {
      tr {
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f7fa;
        }

        td {
          padding: 14px 0;
          border-bottom: 1px solid #f0f2f5;
        }
      }
    }

    // 优化操作列按钮样式
    .el-button {
      &--small {
        padding: 5px 12px;
        font-size: 13px;
      }

      &--success {
        background-color: #67c23a;
        border-color: #67c23a;

        &:hover {
          background-color: #85ce61;
          border-color: #85ce61;
        }
      }

      &--danger {
        background-color: #f56c6c;
        border-color: #f56c6c;

        &:hover {
          background-color: #f78989;
          border-color: #f78989;
        }
      }
    }

    // 触发来源单元格样式穿透
    :deep(.trigger-source-cell) {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    :deep(.trigger-source-avatar) {
      flex-shrink: 0;
    }

    :deep(.trigger-source-info) {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    :deep(.trigger-source-name) {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.trigger-source-type) {
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }

    // 风险提示单元格样式穿透
    :deep(.risk-alert-cell) {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }

    :deep(.risk-alert-tag) {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      width: fit-content;
      background-color: #fef0f0;
      color: #f56c6c;
      border: none;

      &.risk-alert-tag-warning {
        background-color: #fdf6ec;
        color: #e6a23c;
      }

      &.risk-alert-tag-danger {
        background-color: #fef0f0;
        color: #f56c6c;
      }

      .risk-tag-icon {
        font-size: 14px;
        font-weight: bold;
      }
    }

    :deep(.risk-alert-reason) {
      font-size: 13px;
      color: #606266;
      line-height: 1.5;
      word-break: break-word;
      margin-top: 2px;
    }

    // 头像样式穿透
    :deep(.avatar-circle) {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #409eff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 500;
      font-size: 14px;
      flex-shrink: 0;
    }

    :deep(.avatar-square) {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      background: #e6a23c;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 500;
      font-size: 14px;
      flex-shrink: 0;
    }
  }
}

/* 头像样式 */
.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}

.avatar-square {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}

/* 触发来源单元格样式 - 简洁布局 */
.trigger-source-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.trigger-source-avatar {
  flex-shrink: 0;
}

.trigger-source-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.trigger-source-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-source-type {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 风险提示单元格样式 - 简洁布局 */
.risk-alert-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.risk-alert-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
  background-color: #fef0f0;
  color: #f56c6c;
  border: none;

  &.risk-alert-tag-warning {
    background-color: #fdf6ec;
    color: #e6a23c;
  }

  &.risk-alert-tag-danger {
    background-color: #fef0f0;
    color: #f56c6c;
  }

  .risk-tag-icon {
    font-size: 14px;
    font-weight: bold;
  }
}

.risk-alert-reason {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
  margin-top: 2px;
}

/* 统计卡片 */
.stat-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

/* 状态标签 */
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pending {
  background-color: #e6a23c;
}

.status-approved {
  background-color: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.1);
}

.status-rejected {
  background-color: #f56c6c;
}

/* === 差异对比核心样式 (Diff View) === */
.diff-container {
  background: #fff;
  padding: 0 20px 20px 20px;
}

.diff-header {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.diff-col {
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: #606266;
}

/* 字段行样式 */
.field-row {
  display: flex;
  border-bottom: 1px solid #f5f5f5;
  padding: 12px 0;
  align-items: center;
  font-size: 13px;

  &:hover {
    background-color: #fafafa;
  }
}

.field-label {
  width: 140px;
  color: #909399;
  font-weight: 500;
  padding-left: 10px;
}

.field-val {
  flex: 1;
  padding: 0 15px;
  word-break: break-all;
  color: #303133;
  text-align: center;
}

.field-arrow {
  width: 40px;
  text-align: center;
  color: #c0c4cc;
}

/* 变更高亮逻辑 */
.is-changed {
  background-color: #fffbf0; /* 只要有变动，整行给个淡黄背景 */
}

.val-new {
  color: #1890ff;
  font-weight: bold; /* 新值变蓝 */
}

.val-manual {
  color: #e6a23c;
  font-weight: bold;
  text-decoration: underline; /* 人工修改的值 */
}

/* 标签风格 */
.tag-manual {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
  border-radius: 2px;
  padding: 0 4px;
  font-size: 12px;
  transform: scale(0.9);
  display: inline-block;
  margin-left: 5px;
}

.money-font {
  font-family: Consolas, monospace;
}
</style>

<!-- 全局样式，用于穿透到表格单元格 -->
<style lang="scss">
/* 触发来源单元格样式 */
.trigger-source-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.trigger-source-avatar {
  flex-shrink: 0;
}

.trigger-source-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.trigger-source-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-source-type {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 风险提示单元格样式 */
.risk-alert-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.risk-alert-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
  background-color: #fef0f0;
  color: #f56c6c;
  border: none;

  &.risk-alert-tag-warning {
    background-color: #fdf6ec;
    color: #e6a23c;
  }

  &.risk-alert-tag-danger {
    background-color: #fef0f0;
    color: #f56c6c;
  }

  .risk-tag-icon {
    font-size: 14px;
    font-weight: bold;
  }
}

.risk-alert-reason {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
  margin-top: 2px;
}

/* 头像样式 */
.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}

.avatar-square {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}
</style>

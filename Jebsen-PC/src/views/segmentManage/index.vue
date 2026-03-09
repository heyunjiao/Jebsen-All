<template>
  <div class="table-box segment-manage">
    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(segmentStats.segmentTotal) }}</div>
          <div class="stats-label">{{ t("segmentManage.stats.segmentTotal") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><User /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(segmentStats.totalMembers) }}</div>
          <div class="stats-label">{{ t("segmentManage.stats.totalMembers") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(segmentStats.activeSegments) }}</div>
          <div class="stats-label">{{ t("segmentManage.stats.activeSegments") }}</div>
        </div>
      </div>
      <div class="stats-card warning-card">
        <div class="stats-icon-wrapper">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(segmentStats.draftSegments) }}</div>
          <div class="stats-label">{{ t("segmentManage.stats.draftSegments") }}</div>
        </div>
      </div>
    </div>

    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="id"
      :tool-button="['refresh', 'setting', 'search']"
    >
      <!-- 表格 header 按钮（新建分群不设权限，始终显示） -->
      <template #tableHeader>
        <el-button type="primary" :icon="Plus" @click="handleAdd">{{ t("segmentManage.createSegment") }}</el-button>
      </template>

      <!-- 分类列 -->
      <template #category="scope">
        <el-tag v-if="scope.row.category" :type="getCategoryType(scope.row.category) as any" size="small">
          {{ scope.row.category }}
        </el-tag>
        <span v-else class="text-gray-500">-</span>
      </template>

      <!-- 状态列 -->
      <template #status="scope">
        <div class="status-cell">
          <el-tag :type="statusType(scope.row.status)" size="small">
            {{ statusLabel(scope.row.status) }}
          </el-tag>
        </div>
      </template>

      <!-- 成员数 -->
      <template #memberCount="scope">
        <span class="strong">{{ scope.row.memberCount.toLocaleString() }}</span>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">{{ t("segmentManage.edit") }}</el-button>
        <el-button type="info" link :icon="View" @click="handleView(scope.row)">{{ t("segmentManage.preview") }}</el-button>
        <el-button v-if="scope.row.status === 'active'" type="warning" link :icon="Close" @click="handleDisable(scope.row)">
          {{ t("segmentManage.disable") }}
        </el-button>
        <el-button type="warning" link :icon="Download" @click="handleExport(scope.row)">{{
          t("segmentManage.export")
        }}</el-button>
      </template>
    </ProTable>

    <!-- 新建 / 编辑分群 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="1400px" append-to-body :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('segmentManage.segmentName')" prop="name" required>
          <el-input v-model="form.name" maxlength="50" show-word-limit :placeholder="t('segmentManage.enterSegmentName')" />
        </el-form-item>
        <el-form-item :label="t('segmentManage.category')" prop="category">
          <el-select
            v-model="form.category"
            :placeholder="t('segmentManage.selectCategory')"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('segmentManage.description')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            :placeholder="t('segmentManage.enterDescription')"
          />
        </el-form-item>
        <el-form-item :label="t('segmentManage.status')" prop="status" required>
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
            :active-text="t('segmentManage.statusOptions.active')"
            :inactive-text="t('segmentManage.statusOptions.disabled')"
          />
        </el-form-item>
        <el-form-item :label="t('segmentManage.ruleConfig')" prop="ruleConfig" class="rule-config-form-item">
          <RuleEditor v-model="ruleTree" :available-tags="availableTags" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <div v-if="estimateResult" class="estimate-result">
              <span class="estimate-item">
                {{ t("segmentManage.estimatedCount") }}：<strong>{{ estimateResult.estimatedCount.toLocaleString() }}</strong>
              </span>
              <span class="estimate-item">
                {{ t("segmentManage.estimatedRate") }}：<strong>{{ estimateResult.estimatedRate }}</strong>
              </span>
            </div>
          </div>
          <div class="footer-right">
            <el-button type="success" :icon="View" @click="handleEstimate">{{ t("segmentManage.coverageEstimate") }}</el-button>
            <el-button @click="dialogVisible = false">{{ t("segmentManage.cancel") }}</el-button>
            <el-button type="primary" :loading="submitting" @click="submitForm">{{ t("segmentManage.save") }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 分群预览 -->
    <el-drawer v-model="previewVisible" :title="t('segmentManage.segmentPreview')" size="60%" :with-header="true">
      <div class="preview-header">
        <div>{{ t("segmentManage.segmentName") }}：{{ currentSegment?.name }}</div>
        <div>{{ t("segmentManage.memberCount") }}：{{ currentSegment?.memberCount?.toLocaleString?.() || "-" }}</div>
      </div>
      <ProTable
        v-if="previewVisible"
        :columns="previewColumns"
        :request-api="mockPreview"
        row-key="oneId"
        :pagination="true"
        :tool-button="[]"
      />
      <div class="drawer-footer">
        <el-button type="warning" :icon="Download" @click="handleExport(currentSegment)">{{
          t("segmentManage.export")
        }}</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, View, Check, Download, UserFilled, User, Close } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import RuleEditor, { type RuleNode } from "../tagManage/components/RuleEditor.vue";
import type { Segment } from "@/api/modules/segment";
import {
  getSegmentList,
  getSegmentDetail,
  saveSegment,
  estimateSegment,
  exportSegment,
  disableSegment
} from "@/api/modules/segment";
import { getTagList } from "@/api/modules/tagManage";
import type { TagManage } from "@/api/modules/tagManage";
import { onMounted } from "vue";

const { t } = useI18n();

const proTable = ref<ProTableInstance>();
const dialogVisible = ref(false);
const dialogTitle = ref("");
const previewVisible = ref(false);
const submitting = ref(false);
const formRef = ref();
const currentSegment = ref<Segment.SegmentInfo | null>(null);
const estimateResult = ref<{ estimatedCount: number; estimatedRate: string } | null>(null);
const availableTags = ref<Array<{ tagId: string; tagName: string; category: string }>>([]);

// 分群统计数据
const segmentStats = reactive({
  segmentTotal: 0,
  totalMembers: 0,
  activeSegments: 0,
  draftSegments: 0
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

const form = reactive<Segment.ReqSegmentForm>({
  id: undefined,
  name: "",
  category: "",
  description: "",
  status: "draft",
  ruleConfig: null
});

const ruleTree = ref<RuleNode>({
  id: "root",
  type: "group",
  operator: "AND",
  children: []
});

const rules = {
  name: [{ required: true, message: t("segmentManage.messages.nameRequired"), trigger: "blur" }],
  category: [{ required: false }],
  status: [{ required: true, message: t("segmentManage.messages.statusRequired"), trigger: "change" }],
  ruleConfig: [{ required: true, message: t("segmentManage.messages.ruleConfigRequired"), trigger: "change" }]
};

const statusType = (s: Segment.SegmentStatus) => {
  return {
    draft: "info",
    running: "warning",
    active: "success",
    failed: "danger",
    inactive: "warning"
  }[s];
};
const statusLabel = (s: Segment.SegmentStatus) => {
  return {
    draft: t("segmentManage.draft"),
    running: t("segmentManage.calculating"),
    active: t("segmentManage.active"),
    failed: t("segmentManage.failed"),
    inactive: t("segmentManage.inactive")
  }[s];
};

// 获取分类类型
const categoryOptions = [
  "意向级别",
  "车牌类型",
  "所在城市",
  "特殊标识",
  "爱好",
  "SC",
  "续保",
  "保险到期月份",
  "POC",
  "线上活动",
  "保时捷",
  "新能源"
];

const getCategoryType = (category?: Segment.SegmentCategory) => {
  if (!category) return "info";
  // 根据分类名称动态分配颜色类型
  const categoryMap: Record<string, string> = {
    意向级别: "primary",
    车牌类型: "success",
    所在城市: "warning",
    特殊标识: "danger",
    爱好: "info",
    SC: "success",
    续保: "warning",
    保险到期月份: "info",
    POC: "primary",
    线上活动: "success",
    保时捷: "warning",
    新能源: "success"
  };
  return categoryMap[category] || "info";
};

const columns = reactive<ColumnProps<Segment.SegmentInfo>[]>([
  {
    prop: "name",
    label: t("segmentManage.segmentName"),
    minWidth: 180,
    search: { el: "input", props: { placeholder: t("segmentManage.enterSegmentName") } }
  },
  {
    prop: "category",
    label: t("segmentManage.category"),
    minWidth: 100,
    search: {
      el: "select",
      props: {
        placeholder: t("segmentManage.selectCategory"),
        options: categoryOptions.map(item => ({ label: item, value: item }))
      }
    }
  },
  {
    prop: "status",
    label: t("segmentManage.status"),
    minWidth: 110,
    search: {
      el: "select",
      props: {
        placeholder: t("segmentManage.selectStatus"),
        options: [
          { label: t("segmentManage.draft"), value: "draft" },
          { label: t("segmentManage.calculating"), value: "running" },
          { label: t("segmentManage.active"), value: "active" },
          { label: t("segmentManage.failed"), value: "failed" },
          { label: t("segmentManage.inactive"), value: "inactive" }
        ]
      }
    }
  },
  { prop: "memberCount", label: "成员数", minWidth: 120 },

  { prop: "lastExportAt", label: "最近导出时间", minWidth: 180 },
  { prop: "creator", label: "创建人", minWidth: 120 },
  { prop: "createdAt", label: "创建时间", minWidth: 180 },
  { prop: "updatedAt", label: "更新时间", minWidth: 180 },
  {
    prop: "operation",
    label: "操作",
    fixed: "right",
    width: 260
  }
]);

const previewColumns = reactive<ColumnProps[]>([
  { prop: "oneId", label: "OneID", minWidth: 140 },
  { prop: "name", label: "姓名", minWidth: 120 },
  { prop: "gender", label: "性别", minWidth: 80 },
  { prop: "tagSummary", label: "标签", minWidth: 200 }
]);

const dataCallback = (data: any) => {
  const list = data.list || data.data?.list || [];
  const total = data.total || data.data?.total || 0;

  // 更新统计数据
  updateStats(list);

  return {
    list,
    total
  };
};

// 更新统计数据
const updateStats = (list: Segment.SegmentInfo[]) => {
  segmentStats.segmentTotal = list.length;
  segmentStats.totalMembers = list.reduce((sum, item) => sum + (item.memberCount || 0), 0);
  segmentStats.activeSegments = list.filter(item => item.status === "active").length;
  segmentStats.draftSegments = list.filter(item => item.status === "draft").length;
};

const getTableList = (params: any) => getSegmentList(params);

// 监听 ruleTree
watch(
  ruleTree,
  newTree => {
    form.ruleConfig = { root: newTree };
  },
  { deep: true }
);

const handleAdd = () => {
  resetForm();
  dialogTitle.value = t("segmentManage.createSegment");
  dialogVisible.value = true;
  // 确保标签列表已加载
  if (availableTags.value.length === 0) {
    loadTags();
  }
};

const handleEdit = (row: Segment.SegmentInfo) => {
  getSegmentDetail(row.id).then(res => {
    const data = res.data;
    form.id = data.id;
    form.name = data.name;
    form.category = data.category || "";
    form.description = data.description;
    // 如果状态不是 active 或 inactive，则根据状态设置：draft/running/failed 都设为 inactive
    form.status = data.status === "active" ? "active" : "inactive";
    ruleTree.value = data.ruleConfig?.root || {
      id: "root",
      type: "group",
      operator: "AND",
      children: []
    };
    dialogTitle.value = t("segmentManage.editSegment");
    dialogVisible.value = true;
    estimateResult.value = null;
    // 确保标签列表已加载
    if (availableTags.value.length === 0) {
      loadTags();
    }
  });
};

const handleView = (row: Segment.SegmentInfo) => {
  currentSegment.value = row;
  previewVisible.value = true;
};

const handleEstimate = async () => {
  if (!form.ruleConfig || !ruleTree.value.children || ruleTree.value.children.length === 0) {
    ElMessage.warning(t("segmentManage.enterRuleConfig"));
    return;
  }
  const res = await estimateSegment(ruleTree.value);
  estimateResult.value = res.data;
  ElMessage.success(t("segmentManage.estimateComplete"));
};

const submitForm = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    saveSegment({
      ...form,
      ruleConfig: { root: ruleTree.value }
    })
      .then(() => {
        ElMessage.success(t("segmentManage.saveSuccess"));
        dialogVisible.value = false;
        proTable.value?.getTableList();
      })
      .finally(() => (submitting.value = false));
  });
};

const handleExport = (row?: Segment.SegmentInfo | null) => {
  const target = row || currentSegment.value;
  if (!target) {
    ElMessage.warning(t("segmentManage.selectSegmentFirst"));
    return;
  }
  ElMessageBox.confirm(t("segmentManage.confirmExport", { name: target.name }), t("common.confirm"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    exportSegment(target.id, ["oneId", "name", "phone"]).then(() => {
      ElMessage.success(t("segmentManage.exportTaskSubmitted"));
    });
  });
};

// 停用分群
const handleDisable = (row: Segment.SegmentInfo) => {
  ElMessageBox.confirm(t("segmentManage.messages.disableConfirm", { name: row.name }), t("common.confirm"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    disableSegment({ id: row.id }).then(() => {
      ElMessage.success(t("segmentManage.messages.disableSuccess"));
      proTable.value?.getTableList();
    });
  });
};

const mockPreview = async () => {
  // 简单预览占位
  return {
    data: {
      list: [
        { oneId: "ONEID0001", name: "陈建华", gender: "女", tagSummary: "高价值客户, 活跃" },
        { oneId: "ONEID0002", name: "王芳", gender: "男", tagSummary: "新能源, 高潜" }
      ],
      total: 2
    }
  };
};

const resetForm = () => {
  form.id = undefined;
  form.name = "";
  form.category = "";
  form.description = "";
  form.status = "active";
  form.ruleConfig = null;
  ruleTree.value = {
    id: "root",
    type: "group",
    operator: "AND",
    children: []
  };
  estimateResult.value = null;
};

// 加载标签列表
const loadTags = async () => {
  try {
    // 仅加载「已启用」状态的标签，保持与标签管理模块状态值一致（active）
    const res = await getTagList({ pageNum: 1, pageSize: 1000, status: "active" });
    console.log("标签列表响应:", res);
    if (res.data?.list) {
      availableTags.value = res.data.list.map((tag: TagManage.TagInfo) => ({
        tagId: tag.tagId,
        tagName: tag.tagName,
        category: tag.category
      }));
      console.log("已加载标签数量:", availableTags.value.length, availableTags.value);
    } else {
      console.warn("标签列表为空，响应数据:", res);
    }
  } catch (error) {
    console.error("加载标签列表失败:", error);
  }
};

// 组件挂载时加载标签
onMounted(() => {
  loadTags();
});
</script>

<style scoped lang="scss">
.segment-manage {
  .strong {
    font-weight: 600;
  }

  .status-cell {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .start-audit {
    cursor: help;
  }

  .rule-config-form-item {
    :deep(.el-form-item__content) {
      width: 100%;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;

      .estimate-result {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background-color: var(--el-bg-color-page);
        border-radius: 4px;
        font-size: 14px;
        color: var(--el-text-color-regular);

        .estimate-item {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;

          strong {
            color: var(--el-color-success);
            font-weight: 600;
            margin-left: 4px;
          }
        }
      }
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .drawer-footer {
    margin-top: 12px;
    text-align: right;
  }

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
      .stats-icon-wrapper {
        background-color: rgba(64, 158, 255, 0.12);
        color: #409eff;
      }
      .stats-number {
        color: #409eff;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(64, 158, 255, 0.2);
      }
    }

    &.success-card {
      .stats-icon-wrapper {
        background-color: rgba(103, 194, 58, 0.12);
        color: #67c23a;
      }
      .stats-number {
        color: #67c23a;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(103, 194, 58, 0.2);
      }
    }

    &.warning-card {
      .stats-icon-wrapper {
        background-color: rgba(230, 162, 60, 0.12);
        color: #e6a23c;
      }
      .stats-number {
        color: #e6a23c;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(230, 162, 60, 0.2);
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
}
</style>

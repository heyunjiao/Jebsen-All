<template>
  <div class="table-box tag-manage">
    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><CollectionTag /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(tagStats.tagTotal) }}</div>
          <div class="stats-label">{{ t("tagManage.stats.tagTotal") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">
            {{ formatNumber(tagStats.coverageCount) }} <span class="sub-value">({{ tagStats.coveragePercent }}%)</span>
          </div>
          <div class="stats-label">{{ t("tagManage.stats.tagCoverage") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(tagStats.active) }}</div>
          <div class="stats-label">{{ t("tagManage.stats.active") }}</div>
        </div>
      </div>
      <div class="stats-card warning-card">
        <div class="stats-icon-wrapper">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(tagStats.auto) }}</div>
          <div class="stats-label">{{ t("tagManage.stats.auto") }}</div>
        </div>
      </div>
      <div class="stats-card info-card">
        <div class="stats-icon-wrapper">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(tagStats.manual) }}</div>
          <div class="stats-label">{{ t("tagManage.stats.manual") }}</div>
        </div>
      </div>
    </div>

    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="tagId"
      :tool-button="['refresh', 'setting', 'search']"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增标签</el-button>
        <!-- <el-button
          type="success"
          plain
          :icon="Edit"
          :disabled="!scope.isSelected || scope.selectedListIds.length !== 1"
          @click="handleUpdate()"
        >
          编辑
        </el-button>
        <el-button
          type="warning"
          plain
          :icon="View"
          @click="handleViewDetail()"
          :disabled="!scope.isSelected || scope.selectedListIds.length !== 1"
        >
          查看详情
        </el-button> -->
      </template>

      <!-- 标签名称列 -->
      <template #tagName="scope">
        <el-link type="primary" :underline="false" @click="handleViewDetail(scope.row)">
          {{ scope.row.tagName }}
        </el-link>
      </template>

      <!-- 分类列 -->
      <template #category="scope">
        <el-tag :type="getCategoryType(scope.row.category) as any" size="small">
          {{ scope.row.category }}
        </el-tag>
      </template>

      <!-- 标签类型列 -->
      <template #tagType="scope">
        <el-tag :type="scope.row.tagType === 'auto' ? 'success' : 'info'" size="small">
          {{ scope.row.tagType === "auto" ? "自动化规则" : "人工手动" }}
        </el-tag>
      </template>

      <!-- 状态列 -->
      <template #status="scope">
        <div class="status-cell">
          <el-tag :type="getStatusType(scope.row.status) as any" size="small">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </div>
      </template>

      <!-- 覆盖人数列 -->
      <template #coverageCount="scope">
        <span class="coverage-count">{{ scope.row.coverageCount.toLocaleString() }}</span>
        <span class="coverage-rate">({{ scope.row.coverageRate }})</span>
      </template>

      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="Edit" @click="handleUpdate(scope.row)">编辑</el-button>
        <el-button
          v-if="scope.row.status === 'draft' || scope.row.status === 'inactive'"
          type="success"
          link
          :icon="Check"
          @click="handleEnable(scope.row)"
        >
          启用
        </el-button>
        <el-button v-if="scope.row.status === 'active'" type="warning" link :icon="Close" @click="handleDisable(scope.row)">
          停用
        </el-button>
        <el-button type="info" link :icon="View" @click="handleViewDetail(scope.row)">详情</el-button>
      </template>
    </ProTable>

    <!-- 添加或修改标签对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="1400px"
      append-to-body
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="form.tagName" placeholder="请输入标签名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item :label="t('tagManage.category')" prop="category">
          <el-select
            v-model="form.category"
            :placeholder="t('tagManage.selectCategory')"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签类型" prop="tagType">
          <el-radio-group v-model="form.tagType">
            <el-radio value="auto">自动化规则</el-radio>
            <el-radio value="manual">人工手动</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item :label="t('tagManage.status')" prop="status">
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
            :active-text="t('tagManage.statusOptions.active')"
            :inactive-text="t('tagManage.statusOptions.inactive')"
          />
        </el-form-item>
        <!-- 规则配置（仅自动化规则显示） -->
        <el-form-item v-if="form.tagType === 'auto'" label="规则配置" prop="ruleConfig" class="rule-config-form-item">
          <RuleEditor v-model="ruleTree" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <el-button v-if="form.tagType === 'auto'" type="success" :icon="View" @click="handleSimulate">模拟验证</el-button>
            <div v-if="simulateResult" class="simulate-result">
              <span class="simulate-item">
                预估覆盖人数：<strong>{{ simulateResult.estimatedCount.toLocaleString() }}</strong> 人
              </span>
              <span class="simulate-item">
                预估覆盖率：<strong>{{ simulateResult.estimatedRate }}</strong>
              </span>
            </div>
          </div>
          <div class="footer-right">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 标签详情对话框 -->
    <el-dialog title="标签详情" v-model="detailVisible" width="900px" append-to-body>
      <div v-if="currentTag" class="tag-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标签ID">{{ currentTag.tagId }}</el-descriptions-item>
          <el-descriptions-item label="标签名称">{{ currentTag.tagName }}</el-descriptions-item>
          <el-descriptions-item label="标签分类">
            <el-tag :type="getCategoryType(currentTag.category) as any" size="small">
              {{ currentTag.category }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标签类型">
            <el-tag :type="currentTag.tagType === 'auto' ? 'success' : 'info'" size="small">
              {{ currentTag.tagType === "auto" ? "自动化规则" : "人工手动" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTag.status) as any" size="small">
              {{ getStatusLabel(currentTag.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="覆盖人数">
            {{ currentTag.coverageCount.toLocaleString() }} ({{ currentTag.coverageRate }})
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentTag.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentTag.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentTag.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="发布时间" v-if="currentTag.publishTime">
            {{ currentTag.publishTime }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">{{ currentTag.version }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentTag.description }}</el-descriptions-item>
        </el-descriptions>

        <!-- 规则配置展示 -->
        <div v-if="currentTag.ruleConfig" class="rule-display mt-20">
          <h4>规则配置</h4>
          <el-card shadow="never">
            <div v-if="currentTag.ruleConfig.root" class="rule-tree-display">
              <RuleTreeDisplay :node="currentTag.ruleConfig.root" />
            </div>
            <div v-else-if="currentTag.ruleConfig.conditions" class="rule-tree">
              <div class="rule-logic">{{ currentTag.ruleConfig.logic || "AND" }}</div>
              <div class="rule-conditions">
                <div v-for="(condition, index) in currentTag.ruleConfig.conditions" :key="index" class="condition-display">
                  {{ getFieldLabel(condition.field) }} {{ getOperatorLabel(condition.operator) }} {{ condition.value }}
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 版本历史 -->
        <div v-if="currentTag.versionHistory && currentTag.versionHistory.length > 0" class="version-history mt-20">
          <h4>版本历史</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(version, index) in currentTag.versionHistory"
              :key="index"
              :timestamp="version.updateTime"
              placement="top"
            >
              <el-card>
                <h4>{{ version.version }}</h4>
                <p>操作人：{{ version.operator }}</p>
                <p>变更说明：{{ version.changeLog }}</p>
                <el-button
                  v-if="index > 0"
                  type="primary"
                  link
                  size="small"
                  @click="handleRollback(currentTag.tagId, version.version)"
                >
                  回滚到此版本
                </el-button>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="tagManage">
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, View, Check, Close, CollectionTag, UserFilled } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import type { TagManage } from "@/api/modules/tagManage";
import RuleEditor, { type RuleNode } from "./components/RuleEditor.vue";
import RuleTreeDisplay from "./components/RuleTreeDisplay.vue";
import {
  getTagList,
  getTagDetail,
  addTag,
  editTag,
  publishTag,
  disableTag,
  simulateRule,
  rollbackVersion
} from "@/api/modules/tagManage";

// ProTable 实例
const proTable = ref<ProTableInstance>();

const { t } = useI18n();

// 标签统计数据
const tagStats = reactive({
  tagTotal: 156,
  coverageCount: 2450000,
  coveragePercent: 85,
  active: 45,
  auto: 78,
  manual: 33
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

// 响应式数据
const title = ref("");
const open = ref(false);
const detailVisible = ref(false);
const submitting = ref(false);
const formRef = ref();
const currentTag = ref<TagManage.TagInfo | null>(null);
const simulateResult = ref<TagManage.ResSimulate | null>(null);

const form = reactive<TagManage.ReqTagForm & { description: string; status: TagManage.TagStatus }>({
  tagId: undefined,
  tagName: "",
  category: "",
  tagType: "auto",
  // 默认状态与接口定义保持一致，使用已启用状态值 active
  status: "active",
  description: "",
  ruleConfig: null
});

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

// 规则树（用于规则编辑器）
const ruleTree = ref<RuleNode>({
  id: "root",
  type: "group",
  operator: "AND",
  children: []
});

const rules = {
  tagName: [{ required: true, message: "标签名称不能为空", trigger: "blur" }],
  category: [{ required: true, message: "标签分类不能为空", trigger: "change" }],
  tagType: [{ required: true, message: "标签类型不能为空", trigger: "change" }],
  status: [{ required: true, message: "状态不能为空", trigger: "change" }],
  description: [{ required: true, message: "标签描述不能为空", trigger: "blur" }]
};

// 表格配置项
const columns = reactive<ColumnProps<TagManage.TagInfo>[]>([
  {
    prop: "tagName",
    label: "标签名称",
    minWidth: 150,
    search: {
      el: "input",
      label: "标签名称",
      props: { placeholder: "请输入标签名称" }
    }
  },
  {
    prop: "category",
    label: "分类",
    minWidth: 100,
    search: {
      el: "select",
      label: "分类",
      props: {
        placeholder: "请选择分类",
        options: categoryOptions.map(item => ({ label: item, value: item }))
      }
    }
  },
  {
    prop: "tagType",
    label: t("tagManage.tagType"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("tagManage.tagType"),
      props: {
        placeholder: t("tagManage.tagType"),
        options: [
          { label: t("tagManage.tagTypeOptions.auto"), value: "auto" },
          { label: t("tagManage.tagTypeOptions.manual"), value: "manual" }
        ]
      }
    }
  },
  {
    prop: "status",
    label: t("tagManage.status"),
    minWidth: 100,
    search: {
      el: "select",
      label: t("tagManage.status"),
      props: {
        placeholder: t("tagManage.status"),
        options: [
          { label: t("tagManage.statusOptions.draft"), value: "draft" },
          { label: t("tagManage.statusOptions.active"), value: "active" },
          { label: t("tagManage.statusOptions.inactive"), value: "inactive" },
          { label: t("tagManage.statusOptions.abandoned"), value: "abandoned" }
        ]
      }
    }
  },
  {
    prop: "coverageCount",
    label: "覆盖人数",
    minWidth: 150
  },
  {
    prop: "creator",
    label: "创建人",
    minWidth: 100
  },
  {
    prop: "createTime",
    label: "创建时间",
    minWidth: 180
  },
  {
    prop: "updateTime",
    label: "更新时间",
    minWidth: 180
  },
  {
    prop: "operation",
    label: "操作",
    fixed: "right",
    width: 300
  }
]);

// 数据回调
const dataCallback = (data: any) => {
  const list = data.list || data.data?.list || [];
  return {
    list,
    total: data.total || data.data?.total || 0
  };
};

// 获取表格数据
const getTableList = (params: any) => {
  return getTagList(params);
};

// 获取状态类型
const getStatusType = (status: TagManage.TagStatus) => {
  const statusMap = {
    draft: "info",
    active: "success",
    inactive: "warning",
    abandoned: "danger"
  };
  return statusMap[status] || "info";
};

// 获取状态标签（走 i18n，保证与多语言文案完全一致）
const getStatusLabel = (status: TagManage.TagStatus) => {
  return t(`tagManage.statusOptions.${status}`);
};

// 获取分类类型
const getCategoryType = (category: TagManage.TagCategory) => {
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

// 获取字段标签
const getFieldLabel = (field: string) => {
  const fieldMap: Record<string, string> = {
    annualConsumption: "年消费金额",
    age: "年龄",
    gender: "性别",
    visitCount90Days: "90天到店次数",
    vehicleType: "车辆类型",
    lastVisitDays: "最后到店天数",
    totalConsumption: "累计消费"
  };
  return fieldMap[field] || field;
};

// 获取操作符标签
const getOperatorLabel = (operator: string) => {
  const operatorMap: Record<string, string> = {
    "=": "等于",
    "!=": "不等于",
    ">": "大于",
    ">=": "大于等于",
    "<": "小于",
    "<=": "小于等于",
    contains: "包含",
    "not contains": "不包含"
  };
  return operatorMap[operator] || operator;
};

// 移除实时同步，避免递归更新
// 规则配置将在提交表单时设置

// 模拟验证
const handleSimulate = async () => {
  if (!ruleTree.value || !ruleTree.value.children || ruleTree.value.children.length === 0) {
    ElMessage.warning("请先配置规则");
    return;
  }
  try {
    // 直接传递规则树节点
    const result = await simulateRule({ ruleConfig: ruleTree.value });
    simulateResult.value = result.data;
    ElMessage.success("模拟验证完成");
  } catch (error) {
    console.error("模拟验证失败:", error);
  }
};

// 新增
const handleAdd = () => {
  resetForm();
  title.value = "新增标签";
  open.value = true;
};

// 修改
const handleUpdate = (row?: TagManage.TagInfo) => {
  const tagId = row?.tagId || proTable.value?.selectedListIds?.[0];
  if (!tagId) {
    ElMessage.warning("请选择要修改的标签");
    return;
  }

  getTagDetail(tagId).then(res => {
    const data = res.data;
    form.tagId = data.tagId;
    form.tagName = data.tagName;
    form.category = data.category;
    form.tagType = data.tagType;
    form.status = data.status;
    form.description = data.description;

    // 处理规则配置：兼容旧格式和新格式
    if (data.ruleConfig) {
      if (data.ruleConfig.root) {
        // 新格式：树状结构
        ruleTree.value = JSON.parse(JSON.stringify(data.ruleConfig.root));
        form.ruleConfig = data.ruleConfig;
      } else if (data.ruleConfig.conditions && data.ruleConfig.conditions.length > 0) {
        // 旧格式：扁平结构，转换为树状结构
        ruleTree.value = {
          id: "root",
          type: "group",
          operator: (data.ruleConfig.logic as "AND" | "OR") || "AND",
          children: data.ruleConfig.conditions.map((condition, index) => ({
            id: `condition_${index}`,
            type: "predicate" as const,
            field: condition.field,
            operatorType: convertOperator(condition.operator),
            value: condition.value
          }))
        };
        form.ruleConfig = {
          root: ruleTree.value
        };
      } else {
        // 空规则
        ruleTree.value = {
          id: "root",
          type: "group",
          operator: "AND",
          children: []
        };
        form.ruleConfig = {
          root: ruleTree.value
        };
      }
    } else {
      // 无规则配置
      ruleTree.value = {
        id: "root",
        type: "group",
        operator: "AND",
        children: []
      };
      form.ruleConfig = null;
    }

    title.value = "修改标签";
    open.value = true;
    simulateResult.value = null;
  });
};

// 转换操作符格式
const convertOperator = (op: string): string => {
  const operatorMap: Record<string, string> = {
    "=": "eq",
    "!=": "ne",
    ">": "gt",
    ">=": "gte",
    "<": "lt",
    "<=": "lte",
    contains: "contains",
    "not contains": "notContains"
  };
  return operatorMap[op] || "eq";
};

// 启用
const handleEnable = (row: TagManage.TagInfo) => {
  ElMessageBox.confirm(`确定要启用标签"${row.tagName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "success"
  }).then(() => {
    publishTag({ tagId: row.tagId }).then(() => {
      ElMessage.success("启用成功");
      proTable.value?.getTableList();
    });
  });
};

// 停用
const handleDisable = (row: TagManage.TagInfo) => {
  ElMessageBox.confirm(`确定要停用标签"${row.tagName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    disableTag({ tagId: row.tagId }).then(() => {
      ElMessage.success("停用成功");
      proTable.value?.getTableList();
    });
  });
};

// 查看详情
const handleViewDetail = async (row?: TagManage.TagInfo) => {
  const tagId = row?.tagId || proTable.value?.selectedListIds?.[0];
  if (!tagId) {
    ElMessage.warning("请选择要查看的标签");
    return;
  }

  try {
    const res = await getTagDetail(tagId);
    currentTag.value = res.data;
    detailVisible.value = true;
  } catch (error) {
    console.error("获取标签详情失败:", error);
  }
};

// 版本回滚
const handleRollback = (tagId: string, version: string) => {
  ElMessageBox.confirm(`确定要回滚到版本"${version}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    rollbackVersion({ tagId, version }).then(() => {
      ElMessage.success("回滚成功");
      handleViewDetail({ tagId } as TagManage.TagInfo);
      proTable.value?.getTableList();
    });
  });
};

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;

    // 如果是自动化规则，验证规则配置
    if (form.tagType === "auto") {
      if (!ruleTree.value || !ruleTree.value.children || ruleTree.value.children.length === 0) {
        ElMessage.warning("请至少添加一个规则条件");
        return;
      }

      // 验证规则树是否完整
      const validateTree = (node: RuleNode): boolean => {
        if (node.type === "group") {
          if (!node.operator) {
            ElMessage.warning("请选择逻辑运算符（且/或）");
            return false;
          }
          if (!node.children || node.children.length === 0) {
            ElMessage.warning("组内不能为空");
            return false;
          }
          return node.children.every(validateTree);
        } else {
          // predicate
          if (!node.field || !node.operatorType || node.value === undefined || node.value === "") {
            ElMessage.warning("请完善所有条件配置");
            return false;
          }
          return true;
        }
      };

      if (!validateTree(ruleTree.value)) {
        return;
      }
    }

    submitting.value = true;
    const api = form.tagId ? editTag : addTag;
    const params: TagManage.ReqTagForm = {
      tagId: form.tagId,
      tagName: form.tagName,
      category: form.category,
      tagType: form.tagType,
      status: form.status,
      description: form.description,
      ruleConfig: form.tagType === "auto" ? { root: ruleTree.value } : null
    };

    api(params)
      .then(() => {
        ElMessage.success(form.tagId ? "修改成功" : "新增成功");
        open.value = false;
        proTable.value?.getTableList();
      })
      .finally(() => {
        submitting.value = false;
      });
  });
};

// 取消
const cancel = () => {
  open.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  form.tagId = undefined;
  form.tagName = "";
  form.category = "";
  form.tagType = "auto";
  // 重置时保持与表单初始值一致，避免使用未在枚举中定义的状态值
  form.status = "active";
  form.description = "";
  form.ruleConfig = null;
  ruleTree.value = {
    id: "root",
    type: "group",
    operator: "AND",
    children: []
  };
  simulateResult.value = null;
  formRef.value?.resetFields();
};

// 对话框关闭
const handleDialogClose = () => {
  resetForm();
};
</script>

<style lang="scss" scoped>
.tag-manage {
  .coverage-count {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .status-cell {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .start-audit {
    cursor: help;
  }

  .coverage-rate {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-left: 4px;
  }

  .rule-config-form-item {
    :deep(.el-form-item__content) {
      width: 100%;
    }
  }

  .tag-detail {
    .rule-display {
      h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }

      .rule-tree {
        .rule-logic {
          font-weight: 600;
          color: var(--el-color-primary);
          margin-bottom: 12px;
        }

        .rule-conditions {
          .condition-display {
            padding: 8px 12px;
            background-color: var(--el-bg-color-page);
            border-radius: 4px;
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .version-history {
      h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }
    }
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

.mt-12 {
  margin-top: 12px;
}

.mt-20 {
  margin-top: 20px;
}

.mb-12 {
  margin-bottom: 12px;
}
</style>

<style lang="scss">
// 全局样式，用于修复对话框内下拉框定位问题
.rule-select-dropdown {
  z-index: 3000 !important;
}

// 确保对话框内容区域不会裁剪下拉框
.el-dialog__body {
  overflow: visible !important;
}

// 对话框底部样式（因为 footer slot 内容在组件外部）
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;

    .simulate-result {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 16px;
      background-color: var(--el-bg-color-page);
      border-radius: 4px;
      font-size: 14px;
      color: var(--el-text-color-regular);

      .simulate-item {
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
    gap: 12px;
  }
}
</style>

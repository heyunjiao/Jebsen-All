<template>
  <el-drawer
    v-model="visible"
    :title="isBatch ? `批量推送配置 (${batchInfo?.count || 0} 条)` : '推送配置'"
    :size="680"
    :before-close="handleClose"
    direction="rtl"
  >
    <div class="push-drawer-content">
      <!-- A. 任务配置区 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="section-title">任务配置</div>
        </template>

        <el-form :model="formData" label-width="100px" label-position="right">
          <!-- 推送目标 -->
          <el-form-item label="推送目标" required>
            <el-radio-group v-model="formData.targetSystem">
              <el-radio v-for="option in PUSH_TARGET_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 接收对象 -->
          <el-form-item label="接收对象">
            <el-select
              v-model="formData.assignee"
              placeholder="请选择或搜索服务顾问/销售顾问"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option v-for="advisor in advisorList" :key="advisor.id" :label="advisor.name" :value="advisor.id">
                <span>{{ advisor.name }}</span>
                <span style="color: #8492a6; font-size: 12px; margin-left: 10px">
                  {{ advisor.role }} - {{ advisor.department }}
                </span>
              </el-option>
            </el-select>
            <div class="form-tip" v-if="defaultAdvisor">
              <el-icon><InfoFilled /></el-icon>
              系统检测到该客户已有专属顾问：<strong>{{ defaultAdvisor.name }}</strong>，已自动选中
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- B. 批量推送信息 / 联系人清洗区 -->
      <el-card shadow="never" class="section-card" v-if="isBatch">
        <template #header>
          <div class="section-title">批量推送信息</div>
        </template>

        <el-descriptions :column="2" border style="margin-bottom: 16px">
          <el-descriptions-item label="推送分类">
            {{ getCategoryLabel(props.batchInfo?.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="推送目标">
            {{ props.batchInfo?.target === "advisor" ? "推送顾问" : "推送客服" }}
          </el-descriptions-item>
          <el-descriptions-item label="待推送数量" :span="2">
            <el-tag type="warning" size="large">{{ props.batchInfo?.count || 0 }} 条商机</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px">
          <template #title>
            本次将批量推送
            <strong>{{ props.batchInfo?.count || 0 }}</strong> 条待处理商机，系统将自动为每条商机选择最优的联系人号码。
          </template>
        </el-alert>

        <!-- 商机列表预览 -->
        <div class="batch-leads-preview">
          <div class="preview-header">
            <span class="preview-title">待推送商机列表（前10条预览）</span>
            <el-tag type="info" size="small">共 {{ props.leadList?.length || 0 }} 条</el-tag>
          </div>
          <el-table
            :data="props.leadList?.slice(0, 10) || []"
            border
            size="small"
            style="width: 100%"
            max-height="300"
            row-key="id"
          >
            <el-table-column prop="customerName" label="客户姓名" width="120">
              <template #default="scope">
                {{ scope.row.customerName || scope.row.name || "未知" }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="商机类型" width="120">
              <template #default="scope">
                <el-tag size="small" type="primary">
                  {{ getLeadTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="联系电话" width="130">
              <template #default="scope">
                {{ scope.row.phone || scope.row.mobile || "未提供" }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag size="small" type="warning">待处理</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="150">
              <template #default="scope">
                {{ scope.row.createTime || scope.row.createdAt || "未知" }}
              </template>
            </el-table-column>
          </el-table>
          <div v-if="(props.leadList?.length || 0) > 10" class="preview-footer">
            <el-text type="info" size="small"> 还有 {{ (props.leadList?.length || 0) - 10 }} 条商机未显示... </el-text>
          </div>
        </div>
      </el-card>

      <!-- B. 联系人清洗区（单个推送时显示） -->
      <el-card shadow="never" class="section-card" v-else>
        <template #header>
          <div class="section-title">联系人清洗</div>
        </template>

        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px">
          <template #title> 由于 OneID 合并了多条记录，请选择要推送的号码。系统已默认勾选权重最高的号码。 </template>
        </el-alert>

        <el-table
          :data="contactList"
          border
          style="width: 100%"
          size="small"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="50" :reserve-selection="true" />
          <el-table-column prop="source" label="来源系统" width="100">
            <template #default="scope">
              <el-tag size="small" type="info">{{ scope.row.source }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="relation" label="关系标签" width="110">
            <template #default="scope">
              <el-tag :type="getRelationTagType(scope.row.relation)" size="small">
                {{ scope.row.relation }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="号码预览" min-width="130">
            <template #default="scope">
              <span class="phone-text">{{ scope.row.phone }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="最近状态" width="90">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="权重" width="100" align="center">
            <template #default="scope">
              <el-rate
                v-model="scope.row.weight"
                disabled
                :max="5"
                show-score
                text-color="#ff9900"
                score-template="{value}"
                :size="14"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- C. 安全审计区 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="section-title">安全审计预览</div>
        </template>

        <el-alert
          :title="`本次操作将生成审计日志 (LogID: #${logId})，请确保合规。`"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        />

        <div class="json-preview">
          <div class="json-header">
            <el-icon><Document /></el-icon>
            <span>即将发送的 Payload</span>
          </div>
          <div class="json-content-wrapper">
            <pre class="json-content">{{ JSON.stringify(previewPayload, null, 2) }}</pre>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading" size="default"> 确认推送 </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { InfoFilled, Document } from "@element-plus/icons-vue";
import { pushLeads } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { PUSH_TARGET_OPTIONS } from "../interface";

interface ContactInfo {
  id: string;
  source: string; // DMS / 车机 / 官网注册
  relation: string; // 本人 / 疑似妻子 / 常用联系人
  phone: string;
  status: "有效" | "空号" | "黑名单";
  weight: number; // 1-5
  selected: boolean;
}

interface Advisor {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface BatchInfo {
  category: string;
  target: "advisor" | "service";
  count: number;
}

interface Props {
  modelValue: boolean;
  leadIds?: string[];
  leadList?: any[]; // 批量推送时的商机列表
  defaultAdvisor?: Advisor | null;
  contacts?: ContactInfo[];
  isBatch?: boolean; // 是否为批量推送
  batchInfo?: BatchInfo; // 批量推送信息
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  leadIds: () => [],
  leadList: () => [],
  defaultAdvisor: null,
  contacts: () => [],
  isBatch: false,
  batchInfo: undefined
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});

const loading = ref(false);
const logId = ref(Math.floor(Math.random() * 10000));

const formData = ref({
  targetSystem: "BDC外呼系统" as Lead.PushTarget,
  assignee: ""
});

const advisorList = ref<Advisor[]>([
  { id: "1", name: "张顾问", role: "服务顾问", department: "北京朝阳店" },
  { id: "2", name: "李顾问", role: "销售顾问", department: "北京朝阳店" },
  { id: "3", name: "王顾问", role: "服务顾问", department: "北京海淀店" }
]);

const contactList = ref<ContactInfo[]>([
  {
    id: "1",
    source: "DMS",
    relation: "本人",
    phone: "138****8888",
    status: "有效",
    weight: 5,
    selected: true
  },
  {
    id: "2",
    source: "车机",
    relation: "疑似妻子",
    phone: "139****9999",
    status: "有效",
    weight: 3,
    selected: false
  },
  {
    id: "3",
    source: "官网注册",
    relation: "常用联系人",
    phone: "137****7777",
    status: "有效",
    weight: 2,
    selected: false
  }
]);

// 监听props变化，初始化数据
watch(
  () => props.modelValue,
  val => {
    if (val) {
      // 初始化表单数据
      if (props.defaultAdvisor) {
        formData.value.assignee = props.defaultAdvisor.id;
      } else {
        formData.value.assignee = "";
      }
      // 使用传入的联系人数据或默认数据
      if (props.contacts && props.contacts.length > 0) {
        contactList.value = props.contacts.map(c => ({ ...c }));
      }
      // 默认选中权重最高的
      if (contactList.value.length > 0) {
        const maxWeight = Math.max(...contactList.value.map(c => c.weight));
        contactList.value.forEach(c => {
          c.selected = c.weight === maxWeight;
        });
      }
      // 生成新的日志ID
      logId.value = Math.floor(Math.random() * 10000);
    }
  },
  { immediate: true }
);

// 处理表格选择变化
const handleSelectionChange = (selection: ContactInfo[]) => {
  contactList.value.forEach(contact => {
    contact.selected = selection.some(sel => sel.id === contact.id);
  });
};

// 预览Payload
const previewPayload = computed(() => {
  const selectedContacts = contactList.value.filter(c => c.selected);
  return {
    opportunity_ids: props.leadIds,
    target_system: formData.value.targetSystem,
    assignee: formData.value.assignee || null,
    contacts: props.isBatch
      ? null
      : selectedContacts.map(c => ({
          phone: c.phone,
          source: c.source,
          relation: c.relation
        })),
    batch_info: props.isBatch
      ? {
          category: props.batchInfo?.category,
          target: props.batchInfo?.target,
          count: props.batchInfo?.count
        }
      : null,
    log_id: logId.value,
    timestamp: new Date().toISOString()
  };
});

const getRelationTagType = (relation: string) => {
  const map: Record<string, string> = {
    本人: "success",
    疑似妻子: "warning",
    常用联系人: "info"
  };
  return map[relation] || "info";
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    有效: "success",
    空号: "danger",
    黑名单: "danger"
  };
  return map[status] || "info";
};

// 获取分类标签
const getCategoryLabel = (category?: string) => {
  const categoryMap: Record<string, string> = {
    diamond: "钻石客户",
    gold: "黄金客户",
    silver: "白银客户",
    new_to_renew: "新转续",
    renew_to_renew: "续转续",
    in_repair_no_insurance: "在修不在保",
    dormant: "沉睡",
    pending_activation: "待激活",
    active: "活跃"
  };
  return category ? categoryMap[category] || category : "未知分类";
};

// 获取商机类型标签
const getLeadTypeLabel = (type?: string) => {
  const typeMap: Record<string, string> = {
    maintenance: "维保",
    insurance: "保险",
    repair: "维修",
    sales: "销售",
    service: "服务"
  };
  return type ? typeMap[type] || type : "未知类型";
};

const handleClose = () => {
  visible.value = false;
};

const handleConfirm = async () => {
  if (props.leadIds.length === 0) {
    ElMessage.warning("请选择要推送的商机");
    return;
  }

  // 批量推送时不需要选择联系人
  if (!props.isBatch) {
    const selectedContacts = contactList.value.filter(c => c.selected);
    if (selectedContacts.length === 0) {
      ElMessage.warning("请至少选择一个联系人号码");
      return;
    }
  }

  if (!formData.value.targetSystem) {
    ElMessage.warning("请选择推送目标");
    return;
  }

  loading.value = true;
  try {
    await pushLeads({
      leadIds: props.leadIds,
      target: formData.value.targetSystem,
      assignee: formData.value.assignee || undefined,
      force: false
    });
    ElMessage.success(props.isBatch ? `批量推送成功，共推送 ${props.leadIds.length} 条商机` : "推送成功");
    emit("success");
    handleClose();
  } catch (error: any) {
    ElMessage.error(error.message || "推送失败");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.push-drawer-content {
  padding: 0;

  .section-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .form-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--el-color-info);
      margin-top: 8px;
      line-height: 1.5;

      .el-icon {
        font-size: 14px;
      }

      strong {
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }
  }

  .json-preview {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;
    background: var(--el-bg-color);

    .json-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--el-fill-color-light);
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);

      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }

    .json-content-wrapper {
      max-height: 280px;
      overflow-y: auto;
      background: var(--el-fill-color-blank);

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color-darker);
        border-radius: 3px;
      }
    }

    .json-content {
      padding: 16px;
      margin: 0;
      font-size: 12px;
      line-height: 1.8;
      color: var(--el-text-color-regular);
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .phone-text {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  .batch-leads-preview {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .preview-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .preview-footer {
      margin-top: 12px;
      text-align: center;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
</style>

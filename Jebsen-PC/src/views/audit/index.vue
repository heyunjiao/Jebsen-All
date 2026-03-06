<template>
  <div class="app-container table-box">
    <!-- Tab 组件 -->
    <el-tabs v-model="activeTab" class="audit-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="冲突治理" name="conflict">
        <ProTable
          ref="proTable"
          :columns="conflictColumns"
          :request-api="getAuditLogList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="['refresh', 'setting', 'search']"
          row-key="id"
        >
          <!-- 展开行 -->
          <template #expand="scope">
            <el-form label-position="left" inline class="demo-table-expand" size="small">
              <el-form-item label="Log ID:"><span>{{ scope.row.id }}</span></el-form-item>
              <el-form-item label="Client IP:"><span>{{ scope.row.ip }}</span></el-form-item>
              <el-form-item label="User Agent:"><span>{{ scope.row.ua }}</span></el-form-item>
            </el-form>
          </template>

          <!-- 操作人 -->
          <template #user="scope">
            <div class="user-tag">
              <div class="user-avatar" :class="{ 'mgr-avatar': scope.row.user === 'Manager' }">
                {{ scope.row.user?.[0] || "" }}
              </div>
              <span>{{ scope.row.user }}</span>
            </div>
          </template>

          <!-- 模块 -->
          <template #module="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>

          <!-- 动作 -->
          <template #action="scope">
            <span v-if="scope.row.action?.includes('Submit') || scope.row.action?.includes('提交')" style="color: #409eff">
              <el-icon><Document /></el-icon> 提交合并
            </span>
            <span
              v-else-if="scope.row.action?.includes('修正') || scope.row.action?.includes('Correction')"
              style="color: #e6a23c"
            >
              <el-icon><Edit /></el-icon> 手动修正
            </span>
            <span v-else-if="scope.row.action?.includes('拆分') || scope.row.action?.includes('Split')" style="color: #f56c6c">
              <el-icon><Scissor /></el-icon> 拆分
            </span>
            <span v-else>{{ scope.row.action }}</span>
          </template>

          <!-- 变更对象 -->
          <template #target="scope">
            <div>
              {{ scope.row.target }}
              <span style="color: #999; font-size: 12px">(ID: {{ scope.row.targetId }})</span>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="scope">
            <el-icon style="color: #67c23a"><SuccessFilled /></el-icon> 成功
          </template>

          <!-- 操作 -->
          <template #operation="scope">
            <el-button type="primary" link size="small" :icon="View" @click="viewSnapshot(scope.row)" style="font-weight: 500">
              查看快照
            </el-button>
          </template>
        </ProTable>
      </el-tab-pane>

      <el-tab-pane label="审批中心" name="approval">
        <ProTable
          ref="proTable"
          :columns="approvalColumns"
          :request-api="getAuditLogList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="['refresh', 'setting', 'search']"
          row-key="id"
        >
          <!-- 展开行 -->
          <template #expand="scope">
            <el-form label-position="left" inline class="demo-table-expand" size="small">
              <el-form-item label="Log ID:"><span>{{ scope.row.id }}</span></el-form-item>
              <el-form-item label="Client IP:"><span>{{ scope.row.ip }}</span></el-form-item>
              <el-form-item label="User Agent:"><span>{{ scope.row.ua }}</span></el-form-item>
            </el-form>
          </template>

          <!-- 操作人 -->
          <template #user="scope">
            <div class="user-tag">
              <div class="user-avatar" :class="{ 'mgr-avatar': scope.row.user === 'Manager' }">
                {{ scope.row.user?.[0] || "" }}
              </div>
              <span>{{ scope.row.user }}</span>
            </div>
          </template>

          <!-- 模块 -->
          <template #module="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>

          <!-- 动作 -->
          <template #action="scope">
            <span
              v-if="scope.row.action?.includes('Approve') || scope.row.action?.includes('批准')"
              style="color: #67c23a; font-weight: bold"
            >
              <el-icon><Check /></el-icon> 批准
            </span>
            <span v-else-if="scope.row.action?.includes('Reject') || scope.row.action?.includes('驳回')" style="color: #f56c6c">
              <el-icon><Close /></el-icon> 驳回
            </span>
            <span v-else>{{ scope.row.action }}</span>
          </template>

          <!-- 变更对象 -->
          <template #target="scope">
            <div>
              {{ scope.row.target }}
              <span style="color: #999; font-size: 12px">(ID: {{ scope.row.targetId }})</span>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="scope">
            <el-icon style="color: #67c23a"><SuccessFilled /></el-icon> 成功
          </template>

          <!-- 操作 -->
          <template #operation="scope">
            <el-button type="primary" link size="small" :icon="View" @click="viewSnapshot(scope.row)" style="font-weight: 500">
              查看快照
            </el-button>
          </template>
        </ProTable>
      </el-tab-pane>

      <el-tab-pane label="规则引擎" name="ruleEngine">
        <ProTable
          ref="proTable"
          :columns="ruleEngineColumns"
          :request-api="getAuditLogList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="['refresh', 'setting', 'search']"
          row-key="id"
        >
          <!-- 展开行 -->
          <template #expand="scope">
            <el-form label-position="left" inline class="demo-table-expand" size="small">
              <el-form-item label="Log ID:"><span>{{ scope.row.id }}</span></el-form-item>
              <el-form-item label="Client IP:"><span>{{ scope.row.ip }}</span></el-form-item>
              <el-form-item label="User Agent:"><span>{{ scope.row.ua }}</span></el-form-item>
            </el-form>
          </template>

          <!-- 操作人 -->
          <template #user="scope">
            <div class="user-tag">
              <div class="user-avatar" :class="{ 'system-avatar': scope.row.user === 'System' }">
                {{ scope.row.user?.[0] || "" }}
              </div>
              <span>{{ scope.row.user }}</span>
            </div>
          </template>

          <!-- 模块 -->
          <template #module="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>

          <!-- 动作 -->
          <template #action="scope">
            <span v-if="scope.row.action?.includes('自动合并')" style="color: #409eff">
              <el-icon><Connection /></el-icon> 自动合并
            </span>
            <span v-else-if="scope.row.action?.includes('自动清洗')" style="color: #67c23a">
              <el-icon><Brush /></el-icon> 自动清洗
            </span>
            <span v-else>{{ scope.row.action }}</span>
          </template>

          <!-- 变更对象 -->
          <template #target="scope">
            <div>
              {{ scope.row.target }}
              <span style="color: #999; font-size: 12px">(ID: {{ scope.row.targetId }})</span>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="scope">
            <el-icon style="color: #67c23a"><SuccessFilled /></el-icon> 成功
          </template>

          <!-- 操作 -->
          <template #operation="scope">
            <el-button type="primary" link size="small" :icon="View" @click="viewSnapshot(scope.row)" style="font-weight: 500">
              查看快照
            </el-button>
          </template>
        </ProTable>
      </el-tab-pane>

      <el-tab-pane label="客户客户" name="customer">
        <ProTable
          ref="proTable"
          :columns="customerColumns"
          :request-api="getAuditLogList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="['refresh', 'setting', 'search']"
          row-key="id"
        >
          <!-- 展开行 -->
          <template #expand="scope">
            <el-form label-position="left" inline class="demo-table-expand" size="small">
              <el-form-item label="Log ID:"><span>{{ scope.row.id }}</span></el-form-item>
              <el-form-item label="Client IP:"><span>{{ scope.row.ip }}</span></el-form-item>
              <el-form-item label="User Agent:"><span>{{ scope.row.ua }}</span></el-form-item>
            </el-form>
          </template>

          <!-- 操作人 -->
          <template #user="scope">
            <div class="user-tag">
              <div class="user-avatar" :class="{ 'user-avatar': scope.row.user !== 'System' }">
                {{ scope.row.user?.[0] || "" }}
              </div>
              <span>{{ scope.row.user }}</span>
            </div>
          </template>

          <!-- 模块 -->
          <template #module="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>

          <!-- 动作 -->
          <template #action="scope">
            <span
              v-if="scope.row.action?.includes('查看明文') || scope.row.action?.includes('View Plain')"
              style="color: #e6a23c"
            >
              <el-icon><View /></el-icon> 查看明文手机号
            </span>
            <span v-else-if="scope.row.action?.includes('导出') || scope.row.action?.includes('Export')" style="color: #909399">
              <el-icon><Download /></el-icon> 导出
            </span>
            <span v-else>{{ scope.row.action }}</span>
          </template>

          <!-- 变更对象 -->
          <template #target="scope">
            <div>
              {{ scope.row.target }}
              <span style="color: #999; font-size: 12px">(ID: {{ scope.row.targetId }})</span>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="scope">
            <el-icon style="color: #67c23a"><SuccessFilled /></el-icon> 成功
          </template>

          <!-- 操作 -->
          <template #operation="scope">
            <el-button type="primary" link size="small" :icon="View" @click="viewSnapshot(scope.row)" style="font-weight: 500">
              查看快照
            </el-button>
          </template>
        </ProTable>
      </el-tab-pane>

      <el-tab-pane label="系统配置" name="system">
        <ProTable
          ref="proTable"
          :columns="systemColumns"
          :request-api="getAuditLogList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="['refresh', 'setting', 'search']"
          row-key="id"
        >
          <!-- 展开行 -->
          <template #expand="scope">
            <el-form label-position="left" inline class="demo-table-expand" size="small">
              <el-form-item label="Log ID:"><span>{{ scope.row.id }}</span></el-form-item>
              <el-form-item label="Client IP:"><span>{{ scope.row.ip }}</span></el-form-item>
              <el-form-item label="User Agent:"><span>{{ scope.row.ua }}</span></el-form-item>
            </el-form>
          </template>

          <!-- 操作人 -->
          <template #user="scope">
            <div class="user-tag">
              <div class="user-avatar" :class="{ 'admin-avatar': scope.row.user === 'Admin' }">
                {{ scope.row.user?.[0] || "" }}
              </div>
              <span>{{ scope.row.user }}</span>
            </div>
          </template>

          <!-- 模块 -->
          <template #module="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>

          <!-- 动作 -->
          <template #action="scope">
            <span
              v-if="scope.row.action?.includes('修改合并规则') || scope.row.action?.includes('Modify Merge Rule')"
              style="color: #409eff"
            >
              <el-icon><Edit /></el-icon> 修改合并规则
            </span>
            <span
              v-else-if="scope.row.action?.includes('调整阈值') || scope.row.action?.includes('Adjust Threshold')"
              style="color: #e6a23c"
            >
              <el-icon><Histogram /></el-icon> 调整阈值
            </span>
            <span v-else>{{ scope.row.action }}</span>
          </template>

          <!-- 变更对象 -->
          <template #target="scope">
            <div>
              {{ scope.row.target }}
              <span style="color: #999; font-size: 12px">(ID: {{ scope.row.targetId }})</span>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="scope">
            <el-icon style="color: #67c23a"><SuccessFilled /></el-icon> 成功
          </template>

          <!-- 操作 -->
          <template #operation="scope">
            <el-button type="primary" link size="small" :icon="View" @click="viewSnapshot(scope.row)" style="font-weight: 500">
              查看快照
            </el-button>
          </template>
        </ProTable>
      </el-tab-pane>

      <el-tab-pane label="企微/BDC" name="wechat">
        <ProTable
          ref="proTable"
          :columns="wechatColumns"
          :request-api="getAuditLogList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="['refresh', 'setting', 'search']"
          row-key="id"
        >
          <!-- 展开行 -->
          <template #expand="scope">
            <el-form label-position="left" inline class="demo-table-expand" size="small">
              <el-form-item label="Log ID:"><span>{{ scope.row.id }}</span></el-form-item>
              <el-form-item label="Client IP:"><span>{{ scope.row.ip }}</span></el-form-item>
              <el-form-item label="User Agent:"><span>{{ scope.row.ua }}</span></el-form-item>
            </el-form>
          </template>

          <!-- 操作人 -->
          <template #user="scope">
            <div class="user-tag">
              <div class="user-avatar" :class="{ 'sales-avatar': ['Sales', '客服'].includes(scope.row.user) }">
                {{ scope.row.user?.[0] || "" }}
              </div>
              <span>{{ scope.row.user }}</span>
            </div>
          </template>

          <!-- 模块 -->
          <template #module="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>

          <!-- 动作 -->
          <template #action="scope">
            <span
              v-if="scope.row.action?.includes('修改备注') || scope.row.action?.includes('Modify Remark')"
              style="color: #409eff"
            >
              <el-icon><EditPen /></el-icon> 修改备注
            </span>
            <span
              v-else-if="scope.row.action?.includes('新增记录') || scope.row.action?.includes('Add Record')"
              style="color: #67c23a"
            >
              <el-icon><Plus /></el-icon> 新增记录
            </span>
            <span v-else>{{ scope.row.action }}</span>
          </template>

          <!-- 变更对象 -->
          <template #target="scope">
            <div>
              {{ scope.row.target }}
              <span style="color: #999; font-size: 12px">(ID: {{ scope.row.targetId }})</span>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="scope">
            <el-icon style="color: #67c23a"><SuccessFilled /></el-icon> 成功
          </template>

          <!-- 操作 -->
          <template #operation="scope">
            <el-button type="primary" link size="small" :icon="View" @click="viewSnapshot(scope.row)" style="font-weight: 500">
              查看快照
            </el-button>
          </template>
        </ProTable>
      </el-tab-pane>
    </el-tabs>

    <!-- 快照对比抽屉 (Snapshot Drawer) -->
    <el-drawer v-model="drawerVisible" size="60%" direction="rtl" :with-header="false">
      <div class="diff-layout">
        <div class="diff-tools">
          <div>
            <span style="font-weight: bold; font-size: 16px">{{ currentLog.target || "" }}</span>
            <el-tag v-if="currentLog.targetId" size="small" type="info" style="margin-left: 8px">ID: {{ currentLog.targetId }}</el-tag>
          </div>
          <el-radio-group v-model="diffFilter" size="small">
            <el-radio-button value="all">全量字段 (22)</el-radio-button>
            <el-radio-button value="diff">仅看变更</el-radio-button>
          </el-radio-group>
        </div>

        <div class="diff-content">
          <!-- 头部说明 -->
          <el-alert
            v-if="currentLog.action === 'Approve Merge'"
            title="此次变更为【合并审批】生效，系统自动归档了旧数据。"
            type="success"
            :show-icon="true"
            style="margin-top: 20px"
          ></el-alert>

          <!-- 循环渲染 4 大分组 -->
          <div v-for="(group, idx) in displayGroups" :key="idx" class="diff-group">
            <div class="diff-group-header">
              <el-icon class="diff-icon">
                <component :is="group.icon" />
              </el-icon>
              {{ group.title }}
            </div>

            <!-- 表头 -->
            <div style="display: flex; background: #fafafa; border-bottom: 1px solid #ebeef5; color: #909399; font-size: 12px">
              <div style="width: 140px; padding: 8px 12px">字段名称</div>
              <div style="flex: 1; padding: 8px 12px">变更前 (Old)</div>
              <div style="flex: 1; padding: 8px 12px">变更后 (New)</div>
            </div>

            <!-- 字段列表 -->
            <div
              v-for="(field, fIdx) in group.fields"
              :key="fIdx"
              class="diff-row"
              :class="{ 'is-changed': field.old !== field.new }"
            >
              <div class="col-label">{{ field.label }}</div>
              <div class="col-old" v-html="formatValue(field.key, field.old)"></div>
              <div class="col-new" v-html="formatValue(field.key, field.new)"></div>
            </div>
          </div>

          <div v-if="displayGroups.length === 0" style="padding: 50px; text-align: center; color: #999">
            <el-icon style="font-size: 24px; margin-bottom: 10px; display: block"><Check /></el-icon>
            <div>当前筛选模式下无差异字段</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import {
  Check,
  Close,
  SuccessFilled,
  User,
  Phone,
  TrendCharts,
  Box,
  View,
  Document,
  Edit,
  Scissor,
  Connection,
  Brush,
  Download,
  Histogram,
  EditPen,
  Plus,
  Lightning,
  Lock,
  Setting,
  Promotion,
  ChatLineRound,
  Tools,
  Position
} from "@element-plus/icons-vue";
import { getAuditLogList } from "@/api/modules/audit";
import { ColumnProps } from "@/components/ProTable/interface";

const proTable = ref();
const initParam = reactive({});
const activeTab = ref("conflict"); // 默认激活冲突治理tab

// 数据回调处理
const dataCallback = (data: any) => {
  if (data && data.rows) {
    return {
      list: data.rows || [],
      total: data.total || 0
    };
  }
  return {
    list: [],
    total: 0
  };
};

// 冲突治理列配置
const conflictColumns = reactive<ColumnProps[]>([
  {
    type: "expand",
    slot: "expand"
  } as any,
  {
    prop: "time",
    label: "操作时间",
    width: 180,
    sortable: "custom",
    search: {
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "user",
    label: "操作人",
    width: 140,
    slot: "user",
    search: {
      el: "input",
      props: {
        placeholder: "请输入操作人"
      }
    }
  } as any,
  {
    prop: "action",
    label: "关键动作",
    width: 180,
    slot: "action"
  } as any,
  {
    prop: "target",
    label: "变更对象",
    slot: "target",
    showOverflowTooltip: true
  } as any,
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status"
  } as any,
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  } as any
]);

// 审批中心列配置
const approvalColumns = reactive<ColumnProps[]>([
  {
    type: "expand",
    slot: "expand"
  } as any,
  {
    prop: "time",
    label: "操作时间",
    width: 180,
    sortable: "custom",
    search: {
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "user",
    label: "审批人",
    width: 140,
    slot: "user",
    search: {
      el: "input",
      props: {
        placeholder: "请输入审批人"
      }
    }
  } as any,
  {
    prop: "action",
    label: "审批动作",
    width: 180,
    slot: "action"
  } as any,
  {
    prop: "target",
    label: "审批对象",
    slot: "target",
    showOverflowTooltip: true
  } as any,
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status"
  } as any,
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  } as any
]);

// 规则引擎列配置
const ruleEngineColumns = reactive<ColumnProps[]>([
  {
    type: "expand",
    slot: "expand"
  } as any,
  {
    prop: "time",
    label: "执行时间",
    width: 180,
    sortable: "custom",
    search: {
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "user",
    label: "执行者",
    width: 140,
    slot: "user",
    search: {
      el: "input",
      props: {
        placeholder: "请输入执行者"
      }
    }
  } as any,
  {
    prop: "action",
    label: "执行动作",
    width: 180,
    slot: "action"
  } as any,
  {
    prop: "target",
    label: "影响对象",
    slot: "target",
    showOverflowTooltip: true
  } as any,
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status"
  } as any,
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  } as any
]);

// 客户客户列配置
const customerColumns = reactive<ColumnProps[]>([
  {
    type: "expand",
    slot: "expand"
  } as any,
  {
    prop: "time",
    label: "操作时间",
    width: 180,
    sortable: "custom",
    search: {
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "user",
    label: "操作客户",
    width: 140,
    slot: "user",
    search: {
      el: "input",
      props: {
        placeholder: "请输入操作客户"
      }
    }
  } as any,
  {
    prop: "action",
    label: "操作类型",
    width: 180,
    slot: "action"
  } as any,
  {
    prop: "target",
    label: "涉及客户",
    slot: "target",
    showOverflowTooltip: true
  } as any,
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status"
  } as any,
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  } as any
]);

// 系统配置列配置
const systemColumns = reactive<ColumnProps[]>([
  {
    type: "expand",
    slot: "expand"
  } as any,
  {
    prop: "time",
    label: "操作时间",
    width: 180,
    sortable: "custom",
    search: {
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "user",
    label: "操作员",
    width: 140,
    slot: "user",
    search: {
      el: "input",
      props: {
        placeholder: "请输入操作员"
      }
    }
  } as any,
  {
    prop: "action",
    label: "配置动作",
    width: 180,
    slot: "action"
  } as any,
  {
    prop: "target",
    label: "配置项",
    slot: "target",
    showOverflowTooltip: true
  } as any,
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status"
  } as any,
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  } as any
]);

// 企微/BDC列配置
const wechatColumns = reactive<ColumnProps[]>([
  {
    type: "expand",
    slot: "expand"
  } as any,
  {
    prop: "time",
    label: "操作时间",
    width: 180,
    sortable: "custom",
    search: {
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  {
    prop: "user",
    label: "操作人员",
    width: 140,
    slot: "user",
    search: {
      el: "input",
      props: {
        placeholder: "请输入操作人员"
      }
    }
  } as any,
  {
    prop: "action",
    label: "操作类型",
    width: 180,
    slot: "action"
  } as any,
  {
    prop: "target",
    label: "关联记录",
    slot: "target",
    showOverflowTooltip: true
  } as any,
  {
    prop: "status",
    label: "状态",
    width: 100,
    slot: "status"
  } as any,
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  } as any
]);

// 抽屉相关
const drawerVisible = ref(false);
const diffFilter = ref<"all" | "diff">("all");
const currentLog = ref<any>({
  target: "",
  targetId: "",
  action: "",
  snapshot: null
});

// 22个客户字段的完整定义 (Schema)
const schema = {
  identity: {
    title: "👤 身份与联系信息",
    icon: User,
    fields: [
      { key: "id", label: "客户ID" },
      { key: "name", label: "姓名" },
      { key: "gender", label: "性别" },
      { key: "ageGroup", label: "年龄段" },
      { key: "family", label: "家庭状态" },
      { key: "address", label: "地址" },
      { key: "phone", label: "手机号码" }
    ]
  },
  preference: {
    title: "📞 偏好与习惯",
    icon: Phone,
    fields: [
      { key: "contactPref", label: "联系偏好时间段" },
      { key: "serviceHabit", label: "服务习惯" },
      { key: "projectPref", label: "项目偏好" },
      { key: "hasComplaint", label: "最近一年是否有投诉" }
    ]
  },
  value: {
    title: "💰 价值与交易指标",
    icon: TrendCharts,
    fields: [
      { key: "lastVisit", label: "最近到店时间" },
      { key: "visit90d", label: "近90天到店次数" },
      { key: "orderFreq", label: "年度订单频次" },
      { key: "avgSpend", label: "平均消费金额" },
      { key: "annualSpend", label: "年度消费金额" },
      { key: "loyalty", label: "忠诚度等级" },
      { key: "oppLevel", label: "商机等级" }
    ]
  },
  vehicle: {
    title: "🚗 车辆客户",
    icon: Box,
    fields: [
      { key: "vin", label: "VIN信息" },
      { key: "plate", label: "车牌号" },
      { key: "model", label: "车系+车型" },
      { key: "mileage", label: "当前里程" }
    ]
  }
};

// 构造快照数据
const viewSnapshot = (row: any) => {
  if (!row) return;

  // 根据当前tab确定数据来源类型
  const moduleType = activeTab.value;

  // 根据不同模块类型构造不同的基础数据
  let baseData: any = {};

  switch (moduleType) {
    case "conflict":
      // 冲突治理模块 - 客户信息
      baseData = {
        id: row.targetId || "C360-001",
        name: row.target || "张伟",
        gender: "男",
        ageGroup: "35-40",
        family: "已婚",
        address: "南京市鼓楼区...",
        phone: "150****6988",
        contactPref: "下午",
        serviceHabit: "预约保养",
        projectPref: "维修",
        hasComplaint: "否",
        lastVisit: "2025-06-06",
        visit90d: 0,
        orderFreq: 1,
        avgSpend: 1000,
        annualSpend: 1000,
        loyalty: "普卡",
        oppLevel: "高",
        vin: "73L***M4YV",
        plate: "京C****0",
        model: "911 Carrera S",
        mileage: "147,275 km",
        // 冲突治理特定字段
        conflictType: row.action || "数据冲突",
        resolutionStatus: "待处理",
        priority: "中",
        conflictReason: "字段值不一致",
        mergeResult: "已合并",
        conflictLevel: "低风险",
        operator: row.user || "操作员A",
        resolutionTime: row.time || "2025-01-15 10:30",
        affectedRecords: 2,
        resolutionMethod: "自动合并"
      };
      break;
    case "approval":
      // 审批中心模块 - 审批相关信息
      baseData = {
        id: row.targetId || "APP-001",
        name: row.target || "客户信息更新审批",
        approver: row.user || "李经理",
        opinion: row.action?.includes("驳回") ? "驳回" : "同意",
        time: row.time || "2025-01-15 14:30",
        version: "v2.1 -> v2.2",
        reason: "客户信息更新",
        status: row.action?.includes("驳回") ? "已驳回" : "已批准",
        remarks: row.action?.includes("驳回") ? "信息不完整，需要补充资料" : "请确认信息准确性",
        docId: "DOC-001",
        priority: "普通",
        deadline: "2025-01-20",
        attachments: 2,
        comments: row.action?.includes("驳回") ? 1 : 1,
        processTime: "2小时15分钟",
        department: "销售部",
        reviewer: "王总监",
        result: row.action?.includes("驳回") ? "驳回" : "通过",
        nextStep: row.action?.includes("驳回") ? "重新提交" : "归档",
        history: "初审->复审->终审",
        compliance: "符合规定",
        riskLevel: row.action?.includes("驳回") ? "高风险" : "低风险",
        approvalCode: "APPR-20250115001",
        // 审批特定字段
        approvalType: "客户信息变更",
        approverRole: "部门经理",
        approvalPath: "销售部->财务部->总经理",
        approvalDuration: "4小时",
        approvalOutcome: row.action?.includes("驳回") ? "驳回" : "批准",
        rejectReason: row.action?.includes("驳回") ? "客户信息不完整，缺少联系方式" : "",
        approvalComments: row.action?.includes("驳回") ? "请补充完整客户联系方式后再提交" : "信息完整，可以批准",
        reviewerLevel: "中级审批",
        approvalCategory: "客户资料更新"
      };
      break;
    case "ruleEngine":
      // 规则引擎模块 - 规则相关信息
      baseData = {
        id: row.targetId || "RULE-001",
        name: row.target || "张伟",
        gender: "男",
        ageGroup: "35-40",
        family: "已婚",
        address: "南京市鼓楼区...",
        phone: "150****6988",
        contactPref: "下午",
        serviceHabit: "预约保养",
        projectPref: "维修",
        hasComplaint: "否",
        lastVisit: "2025-06-06",
        visit90d: 0,
        orderFreq: 1,
        avgSpend: 1000,
        annualSpend: 1000,
        loyalty: "普卡",
        oppLevel: "高",
        vin: "73L***M4YV",
        plate: "京C****0",
        model: "911 Carrera S",
        mileage: "147,275 km",
        // 规则引擎特定字段
        ruleId: "MERGE_RULE_001",
        ruleName: "客户信息合并规则",
        triggerCondition: "姓名+电话匹配度>90%",
        confidence: "95.2%",
        matchedFields: ["姓名", "电话", "地址"],
        action: "自动合并",
        executionTime: row.time || "2025-01-15 10:25:30",
        sourceRecords: 2,
        mergedRecord: 1,
        status: "成功",
        engineVersion: "v3.2.1",
        processingTime: "0.5秒",
        threshold: "90% -> 95%",
        ruleType: "合并规则",
        hitCount: 125,
        successRate: "98.5%",
        lastModified: "2025-01-10",
        createdBy: "系统",
        priority: "高",
        dependencies: "无",
        validationPassed: "是",
        // 规则引擎特定字段
        ruleCategory: "数据合并",
        ruleDescription: "用于合并重复客户信息",
        ruleOwner: "数据团队",
        ruleStatus: "启用",
        executionLog: "匹配成功，执行合并",
        ruleMetrics: "准确率95.2%, 召回率92.1%",
        ruleImpact: "影响2个客户记录",
        rulePerformance: "平均处理时间0.5秒",
        ruleHitsToday: 25,
        ruleLastRun: "2025-01-15 10:25:30"
      };
      break;
    case "customer":
      // 客户客户模块 - 客户访问相关信息
      baseData = {
        id: row.targetId || "CUST-001",
        name: row.target || "张伟",
        gender: "男",
        ageGroup: "35-40",
        family: "已婚",
        address: "南京市鼓楼区...",
        phone: "150****6988",
        contactPref: "下午",
        serviceHabit: "预约保养",
        projectPref: "维修",
        hasComplaint: "否",
        lastVisit: "2025-06-06",
        visit90d: 0,
        orderFreq: 1,
        avgSpend: 1000,
        annualSpend: 1000,
        loyalty: "普卡",
        oppLevel: "高",
        vin: "73L***M4YV",
        plate: "京C****0",
        model: "911 Carrera S",
        mileage: "147,275 km",
        // 客户客户特定字段
        customerId: "C360-001",
        customerName: "张伟",
        accessedBy: row.user || "销售员A",
        accessType: "查看明文",
        ipAddress: row.ip || "192.168.1.100",
        userAgent: row.ua || "Chrome/120.0.0.0",
        accessTime: row.time || "2025-01-15 11:30",
        purpose: "客户服务",
        duration: "2分钟",
        permissions: "明文查看",
        sensitiveData: "手机号、身份证",
        action: "查看",
        deviceInfo: "Windows 10, Chrome",
        location: "办公室",
        session: "session_001",
        exportFormat: "-",
        exportReason: "-",
        approvalRequired: "否",
        auditTrail: "已记录",
        complianceCheck: "通过",
        riskScore: "低",
        accessChannel: "Web端",
        recordChanges: "无",
        // 客户客户特定字段
        customerSegment: "VIP客户",
        accessPurpose: "客户回访",
        dataAccessType: "明文",
        accessApproval: "自动",
        accessDuration: "2分钟",
        dataSensitivity: "高",
        accessAuditLevel: "标准",
        customerPrivacyLevel: "高",
        accessComplianceStatus: "合规"
      };
      break;
    case "system":
      // 系统配置模块 - 配置变更信息
      baseData = {
        id: row.targetId || "SYS-001",
        name: row.target || "张伟",
        gender: "男",
        ageGroup: "35-40",
        family: "已婚",
        address: "南京市鼓楼区...",
        phone: "150****6988",
        contactPref: "下午",
        serviceHabit: "预约保养",
        projectPref: "维修",
        hasComplaint: "否",
        lastVisit: "2025-06-06",
        visit90d: 0,
        orderFreq: 1,
        avgSpend: 1000,
        annualSpend: 1000,
        loyalty: "普卡",
        oppLevel: "高",
        vin: "73L***M4YV",
        plate: "京C****0",
        model: "911 Carrera S",
        mileage: "147,275 km",
        // 系统配置特定字段
        configId: "CONF-001",
        paramName: "合并规则阈值",
        oldValue: "90分",
        newValue: "95分",
        changedBy: row.user || "管理员",
        changeTime: row.time || "2025-01-15 16:45",
        reason: "提高数据准确性",
        approvalRequired: "是",
        reviewStatus: "已批准",
        rollbackPossible: "是",
        impactAnalysis: "影响合并策略",
        affectedModules: ["冲突治理", "客户客户"],
        testResults: "通过",
        validationStatus: "已验证",
        deploymentEnv: "生产环境",
        releaseNotes: "调整合并阈值以减少误合并",
        version: "v1.2.3 -> v1.2.4",
        backupStatus: "已备份",
        downtime: "0分钟",
        changelog: "合并规则优化",
        reviewers: ["张主管", "李总监"],
        compliance: "符合安全规范",
        approvalDate: "2025-01-15",
        // 系统配置特定字段
        configCategory: "业务规则",
        configOwner: "系统管理员",
        configEnvironment: "生产",
        configStatus: "生效",
        configScope: "全局",
        configDependencies: "客户管理模块",
        configBackupStatus: "已备份",
        configTestStatus: "已测试",
        configRollbackPlan: "恢复到v1.2.3",
        configImpactLevel: "中等"
      };
      break;
    case "wechat":
      // 企微/BDC模块 - 客服交互信息
      baseData = {
        id: row.targetId || "WX-001",
        name: row.target || "张伟",
        gender: "男",
        ageGroup: "35-40",
        family: "已婚",
        address: "南京市鼓楼区...",
        phone: "150****6988",
        contactPref: "下午",
        serviceHabit: "预约保养",
        projectPref: "维修",
        hasComplaint: "否",
        lastVisit: "2025-06-06",
        visit90d: 0,
        orderFreq: 1,
        avgSpend: 1000,
        annualSpend: 1000,
        loyalty: "普卡",
        oppLevel: "高",
        vin: "73L***M4YV",
        plate: "京C****0",
        model: "911 Carrera S",
        mileage: "147,275 km",
        // 企微/BDC特定字段
        customerId: "C360-001",
        customerName: "张伟",
        operator: row.user || "客服A",
        operationType: "修改备注",
        content: "重要客户，优先服务",
        updateTime: row.time || "2025-01-15 13:20",
        channel: "企业微信",
        sourceSystem: "CRM",
        syncStatus: "已同步",
        priority: "普通",
        category: "客户备注",
        tags: ["VIP", "重要"],
        relatedRecords: 1,
        attachments: 0,
        followUpRequired: "否",
        responseTime: "即时",
        satisfaction: "待评价",
        interactionType: "文本消息",
        resolutionStatus: "已完成",
        escalationLevel: "无",
        handlingDepartment: "客服部",
        handlingTime: "2分钟",
        outcome: "备注更新成功",
        nextAction: "无",
        // 企微/BDC特定字段
        interactionChannel: "企业微信",
        customerServiceLevel: "标准",
        interactionCategory: "咨询",
        serviceDuration: "2分钟",
        serviceType: "客户支持",
        serviceQuality: "良好",
        customerSatisfaction: "待评价",
        serviceTags: ["咨询", "解答"],
        serviceOutcome: "问题已解决",
        escalationRequired: "否"
      };
      break;
    default:
      // 默认客户信息
      baseData = {
        id: row.targetId || "C360-001",
        name: row.target || "张伟",
        gender: "男",
        ageGroup: "35-40",
        family: "已婚",
        address: "南京市鼓楼区...",
        phone: "150****6988",
        contactPref: "下午",
        serviceHabit: "预约保养",
        projectPref: "维修",
        hasComplaint: "否",
        lastVisit: "2025-06-06",
        visit90d: 0,
        orderFreq: 1,
        avgSpend: 1000,
        annualSpend: 1000,
        loyalty: "普卡",
        oppLevel: "高",
        vin: "73L***M4YV",
        plate: "京C****0",
        model: "911 Carrera S",
        mileage: "147,275 km"
      };
  }

  // 2. 根据 row.changes 构造完整快照
  // 如果 changes 里有，说明变了；如果没变，old = new = baseData
  const snapshot: any = {};
  let schemaToUse = schema; // 默认使用客户信息schema

  // 根据模块类型选择对应的schema
  switch (moduleType) {
    case "approval":
      schemaToUse = approvalSchema;
      break;
    case "ruleEngine":
      schemaToUse = ruleEngineSchema;
      break;
    case "customer":
      schemaToUse = customerSchema;
      break;
    case "system":
      schemaToUse = systemConfigSchema;
      break;
    case "wechat":
      schemaToUse = wechatSchema;
      break;
    default:
      schemaToUse = schema; // 使用默认的客户信息schema
  }

  // 遍历当前模块的schema字段
  const allKeys: any[] = [];
  for (const sectionKey in schemaToUse) {
    const section = (schemaToUse as any)[sectionKey];
    allKeys.push(...section.fields);
  }

  allKeys.forEach((f: any) => {
    const key = f.key;
    if (row.changes && row.changes[key]) {
      // 有变动
      snapshot[key] = {
        old: row.changes[key].old,
        new: row.changes[key].new
      };
    } else {
      // 无变动
      snapshot[key] = {
        old: baseData[key] || "",
        new: baseData[key] || ""
      };
    }
  });

  // 更新 currentLog
  currentLog.value = {
    ...row,
    moduleType, // 添加模块类型信息
    snapshot: snapshot
  };

  drawerVisible.value = true;
};

// 不同模块的schema定义
const approvalSchema = {
  basic: {
    title: "📋 审批基本信息",
    icon: Document,
    fields: [
      { key: "id", label: "审批ID" },
      { key: "name", label: "审批对象" },
      { key: "approver", label: "审批人" },
      { key: "time", label: "审批时间" },
      { key: "approvalType", label: "审批类型" },
      { key: "approverRole", label: "审批人角色" }
    ]
  },
  process: {
    title: "🔄 审批流程信息",
    icon: Connection,
    fields: [
      { key: "status", label: "审批状态" },
      { key: "opinion", label: "审批意见" },
      { key: "result", label: "审批结果" },
      { key: "approvalOutcome", label: "审批结果" },
      { key: "rejectReason", label: "驳回原因" },
      { key: "approvalComments", label: "审批意见" },
      { key: "priority", label: "优先级" },
      { key: "deadline", label: "截止时间" },
      { key: "processTime", label: "处理时长" }
    ]
  },
  result: {
    title: "✅ 审批结果",
    icon: SuccessFilled,
    fields: [
      { key: "nextStep", label: "下一步" },
      { key: "history", label: "审批历史" },
      { key: "approvalPath", label: "审批路径" },
      { key: "reviewer", label: "审核人" },
      { key: "department", label: "部门" },
      { key: "compliance", label: "合规性" },
      { key: "riskLevel", label: "风险等级" },
      { key: "approvalCode", label: "审批码" },
      { key: "reviewerLevel", label: "审核级别" },
      { key: "approvalCategory", label: "审批分类" }
    ]
  }
};

const ruleEngineSchema = {
  ruleInfo: {
    title: "⚙️ 规则信息",
    icon: Edit,
    fields: [
      { key: "id", label: "规则ID" },
      { key: "ruleId", label: "规则编号" },
      { key: "ruleName", label: "规则名称" },
      { key: "ruleType", label: "规则类型" },
      { key: "ruleCategory", label: "规则分类" },
      { key: "ruleDescription", label: "规则描述" },
      { key: "ruleOwner", label: "规则负责人" },
      { key: "ruleStatus", label: "规则状态" }
    ]
  },
  execution: {
    title: "⚡ 执行信息",
    icon: Lightning,
    fields: [
      { key: "action", label: "执行动作" },
      { key: "executionTime", label: "执行时间" },
      { key: "sourceRecords", label: "源记录数" },
      { key: "mergedRecord", label: "合并记录数" },
      { key: "status", label: "执行状态" },
      { key: "engineVersion", label: "引擎版本" },
      { key: "processingTime", label: "处理耗时" },
      { key: "executionLog", label: "执行日志" }
    ]
  },
  metrics: {
    title: "📊 规则指标",
    icon: Histogram,
    fields: [
      { key: "triggerCondition", label: "触发条件" },
      { key: "confidence", label: "置信度" },
      { key: "matchedFields", label: "匹配字段" },
      { key: "threshold", label: "阈值" },
      { key: "hitCount", label: "命中次数" },
      { key: "successRate", label: "成功率" },
      { key: "ruleMetrics", label: "规则指标" },
      { key: "rulePerformance", label: "规则性能" },
      { key: "ruleHitsToday", label: "今日命中" }
    ]
  }
};

const customerSchema = {
  accessInfo: {
    title: "👤 访问者信息",
    icon: User,
    fields: [
      { key: "id", label: "访问ID" },
      { key: "customerId", label: "客户ID" },
      { key: "customerName", label: "客户姓名" },
      { key: "accessedBy", label: "访问者" },
      { key: "accessType", label: "访问类型" },
      { key: "ipAddress", label: "IP地址" },
      { key: "userAgent", label: "客户代理" },
      { key: "customerSegment", label: "客户分群" }
    ]
  },
  accessDetail: {
    title: "🔍 访问详情",
    icon: View,
    fields: [
      { key: "accessTime", label: "访问时间" },
      { key: "purpose", label: "访问目的" },
      { key: "duration", label: "访问时长" },
      { key: "permissions", label: "权限级别" },
      { key: "sensitiveData", label: "敏感数据" },
      { key: "action", label: "操作" },
      { key: "deviceInfo", label: "设备信息" },
      { key: "location", label: "位置" },
      { key: "accessPurpose", label: "访问目的" },
      { key: "dataAccessType", label: "数据访问类型" },
      { key: "accessDuration", label: "访问时长" }
    ]
  },
  compliance: {
    title: "🔒 合规信息",
    icon: Lock,
    fields: [
      { key: "session", label: "会话" },
      { key: "exportFormat", label: "导出格式" },
      { key: "exportReason", label: "导出原因" },
      { key: "approvalRequired", label: "需审批" },
      { key: "auditTrail", label: "审计轨迹" },
      { key: "complianceCheck", label: "合规检查" },
      { key: "riskScore", label: "风险评分" },
      { key: "accessChannel", label: "访问渠道" },
      { key: "recordChanges", label: "记录变更" },
      { key: "dataSensitivity", label: "数据敏感度" },
      { key: "accessComplianceStatus", label: "访问合规状态" },
      { key: "customerPrivacyLevel", label: "客户隐私级别" }
    ]
  }
};

const systemConfigSchema = {
  configInfo: {
    title: "⚙️ 配置信息",
    icon: Setting,
    fields: [
      { key: "id", label: "配置ID" },
      { key: "configId", label: "配置编号" },
      { key: "paramName", label: "参数名" },
      { key: "oldValue", label: "原值" },
      { key: "newValue", label: "新值" },
      { key: "changedBy", label: "变更人" },
      { key: "changeTime", label: "变更时间" },
      { key: "configCategory", label: "配置分类" },
      { key: "configOwner", label: "配置负责人" }
    ]
  },
  changeDetail: {
    title: "📝 变更详情",
    icon: Document,
    fields: [
      { key: "reason", label: "变更原因" },
      { key: "approvalRequired", label: "需审批" },
      { key: "reviewStatus", label: "审核状态" },
      { key: "rollbackPossible", label: "可回滚" },
      { key: "impactAnalysis", label: "影响分析" },
      { key: "affectedModules", label: "影响模块" },
      { key: "testResults", label: "测试结果" },
      { key: "configScope", label: "配置范围" },
      { key: "configDependencies", label: "配置依赖" }
    ]
  },
  deployment: {
    title: "🚀 部署信息",
    icon: Promotion,
    fields: [
      { key: "validationStatus", label: "验证状态" },
      { key: "deploymentEnv", label: "部署环境" },
      { key: "configEnvironment", label: "配置环境" },
      { key: "configStatus", label: "配置状态" },
      { key: "releaseNotes", label: "发布说明" },
      { key: "version", label: "版本" },
      { key: "backupStatus", label: "备份状态" },
      { key: "configBackupStatus", label: "配置备份状态" },
      { key: "downtime", label: "停机时间" },
      { key: "changelog", label: "变更日志" },
      { key: "configTestStatus", label: "配置测试状态" },
      { key: "configRollbackPlan", label: "配置回滚计划" },
      { key: "configImpactLevel", label: "配置影响级别" }
    ]
  }
};

const wechatSchema = {
  interaction: {
    title: "💬 交互信息",
    icon: ChatLineRound,
    fields: [
      { key: "id", label: "交互ID" },
      { key: "customerId", label: "客户ID" },
      { key: "customerName", label: "客户姓名" },
      { key: "operator", label: "操作员" },
      { key: "operationType", label: "操作类型" },
      { key: "content", label: "内容" },
      { key: "updateTime", label: "更新时间" },
      { key: "interactionChannel", label: "交互渠道" },
      { key: "interactionCategory", label: "交互分类" }
    ]
  },
  channel: {
    title: "📡 渠道信息",
    icon: Position,
    fields: [
      { key: "channel", label: "渠道" },
      { key: "sourceSystem", label: "源系统" },
      { key: "syncStatus", label: "同步状态" },
      { key: "priority", label: "优先级" },
      { key: "category", label: "分类" },
      { key: "tags", label: "标签" },
      { key: "relatedRecords", label: "相关记录" },
      { key: "serviceType", label: "服务类型" },
      { key: "serviceDuration", label: "服务时长" }
    ]
  },
  handling: {
    title: "🔧 处理信息",
    icon: Tools,
    fields: [
      { key: "attachments", label: "附件" },
      { key: "followUpRequired", label: "需跟进" },
      { key: "responseTime", label: "响应时间" },
      { key: "satisfaction", label: "满意度" },
      { key: "interactionType", label: "交互类型" },
      { key: "resolutionStatus", label: "解决状态" },
      { key: "escalationLevel", label: "升级级别" },
      { key: "handlingDepartment", label: "处理部门" },
      { key: "handlingTime", label: "处理时长" },
      { key: "outcome", label: "结果" },
      { key: "nextAction", label: "下一步" },
      { key: "customerServiceLevel", label: "客户服务级别" },
      { key: "serviceQuality", label: "服务质量" },
      { key: "customerSatisfaction", label: "客户满意度" },
      { key: "escalationRequired", label: "需要升级" }
    ]
  }
};

// 格式化字段值 (增强视觉效果)
const formatValue = (key: string, val: any) => {
  if (val === undefined || val === null) return '<span class="empty-val">(空)</span>';

  // 金额处理
  if (["avgSpend", "annualSpend"].includes(key)) {
    return `<span class="money">¥${Number(val).toLocaleString()}</span>`;
  }

  // 投诉警示 - 使用纯 HTML 和 CSS，不使用组件
  if (key === "hasComplaint") {
    if (val === "是") {
      return '<span class="tag-risk">是 (Risk)</span>';
    }
    return '<span style="color: #67c23a;">否</span>';
  }

  return String(val);
};

// 根据筛选模式（全部/仅差异）动态计算显示的字段
const displayGroups = computed(() => {
  if (!currentLog.value.snapshot) return [];

  const groups: any[] = [];
  const moduleType = currentLog.value.moduleType || "conflict";

  let schemaToUse = schema; // 默认使用客户信息schema

  // 根据模块类型选择对应的schema
  switch (moduleType) {
    case "approval":
      schemaToUse = approvalSchema;
      break;
    case "ruleEngine":
      schemaToUse = ruleEngineSchema;
      break;
    case "customer":
      schemaToUse = customerSchema;
      break;
    case "system":
      schemaToUse = systemConfigSchema;
      break;
    case "wechat":
      schemaToUse = wechatSchema;
      break;
    default:
      schemaToUse = schema; // 使用默认的客户信息schema
  }

  // 遍历当前模块的schema
  for (const sectionKey in schemaToUse) {
    const section = (schemaToUse as any)[sectionKey];
    const groupFields: any[] = [];

    section.fields.forEach((f: any) => {
      const oldVal = currentLog.value.snapshot[f.key].old;
      const newVal = currentLog.value.snapshot[f.key].new;

      // 如果是 diff 模式，且值相等，则跳过
      if (diffFilter.value === "diff" && oldVal === newVal) return;

      groupFields.push({
        key: f.key,
        label: f.label,
        old: oldVal,
        new: newVal
      });
    });

    if (groupFields.length > 0) {
      groups.push({
        title: section.title,
        icon: section.icon,
        fields: groupFields
      });
    }
  }
  return groups;
});

// 处理tab切换
const handleTabChange = (tabName: string) => {
  // 根据不同tab可能需要刷新数据或执行其他操作
  console.log("Tab changed to:", tabName);
};
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.user-tag {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  margin-right: 8px;
}

.mgr-avatar {
  background: #f56c6c;
}

.system-avatar {
  background: #909399;
}

.admin-avatar {
  background: #e6a23c;
}

.sales-avatar {
  background: #67c23a;
}

.demo-table-expand {
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 0;
    width: 50%;
  }
}

.audit-tabs {
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 20px;
  }
}

/* === 核心：快照对比样式 (Snapshot Diff) === */
.diff-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.diff-tools {
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diff-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.diff-group {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.diff-group-header {
  background: #f5f7fa;
  padding: 10px 15px;
  font-weight: 700;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  display: flex;
  align-items: center;
}

.diff-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #409eff;
}

.diff-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  line-height: 1.5;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
  }
}

.col-label {
  width: 140px;
  padding: 12px;
  background: #fafafa;
  color: #909399;
  font-weight: 500;
  border-right: 1px solid #ebeef5;
}

.col-old {
  flex: 1;
  padding: 12px;
  border-right: 1px solid #ebeef5;
  color: #909399;
}

.col-new {
  flex: 1;
  padding: 12px;
  color: #303133;
}

/* 变更状态样式 */
.is-changed {
  .col-old {
    background: #fef0f0;
    color: #f56c6c;
    text-decoration: line-through;
    opacity: 0.8;
  }

  .col-new {
    background: #f0f9eb;
    color: #67c23a;
    font-weight: 700;
  }
}

/* 特殊字段样式 */
.money {
  font-family: Consolas, monospace;
}

.tag-risk {
  color: #f56c6c;
  font-weight: bold;
}

.empty-val {
  color: #ccc;
  font-style: italic;
}
</style>

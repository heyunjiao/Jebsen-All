<template>
  <div class="company-customer-table card table-main">
    <!-- 表格主体 -->
    <el-table :data="tableData" :border="true" :row-key="'id'">
      <!-- OneID（与全部/个人列表一致） -->
      <el-table-column :label="$t('customer.oneId')" min-width="150" fixed="left" show-overflow-tooltip>
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': !row.oneId }">{{ row.oneId || TABLE_EMPTY_PLACEHOLDER }}</span>
        </template>
      </el-table-column>

      <!-- 客户姓名/主体 -->
      <el-table-column :label="$t('customer.companyTable.name')" min-width="200" fixed="left">
        <template #default="{ row }">
          <div class="company-name-cell">
            <span class="name" :class="{ 'table-cell-empty': !row.name }">{{ row.name || TABLE_EMPTY_PLACEHOLDER }}</span>
            <el-tag v-if="row.hasConflict" type="warning" size="small" style="margin-left: 8px">
              <el-icon><Warning /></el-icon>
              {{ $t("customer.conflict") }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 主服务门店（与个人/全部列表保持一致） -->
      <el-table-column :label="$t('customer.store.label')" min-width="160">
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': !row.primaryStoreName }">
            {{ row.primaryStoreName || TABLE_EMPTY_PLACEHOLDER }}
          </span>
        </template>
      </el-table-column>

      <!-- 城市（与个人/全部列表保持一致） -->
      <el-table-column :label="$t('customer.city')" min-width="120">
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': !row.city }">
            {{ row.city || TABLE_EMPTY_PLACEHOLDER }}
          </span>
        </template>
      </el-table-column>

      <!-- 生命周期状态（与个人/全部列表保持一致） -->
      <el-table-column :label="$t('customer.lifecycleStatus')" min-width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.lifecycleStatus)" size="small">
            {{ getStatusLabel(row.lifecycleStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 分群名称 -->
      <el-table-column :label="$t('customer.segmentName')" min-width="140">
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': !row.segmentName }">
            {{ row.segmentName || TABLE_EMPTY_PLACEHOLDER }}
          </span>
        </template>
      </el-table-column>

      <!-- 最近到店时间 -->
      <el-table-column :label="$t('customer.lastVisitTime')" min-width="160">
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': !row.lastVisitTime }">
            {{ row.lastVisitTime || TABLE_EMPTY_PLACEHOLDER }}
          </span>
        </template>
      </el-table-column>

      <!-- 年度消费金额（数值列右对齐） -->
      <el-table-column :label="$t('customer.annualConsumption')" min-width="160" align="right">
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': !row.annualConsumption }">
            {{ row.annualConsumption ? formatCellValue(row.annualConsumption, "annualConsumption") : TABLE_EMPTY_PLACEHOLDER }}
          </span>
        </template>
      </el-table-column>

      <!-- 最近一年是否有投诉 -->
      <el-table-column :label="$t('customer.hasComplaintLastYear')" min-width="160">
        <template #default="{ row }">
          <span>
            {{ row.hasComplaintLastYear ? $t("common.yes") : $t("common.no") }}
          </span>
        </template>
      </el-table-column>

      <!-- 汇总数据：经办人 -->
      <el-table-column :label="$t('customer.companyTable.handler')" min-width="120">
        <template #default="{ row }">
          <span :class="{ 'table-cell-empty': getHandler(row) === TABLE_EMPTY_PLACEHOLDER }">{{ getHandler(row) }}</span>
        </template>
      </el-table-column>

      <!-- 汇总数据：车辆数量（数值列右对齐） -->
      <el-table-column :label="$t('customer.companyTable.vehicleCount')" min-width="120" align="right">
        <template #default="{ row }">
          <span class="vehicle-count">{{ getVehicleCount(row) }}</span>
          <span class="vehicle-unit">{{ $t("customer.companyTable.vehicles") }}</span>
        </template>
      </el-table-column>

      <!-- 操作列：查看360（主行点击弹窗） -->
      <el-table-column :label="$t('common.operation')" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView360(row)">
            <el-icon><View /></el-icon>
            {{ $t("customer.view360") }}
          </el-button>
        </template>
      </el-table-column>

      <!-- 空状态与 ProTable 保持一致 -->
      <template #empty>
        <div class="table-empty">
          <img src="@/assets/images/notData.png" alt="notData" />
          <div>{{ $t("common.noData") }}</div>
        </div>
      </template>
    </el-table>

    <!-- 分页组件与 ProTable 保持一致 -->
    <Pagination
      v-if="pagination"
      :pageable="pagination"
      :handle-size-change="handleSizeChange"
      :handle-current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Warning, View } from "@element-plus/icons-vue";
import type { Customer, LifecycleStatus } from "../interface";
import type { ColumnProps } from "@/components/ProTable/interface/index";
import { TABLE_EMPTY_PLACEHOLDER } from "@/utils";
import Pagination from "@/components/ProTable/components/Pagination.vue";

interface Props {
  tableData: Customer[];
  columns: ColumnProps<Customer>[];
  pagination?: {
    pageNum: number;
    pageSize: number;
    total: number;
  };
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "view360", row: Customer): void;
  (e: "viewSensitiveData", value: string | number): void;
  (e: "sizeChange", size: number): void;
  (e: "currentChange", page: number): void;
}>();

const { t } = useI18n();

// 获取车辆数量
const getVehicleCount = (row: Customer): number => {
  if (Array.isArray(row.vinInfo)) return row.vinInfo.length;
  if (typeof row.vinInfo === "string" && row.vinInfo) return 1;
  return 0;
};

// 获取状态类型
const getStatusType = (status: LifecycleStatus): "success" | "info" | "warning" | "danger" => {
  const map: Record<LifecycleStatus, "success" | "info" | "warning" | "danger"> = {
    active: "success",
    inactive: "info",
    pending: "warning",
    conflict: "danger"
  };
  return map[status] || "info";
};

// 获取状态标签
const getStatusLabel = (status: LifecycleStatus) => {
  return t(`customer.lifecycleStatusOptions.${status}`);
};

// 获取经办人：显示关联的经办人名字 + 角色（多个），公司下一行摘要也用
const getHandler = (row: Customer): string => {
  const handlers = (row as Customer & { handlers?: { name?: string; role?: string }[] }).handlers;
  if (handlers?.length) {
    const names = handlers
      .map(h => {
        if (!h.name) return "";
        return h.role ? `${h.name}（${h.role}）` : h.name;
      })
      .filter(Boolean);
    if (names.length > 3) {
      return t("customer.companyTable.multipleCustomers", {
        names: names.slice(0, 3).join(t("common.separator")),
        count: names.length
      });
    }
    return names.join(t("common.separator"));
  }
  return TABLE_EMPTY_PLACEHOLDER;
};

// 格式化单元格值
const formatCellValue = (value: any, prop: string): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? t("common.yes") : t("common.no");
  if (typeof value === "number") {
    // 金额类字段保留2位小数
    if (prop.includes("consumption") || prop.includes("amount") || prop.includes("avg")) {
      return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value.toLocaleString("zh-CN");
  }
  return String(value);
};

// 查看360视图
const handleView360 = (row: Customer) => {
  emit("view360", row);
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  emit("sizeChange", size);
};

// 当前页变化
const handleCurrentChange = (page: number) => {
  emit("currentChange", page);
};
</script>

<style scoped lang="scss">
.company-customer-table {
  .table-cell-empty {
    color: var(--el-text-color-placeholder);
  }
  .company-name-cell {
    display: flex;
    align-items: center;
    .name {
      font-weight: 500;
      color: #303133;
    }
  }
  .oneid-cell {
    display: flex;
    align-items: center;
  }
  .vehicle-count {
    font-size: 16px;
    font-weight: 600;
    color: #409eff;
  }
  .vehicle-unit {
    margin-left: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>

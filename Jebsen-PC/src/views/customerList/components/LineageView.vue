<template>
  <div class="lineage-view">
    <div class="lineage-header">
      <span class="card-title">{{ $t("customer.lineage.title") }}</span>
      <el-tag type="primary" size="large">{{ lineage.oneId }}</el-tag>
    </div>

    <div class="lineage-log" v-if="flatHistory && flatHistory.length > 0">
      <el-table :data="pagedFlatHistory" border stripe size="small">
        <el-table-column prop="mergedAt" :label="$t('customer.lineage.mergedAt')" width="180" />
        <el-table-column prop="mergedBy" :label="$t('customer.lineage.mergedBy')" width="140" />
        <el-table-column prop="sourceSystem" :label="$t('customer.lineage.systemName')" width="140" />
        <el-table-column :label="$t('customer.lineage.changeField')" min-width="180">
          <template #default="scope">
            <span class="field-name">
              {{ scope.row.fieldLabel || scope.row.field || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="oldValue" :label="$t('customer.lineage.oldValue')" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span class="field-value-old" v-if="scope.row.oldValue !== null && scope.row.oldValue !== undefined">
              {{ scope.row.oldValue }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="newValue" :label="$t('customer.lineage.newValue')" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span class="field-value-new">
              {{ scope.row.newValue ?? "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" :label="$t('customer.lineage.reason')" min-width="220" show-overflow-tooltip />
      </el-table>
      <div class="pagination-wrapper" v-if="flatHistory.length > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="flatHistory.length"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          small
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-empty v-else :description="$t('common.noData')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { Customer, LineageInfo } from "../interface";

const { t } = useI18n();

interface Props {
  lineage: LineageInfo;
  customer: Customer;
}

const props = defineProps<Props>();

const mergeHistory = computed(() => props.lineage.mergeHistory ?? []);

// 扁平化：每个字段变更一行，表头更丰富（时间 / 操作人 / 来源系统 / 字段 / 原值 / 新值 / 原因）
interface LineageChangeRow {
  id: string;
  mergedAt: string;
  mergedBy: string;
  sourceSystem?: string;
  field: string;
  fieldLabel?: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string;
}

const flatHistory = computed<LineageChangeRow[]>(() => {
  const list: LineageChangeRow[] = [];
  const history = mergeHistory.value;

  history.forEach((item, idx) => {
    if (item.changes && item.changes.length > 0) {
      item.changes.forEach((change, cIdx) => {
        list.push({
          id: `${idx}-${cIdx}`,
          mergedAt: item.mergedAt,
          mergedBy: item.mergedBy,
          sourceSystem: item.sourceSystem,
          field: change.field,
          fieldLabel: change.fieldLabel,
          oldValue: change.oldValue ?? null,
          newValue: change.newValue ?? null,
          reason: item.reason
        });
      });
    } else {
      // 没有字段明细也保留一行日志
      list.push({
        id: `${idx}-0`,
        mergedAt: item.mergedAt,
        mergedBy: item.mergedBy,
        sourceSystem: item.sourceSystem,
        field: "",
        fieldLabel: "",
        oldValue: null,
        newValue: null,
        reason: item.reason
      });
    }
  });

  return list;
});

const pageSize = ref(5);
const currentPage = ref(1);

const pagedFlatHistory = computed(() => {
  const list = flatHistory.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return list.slice(start, start + pageSize.value);
});

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};
</script>

<style scoped lang="scss">
.lineage-view {
  padding: 16px;

  .lineage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .lineage-log {
    margin-top: 16px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .field-changes {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .field-change-item {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      font-size: 12px;

      .field-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-right: 4px;
      }

      .field-value-old {
        color: var(--el-text-color-secondary);
        text-decoration: line-through;
      }

      .field-arrow {
        color: var(--el-text-color-placeholder);
      }

      .field-value-new {
        color: var(--el-color-success);
        font-weight: 500;
      }
    }
  }
}
</style>

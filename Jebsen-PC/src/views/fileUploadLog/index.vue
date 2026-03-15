<template>
  <div class="file-upload-log table-box">
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request-api="loadAuditLogApi"
      :init-param="{}"
      :pagination="true"
      :border="true"
      :row-key="getRowKey"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";
import { getAuditLog } from "@/api/modules/dataQualityWorkbench";

const { t } = useI18n();
const tableRef = ref();

const columns = computed<ColumnProps[]>(() => [
  {
    prop: "uploadTime",
    label: t("dataQualityWorkbench.auditLog.uploadTime"),
    width: 180,
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        "value-format": "YYYY-MM-DD HH:mm:ss"
      }
    }
  },
  {
    prop: "dataSource",
    label: t("dataQualityWorkbench.auditLog.dataSource"),
    width: 150,
    search: {
      el: "select",
      props: {
        options: [
          { label: "DMS", value: "DMS" },
          { label: "POAS", value: "POAS" },
          { label: "WWS", value: "WWS" },
          { label: "C@P", value: "C@P" },
          { label: "Voucher", value: "Voucher" },
          { label: "Manual Files", value: "Manual Files" }
        ]
      }
    }
  },
  {
    prop: "fileName",
    label: t("dataQualityWorkbench.auditLog.fileName"),
    minWidth: 200,
    search: {
      el: "input",
      props: {
        placeholder: t("dataQualityWorkbench.auditLog.fileNamePlaceholder")
      }
    }
  },
  {
    prop: "operator",
    label: "上传人",
    width: 180,
    search: {
      el: "input",
      props: {
        placeholder: "请输入上传人"
      }
    }
  },
  {
    prop: "validationResult",
    label: t("dataQualityWorkbench.auditLog.validationResult"),
    width: 120,
    align: "center",
    tag: true,
    enum: [
      { label: t("dataQualityWorkbench.auditLog.statusPassed"), value: "passed", tagType: "success" },
      { label: t("dataQualityWorkbench.auditLog.statusFailed"), value: "failed", tagType: "danger" },
      { label: t("dataQualityWorkbench.auditLog.statusPending"), value: "pending", tagType: "info" }
    ],
    search: {
      el: "select",
      props: {
        options: [
          { label: t("dataQualityWorkbench.auditLog.statusPassed"), value: "passed" },
          { label: t("dataQualityWorkbench.auditLog.statusFailed"), value: "failed" },
          { label: t("dataQualityWorkbench.auditLog.statusPending"), value: "pending" }
        ]
      }
    }
  },
  {
    prop: "uploadStatus",
    label: t("dataQualityWorkbench.auditLog.uploadStatus"),
    width: 120,
    align: "center",
    tag: true,
    enum: [
      { label: t("dataQualityWorkbench.auditLog.uploadSuccess"), value: "success", tagType: "success" },
      { label: t("dataQualityWorkbench.auditLog.uploadFailed"), value: "failed", tagType: "danger" },
      { label: t("dataQualityWorkbench.auditLog.uploadProcessing"), value: "processing", tagType: "warning" }
    ],
    search: {
      el: "select",
      props: {
        options: [
          { label: t("dataQualityWorkbench.auditLog.uploadSuccess"), value: "success" },
          { label: t("dataQualityWorkbench.auditLog.uploadFailed"), value: "failed" },
          { label: t("dataQualityWorkbench.auditLog.uploadProcessing"), value: "processing" }
        ]
      }
    }
  },
  {
    prop: "errorType",
    label: "错误类型",
    minWidth: 150
  }
]);

function getRowKey(row: any, index: number) {
  return `${row.uploadTime ?? ""}_${row.fileName ?? ""}_${index}`;
}

async function loadAuditLogApi(params: any) {
  try {
    const mockData = await import("@/assets/json/dataQualityWorkbenchMockData.json");
    const auditData = mockData.default?.auditLog?.data;
    if (auditData) {
      const { list, total } = auditData;
      const page = params?.pageNum ?? params?.page ?? 1;
      const pageSize = params?.pageSize ?? 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: {
          list: list.slice(start, end),
          total: total ?? list.length
        }
      };
    }
  } catch (_) {
    // ignore mock load error
  }

  try {
    const res = await getAuditLog(params);
    const d = (res as any)?.data;
    if (d?.list) {
      return {
        data: {
          list: d.list,
          total: d.total ?? 0
        }
      };
    }
  } catch (e) {
    console.error("加载文件上传日志失败:", e);
  }

  return { data: { list: [], total: 0 } };
}
</script>

<style scoped lang="scss">
.file-upload-log {
  padding: 0;
}
</style>

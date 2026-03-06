<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :title="t('operation.storeAnalysis')"
      :columns="columns"
      :request-api="getTableList"
      :pagination="true"
      :data-callback="dataCallback"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { useI18n } from "vue-i18n";
import { ElTooltip, ElIcon } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";

const { t } = useI18n();

// 自定义表头渲染（带 Tooltip）
const renderHeaderWithTooltip = (label: string, tipKey: string) => {
  return () => {
    return h("div", { style: { display: "flex", alignItems: "center", justifyContent: "center" } }, [
      h("span", label),
      h(
        ElTooltip,
        {
          content: t(`operation.tips.${tipKey}`),
          placement: "top",
          effect: "dark"
        },
        {
          default: () =>
            h(ElIcon, { style: { marginLeft: "4px", cursor: "pointer", color: "#909399" } }, { default: () => h(InfoFilled) })
        }
      )
    ]);
  };
};

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 表格列配置
const columns: ColumnProps[] = [
  {
    prop: "storeName",
    label: t("operation.storeName"),
    minWidth: 180,
    fixed: "left",
    search: {
      el: "select",
      props: {
        placeholder: t("operation.placeholder.store")
      }
    },
    enum: [
      { label: "上海浦东保时捷中心", value: "1" },
      { label: "上海静安保时捷中心", value: "2" },
      { label: "杭州西湖保时捷中心", value: "3" },
      { label: "北京长安保时捷中心", value: "4" },
      { label: "广州天河保时捷中心", value: "5" },
      { label: "深圳福田保时捷中心", value: "6" },
      { label: "成都锦江保时捷中心", value: "7" },
      { label: "南京玄武保时捷中心", value: "8" }
    ]
  },
  {
    prop: "year",
    label: t("operation.year"),
    isShow: false,
    search: {
      el: "date-picker",
      props: {
        type: "year",
        valueFormat: "YYYY",
        placeholder: t("operation.placeholder.year")
      }
    }
  },
  {
    prop: "month",
    label: t("operation.month"),
    isShow: false,
    search: {
      el: "date-picker",
      props: {
        type: "month",
        format: "MM",
        valueFormat: "MM",
        placeholder: t("operation.placeholder.month")
      }
    }
  },
  {
    label: t("operation.customerGrowth"),
    headerAlign: "center",
    _children: [
      {
        prop: "netGrowthRate",
        label: t("operation.netGrowthRate"),
        minWidth: 140,
        render: scope => scope.row.netGrowthRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.netGrowthRate"), "netGrowthRate")
      },
      {
        prop: "newSalesLocal",
        label: t("operation.newSalesLocal"),
        minWidth: 140,
        headerRender: renderHeaderWithTooltip(t("operation.newSalesLocal"), "newSalesLocal")
      },
      {
        prop: "newAfterSalesNonLocal",
        label: t("operation.newAfterSalesNonLocal"),
        minWidth: 180,
        headerRender: renderHeaderWithTooltip(t("operation.newAfterSalesNonLocal"), "newAfterSalesNonLocal")
      },
      {
        prop: "lostCustomers",
        label: t("operation.lostCustomers"),
        minWidth: 120,
        headerRender: renderHeaderWithTooltip(t("operation.lostCustomers"), "lostCustomers")
      }
    ]
  },
  {
    label: t("operation.retentionPenetration"),
    headerAlign: "center",
    _children: [
      {
        prop: "salesFirstMaintenanceRate",
        label: t("operation.salesFirstMaintenanceRate"),
        minWidth: 150,
        render: scope => scope.row.salesFirstMaintenanceRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.salesFirstMaintenanceRate"), "salesFirstMaintenanceRate")
      },
      {
        prop: "salesFirstReturnRate",
        label: t("operation.salesFirstReturnRate"),
        minWidth: 150,
        render: scope => scope.row.salesFirstReturnRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.salesFirstReturnRate"), "salesFirstReturnRate")
      },
      {
        prop: "afterSalesRegularMaintenanceRate",
        label: t("operation.afterSalesRegularMaintenanceRate"),
        minWidth: 160,
        render: scope => scope.row.afterSalesRegularMaintenanceRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.afterSalesRegularMaintenanceRate"), "afterSalesRegularMaintenanceRate")
      },
      {
        prop: "afterSalesRetentionRate",
        label: t("operation.afterSalesRetentionRate"),
        minWidth: 150,
        render: scope => scope.row.afterSalesRetentionRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.afterSalesRetentionRate"), "afterSalesRetentionRate")
      },
      {
        prop: "stickyProductPenetrationRate",
        label: t("operation.stickyProductPenetrationRate"),
        minWidth: 150,
        render: scope => scope.row.stickyProductPenetrationRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.stickyProductPenetrationRate"), "stickyProductPenetrationRate")
      },
      {
        prop: "newInsurancePenetrationRate",
        label: t("operation.newInsurancePenetrationRate"),
        minWidth: 130,
        render: scope => scope.row.newInsurancePenetrationRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.newInsurancePenetrationRate"), "newInsurancePenetrationRate")
      },
      {
        prop: "renewalInsurancePenetrationRate",
        label: t("operation.renewalInsurancePenetrationRate"),
        minWidth: 130,
        render: scope => scope.row.renewalInsurancePenetrationRate + "%",
        headerRender: renderHeaderWithTooltip(t("operation.renewalInsurancePenetrationRate"), "renewalInsurancePenetrationRate")
      },
      {
        prop: "underRepairNotInsuredPenetrationRate",
        label: t("operation.underRepairNotInsuredPenetrationRate"),
        minWidth: 160,
        render: scope => scope.row.underRepairNotInsuredPenetrationRate + "%",
        headerRender: renderHeaderWithTooltip(
          t("operation.underRepairNotInsuredPenetrationRate"),
          "underRepairNotInsuredPenetrationRate"
        )
      },
      {
        prop: "renewalRateDistribution",
        label: t("operation.renewalRateDistribution"),
        minWidth: 180,
        render: scope => scope.row.renewalRateDistribution + "%",
        headerRender: renderHeaderWithTooltip(t("operation.renewalRateDistribution"), "renewalRateDistribution")
      }
    ]
  }
];

// 获取表格数据
const getTableList = () => {
  return new Promise(resolve => {
    // 模拟接口请求
    setTimeout(() => {
      const list = [
        {
          id: "1",
          storeName: "1",
          netGrowthRate: 12.5,
          newSalesLocal: 45,
          newAfterSalesNonLocal: 28,
          lostCustomers: 12,
          salesFirstMaintenanceRate: 88.2,
          salesFirstReturnRate: 75.4,
          afterSalesRegularMaintenanceRate: 65.8,
          afterSalesRetentionRate: 72.1,
          stickyProductPenetrationRate: 42.5,
          newInsurancePenetrationRate: 92.0,
          renewalInsurancePenetrationRate: 85.5,
          underRepairNotInsuredPenetrationRate: 35.2,
          renewalRateDistribution: 68.5
        },
        {
          id: "2",
          storeName: "2",
          netGrowthRate: 10.8,
          newSalesLocal: 38,
          newAfterSalesNonLocal: 22,
          lostCustomers: 15,
          salesFirstMaintenanceRate: 85.5,
          salesFirstReturnRate: 72.0,
          afterSalesRegularMaintenanceRate: 62.4,
          afterSalesRetentionRate: 70.5,
          stickyProductPenetrationRate: 40.2,
          newInsurancePenetrationRate: 90.5,
          renewalInsurancePenetrationRate: 82.0,
          underRepairNotInsuredPenetrationRate: 32.8,
          renewalRateDistribution: 65.0
        },
        {
          id: "3",
          storeName: "3",
          netGrowthRate: 15.2,
          newSalesLocal: 52,
          newAfterSalesNonLocal: 35,
          lostCustomers: 8,
          salesFirstMaintenanceRate: 91.0,
          salesFirstReturnRate: 78.5,
          afterSalesRegularMaintenanceRate: 68.2,
          afterSalesRetentionRate: 75.8,
          stickyProductPenetrationRate: 45.6,
          newInsurancePenetrationRate: 94.2,
          renewalInsurancePenetrationRate: 88.0,
          underRepairNotInsuredPenetrationRate: 38.5,
          renewalRateDistribution: 72.4
        },
        {
          id: "4",
          storeName: "4",
          netGrowthRate: 9.5,
          newSalesLocal: 42,
          newAfterSalesNonLocal: 28,
          lostCustomers: 18,
          salesFirstMaintenanceRate: 84.0,
          salesFirstReturnRate: 70.2,
          afterSalesRegularMaintenanceRate: 60.5,
          afterSalesRetentionRate: 68.4,
          stickyProductPenetrationRate: 38.5,
          newInsurancePenetrationRate: 89.0,
          renewalInsurancePenetrationRate: 80.5,
          underRepairNotInsuredPenetrationRate: 30.2,
          renewalRateDistribution: 60.2
        },
        {
          id: "5",
          storeName: "5",
          netGrowthRate: 11.2,
          newSalesLocal: 40,
          newAfterSalesNonLocal: 30,
          lostCustomers: 10,
          salesFirstMaintenanceRate: 87.5,
          salesFirstReturnRate: 74.0,
          afterSalesRegularMaintenanceRate: 64.2,
          afterSalesRetentionRate: 71.8,
          stickyProductPenetrationRate: 43.0,
          newInsurancePenetrationRate: 91.5,
          renewalInsurancePenetrationRate: 84.2,
          underRepairNotInsuredPenetrationRate: 34.5,
          renewalRateDistribution: 67.8
        },
        {
          id: "6",
          storeName: "6",
          netGrowthRate: 14.8,
          newSalesLocal: 48,
          newAfterSalesNonLocal: 32,
          lostCustomers: 7,
          salesFirstMaintenanceRate: 90.5,
          salesFirstReturnRate: 77.8,
          afterSalesRegularMaintenanceRate: 67.5,
          afterSalesRetentionRate: 74.5,
          stickyProductPenetrationRate: 46.8,
          newInsurancePenetrationRate: 93.8,
          renewalInsurancePenetrationRate: 87.5,
          underRepairNotInsuredPenetrationRate: 37.8,
          renewalRateDistribution: 71.2
        },
        {
          id: "7",
          storeName: "7",
          netGrowthRate: 8.2,
          newSalesLocal: 35,
          newAfterSalesNonLocal: 20,
          lostCustomers: 20,
          salesFirstMaintenanceRate: 82.5,
          salesFirstReturnRate: 68.5,
          afterSalesRegularMaintenanceRate: 58.8,
          afterSalesRetentionRate: 65.1,
          stickyProductPenetrationRate: 36.2,
          newInsurancePenetrationRate: 86.5,
          renewalInsurancePenetrationRate: 78.2,
          underRepairNotInsuredPenetrationRate: 28.5,
          renewalRateDistribution: 58.5
        },
        {
          id: "8",
          storeName: "8",
          netGrowthRate: 10.5,
          newSalesLocal: 39,
          newAfterSalesNonLocal: 25,
          lostCustomers: 14,
          salesFirstMaintenanceRate: 86.2,
          salesFirstReturnRate: 71.5,
          afterSalesRegularMaintenanceRate: 61.8,
          afterSalesRetentionRate: 69.2,
          stickyProductPenetrationRate: 41.5,
          newInsurancePenetrationRate: 89.8,
          renewalInsurancePenetrationRate: 81.5,
          underRepairNotInsuredPenetrationRate: 31.8,
          renewalRateDistribution: 64.2
        }
      ];
      resolve({
        data: {
          list: list,
          total: list.length,
          pageNum: 1,
          pageSize: 10
        }
      });
    }, 500);
  });
};

// 数据回调
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total,
    pageNum: data.pageNum,
    pageSize: data.pageSize
  };
};
</script>

<style scoped lang="scss">
.table-box {
  padding: 20px;
}
</style>

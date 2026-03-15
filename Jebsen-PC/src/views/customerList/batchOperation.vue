<template>
  <div class="main-box">
    <TreeFilter
      title="地区列表(多选)"
      multiple
      label="name"
      :request-api="getRegionList"
      :default-value="treeFilterValues.regionId"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <div class="card mb10 pt0 pb0">
        <SelectFilter :data="selectFilterData" :default-values="selectFilterValues" @change="changeSelectFilter" />
      </div>
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="loadData"
        :init-param="Object.assign(treeFilterValues, selectFilterValues)"
        :pagination="true"
        :tool-button="toolButton"
        :border="true"
        :row-key="'id'"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="batchAddCustomer">批量添加客户</el-button>
          <el-button type="primary" :icon="Download" plain @click="downloadFile">导出客户数据</el-button>
          <el-button type="primary" :icon="Delete" plain @click="batchDelete">批量删除</el-button>
        </template>
        <!-- OneID列 -->
        <template #oneId="scope">
          <div class="oneid-cell">
            <span>{{ scope.row.oneId }}</span>
            <el-tag v-if="scope.row.hasConflict" type="warning" size="small" style="margin-left: 8px">
              <el-icon><Warning /></el-icon>
              {{ $t("customer.conflict") }}
            </el-tag>
            <el-tag v-if="scope.row.lifecycleStatus === 'pending'" type="info" size="small" style="margin-left: 8px">
              {{ $t("customer.lifecycleStatusOptions.pending") }}
            </el-tag>
          </div>
        </template>

        <!-- 手机号列（多值支持） -->
        <template #phone="scope">
          <MultiValueField field-key="phone" field-label="手机号码" :field-value="scope.row.phone" :one-id="scope.row.oneId" />
        </template>

        <!-- 生命周期状态列 -->
        <template #lifecycleStatus="scope">
          <el-tag :type="getStatusType(scope.row.lifecycleStatus)" size="small">
            {{ getStatusLabel(scope.row.lifecycleStatus) }}
          </el-tag>
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button link type="primary" @click="viewProfile360(scope.row)">
            <el-icon><View /></el-icon>
            {{ $t("customer.view360") }}
          </el-button>
          <el-button link type="warning" @click="submitFeedback(scope.row)">
            <el-icon><Warning /></el-icon>
            {{ $t("customer.feedback.report") }}
          </el-button>
        </template>
      </ProTable>
      <ImportExcel ref="dialogRef" />

      <!-- 360度全景视图 -->
      <Profile360View v-model="show360View" :profile-data="current360Data" @export="handleExport360" />

      <!-- 纠错反馈弹窗 -->
      <FeedbackDialog v-model="showFeedbackDialog" :customer="currentCustomer" @submit="handleFeedbackSubmit" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, h } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, View, Warning } from "@element-plus/icons-vue";
import { STORE_LIST } from "@/constants/storeList";
import { Customer, LifecycleStatus, Customer360View } from "./interface";
import MultiValueField from "./components/MultiValueField.vue";
import Profile360View from "./components/Profile360View.vue";
import FeedbackDialog from "./components/FeedbackDialog.vue";

const { t } = useI18n();

// 工具栏按钮配置
const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 表格列配置（参考客户列表）
const columns = reactive<ColumnProps<Customer>[]>([
  { type: "selection", label: "多选", width: 80 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "oneId",
    label: t("customer.oneId"),
    minWidth: 150,
    sortable: true,
    search: {
      el: "input",
      label: t("customer.oneId"),
      props: { placeholder: t("customer.placeholder.oneId") }
    }
  },
  {
    prop: "lifecycleStatus",
    label: t("customer.lifecycleStatus"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("customer.lifecycleStatus"),
      props: {
        placeholder: t("customer.placeholder.lifecycleStatus"),
        options: [
          { label: t("customer.lifecycleStatusOptions.active"), value: "active" },
          { label: t("customer.lifecycleStatusOptions.inactive"), value: "inactive" },
          { label: t("customer.lifecycleStatusOptions.pending"), value: "pending" },
          { label: t("customer.lifecycleStatusOptions.conflict"), value: "conflict" }
        ]
      }
    }
  },
  {
    prop: "userId",
    label: t("customer.userId"),
    minWidth: 120,
    sortable: true,
    search: {
      el: "input",
      label: t("customer.userId"),
      props: { placeholder: t("customer.placeholder.userId") }
    }
  },
  {
    prop: "name",
    label: t("customer.name"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.name"),
      props: { placeholder: t("customer.placeholder.name") }
    }
  },
  {
    prop: "gender",
    label: t("customer.gender.label"),
    minWidth: 100,
    search: {
      el: "select",
      label: t("customer.gender.label"),
      props: {
        placeholder: t("customer.placeholder.gender"),
        options: [
          { label: t("customer.gender.male"), value: "male" },
          { label: t("customer.gender.female"), value: "female" },
          { label: t("customer.gender.other"), value: "other" }
        ]
      }
    }
  },
  {
    prop: "ageGroup",
    label: t("customer.ageGroup"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.ageGroup"),
      props: { placeholder: t("customer.placeholder.ageGroup") }
    }
  },
  {
    prop: "familyStatus",
    label: t("customer.familyStatus"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.familyStatus"),
      props: { placeholder: t("customer.placeholder.familyStatus") }
    }
  },
  {
    prop: "address",
    label: t("customer.address"),
    minWidth: 180,
    search: {
      el: "input",
      label: t("customer.address"),
      props: { placeholder: t("customer.placeholder.address") }
    },
    render: scope => {
      const fieldValue = scope.row.address;
      if (Array.isArray(fieldValue) && fieldValue.length > 1) {
        return h(MultiValueField, {
          fieldKey: "address",
          fieldLabel: t("customer.address"),
          fieldValue: fieldValue,
          oneId: scope.row.oneId
        });
      }
      return typeof fieldValue === "string" ? fieldValue : fieldValue?.[0]?.value || "";
    }
  },
  {
    prop: "phone",
    label: t("customer.phone"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.phone"),
      props: { placeholder: t("customer.placeholder.phone") }
    }
  },
  {
    prop: "segmentName",
    label: t("customer.segmentName"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.segmentName"),
      props: { placeholder: t("customer.placeholder.segmentName") }
    }
  },
  {
    prop: "contactPreference",
    label: t("customer.contactPreference"),
    minWidth: 160,
    search: {
      el: "input",
      label: t("customer.contactPreference"),
      props: { placeholder: t("customer.placeholder.contactPreference") }
    }
  },
  {
    prop: "lastVisitTime",
    label: t("customer.lastVisitTime"),
    minWidth: 160,
    search: {
      el: "date-picker",
      label: t("customer.lastVisitTime"),
      props: {
        type: "daterange",
        rangeSeparator: "-",
        startPlaceholder: t("customer.placeholder.lastVisitTimeStart"),
        endPlaceholder: t("customer.placeholder.lastVisitTimeEnd")
      }
    }
  },
  {
    prop: "visitCount90Days",
    label: t("customer.visitCount90Days"),
    minWidth: 160,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.visitCount90Days"),
      props: {
        placeholder: t("customer.placeholder.visitCount90Days"),
        min: 0
      }
    }
  },
  {
    prop: "annualOrderFrequency",
    label: t("customer.annualOrderFrequency"),
    minWidth: 180,
    search: {
      el: "input",
      label: t("customer.annualOrderFrequency"),
      props: { placeholder: t("customer.placeholder.annualOrderFrequency") }
    }
  },
  {
    prop: "avgConsumption",
    label: t("customer.avgConsumption"),
    minWidth: 150,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.avgConsumption"),
      props: {
        placeholder: t("customer.placeholder.avgConsumption"),
        min: 0,
        precision: 2
      }
    }
  },
  {
    prop: "projectPreference",
    label: t("customer.projectPreference"),
    minWidth: 150,
    search: {
      el: "input",
      label: t("customer.projectPreference"),
      props: { placeholder: t("customer.placeholder.projectPreference") }
    }
  },
  {
    prop: "hasComplaintLastYear",
    label: t("customer.hasComplaintLastYear"),
    minWidth: 180,
    search: {
      el: "select",
      label: t("customer.hasComplaintLastYear"),
      props: {
        placeholder: t("customer.placeholder.hasComplaintLastYear"),
        options: [
          { label: t("common.yes"), value: true },
          { label: t("common.no"), value: false }
        ]
      }
    }
  },
  {
    prop: "annualConsumption",
    label: t("customer.annualConsumption"),
    minWidth: 160,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.annualConsumption"),
      props: {
        placeholder: t("customer.placeholder.annualConsumption"),
        min: 0,
        precision: 2
      }
    }
  },
  {
    prop: "loyaltyLevel",
    label: t("customer.loyaltyLevel"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.loyaltyLevel"),
      props: { placeholder: t("customer.placeholder.loyaltyLevel") }
    }
  },
  {
    prop: "opportunityLevel",
    label: t("customer.opportunityLevel"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.opportunityLevel"),
      props: { placeholder: t("customer.placeholder.opportunityLevel") }
    }
  },
  {
    prop: "vinInfo",
    label: t("customer.vinInfo"),
    minWidth: 180,
    search: {
      el: "input",
      label: t("customer.vinInfo"),
      props: { placeholder: t("customer.placeholder.vinInfo") }
    },
    render: scope => {
      const fieldValue = scope.row.vinInfo;
      if (Array.isArray(fieldValue) && fieldValue.length > 1) {
        return h(MultiValueField, {
          fieldKey: "vin",
          fieldLabel: t("customer.vinInfo"),
          fieldValue: fieldValue,
          oneId: scope.row.oneId
        });
      }
      return typeof fieldValue === "string" ? fieldValue : fieldValue?.[0]?.value || "";
    }
  },
  {
    prop: "licensePlate",
    label: t("customer.licensePlate"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.licensePlate"),
      props: { placeholder: t("customer.placeholder.licensePlate") }
    },
    render: scope => {
      const fieldValue = scope.row.licensePlate;
      if (Array.isArray(fieldValue) && fieldValue.length > 1) {
        return h(MultiValueField, {
          fieldKey: "plate",
          fieldLabel: t("customer.licensePlate"),
          fieldValue: fieldValue,
          oneId: scope.row.oneId
        });
      }
      return typeof fieldValue === "string" ? fieldValue : fieldValue?.[0]?.value || "";
    }
  },
  {
    prop: "carSeriesModel",
    label: t("customer.carSeriesModel"),
    minWidth: 160,
    search: {
      el: "input",
      label: t("customer.carSeriesModel"),
      props: { placeholder: t("customer.placeholder.carSeriesModel") }
    }
  },
  {
    prop: "currentMileage",
    label: t("customer.currentMileage"),
    minWidth: 150,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.currentMileage"),
      props: {
        placeholder: t("customer.placeholder.currentMileage"),
        min: 0,
        precision: 2
      }
    }
  },
  {
    prop: "serviceHabit",
    label: t("customer.serviceHabit"),
    minWidth: 150,
    search: {
      el: "input",
      label: t("customer.serviceHabit"),
      props: { placeholder: t("customer.placeholder.serviceHabit") }
    }
  },
  {
    prop: "operation",
    label: t("common.operation"),
    fixed: "right",
    width: 280
  }
]);

// selectFilter 数据
const selectFilterData = reactive([
  {
    title: "忠诚度等级(单)",
    key: "loyaltyLevel",
    options: [
      { label: "全部", value: "" },
      { label: "普通", value: "普通", icon: "User" },
      { label: "银卡", value: "银卡", icon: "Star" },
      { label: "金卡", value: "金卡", icon: "StarFilled" },
      { label: "VIP", value: "VIP", icon: "Trophy" }
    ]
  },
  {
    title: "机会等级(多)",
    key: "opportunityLevel",
    multiple: true,
    options: [
      { label: "全部", value: "" },
      { label: "A级", value: "A级" },
      { label: "B级", value: "B级" },
      { label: "C级", value: "C级" },
      { label: "D级", value: "D级" }
    ]
  }
]);

// 默认 selectFilter 参数
const selectFilterValues = ref({ loyaltyLevel: "", opportunityLevel: [""] });
const changeSelectFilter = (value: typeof selectFilterValues.value) => {
  ElMessage.success("筛选条件已更新");
  proTable.value!.pageable.pageNum = 1;
  selectFilterValues.value = value;
};

// 模拟地区数据API
const getRegionList = async () => {
  // 模拟地区数据
  const mockRegions = [
    {
      id: "1",
      name: "华东地区",
      children: [
        { id: "11", name: "上海" },
        { id: "12", name: "江苏" },
        { id: "13", name: "浙江" }
      ]
    },
    {
      id: "2",
      name: "华南地区",
      children: [
        { id: "21", name: "广东" },
        { id: "22", name: "福建" },
        { id: "23", name: "海南" }
      ]
    },
    {
      id: "3",
      name: "华北地区",
      children: [
        { id: "31", name: "北京" },
        { id: "32", name: "天津" },
        { id: "33", name: "河北" }
      ]
    },
    {
      id: "4",
      name: "华中地区",
      children: [
        { id: "41", name: "湖北" },
        { id: "42", name: "湖南" },
        { id: "43", name: "河南" }
      ]
    }
  ];
  return { data: mockRegions };
};

// 默认 treeFilter 参数
const treeFilterValues = reactive<{ regionId: string[] }>({ regionId: [] });
const changeTreeFilter = (val: string[]) => {
  ElMessage.success("地区筛选已更新");
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.regionId = val;
};

// 生成模拟数据（与客户列表相同的数据源）
const generateMockData = (pageNum: number, pageSize: number) => {
  const mockData: Customer[] = [];
  const total = 100;
  const start = (pageNum - 1) * pageSize;
  const end = Math.min(pageNum * pageSize, total);

  const genders = ["male", "female", "other"];
  const ageGroups = ["18-25", "26-35", "36-45", "46-55", "56-65"];
  const familyStatuses = ["未婚", "已婚", "离异", "丧偶"];
  const loyaltyLevels = ["普通", "银卡", "金卡", "VIP"];
  const opportunityLevels = ["A级", "B级", "C级", "D级"];
  const projectPreferences = ["保养", "维修", "美容", "配件", "保险", "救援"];
  const serviceHabits = ["到店即办", "预约服务", "上门服务", "电话咨询"];
  // 保时捷在售车系/车型（与客户列表、360 车辆信息一致）
  const carSeriesModels = [
    "保时捷 911 Carrera",
    "保时捷 911 Turbo",
    "保时捷 Cayenne",
    "保时捷 Cayenne Coupé",
    "保时捷 Panamera",
    "保时捷 Taycan",
    "保时捷 Macan",
    "保时捷 718 Boxster",
    "保时捷 718 Cayman"
  ];

  const sourceSystems = ["DMS", "BDC", "CRM", "ERP", "WMS", "SCM", "BI"];
  const lifecycleStatuses: LifecycleStatus[] = ["active", "inactive", "pending", "conflict"];
  const segments = ["高价值客户", "普通客户", "潜在客户", "流失客户", "VIP客户"];

  for (let i = start; i < end; i++) {
    const oneId = `ONEID${String(i + 1).padStart(8, "0")}`;
    const hasConflict = i % 10 === 0; // 每10个中有1个有冲突
    const lifecycleStatus = lifecycleStatuses[i % lifecycleStatuses.length];

    mockData.push({
      id: i + 1,
      oneId: oneId,
      userId: `C${String(i + 1).padStart(3, "0")}`,
      name: `客户${i + 1}`,
      gender: genders[i % genders.length],
      ageGroup: ageGroups[i % ageGroups.length],
      familyStatus: familyStatuses[i % familyStatuses.length],
      address:
        i % 5 === 0
          ? [
              {
                value: `地址${i + 1}号街道${Math.floor(Math.random() * 100) + 1}号`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              {
                value: `地址${i + 1}号街道${Math.floor(Math.random() * 100) + 1}号（新）`,
                source: "BDC",
                updateTime: "2025-01-06 14:20:00"
              }
            ]
          : `地址${i + 1}号街道${Math.floor(Math.random() * 100) + 1}号`,
      phone:
        i % 7 === 0
          ? [
              {
                value: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              {
                value: `139${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
                source: "BDC",
                updateTime: "2025-01-06 14:20:00"
              },
              {
                value: `150${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
                source: "客户报告纠错",
                updateTime: "2025-01-05 09:15:00"
              }
            ]
          : `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      contactPreference: ["工作日 9:00-18:00", "周末 10:00-20:00", "任意时间"][i % 3],
      lastVisitTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(
        2,
        "0"
      )}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 12) + 8).padStart(
        2,
        "0"
      )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
      visitCount90Days: Math.floor(Math.random() * 20),
      annualOrderFrequency: Math.floor(Math.random() * 50),
      avgConsumption: parseFloat((Math.random() * 10000).toFixed(2)),
      projectPreference: projectPreferences[i % projectPreferences.length],
      hasComplaintLastYear: i % 7 === 0,
      annualConsumption: parseFloat((Math.random() * 50000).toFixed(2)),
      loyaltyLevel: loyaltyLevels[i % loyaltyLevels.length],
      opportunityLevel: opportunityLevels[i % opportunityLevels.length],
      vinInfo:
        i % 8 === 0
          ? [
              {
                value: `LSGDB52E7HA${String(100000 + i).slice(-6)}`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              { value: `LSGDB52E7HA${String(100000 + i + 1).slice(-6)}`, source: "BDC", updateTime: "2025-01-06 14:20:00" }
            ]
          : `LSGDB52E7HA${String(100000 + i).slice(-6)}`,
      licensePlate:
        i % 6 === 0
          ? [
              {
                value: `${["京", "沪", "粤", "苏", "浙", "鲁"][i % 6]}${String.fromCharCode(65 + (i % 6))}${Math.floor(Math.random() * 90000 + 10000)}`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              {
                value: `${["京", "沪", "粤", "苏", "浙", "鲁"][(i + 1) % 6]}${String.fromCharCode(65 + ((i + 1) % 6))}${Math.floor(Math.random() * 90000 + 10000)}`,
                source: "BDC",
                updateTime: "2025-01-05 09:20:00"
              }
            ]
          : `${["京", "沪", "粤", "苏", "浙", "鲁"][i % 6]}${String.fromCharCode(65 + (i % 6))}${Math.floor(Math.random() * 90000 + 10000)}`,
      carSeriesModel: carSeriesModels[i % carSeriesModels.length],
      currentMileage: parseFloat((Math.random() * 200000).toFixed(2)),
      serviceHabit: serviceHabits[i % serviceHabits.length],
      // 新增字段
      lifecycleStatus: lifecycleStatus,
      hasConflict: hasConflict,
      conflicts: hasConflict
        ? [
            {
              field: "phone",
              sourceValues: [
                {
                  system: "DMS",
                  value: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`
                },
                {
                  system: "BDC",
                  value: `139${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`
                }
              ],
              resolvedValue: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`
            }
          ]
        : undefined,
      lineage: {
        oneId: oneId,
        sourceSystems: [
          {
            systemName: sourceSystems[i % sourceSystems.length],
            systemId: `${sourceSystems[i % sourceSystems.length]}_${i + 1}`,
            linkedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isPrimary: i % 3 === 0
          },
          {
            systemName: sourceSystems[(i + 1) % sourceSystems.length],
            systemId: `${sourceSystems[(i + 1) % sourceSystems.length]}_${i + 1}`,
            linkedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isPrimary: false
          }
        ]
      },
      tags: (i % 5 === 0 ? ["高价值客户", "VIP"] : i % 3 === 0 ? ["活跃客户"] : []) as string[],
      segmentName: segments[i % segments.length],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return {
    data: mockData,
    total: total
  };
};

// 模拟数据加载函数（与客户列表相同）
const loadData = async (params: any) => {
  console.log("加载客户数据，参数：", params);

  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  const result = generateMockData(pageNum, pageSize);

  await new Promise(resolve => setTimeout(resolve, 300));

  const response = {
    data: {
      list: result.data,
      total: result.total
    }
  };

  return response;
};

// 批量添加客户
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAddCustomer = () => {
  ElMessage.info("批量添加功能开发中");
  // 这里可以打开批量导入对话框
  // const params = {
  //   title: "客户",
  //   tempApi: exportCustomerInfo,
  //   importApi: BatchAddCustomer,
  //   getTableList: proTable.value?.getTableList
  // };
  // dialogRef.value?.acceptParams(params);
};

// 导出客户数据
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出客户数据?", "温馨提示", { type: "warning" }).then(() => {
    ElMessage.success("导出功能开发中");
    // useDownload(exportCustomerInfo, "客户列表", proTable.value?.searchParam)
  });
};

// 批量删除
const batchDelete = () => {
  const selectedRows = proTable.value?.element?.getSelectionRows();
  if (!selectedRows || selectedRows.length === 0) {
    ElMessage.warning("请先选择要删除的客户");
    return;
  }
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.length} 条客户数据?`, "温馨提示", {
    type: "warning"
  }).then(() => {
    ElMessage.success("批量删除功能开发中");
    proTable.value?.getTableList();
  });
};

// 状态管理
const show360View = ref(false);
const showFeedbackDialog = ref(false);
const currentCustomer = ref<Customer | undefined>();
const current360Data = ref<Customer360View | undefined>();

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

// 查看360度全景视图
const viewProfile360 = async (row: Customer) => {
  currentCustomer.value = row;

  // 生成消费趋势数据（最近12个月）
  const consumptionTrend: Array<{ date: string; amount: number; count: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    consumptionTrend.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      amount: Math.floor(Math.random() * 10000) + 1000,
      count: Math.floor(Math.random() * 5) + 1
    });
  }

  // 生成消费结构数据
  const consumptionStructure = [
    { category: "保养", amount: row.avgConsumption * 0.4, percentage: 40 },
    { category: "维修", amount: row.avgConsumption * 0.3, percentage: 30 },
    { category: "美容", amount: row.avgConsumption * 0.15, percentage: 15 },
    { category: "配件", amount: row.avgConsumption * 0.1, percentage: 10 },
    { category: "其他", amount: row.avgConsumption * 0.05, percentage: 5 }
  ];

  // 生成项目偏好排行
  const projectPreferenceRank = [
    { name: "保养", count: 15, amount: row.avgConsumption * 0.4 * 15 },
    { name: "维修", count: 8, amount: row.avgConsumption * 0.3 * 8 },
    { name: "美容", count: 5, amount: row.avgConsumption * 0.15 * 5 },
    { name: "配件", count: 3, amount: row.avgConsumption * 0.1 * 3 }
  ];

  // 判断是否需要显示公司信息（如果客户有 companyId 或 companyOneId，说明属于公司）
  const hasCompanyInfo = row.companyId || row.companyOneId;

  // 构建公司信息（如果客户属于公司）
  const companyInfo = hasCompanyInfo
    ? {
        id: row.companyId || "",
        oneId: row.companyOneId || row.companyId || "",
        name: row.customerType === "company" ? row.name : row.companyId ? `公司-${row.companyId}` : "所属公司",
        address: typeof row.address === "string" ? row.address : Array.isArray(row.address) ? row.address[0]?.value || "" : "",
        phone: row.phone,
        contactPerson: row.name
      }
    : undefined;

  // 模拟加载360度数据（带 OneID 血缘信息）
  current360Data.value = {
    // 公司信息（如果客户属于公司）
    company: companyInfo,
    customer: {
      ...row,
      lineage: {
        oneId: row.oneId,
        sourceSystems: [
          {
            systemName: "DMS",
            systemId: "DMS-" + row.userId,
            linkedAt: "2023-01-10 10:00:00",
            isPrimary: true
          },
          {
            systemName: "BDC",
            systemId: "BDC-" + row.userId,
            linkedAt: "2023-03-15 15:20:00",
            isPrimary: false
          },
          {
            systemName: "CRM",
            systemId: "CRM-" + row.userId,
            linkedAt: "2023-05-08 09:30:00",
            isPrimary: false
          }
        ],
        mergeHistory: [
          {
            mergedAt: "2024-01-05 09:30:00",
            mergedBy: "数据治理管理员",
            reason: "对齐客户基本信息，合并 DMS 与 CRM 记录",
            sourceSystem: "DMS",
            changes: [
              {
                field: "name",
                fieldLabel: t("customer.name"),
                oldValue: "张伟（CRM）",
                newValue: row.name
              }
            ]
          },
          {
            mergedAt: "2024-03-12 14:10:00",
            mergedBy: "客服中心",
            reason: "客户主动更新联系方式，手机号同步到 Golden Record",
            sourceSystem: "BDC",
            changes: [
              {
                field: "phone",
                fieldLabel: t("customer.phone"),
                oldValue: "138****0000",
                newValue: typeof row.phone === "string" ? row.phone : row.phone?.[0]?.value || "138****1234"
              }
            ]
          }
        ]
      }
    },
    transactions: [
      {
        id: "1",
        type: "sale",
        date: "2024-01-15",
        amount: 50000,
        description: "购车",
        orderNo: "ORD20240115001",
        storeName: STORE_LIST[0].storeName,
        paymentMethod: "银行转账"
      },
      {
        id: "2",
        type: "service",
        date: "2024-02-20",
        amount: 2000,
        description: "保养",
        orderNo: "ORD20240220001",
        storeName: STORE_LIST[0].storeName,
        paymentMethod: "现金"
      }
    ],
    consumptionTrend,
    consumptionStructure,
    assets: {
      coupons: [
        {
          id: "1",
          name: "保养券",
          amount: 500,
          expireDate: "2024-12-31",
          status: "valid",
          source: "活动赠送"
        }
      ],
      vouchers: [
        {
          id: "1",
          name: "代金券",
          balance: 1000,
          totalAmount: 2000,
          usedAmount: 1000
        }
      ],
      totalCouponValue: 800,
      totalVoucherBalance: 1000
    },
    vehicles: [
      {
        vin: typeof row.vinInfo === "string" ? row.vinInfo : row.vinInfo?.[0]?.value || "",
        licensePlate: typeof row.licensePlate === "string" ? row.licensePlate : row.licensePlate?.[0]?.value || "",
        model: row.carSeriesModel,
        brand: row.carSeriesModel.split(" ")[0] || "保时捷",
        purchaseDate: "2023-01-01",
        lastServiceDate: "2024-01-15",
        nextServiceDate: "2024-07-15",
        mileage: row.currentMileage,
        serviceCount: 12,
        totalServiceAmount: 15000
      }
    ],
    interactions: [
      {
        id: "1",
        type: "call",
        date: "2024-01-10",
        content: "电话咨询保养服务",
        operator: "BDC客服",
        duration: 180,
        result: "已预约"
      }
    ],
    metrics: {
      totalConsumption: row.annualConsumption,
      avgOrderValue: row.avgConsumption,
      retentionRate: 0.85,
      lifetimeValue: row.annualConsumption * 3,
      visitFrequency: row.visitCount90Days * 4,
      lastVisitDays: Math.floor((Date.now() - new Date(row.lastVisitTime).getTime()) / (1000 * 60 * 60 * 24)),
      orderCount: row.annualOrderFrequency,
      avgVisitInterval: 45,
      projectPreferenceRank
    },
    statistics: {
      firstOrderDate: "2023-01-15",
      lastOrderDate: row.lastVisitTime,
      totalOrderCount: row.annualOrderFrequency,
      totalServiceCount: 25,
      avgConsumptionPerMonth: row.annualConsumption / 12,
      peakConsumptionMonth: "2024-01"
    },
    dataCompleteness: {
      basicInfo: 95,
      transactionHistory: 90,
      vehicleInfo: 85,
      interactionHistory: 80
    },
    lastUpdated: {
      basicInfo: row.updatedAt,
      transactions: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      assets: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      vehicles: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      interactions: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  };

  show360View.value = true;
};

// 提交反馈
const submitFeedback = (row: Customer) => {
  currentCustomer.value = row;
  showFeedbackDialog.value = true;
};

// 处理反馈提交
const handleFeedbackSubmit = (form: any) => {
  console.log("提交纠错反馈:", form);
  ElMessage.success(t("customer.feedback.submitSuccess"));
};

// 导出360视图数据
const handleExport360 = () => {
  ElMessage.success(t("customer.profile360.exportSuccess"));
};
</script>

<style scoped lang="scss">
.main-box {
  display: flex;
  height: calc(100vh - 85px);
  .table-box {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>

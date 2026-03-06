<template>
  <div class="sample-preview">
    <div v-loading="loading" class="preview-content">
      <el-empty
        v-if="!sampleData || sampleData.length === 0"
        :description="$t('customerSegmentation.samplePreview.noData')"
        :image-size="80"
      />

      <el-table v-else :data="sampleData" stripe border style="width: 100%" :max-height="400">
        <el-table-column prop="oneId" :label="$t('customer.oneId')" width="140" />
        <el-table-column prop="name" :label="$t('customer.name')" width="120">
          <template #default="{ row }">
            {{ maskName(row.name) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" :label="$t('customer.phone')" width="140">
          <template #default="{ row }">
            {{ maskPhone(row.phone) }}
          </template>
        </el-table-column>
        <el-table-column prop="vin" :label="$t('customer.vinInfo')" width="180">
          <template #default="{ row }">
            {{ maskVIN(row.vin) }}
          </template>
        </el-table-column>
        <el-table-column prop="gender" :label="$t('customer.gender.label')" width="80" />
        <el-table-column prop="ageGroup" :label="$t('customerSegmentation.fields.ageGroup')" width="100" />
        <el-table-column prop="city" :label="$t('customerSegmentation.fields.city')" width="120" />
        <el-table-column prop="carSeriesModel" :label="$t('customerSegmentation.fields.modelLine')" width="150" />
        <el-table-column prop="lastVisitTime" :label="$t('customerSegmentation.fields.lastVisit')" width="120" />
        <el-table-column prop="annualSpend" :label="$t('customerSegmentation.fields.annualSpend')" width="120" align="right">
          <template #default="{ row }"> ¥{{ formatNumber(row.annualSpend) }} </template>
        </el-table-column>
        <el-table-column prop="tags" :label="$t('customerSegmentation.fields.systemTag')" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" class="mr-4">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { TagManage } from "@/api/modules/tagManage";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";
import { getSampleData } from "@/api/modules/customerSegmentation";

const { t } = useI18n();

const props = defineProps<{
  rulePayload: TagManage.RuleConfig | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const sampleData = ref<CustomerSegmentation.SampleData[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 脱敏函数
const maskPhone = (phone: string) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

const maskVIN = (vin: string) => {
  if (!vin || vin.length < 8) return vin;
  const start = vin.substring(0, 4);
  const end = vin.substring(vin.length - 4);
  return `${start}${"*".repeat(vin.length - 8)}${end}`;
};

const maskName = (name: string) => {
  if (!name || name.length <= 1) return name;
  return name.substring(0, 1) + "**";
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const loadSampleData = async () => {
  if (!props.rulePayload) {
    sampleData.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const res = await getSampleData(props.rulePayload, currentPage.value, pageSize.value);
    sampleData.value = res.data.list || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error("加载样本数据失败:", error);
    sampleData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadSampleData();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadSampleData();
};

watch(
  () => props.rulePayload,
  () => {
    currentPage.value = 1;
    loadSampleData();
  },
  { deep: true }
);

onMounted(() => {
  loadSampleData();
});
</script>

<style scoped lang="scss">
.sample-preview {
  .preview-content {
    min-height: 200px;

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .mr-4 {
      margin-right: 4px;
    }
  }
}
</style>

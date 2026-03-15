<template>
  <div class="quick-filters">
    <div class="filter-header">
      <div class="header-left">
        <el-icon class="filter-icon"><Filter /></el-icon>
        <span class="filter-title">漏斗筛选</span>
      </div>
      <div class="header-right">
        <el-tag size="small" type="success" v-if="activeFiltersCount > 0"> 已选 {{ activeFiltersCount }} 项条件 </el-tag>
        <el-button v-if="activeFiltersCount > 0" type="info" link size="small" :icon="RefreshLeft" @click="handleClear">
          重置
        </el-button>
        <el-button type="primary" link size="small" @click="toggleAllSections">
          {{ allExpanded ? "全部折叠" : "全部展开" }}
        </el-button>
      </div>
    </div>

    <el-form :model="filterForm" label-width="120px" label-position="top" class="filter-form">
      <el-collapse v-model="activeSections">
        <!-- 1. 基础档案信息 -->
        <el-collapse-item name="basic">
          <template #title>
            <div class="section-title">
              <el-icon><User /></el-icon>
              <span>{{ $t("customerSegmentation.filterSections.basic") }}</span>
              <el-tag v-if="getSectionCount('basic') > 0" size="small" type="success">{{ getSectionCount("basic") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="姓名">
                <el-input v-model="filterForm.name" placeholder="输入姓名，支持模糊匹配" clearable @input="handleFilterChange" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="性别">
                <el-radio-group v-model="filterForm.gender" @change="handleFilterChange">
                  <el-radio-button value="">不限</el-radio-button>
                  <el-radio-button value="male">男</el-radio-button>
                  <el-radio-button value="female">女</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="年龄段">
                <el-checkbox-group v-model="filterForm.ageGroup" @change="handleFilterChange">
                  <el-checkbox value="20-30">20-30</el-checkbox>
                  <el-checkbox value="30-40">30-40</el-checkbox>
                  <el-checkbox value="40-50">40-50</el-checkbox>
                  <el-checkbox value="50+">50+</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item :label="$t('customer.listFields.residenceArea')">
                <el-select
                  v-model="filterForm.residenceArea"
                  filterable
                  allow-create
                  default-first-option
                  :placeholder="$t('customer.placeholder.residenceArea')"
                  clearable
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="city in RESIDENCE_CITY_OPTIONS"
                    :key="city"
                    :label="city"
                    :value="city"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item :label="$t('customer.lifecycleStatus')">
                <el-select
                  v-model="filterForm.lifecycleStatus"
                  :placeholder="$t('customer.placeholder.lifecycleStatus')"
                  clearable
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="opt in LIFECYCLE_STATUS_OPTIONS"
                    :key="opt.value"
                    :label="$t(opt.labelKey)"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 2. 售后行为（需求侧-售后行为） -->
        <el-collapse-item name="behavior">
          <template #title>
            <div class="section-title">
              <el-icon><DataLine /></el-icon>
              <span>{{ $t("customerSegmentation.filterSections.afterSales") }}</span>
              <el-tag v-if="getSectionCount('behavior') > 0" size="small" type="success">{{
                getSectionCount("behavior")
              }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="最近到店时间">
                <el-date-picker
                  v-model="filterForm.lastVisitTime as any"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :shortcuts="dateShortcuts"
                  style="width: 100%"
                  @change="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="近90天到店次数">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.visits90d.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.visits90d.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">次</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="年度订单频次">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.annualOrderFreq.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.annualOrderFreq.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">次</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="平均消费金额">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.avgSpend.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.avgSpend.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">元</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="两年内进场次数">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.visitsIn2Years.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.visitsIn2Years.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">次</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="两年内自费金额">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.selfPayAmountIn2Years.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.selfPayAmountIn2Years.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">元</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="最近进店订单日期">
                <el-date-picker
                  v-model="filterForm.lastServiceOrderDate as any"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :shortcuts="dateShortcuts"
                  style="width: 100%"
                  @change="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="最近一年事故维修次数">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.accidentRepairCountIn1Year.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.accidentRepairCountIn1Year.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">次</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item :label="$t('customer.profile360.lastMaintenanceStore')">
                <el-select
                  v-model="filterForm.lastMaintenanceStore"
                  placeholder="请选择门店"
                  clearable
                  filterable
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="opt in LAST_SERVICE_STORE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item :label="$t('customer.listFields.lastReturnStore')">
                <el-select
                  v-model="filterForm.lastReturnStore"
                  placeholder="请选择门店"
                  clearable
                  filterable
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="opt in LAST_SERVICE_STORE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 3. 客户价值（需求侧-客户价值） -->
        <el-collapse-item name="value">
          <template #title>
            <div class="section-title">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ $t("customerSegmentation.filterSections.value") }}</span>
              <el-tag v-if="getSectionCount('value') > 0" size="small" type="success">{{ getSectionCount("value") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item :label="$t('customerSegmentation.fields.annualSpendRange')">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.annualSpend.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.annualSpend.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">元</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item :label="$t('customer.profile360.compositeScore')">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.compositeScore.min"
                    type="number"
                    placeholder="最低"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.compositeScore.max"
                    type="number"
                    placeholder="最高"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 4. 车辆关联信息（需求侧-车辆关联信息） -->
        <el-collapse-item name="vehicle">
          <template #title>
            <div class="section-title">
              <el-icon><Van /></el-icon>
              <span>{{ $t("customerSegmentation.filterSections.vehicle") }}</span>
              <el-tag v-if="getSectionCount('vehicle') > 0" size="small" type="success">{{ getSectionCount("vehicle") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车系">
                <el-autocomplete
                  v-model="filterForm.modelLine"
                  :fetch-suggestions="queryModelLine"
                  placeholder="输入车系或车型"
                  clearable
                  style="width: 100%"
                  @select="handleFilterChange"
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="车型">
                <el-select
                  v-model="filterForm.modelLines"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入车型"
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option v-for="model in modelLineOptions" :key="model" :label="model" :value="model" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="版本/年款">
                <el-input
                  v-model="filterForm.versionYear"
                  placeholder="输入版本或年款"
                  clearable
                  style="width: 100%"
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="车龄">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.carAge.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.carAge.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">年</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车架号（VIN）">
                <el-input
                  v-model="filterForm.vin"
                  placeholder="输入车架号"
                  clearable
                  style="width: 100%"
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车牌号">
                <el-input
                  v-model="filterForm.licensePlate"
                  placeholder="输入车牌号"
                  clearable
                  style="width: 100%"
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车辆属性">
                <el-select
                  v-model="filterForm.vehicleAttribute"
                  placeholder="新车/二手车"
                  clearable
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="opt in VEHICLE_ATTRIBUTE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="购车属性">
                <el-checkbox-group v-model="filterForm.purchaseAttribute" @change="handleFilterChange">
                  <el-checkbox
                    v-for="opt in PURCHASE_ATTRIBUTE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 6. 标签（按分类展开，直接勾选） -->
        <el-collapse-item name="tags">
          <template #title>
            <div class="section-title">
              <el-icon><PriceTag /></el-icon>
              <span>{{ $t("customerSegmentation.filterSections.tags") }}</span>
              <el-tag v-if="getSectionCount('tags') > 0" size="small" type="success">{{ getSectionCount("tags") }}</el-tag>
            </div>
          </template>
          <el-form-item :label="$t('customerSegmentation.quickFilters.tagLabel')">
            <div class="tag-by-category">
              <el-collapse v-model="tagCategoryActiveNames" class="tag-category-collapse">
                <el-collapse-item
                  v-for="category in tagCategories"
                  :key="category.value"
                  :name="category.value"
                >
                  <template #title>
                    <span class="tag-category-name">{{ category.label }}</span>
                    <el-tag v-if="getCategoryTagCount(category) > 0" size="small" type="info" class="tag-category-count">
                      {{ getCategoryTagCount(category) }}
                    </el-tag>
                  </template>
                  <el-checkbox-group
                    v-model="filterForm.tags"
                    class="tag-checkbox-group"
                    @change="handleFilterChange"
                  >
                    <el-checkbox
                      v-for="tag in (category.children || [])"
                      :key="tag.value"
                      :value="tag.value"
                      class="tag-checkbox"
                    >
                      {{ tag.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-form-item>
        </el-collapse-item>

        <!-- 5. 销售行为（需求侧-销售行为） -->
        <el-collapse-item name="purchase">
          <template #title>
            <div class="section-title">
              <el-icon><ShoppingBag /></el-icon>
              <span>{{ $t("customerSegmentation.filterSections.sales") }}</span>
              <el-tag v-if="getSectionCount('purchase') > 0" size="small" type="success">{{
                getSectionCount("purchase")
              }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="购车金额">
                <el-select
                  :model-value="totalCarPriceRangeValue"
                  placeholder="请选择金额区间"
                  clearable
                  style="width: 100%"
                  @change="onAmountRangeChange('totalCarPrice', $event, PURCHASE_AMOUNT_RANGES)"
                >
                  <el-option
                    v-for="opt in PURCHASE_AMOUNT_RANGES"
                    :key="opt.value || 'empty'"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="选配金额">
                <el-select
                  :model-value="totalOptionPriceRangeValue"
                  placeholder="请选择金额区间"
                  clearable
                  style="width: 100%"
                  @change="onAmountRangeChange('totalOptionPrice', $event, OPTION_AMOUNT_RANGES)"
                >
                  <el-option
                    v-for="opt in OPTION_AMOUNT_RANGES"
                    :key="opt.value || 'empty'"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="售后自费金额">
                <el-select
                  :model-value="afterSalesSelfPayRangeValue"
                  placeholder="请选择金额区间"
                  clearable
                  style="width: 100%"
                  @change="onAmountRangeChange('afterSalesSelfPayAmount', $event, AFTER_SALES_SELF_PAY_RANGES)"
                >
                  <el-option
                    v-for="opt in AFTER_SALES_SELF_PAY_RANGES"
                    :key="opt.value || 'empty'"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="已成交订单数">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.completedOrderCount.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.completedOrderCount.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">单</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="最后购车订单交车日期">
                <el-date-picker
                  v-model="filterForm.lastPurchaseDeliveryDate as any"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :shortcuts="dateShortcuts"
                  style="width: 100%"
                  @change="handleFilterChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import {
  Filter,
  RefreshLeft,
  User,
  DataLine,
  TrendCharts,
  Van,
  Service,
  PriceTag,
  ShoppingBag
} from "@element-plus/icons-vue";
import provinceCityDistrictData from "@/assets/json/provinceCityDistrict.json";
import {
  PURCHASE_AMOUNT_RANGES,
  OPTION_AMOUNT_RANGES,
  AFTER_SALES_SELF_PAY_RANGES,
  matchPurchaseAmountRange,
  matchOptionAmountRange,
  matchAfterSalesSelfPayRange
} from "@/constants/amountRangeOptions";
import { SEGMENT_TAG_OPTIONS } from "../constants/tagOptions";
import { TAG_CATEGORY_OPTIONS } from "@/constants/tagCategory";
import {
  VEHICLE_ATTRIBUTE_OPTIONS,
  PURCHASE_ATTRIBUTE_OPTIONS
} from "../constants/vehicleOptions";
import { LAST_SERVICE_STORE_OPTIONS } from "../constants/afterSalesOptions";
import { LIFECYCLE_STATUS_OPTIONS, RESIDENCE_CITY_OPTIONS } from "../constants/basicOptions";

// 表单数据类型
export interface FilterFormType {
  // 基础档案（与客户列表筛选对齐）
  name: string;
  gender: string;
  ageGroup: string[];
  residenceArea: string;   // 居住区域，支持搜索城市
  lifecycleStatus: string; // OneID/生命周期状态
  // 售后行为
  lastVisitTime: [string, string] | null;
  visits90d: { min: number | undefined; max: number | undefined };
  annualOrderFreq: { min: number | undefined; max: number | undefined };
  avgSpend: { min: number | undefined; max: number | undefined };
  accidentRepairCountIn1Year: { min: number | undefined; max: number | undefined };
  // 客户价值
  annualSpend: { min: number | undefined; max: number | undefined };
  compositeScore: { min: number | undefined; max: number | undefined }; // 价值综合评分
  // 车辆关联信息（需求侧表格拆解）
  modelLine: string;
  modelLines: string[];
  versionYear: string;
  carAge: { min: number | undefined; max: number | undefined };
  vin: string;              // 车架号
  licensePlate: string;     // 车牌号
  vehicleAttribute: string; // 车辆属性：新车/二手车
  purchaseAttribute: string[]; // 购车属性：首次购车/增购/换购
  lastMaintenanceStore: string;  // 最近一次保养门店
  lastReturnStore: string;       // 最后一次返厂门店
  // 标签（默认标签 tagCategory）
  tags: string[];
  // 车价相关
  totalCarPrice: { min: number | undefined; max: number | undefined }; // 总车价起止范围（万元）
  totalOptionPrice: { min: number | undefined; max: number | undefined }; // 选配总价范围起止（万元）
  afterSalesSelfPayAmount: { min: number | undefined; max: number | undefined }; // 售后自费金额起止金额
  completedOrderCount: { min: number | undefined; max: number | undefined }; // 已成交订单数范围（购车数）
  // 两年内进场
  visitsIn2Years: { min: number | undefined; max: number | undefined }; // 两年内进场多少次
  selfPayAmountIn2Years: { min: number | undefined; max: number | undefined }; // 两年内自费金额多少
  lastServiceOrderDate: [string, string] | null; // 最近一张进店的订单日期
  // 最后购车订单
  lastPurchaseDeliveryDate: [string, string] | null; // 最后购车订单的交车日期
}

const props = defineProps<{
  modelValue?: FilterFormType;
  conflictFields?: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: FilterFormType];
  change: [value: FilterFormType];
}>();

// 折叠面板状态 - 默认全部展开（需求侧维度：基础档案、售后行为、客户价值、车辆关联、标签、销售行为）
const activeSections = ref<string[]>(["basic", "behavior", "value", "vehicle", "tags", "purchase"]);
const allExpanded = computed(() => activeSections.value.length === 6);

const toggleAllSections = () => {
  if (allExpanded.value) {
    activeSections.value = [];
  } else {
    activeSections.value = ["basic", "behavior", "value", "vehicle", "tags", "purchase"];
  }
};

// 省市区级联数据
const provinceCityDistrictOptions = ref<any[]>([]);

// 级联选择器配置
const cascaderProps = {
  value: "value",
  label: "label",
  children: "children",
  expandTrigger: "hover" as const,
  emitPath: true
};

// 初始化省市区数据
const initProvinceCityDistrict = () => {
  try {
    if (provinceCityDistrictData && Array.isArray(provinceCityDistrictData)) {
      provinceCityDistrictOptions.value = provinceCityDistrictData;
    } else {
      provinceCityDistrictOptions.value = [];
    }
  } catch (error) {
    console.error("加载省市区数据失败:", error);
    provinceCityDistrictOptions.value = [];
  }
};

// 初始化表单数据
const getInitialForm = (): FilterFormType => ({
  // 基础属性
  name: "",
  gender: "",
  ageGroup: [],
  residenceArea: "",
  lifecycleStatus: "",
  // 售后行为
  lastVisitTime: null,
  visits90d: { min: undefined, max: undefined },
  annualOrderFreq: { min: undefined, max: undefined },
  avgSpend: { min: undefined, max: undefined },
  // 客户价值
  annualSpend: { min: undefined, max: undefined },
  compositeScore: { min: undefined, max: undefined },
  // 车辆关联
  modelLine: "",
  modelLines: [],
  versionYear: "",
  carAge: { min: undefined, max: undefined },
  vin: "",
  licensePlate: "",
  vehicleAttribute: "",
  purchaseAttribute: [],
  accidentRepairCountIn1Year: { min: undefined, max: undefined },
  lastMaintenanceStore: "",
  lastReturnStore: "",
  // 标签
  tags: [],
  // 车价相关
  totalCarPrice: { min: undefined, max: undefined },
  totalOptionPrice: { min: undefined, max: undefined },
  afterSalesSelfPayAmount: { min: undefined, max: undefined },
  // 车型与订单
  modelLines: [],
  completedOrderCount: { min: undefined, max: undefined },
  // 两年内进场
  visitsIn2Years: { min: undefined, max: undefined },
  selfPayAmountIn2Years: { min: undefined, max: undefined },
  lastServiceOrderDate: null,
  // 最后购车订单
  lastPurchaseDeliveryDate: null
});

const filterForm = reactive<FilterFormType>(getInitialForm());

// 购车/选配/售后自费金额区间选择回显
const totalCarPriceRangeValue = computed(() =>
  matchPurchaseAmountRange(filterForm.totalCarPrice.min, filterForm.totalCarPrice.max)
);
const totalOptionPriceRangeValue = computed(() =>
  matchOptionAmountRange(filterForm.totalOptionPrice.min, filterForm.totalOptionPrice.max)
);
const afterSalesSelfPayRangeValue = computed(() =>
  matchAfterSalesSelfPayRange(filterForm.afterSalesSelfPayAmount.min, filterForm.afterSalesSelfPayAmount.max)
);

// 金额区间选择变更（预设区间，客户直接选择）
function onAmountRangeChange(
  field: "totalCarPrice" | "totalOptionPrice" | "afterSalesSelfPayAmount",
  value: string,
  options: typeof PURCHASE_AMOUNT_RANGES
) {
  const opt = options.find(r => r.value === value);
  if (opt) {
    (filterForm[field] as { min?: number; max?: number }) = { min: opt.min, max: opt.max };
  } else {
    (filterForm[field] as { min?: number; max?: number }) = { min: undefined, max: undefined };
  }
  handleFilterChange();
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: "近7天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "近30天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: "近90天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  },
  {
    text: "近半年",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
      return [start, end];
    }
  }
];

// 标签选项：与标签管理 tagCategory 统一，与 index 预览共用
const segmentTagOptions = SEGMENT_TAG_OPTIONS;

// 按分类展示的标签（来自 tagCategory 第二级：会员分层、售后行为等）
const tagCategories = computed(() => {
  const root = TAG_CATEGORY_OPTIONS[0];
  return root?.children ?? [];
});

// 标签分类折叠：默认全部展开
const tagCategoryActiveNames = ref<string[]>(
  (TAG_CATEGORY_OPTIONS[0]?.children ?? []).map((c: { value: string }) => c.value)
);

// 某分类下已选标签数量
const getCategoryTagCount = (category: { value: string; label: string; children?: { value: string; label: string }[] }) => {
  const values = (category.children ?? []).map(c => c.value);
  return filterForm.tags.filter(v => values.includes(v)).length;
};

// 车型自动补全
const modelLineOptions = [
  "BMW 3系",
  "BMW 5系",
  "BMW 7系",
  "BMW X1",
  "BMW X3",
  "BMW X5",
  "BMW X7",
  "MINI COOPER",
  "MINI COUNTRYMAN"
];

const queryModelLine = (queryString: string, cb: (results: { value: string }[]) => void) => {
  const results = queryString
    ? modelLineOptions.filter(item => item.toLowerCase().includes(queryString.toLowerCase())).map(v => ({ value: v }))
    : modelLineOptions.map(v => ({ value: v }));
  cb(results);
};

// 按分区计算已选条件
const hasValue = (val: any): boolean => {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim() !== "";
  if (Array.isArray(val)) return val.length > 0;
  // 对于数字，0是有效值，只有NaN或空字符串无效
  if (typeof val === "number") return !isNaN(val);
  return true;
};

const getSectionCount = (section: string): number => {
  const f = filterForm;
  switch (section) {
    case "basic":
      let basicCount = 0;
      if (hasValue(f.name)) basicCount++;
      if (hasValue(f.gender)) basicCount++;
      if (hasValue(f.ageGroup)) basicCount++;
      if (hasValue(f.residenceArea)) basicCount++;
      if (hasValue(f.lifecycleStatus)) basicCount++;
      return basicCount;
    case "behavior":
      let behaviorCount = 0;
      if (hasValue(f.lastVisitTime)) behaviorCount++;
      if (hasValue(f.visits90d.min) || hasValue(f.visits90d.max)) behaviorCount++;
      if (hasValue(f.annualOrderFreq.min) || hasValue(f.annualOrderFreq.max)) behaviorCount++;
      if (hasValue(f.avgSpend.min) || hasValue(f.avgSpend.max)) behaviorCount++;
      if (hasValue(f.visitsIn2Years.min) || hasValue(f.visitsIn2Years.max)) behaviorCount++;
      if (hasValue(f.selfPayAmountIn2Years.min) || hasValue(f.selfPayAmountIn2Years.max)) behaviorCount++;
      if (hasValue(f.lastServiceOrderDate)) behaviorCount++;
      if (hasValue(f.accidentRepairCountIn1Year.min) || hasValue(f.accidentRepairCountIn1Year.max)) behaviorCount++;
      if (hasValue(f.lastMaintenanceStore)) behaviorCount++;
      if (hasValue(f.lastReturnStore)) behaviorCount++;
      return behaviorCount;
    case "value":
      let valueCount = 0;
      if (hasValue(f.annualSpend.min) || hasValue(f.annualSpend.max)) valueCount++;
      if (hasValue(f.compositeScore?.min) || hasValue(f.compositeScore?.max)) valueCount++;
      return valueCount;
    case "vehicle":
      let vehicleCount = 0;
      if (hasValue(f.modelLine)) vehicleCount++;
      if (hasValue(f.modelLines)) vehicleCount++;
      if (hasValue(f.versionYear)) vehicleCount++;
      if (hasValue(f.carAge.min) || hasValue(f.carAge.max)) vehicleCount++;
      if (hasValue(f.vin)) vehicleCount++;
      if (hasValue(f.licensePlate)) vehicleCount++;
      if (hasValue(f.vehicleAttribute)) vehicleCount++;
      if (hasValue(f.purchaseAttribute)) vehicleCount++;
      return vehicleCount;
    case "tags":
      return hasValue(f.tags) ? 1 : 0;
    case "purchase":
      let purchaseCount = 0;
      if (hasValue(f.totalCarPrice.min) || hasValue(f.totalCarPrice.max)) purchaseCount++;
      if (hasValue(f.totalOptionPrice.min) || hasValue(f.totalOptionPrice.max)) purchaseCount++;
      if (hasValue(f.afterSalesSelfPayAmount.min) || hasValue(f.afterSalesSelfPayAmount.max)) purchaseCount++;
      if (hasValue(f.completedOrderCount.min) || hasValue(f.completedOrderCount.max)) purchaseCount++;
      if (hasValue(f.lastPurchaseDeliveryDate)) purchaseCount++;
      return purchaseCount;
    default:
      return 0;
  }
};

// 计算已激活的筛选条件数量
const activeFiltersCount = computed(() => {
  return (
    getSectionCount("basic") +
    getSectionCount("behavior") +
    getSectionCount("value") +
    getSectionCount("vehicle") +
    getSectionCount("tags") +
    getSectionCount("purchase")
  );
});

const handleFilterChange = () => {
  // 清理无效值，确保父组件接收到的数据干净
  const cleanData = JSON.parse(JSON.stringify(filterForm));

  // 处理数字输入框可能产生的空字符串问题
  [
    "visits90d",
    "annualOrderFreq",
    "avgSpend",
    "annualSpend",
    "compositeScore",
    "carAge",
    "totalCarPrice",
    "totalOptionPrice",
    "afterSalesSelfPayAmount",
    "completedOrderCount",
    "visitsIn2Years",
    "selfPayAmountIn2Years",
    "accidentRepairCountIn1Year"
  ].forEach(key => {
    const range = cleanData[key];
    if (range.min === "") range.min = undefined;
    if (range.max === "") range.max = undefined;
  });

  emit("update:modelValue", cleanData);
  emit("change", cleanData);
};

const handleClear = () => {
  const initial = getInitialForm();
  Object.assign(filterForm, initial);
  handleFilterChange();
};

// 同步外部传入的值
watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      Object.assign(filterForm, newVal);
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  // 初始化省市区数据
  await nextTick();
  initProvinceCityDistrict();
  // 加载标签选项等初始化数据
});
</script>

<style scoped lang="scss">
.quick-filters {
  padding: 20px 24px;
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 2px solid var(--el-border-color-lighter);
    .header-left {
      display: flex;
      gap: 8px;
      align-items: center;
      .filter-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }
      .filter-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
    .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
  .filter-form {
    :deep(.el-collapse) {
      border: none;
      .el-collapse-item {
        margin-bottom: 8px;
        overflow: hidden;
        background-color: var(--el-fill-color-blank);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        .el-collapse-item__header {
          height: auto;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
          background-color: transparent;
          border-bottom: none;
          &.is-active {
            border-bottom: 1px dashed var(--el-border-color);
          }
        }
        .el-collapse-item__wrap {
          background-color: transparent;
        }
        .el-collapse-item__content {
          padding: 16px;
        }
      }
    }
    .section-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-weight: 600;
      color: var(--el-text-color-regular);
      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
      .el-tag {
        margin-left: 8px;
      }
    }
    :deep(.el-form-item) {
      margin-bottom: 16px;
      .el-form-item__label {
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
      }
    }
    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      .el-checkbox {
        margin-right: 0;
      }
    }
    :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
    }
    .range-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      width: 100%;
      .range-number-input {
        flex: 1;
        min-width: 80px;
        :deep(.el-input__inner) {
          text-align: center;
        }
      }
      .range-sep {
        flex-shrink: 0;
        font-weight: 500;
        color: var(--el-text-color-secondary);
      }
      .range-unit {
        flex-shrink: 0;
        min-width: 24px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }

    // 优化级联选择器多选时的样式
    :deep(.city-cascader) {
      .el-cascader__tags {
        flex-wrap: wrap;
        gap: 4px;
        max-height: 80px;
        padding-right: 30px; // 为清除按钮留出空间
        overflow: hidden auto;
        .el-tag {
          max-width: 200px;
          padding: 4px 8px;
          margin: 2px 4px 2px 0;
          overflow: hidden;
          font-size: 12px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
          .el-tag__close {
            margin-left: 4px;
          }
        }

        // 折叠标签样式
        .el-tag--info {
          color: var(--el-color-info);
          background-color: var(--el-color-info-light-9);
          border-color: var(--el-color-info-light-7);
        }
      }

      // 输入框样式优化
      .el-input__inner {
        min-height: 32px;
        padding-right: 30px;
      }

      // 下拉面板样式
      .el-cascader__dropdown {
        .el-cascader-panel {
          max-height: 400px;
          overflow-y: auto;
        }
      }
    }

    // 标签按分类展开
    .tag-by-category {
      width: 100%;
    }
    .tag-category-collapse {
      border: none;
      --el-collapse-header-height: 40px;
      :deep(.el-collapse-item__header) {
        border-bottom: 1px solid var(--el-border-color-lighter);
        padding-left: 12px;
        font-weight: 500;
      }
      :deep(.el-collapse-item__wrap) {
        border-bottom: none;
      }
      :deep(.el-collapse-item__content) {
        padding: 12px 12px 16px 24px;
      }
    }
    .tag-category-name {
      margin-right: 8px;
    }
    .tag-category-count {
      vertical-align: middle;
    }
    .tag-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
    }
    .tag-checkbox {
      margin-right: 0;
    }

    // 响应式优化
    @media (width <= 768px) {
      :deep(.city-cascader) {
        .el-cascader__tags {
          max-height: 60px;
          .el-tag {
            max-width: 150px;
            padding: 3px 6px;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>

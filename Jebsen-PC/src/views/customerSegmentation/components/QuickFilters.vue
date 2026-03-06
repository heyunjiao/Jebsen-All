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
        <!-- 1. 基础属性 -->
        <el-collapse-item name="basic">
          <template #title>
            <div class="section-title">
              <el-icon><User /></el-icon>
              <span>基础属性</span>
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
              <el-form-item label="家庭状态">
                <el-checkbox-group v-model="filterForm.familyStatus" @change="handleFilterChange">
                  <el-checkbox value="1">1人</el-checkbox>
                  <el-checkbox value="2">2人</el-checkbox>
                  <el-checkbox value="3-5">3-5人</el-checkbox>
                  <el-checkbox value="5-7">5-7人</el-checkbox>
                  <el-checkbox value="7+">7+</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <el-form-item label="所在省/市/区">
                <el-cascader
                  v-if="provinceCityDistrictOptions.length > 0"
                  v-model="filterForm.city"
                  :options="provinceCityDistrictOptions"
                  :props="{ ...cascaderProps, multiple: true }"
                  placeholder="请选择省/市/区"
                  multiple
                  clearable
                  filterable
                  collapse-tags
                  :max-collapse-tags="3"
                  collapse-tags-tooltip
                  style="width: 100%"
                  class="city-cascader"
                  @change="handleFilterChange"
                />
                <el-input
                  v-else
                  :model-value="
                    Array.isArray(filterForm.city) && filterForm.city.length > 0
                      ? filterForm.city.map(c => (Array.isArray(c) ? c.join('/') : c)).join(', ')
                      : ''
                  "
                  placeholder="加载中..."
                  disabled
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="联系方式有效性">
                <el-radio-group v-model="filterForm.contactValidity" @change="handleFilterChange">
                  <el-radio-button value="">不限</el-radio-button>
                  <el-radio-button value="verified">已验证</el-radio-button>
                  <el-radio-button value="unverified">未验证</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 2. 客户偏好 -->
        <el-collapse-item name="preference">
          <template #title>
            <div class="section-title">
              <el-icon><Star /></el-icon>
              <span>客户偏好</span>
              <el-tag v-if="getSectionCount('preference') > 0" size="small" type="success">{{
                getSectionCount("preference")
              }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="动力偏好">
                <el-checkbox-group v-model="filterForm.powerPreference" @change="handleFilterChange">
                  <el-checkbox value="fuel">燃油</el-checkbox>
                  <el-checkbox value="hybrid">混动</el-checkbox>
                  <el-checkbox value="electric">纯电</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="空间偏好">
                <el-checkbox-group v-model="filterForm.spacePreference" @change="handleFilterChange">
                  <el-checkbox value="small">小型</el-checkbox>
                  <el-checkbox value="medium">中型</el-checkbox>
                  <el-checkbox value="suv">SUV</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="通勤偏好">
                <el-input
                  v-model="filterForm.commutePreference"
                  placeholder="输入通勤偏好"
                  clearable
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="家庭/生活场景偏好">
                <el-input
                  v-model="filterForm.familyLifestylePreference"
                  placeholder="输入偏好"
                  clearable
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="商务场景偏好">
                <el-input
                  v-model="filterForm.businessScenarioPreference"
                  placeholder="输入偏好"
                  clearable
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="性能驾驶偏好">
                <el-input
                  v-model="filterForm.performanceDrivingPreference"
                  placeholder="输入偏好"
                  clearable
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="促销敏感度">
                <el-input v-model="filterForm.promoSensitivity" placeholder="输入敏感度" clearable @input="handleFilterChange" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 3. 客户行为 -->
        <el-collapse-item name="behavior">
          <template #title>
            <div class="section-title">
              <el-icon><DataLine /></el-icon>
              <span>客户行为</span>
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
          </el-row>
        </el-collapse-item>

        <!-- 4. 客户价值 -->
        <el-collapse-item name="value">
          <template #title>
            <div class="section-title">
              <el-icon><TrendCharts /></el-icon>
              <span>客户价值</span>
              <el-tag v-if="getSectionCount('value') > 0" size="small" type="success">{{ getSectionCount("value") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="年度消费金额">
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
              <el-form-item label="消费等级">
                <el-checkbox-group v-model="filterForm.spendingLevel" @change="handleFilterChange">
                  <el-checkbox value="high">高</el-checkbox>
                  <el-checkbox value="medium">中</el-checkbox>
                  <el-checkbox value="low">低</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="忠诚度等级">
                <el-checkbox-group v-model="filterForm.loyaltyLevel" @change="handleFilterChange">
                  <el-checkbox value="dormant">沉睡</el-checkbox>
                  <el-checkbox value="churn">流失</el-checkbox>
                  <el-checkbox value="active">活跃</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="商机等级">
                <el-checkbox-group v-model="filterForm.opportunityLevel" @change="handleFilterChange">
                  <el-checkbox value="diamond">钻石</el-checkbox>
                  <el-checkbox value="gold">黄金</el-checkbox>
                  <el-checkbox value="silver">白银</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="客户价值分层">
                <el-checkbox-group v-model="filterForm.customerValueTier" @change="handleFilterChange">
                  <el-checkbox value="diamond">钻石</el-checkbox>
                  <el-checkbox value="platinum">白金</el-checkbox>
                  <el-checkbox value="gold">黄金</el-checkbox>
                  <el-checkbox value="silver">白银</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 5. 车辆标签 -->
        <el-collapse-item name="vehicle">
          <template #title>
            <div class="section-title">
              <el-icon><Van /></el-icon>
              <span>车辆标签</span>
              <el-tag v-if="getSectionCount('vehicle') > 0" size="small" type="success">{{ getSectionCount("vehicle") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车系+车型">
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
              <el-form-item label="车型（多选）">
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
              <el-form-item label="使用强度">
                <el-checkbox-group v-model="filterForm.usageIntensity" @change="handleFilterChange">
                  <el-checkbox value="high">高</el-checkbox>
                  <el-checkbox value="medium">中</el-checkbox>
                  <el-checkbox value="low">低</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="事故风险等级">
                <el-checkbox-group v-model="filterForm.accidentRiskLevel" @change="handleFilterChange">
                  <el-checkbox value="high">高</el-checkbox>
                  <el-checkbox value="medium">中</el-checkbox>
                  <el-checkbox value="low">低</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 6. 服务与使用习惯 -->
        <el-collapse-item name="service">
          <template #title>
            <div class="section-title">
              <el-icon><Service /></el-icon>
              <span>服务与使用习惯</span>
              <el-tag v-if="getSectionCount('service') > 0" size="small" type="success">{{ getSectionCount("service") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="服务习惯">
                <el-input
                  v-model="filterForm.serviceHabit"
                  placeholder="输入年度节点偏好"
                  clearable
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="最后接待顾问">
                <el-input
                  v-model="filterForm.lastServiceAdvisor"
                  placeholder="输入顾问姓名，支持模糊匹配"
                  clearable
                  @input="handleFilterChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 7. 标签筛选 -->
        <el-collapse-item name="tags">
          <template #title>
            <div class="section-title">
              <el-icon><PriceTag /></el-icon>
              <span>标签筛选</span>
              <el-tag v-if="getSectionCount('tags') > 0" size="small" type="success">{{ getSectionCount("tags") }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="16" :md="12" :lg="8">
              <el-form-item label="标签">
                <el-select
                  v-model="filterForm.tags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入标签"
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option v-for="tag in tagOptions" :key="tag.value" :label="tag.label" :value="tag.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="16" :md="12" :lg="8">
              <el-form-item label="来自BDC的投诉标签">
                <el-select
                  v-model="filterForm.bdcComplaintTags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入投诉标签"
                  style="width: 100%"
                  @change="handleFilterChange"
                >
                  <el-option v-for="tag in bdcComplaintTagOptions" :key="tag.value" :label="tag.label" :value="tag.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 8. 购车信息 -->
        <el-collapse-item name="purchase">
          <template #title>
            <div class="section-title">
              <el-icon><ShoppingBag /></el-icon>
              <span>购车信息</span>
              <el-tag v-if="getSectionCount('purchase') > 0" size="small" type="success">{{
                getSectionCount("purchase")
              }}</el-tag>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="总车价">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.totalCarPrice.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.totalCarPrice.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">万元</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="选配总价">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.totalOptionPrice.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.totalOptionPrice.max"
                    type="number"
                    placeholder="最多"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-unit">万元</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="8">
              <el-form-item label="售后自费金额">
                <div class="range-input-row">
                  <el-input
                    v-model.number="filterForm.afterSalesSelfPayAmount.min"
                    type="number"
                    placeholder="最少"
                    class="range-number-input"
                    @input="handleFilterChange"
                  />
                  <span class="range-sep">-</span>
                  <el-input
                    v-model.number="filterForm.afterSalesSelfPayAmount.max"
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
  Star,
  DataLine,
  TrendCharts,
  Van,
  Service,
  PriceTag,
  ShoppingBag
} from "@element-plus/icons-vue";
import provinceCityDistrictData from "@/assets/json/provinceCityDistrict.json";

// 表单数据类型
export interface FilterFormType {
  // 基础属性
  name: string;
  gender: string;
  ageGroup: string[];
  familyStatus: string[];
  city: string[] | string[][]; // 支持级联选择 [省, 市, 区] 或多选 [[省, 市, 区], ...]
  contactValidity: string;
  // 客户偏好
  powerPreference: string[];
  spacePreference: string[];
  commutePreference: string;
  familyLifestylePreference: string;
  businessScenarioPreference: string;
  performanceDrivingPreference: string;
  promoSensitivity: string;
  // 客户行为
  lastVisitTime: [string, string] | null;
  visits90d: { min: number | undefined; max: number | undefined };
  annualOrderFreq: { min: number | undefined; max: number | undefined };
  avgSpend: { min: number | undefined; max: number | undefined };
  accidentRepairCountIn1Year: { min: number | undefined; max: number | undefined };
  // 客户价值
  annualSpend: { min: number | undefined; max: number | undefined };
  spendingLevel: string[];
  loyaltyLevel: string[];
  opportunityLevel: string[];
  // 车辆标签
  modelLine: string;
  carAge: { min: number | undefined; max: number | undefined };
  usageIntensity: string[];
  accidentRiskLevel: string[];
  // 服务习惯
  serviceHabit: string;
  lastServiceAdvisor: string;
  // 标签
  tags: string[];
  bdcComplaintTags: string[];
  // 车价相关
  totalCarPrice: { min: number | undefined; max: number | undefined }; // 总车价起止范围（万元）
  totalOptionPrice: { min: number | undefined; max: number | undefined }; // 选配总价范围起止（万元）
  afterSalesSelfPayAmount: { min: number | undefined; max: number | undefined }; // 售后自费金额起止金额
  // 客户价值分层
  customerValueTier: string[]; // 客户价值分层类型（钻石客户等）
  // 车型与订单
  modelLines: string[]; // 车型多选
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

// 折叠面板状态 - 默认全部展开
const activeSections = ref<string[]>(["basic", "preference", "behavior", "value", "vehicle", "service", "tags", "purchase"]);
const allExpanded = computed(() => activeSections.value.length === 8);

const toggleAllSections = () => {
  if (allExpanded.value) {
    activeSections.value = [];
  } else {
    activeSections.value = ["basic", "preference", "behavior", "value", "vehicle", "service", "tags", "purchase"];
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
  familyStatus: [],
  city: [], // 改为空数组
  contactValidity: "",
  // 客户偏好
  powerPreference: [],
  spacePreference: [],
  commutePreference: "",
  familyLifestylePreference: "",
  businessScenarioPreference: "",
  performanceDrivingPreference: "",
  promoSensitivity: "",
  // 客户行为
  lastVisitTime: null,
  visits90d: { min: undefined, max: undefined },
  annualOrderFreq: { min: undefined, max: undefined },
  avgSpend: { min: undefined, max: undefined },
  // 客户价值
  annualSpend: { min: undefined, max: undefined },
  spendingLevel: [],
  loyaltyLevel: [],
  opportunityLevel: [],
  // 车辆标签
  modelLine: "",
  carAge: { min: undefined, max: undefined },
  usageIntensity: [],
  accidentRiskLevel: [],
  // 客户行为补充
  accidentRepairCountIn1Year: { min: undefined, max: undefined },
  // 服务习惯
  serviceHabit: "",
  lastServiceAdvisor: "",
  // 标签
  tags: [],
  bdcComplaintTags: [],
  // 车价相关
  totalCarPrice: { min: undefined, max: undefined },
  totalOptionPrice: { min: undefined, max: undefined },
  afterSalesSelfPayAmount: { min: undefined, max: undefined },
  // 客户价值分层
  customerValueTier: [],
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

// 标签选项 (实际项目中从标签管理模块获取)
const tagOptions = ref([
  { label: "高价值", value: "high_value" },
  { label: "即将流失", value: "churn_risk" },
  { label: "活跃客户", value: "active" },
  { label: "沉睡客户", value: "dormant" },
  { label: "新客户", value: "new_customer" },
  { label: "VIP", value: "vip" },
  { label: "保养到期", value: "maintenance_due" },
  { label: "质保即将到期", value: "warranty_expiring" }
]);

// BDC 投诉标签选项
const bdcComplaintTagOptions = ref([
  { label: "服务态度投诉", value: "bdc_service_attitude" },
  { label: "维修质量投诉", value: "bdc_repair_quality" },
  { label: "价格/费用争议", value: "bdc_price_dispute" },
  { label: "预约/等待体验差", value: "bdc_waiting_experience" },
  { label: "配件供应问题", value: "bdc_parts_supply" },
  { label: "其他投诉", value: "bdc_other_complaint" }
]);

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
      if (hasValue(f.familyStatus)) basicCount++;
      if (hasValue(f.city) && Array.isArray(f.city) && f.city.length > 0) basicCount++;
      if (hasValue(f.contactValidity)) basicCount++;
      return basicCount;
    case "preference":
      let prefCount = 0;
      if (hasValue(f.powerPreference)) prefCount++;
      if (hasValue(f.spacePreference)) prefCount++;
      if (hasValue(f.commutePreference)) prefCount++;
      if (hasValue(f.familyLifestylePreference)) prefCount++;
      if (hasValue(f.businessScenarioPreference)) prefCount++;
      if (hasValue(f.performanceDrivingPreference)) prefCount++;
      if (hasValue(f.promoSensitivity)) prefCount++;
      return prefCount;
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
      return behaviorCount;
    case "value":
      let valueCount = 0;
      if (hasValue(f.annualSpend.min) || hasValue(f.annualSpend.max)) valueCount++;
      if (hasValue(f.spendingLevel)) valueCount++;
      if (hasValue(f.loyaltyLevel)) valueCount++;
      if (hasValue(f.opportunityLevel)) valueCount++;
      if (hasValue(f.customerValueTier)) valueCount++;
      return valueCount;
    case "vehicle":
      let vehicleCount = 0;
      if (hasValue(f.modelLine)) vehicleCount++;
      if (hasValue(f.modelLines)) vehicleCount++;
      if (hasValue(f.carAge.min) || hasValue(f.carAge.max)) vehicleCount++;
      if (hasValue(f.usageIntensity)) vehicleCount++;
      if (hasValue(f.accidentRiskLevel)) vehicleCount++;
      return vehicleCount;
    case "service":
      let serviceCount = 0;
      if (hasValue(f.serviceHabit)) serviceCount++;
      if (hasValue(f.lastServiceAdvisor)) serviceCount++;
      return serviceCount;
    case "tags":
      let tagCount = 0;
      if (hasValue(f.tags)) tagCount++;
      if (hasValue(f.bdcComplaintTags)) tagCount++;
      return tagCount;
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
    getSectionCount("preference") +
    getSectionCount("behavior") +
    getSectionCount("value") +
    getSectionCount("vehicle") +
    getSectionCount("service") +
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

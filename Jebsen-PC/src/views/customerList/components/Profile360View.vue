<template>
  <el-drawer
    v-model="visible"
    :title="$t('customer.profile360.title')"
    size="85%"
    :before-close="handleClose"
    destroy-on-close
    class="profile-360-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <span>{{ $t("customer.profile360.title") }}</span>
        <div class="drawer-header-actions" v-if="profileData">
          <el-button link size="small" :icon="ChatDotSquare" @click="handleFeedbackClick">
            {{ $t("customer.feedback.title") }}
          </el-button>
        </div>
      </div>
    </template>
    <div v-if="profileData" class="profile-360-container customer-reference-panel">
      <!-- 与 H5 一致：冲突提示条 -->
      <el-alert
        v-if="profileData.conflictAlert"
        type="warning"
        :title="$t('customer.profile360.conflictNotice')"
        show-icon
        class="profile-alert-bar"
      />
      <!-- 与 H5 一致：最新操作提示条 -->
      <el-alert v-if="profileData.latestOperation" type="info" :closable="false" class="profile-alert-bar operation-alert">
        <template #title>
          {{ $t("customer.profile360.operationNotice") }}: {{ profileData.latestOperation.operator }} -
          {{ profileData.latestOperation.operationType }}
          <span class="operation-time">{{ formatDateTime(profileData.latestOperation.operationTime) }}</span>
        </template>
      </el-alert>
      <!-- 与 H5 一致：数据状态监控 -->
      <el-card v-if="profileData.platformSyncStatus?.length" shadow="never" class="reference-card sync-monitor-card">
        <div class="sync-monitor-header">
          <el-icon><Setting /></el-icon>
          <span>{{ $t("customer.profile360.dataSyncMonitor") }}</span>
          <span v-if="profileData.syncTime" class="sync-time">
            {{ $t("customer.profile360.syncTime") }}: {{ profileData.syncTime }}
          </span>
        </div>
        <div class="sync-source-list">
          <div v-for="source in profileData.platformSyncStatus" :key="source.name" class="sync-source-item">
            <span class="source-name">{{ source.name }}</span>
            <el-tag :type="source.status === 'success' ? 'success' : 'danger'" size="small">
              {{ source.status === "success" ? $t("customer.profile360.valid") : $t("customer.profile360.expired") }}
            </el-tag>
          </div>
        </div>
      </el-card>
      <!-- 公司信息（如果客户属于公司） -->
      <el-card v-if="profileData.company" shadow="never" class="reference-card company-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <div class="header-icon-wrapper company-icon">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <span>{{ $t("customer.company.title") }}</span>
              <!-- 公司生命周期状态：在标题旁显示，编辑时在这里切换 -->
              <div class="company-status-wrapper" v-if="profileData.company">
                <template v-if="!isCompanyEditMode">
                  <el-tag
                    v-if="companyStatusValue"
                    :type="getStatusType(companyStatusValue as LifecycleStatus)"
                    size="small"
                    class="company-status-tag"
                  >
                    {{ getStatusLabel(companyStatusValue as LifecycleStatus) }}
                  </el-tag>
                </template>
                <el-select
                  v-else
                  v-model="companyForm.lifecycleStatus"
                  :placeholder="$t('customer.maintenance.selectStatus')"
                  size="small"
                  class="company-status-select"
                >
                  <el-option :label="$t('customer.lifecycleStatusOptions.active')" value="active" />
                  <el-option :label="$t('customer.lifecycleStatusOptions.inactive')" value="inactive" />
                </el-select>
              </div>
            </div>
            <div class="card-header-right">
              <el-button v-if="!isCompanyEditMode" link type="primary" size="small" :icon="Edit" @click="enterCompanyEditMode">
                {{ $t("customer.profile360.editBasicInfo") }}
              </el-button>
              <template v-else>
                <el-button link type="primary" size="small" :icon="Check" @click="handleSubmitCompanyInfo">
                  {{ $t("customer.profile360.submit") }}
                </el-button>
                <el-button link size="small" :icon="Close" @click="exitCompanyEditMode">
                  {{ $t("customer.profile360.cancel") }}
                </el-button>
              </template>
            </div>
          </div>
        </template>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item :label="$t('customer.company.name')">
            <div class="description-value">
              <el-icon class="value-icon"><OfficeBuilding /></el-icon>
              <template v-if="!isCompanyEditMode">
                <span>{{ profileData.company.name }}</span>
              </template>
              <el-input v-else v-model="companyForm.name" :placeholder="$t('customer.company.name')" size="small" />
            </div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.company.oneId')">
            <div class="description-value">
              <el-icon class="value-icon"><CopyDocument /></el-icon>
              <span>{{ profileData.company.oneId }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.company.address')" :span="2">
            <div class="description-value">
              <el-icon class="value-icon"><Location /></el-icon>
              <template v-if="!isCompanyEditMode">
                <span>{{ profileData.company.address || "-" }}</span>
              </template>
              <el-input v-else v-model="companyForm.address" :placeholder="$t('customer.company.address')" size="small" />
            </div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.company.phone')" :span="2">
            <div class="description-value">
              <el-icon class="value-icon"><Phone /></el-icon>
              <template v-if="!isCompanyEditMode">
                <template v-if="typeof profileData.company.phone === 'string'">
                  <span>{{ profileData.company.phone }}</span>
                </template>
                <template v-else-if="Array.isArray(profileData.company.phone)">
                  <div class="phone-tags-container">
                    <el-tag
                      v-for="(phoneItem, index) in profileData.company.phone"
                      :key="index"
                      type="info"
                      size="small"
                      class="phone-tag"
                    >
                      {{ typeof phoneItem === "string" ? phoneItem : phoneItem.value }}
                    </el-tag>
                  </div>
                </template>
                <span v-else>-</span>
              </template>
              <el-input v-else v-model="companyForm.phone" :placeholder="$t('customer.company.phone')" size="small" />
            </div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.company.contactPerson')">
            <div class="description-value">
              <el-icon class="value-icon"><UserFilled /></el-icon>
              <template v-if="!isCompanyEditMode">
                <span>{{ profileData.company.contactPerson || "-" }}</span>
              </template>
              <el-input
                v-else
                v-model="companyForm.contactPerson"
                :placeholder="$t('customer.company.contactPerson')"
                size="small"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <!-- 层级连接指示器 -->
        <div class="hierarchy-indicator">
          <div class="indicator-line"></div>
          <div class="indicator-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="indicator-text">{{ $t("customer.company.relatedCustomer") }}</div>
        </div>
      </el-card>

      <!-- 公司客户：经办人 Tab（人名+角色）切换，与 H5 一致；切换后下方联系人档案动态展示 -->
      <div
        v-if="profileData.company && profileData.handlers && profileData.handlers.length > 0"
        class="handler-selector-block handler-pill-wrapper"
      >
        <div
          v-for="h in profileData.handlers"
          :key="h.id"
          class="handler-pill"
          :class="{ active: selectedHandlerIdLocal === h.id }"
          @click="selectedHandlerIdLocal = h.id"
        >
          <span class="handler-name">{{ h.name }}</span>
          <span v-if="h.role" class="handler-role-tag">{{ h.role }}</span>
        </div>
      </div>

      <!-- 客户基本信息（联系人档案） -->
      <el-card shadow="never" class="reference-card" :class="{ 'customer-under-company': profileData.company }">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <div class="header-icon-wrapper customer-icon">
                <el-icon><User /></el-icon>
              </div>
              <span>{{ contactArchiveTitle }}</span>
              <el-tag v-if="profileData.company" type="info" size="small" class="company-relation-tag">
                <el-icon class="tag-icon"><Connection /></el-icon>
                <span>{{ $t("customer.company.belongsTo") }}: {{ profileData.company.name }}</span>
              </el-tag>
            </div>
            <div class="card-header-right">
              <el-button
                v-if="!isBasicInfoEditMode"
                link
                type="primary"
                size="small"
                :icon="Edit"
                @click="enterBasicInfoEditMode"
              >
                {{ $t("customer.profile360.editBasicInfo") }}
              </el-button>
              <template v-else>
                <el-button link type="primary" size="small" :icon="Check" @click="handleSubmitBasicInfo">
                  {{ $t("customer.profile360.submit") }}
                </el-button>
                <el-button link size="small" :icon="Close" @click="exitBasicInfoEditMode">
                  {{ $t("customer.profile360.cancel") }}
                </el-button>
              </template>
            </div>
          </div>
        </template>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item v-if="!(isCompanyCustomer && selectedHandler)" label="OneID">
            {{ (currentDisplayCustomer || profileData.customer).oneId }}
            <el-button link type="primary" size="small" :icon="CopyDocument" @click="copyOneId" style="margin-left: 8px" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.customerName')">
            <template v-if="!isBasicInfoEditMode">
              <span>{{ (currentDisplayCustomer || profileData.customer).name }}</span>
            </template>
            <el-input v-else v-model="basicInfoForm.name" :placeholder="$t('customer.placeholder.name')" size="small" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.phone')" :span="2">
            <template v-if="!isBasicInfoEditMode">
              <div class="phone-tags-container">
                <span v-for="(phoneItem, index) in phoneValues" :key="index" class="phone-tag-wrap">
                  <el-tag type="info" size="small" class="phone-tag">
                    {{ phoneItem.value }}
                  </el-tag>
                  <span v-if="phoneItem.isPrimary" class="relation-tag primary">{{
                    $t("customer.profile360.primary") || "主号"
                  }}</span>
                  <span v-else class="relation-tag secondary">{{ $t("customer.profile360.secondary") || "副号" }}</span>
                  <span v-if="phoneItem.relationTagName" class="relation-tag">{{ phoneItem.relationTagName }}</span>
                </span>
              </div>
            </template>
            <div v-else class="phone-list-edit">
              <div v-for="(phone, index) in basicInfoForm.phoneList" :key="index" class="phone-item-edit">
                <el-input
                  v-model="basicInfoForm.phoneList[index]"
                  :placeholder="$t('customer.placeholder.phone')"
                  size="small"
                  clearable
                  class="phone-input"
                />
                <el-select
                  v-model="basicInfoForm.phoneRelationTags[index]"
                  :placeholder="$t('customer.relationTag.label')"
                  size="small"
                  clearable
                  class="relation-tag-select"
                >
                  <el-option v-for="opt in relationTagOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
                <el-radio-group
                  :model-value="basicInfoForm.primaryPhoneIndex === index ? 'primary' : 'secondary'"
                  size="small"
                  @update:model-value="(val: string) => onPhonePrimarySecondaryChange(index, val)"
                >
                  <el-radio label="primary">{{ $t("customer.profile360.primary") }}</el-radio>
                  <el-radio label="secondary">{{ $t("customer.profile360.secondary") }}</el-radio>
                </el-radio-group>
                <el-button
                  type="danger"
                  link
                  size="small"
                  :icon="Delete"
                  :disabled="basicInfoForm.phoneList.length <= 1"
                  @click="removeBasicInfoPhone(index)"
                />
              </div>
              <el-button type="primary" link size="small" :icon="Plus" @click="addBasicInfoPhone">
                {{ $t("customer.profile360.addPhone") }}
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.gender')">
            <template v-if="!isBasicInfoEditMode">
              {{ getGenderLabel((currentDisplayCustomer || profileData.customer).gender) }}
            </template>
            <el-select
              v-else
              v-model="basicInfoForm.gender"
              :placeholder="$t('customer.placeholder.gender')"
              size="small"
              style="width: 100%"
            >
              <el-option :label="$t('customer.gender.male')" value="male" />
              <el-option :label="$t('customer.gender.female')" value="female" />
              <el-option :label="$t('customer.gender.other')" value="other" />
            </el-select>
          </el-descriptions-item>
          <!-- 生命周期状态：仅个人类型（OneID = 个人）允许在这里发起启用/停用申请 -->
          <el-descriptions-item v-if="!isCompanyCustomer" :label="$t('customer.lifecycleStatus')">
            <template v-if="!isBasicInfoEditMode">
              <el-tag :type="getStatusType(profileData.customer.lifecycleStatus as LifecycleStatus)" size="small">
                {{ getStatusLabel(profileData.customer.lifecycleStatus as LifecycleStatus) }}
              </el-tag>
            </template>
            <el-select
              v-else
              v-model="basicInfoForm.lifecycleStatus"
              :placeholder="$t('customer.maintenance.selectStatus')"
              size="small"
              style="width: 100%"
            >
              <el-option :label="$t('customer.lifecycleStatusOptions.active')" value="active" />
              <el-option :label="$t('customer.lifecycleStatusOptions.inactive')" value="inactive" />
            </el-select>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.ageGroup')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).ageGroup || "—" }}
            </template>
            <el-input v-else v-model="basicInfoForm.ageGroup" :placeholder="$t('customer.placeholder.ageGroup')" size="small" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.city')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).city || "—" }}
            </template>
            <el-input v-else v-model="basicInfoForm.city" :placeholder="$t('customer.placeholder.city')" size="small" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.familyStatus')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).familyStatus || "-" }}
            </template>
            <el-input
              v-else
              v-model="basicInfoForm.familyStatus"
              :placeholder="$t('customer.placeholder.familyStatus')"
              size="small"
            />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.address')" :span="2">
            <template v-if="!isBasicInfoEditMode">
              <div class="address-tags-container">
                <el-tag v-for="(addressItem, index) in addressValues" :key="index" type="info" size="small" class="address-tag">
                  {{ addressItem.value }}
                </el-tag>
                <span v-if="addressValues.length === 0">-</span>
              </div>
            </template>
            <el-input v-else v-model="basicInfoForm.address" :placeholder="$t('customer.placeholder.address')" size="small" />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商机信息（个人：商机信息；企业：企业商机信息，与联系人档案联动展示） -->
      <el-card v-if="opportunityInfoList.length > 0 || isCompanyCustomer" shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <el-icon><Opportunity /></el-icon>
              <span>{{
                isCompanyCustomer
                  ? $t("customer.profile360.enterpriseOpportunityInfo")
                  : $t("errorCorrection.customerReference.opportunityInfo")
              }}</span>
            </div>
          </div>
        </template>
        <div v-if="opportunityInfoList.length > 0" class="opportunity-tags-container">
          <el-tag
            v-for="(opportunity, index) in opportunityInfoList"
            :key="index"
            type="primary"
            size="default"
            class="opportunity-tag"
          >
            {{ opportunity.leadType || "-" }}
          </el-tag>
        </div>
        <el-empty v-else :description="$t('customer.profile360.noOpportunityData')" :image-size="80" />
      </el-card>

      <!-- 标签分类 -->
      <el-card shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <el-icon><PriceTag /></el-icon>
              <span>{{
                isCompanyCustomer
                  ? $t("customer.profile360.enterpriseProfileTags")
                  : $t("errorCorrection.customerReference.categoryTags")
              }}</span>
            </div>
            <div class="card-header-right">
              <el-button v-if="!isTagsEditMode" link type="primary" size="small" :icon="Edit" @click="enterTagsEditMode">
                {{ $t("customer.profile360.editTags") }}
              </el-button>
              <template v-else>
                <el-button link type="primary" size="small" :icon="Check" @click="handleSaveTags">
                  {{ $t("customer.profile360.save") }}
                </el-button>
                <el-button link size="small" :icon="Close" @click="exitTagsEditMode">
                  {{ $t("customer.profile360.cancel") }}
                </el-button>
              </template>
            </div>
          </div>
        </template>
        <div class="category-tags-container">
          <template v-if="isTagsEditMode">
            <!-- 编辑模式：显示所有可选标签 -->
            <div class="tags-flow">
              <template v-for="(tags, category) in allCategoryTags" :key="category">
                <div class="category-tags-group">
                  <div class="category-header">
                    <span class="category-name">
                      {{ getCategoryDisplayName(category) }}
                    </span>
                  </div>
                  <div class="tags-list">
                    <el-tag
                      v-for="tag in tags"
                      :key="tag"
                      size="small"
                      :class="[
                        'category-tag',
                        `category-tag-${getCategoryColorIndex(category)}`,
                        { 'tag-selected': isTagSelected(category, tag), 'tag-unselected': !isTagSelected(category, tag) }
                      ]"
                      :effect="isTagSelected(category, tag) ? 'dark' : 'plain'"
                      @click="toggleTag(category, tag)"
                    >
                      <span class="tag-origin" :class="getTagOriginClass(category, tag)">
                        <el-icon v-if="getTagOriginClass(category, tag) === 'auto'"><MagicStick /></el-icon>
                        <el-icon v-else><User /></el-icon>
                        {{ getTagOriginLabel(category, tag) }}
                      </span>
                      <span class="tag-text">{{ tag }}</span>
                    </el-tag>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <!-- 查看模式：只显示已选中的标签 -->
            <template v-if="selectedTags && Object.keys(selectedTags).length > 0">
              <div class="tags-flow">
                <template v-for="(tags, category) in selectedTags" :key="category">
                  <template v-if="tags && Array.isArray(tags) && tags.length > 0">
                    <div class="category-tags-group">
                      <div class="category-header">
                        <span class="category-name">
                          {{ getCategoryDisplayName(category) }}
                        </span>
                      </div>
                      <div class="tags-list">
                        <el-tag
                          v-for="tag in tags"
                          :key="tag"
                          size="small"
                          :class="['category-tag', `category-tag-${getCategoryColorIndex(category)}`]"
                        >
                          <span class="tag-origin" :class="getTagOriginClass(category, tag)">
                            <el-icon v-if="getTagOriginClass(category, tag) === 'auto'"><MagicStick /></el-icon>
                            <el-icon v-else><User /></el-icon>
                            {{ getTagOriginLabel(category, tag) }}
                          </span>
                          <span class="tag-text">{{ tag }}</span>
                        </el-tag>
                      </div>
                    </div>
                  </template>
                </template>
              </div>
              <div v-if="!hasSelectedTags" class="empty-tags">
                <span class="empty-text">{{ $t("common.noData") }}</span>
              </div>
            </template>
            <div v-else class="empty-tags">
              <span class="empty-text">{{ $t("common.noData") }}</span>
            </div>
          </template>
        </div>
      </el-card>

      <!-- 信息标签页 -->
      <el-tabs v-model="activeInfoTab" type="border-card" class="info-tabs">
        <!-- 维保记录 -->
        <el-tab-pane :label="$t('customer.profile360.transactions')" name="transactions">
          <div class="tab-header">
            <div class="tab-header-left">
              <el-input
                v-model="transactionSearch"
                :placeholder="$t('customer.profile360.searchPlaceholder')"
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="transactionTypeFilter"
                :placeholder="$t('customer.profile360.filterByType')"
                clearable
                style="width: 150px; margin-left: 12px"
              >
                <el-option :label="$t('customer.profile360.all')" value="" />
                <el-option :label="$t('customer.profile360.sale')" value="sale" />
                <el-option :label="$t('customer.profile360.service')" value="service" />
              </el-select>
            </div>
            <div class="tab-header-right">
              <span class="data-count">{{ $t("customer.profile360.total") }}: {{ filteredTransactions.length }}</span>
            </div>
          </div>
          <el-table :data="filteredTransactions" border stripe style="margin-top: 12px" size="small">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="serviceType" :label="$t('customer.profile360.serviceType')" min-width="100" />
            <el-table-column prop="serviceTime" :label="$t('customer.profile360.serviceTime')" width="160" sortable />
            <el-table-column prop="serviceStore" :label="$t('customer.profile360.serviceStore')" min-width="120" />
            <el-table-column prop="vehicleModel" :label="$t('customer.profile360.vehicleModel')" min-width="120" />
            <el-table-column prop="amount" :label="$t('customer.profile360.amount')" width="110" align="right">
              <template #default="scope">
                <span class="amount-text">{{ scope.row.amount != null ? formatCurrency(scope.row.amount) : "—" }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="description"
              :label="$t('customer.profile360.description')"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column prop="status" :label="$t('customer.profile360.status')" width="100">
              <template #default="scope">
                <el-tag size="small" :type="getMaintenanceStatusType(scope.row.status)">{{ scope.row.status || "—" }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="tags" :label="$t('customer.profile360.tags')" width="120">
              <template #default="scope">
                <template v-if="scope.row.tags && scope.row.tags.length">
                  <el-tag v-for="(t, i) in scope.row.tags" :key="i" size="small" style="margin-right: 4px">{{ t }}</el-tag>
                </template>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column prop="source" :label="$t('customer.profile360.source')" width="90" />
          </el-table>
          <el-empty v-if="filteredTransactions.length === 0" :description="$t('common.noData')" />
        </el-tab-pane>

        <!-- 保险合同（与 H5 命名一致） -->
        <el-tab-pane :label="$t('customer.profile360.insuranceContract')" name="insurance">
          <div class="tab-header" v-if="profileData.insurance && profileData.insurance.length > 0">
            <div class="tab-header-right">
              <span class="data-count">{{ $t("customer.profile360.total") }}: {{ profileData.insurance.length }}</span>
            </div>
          </div>
          <el-table
            v-if="profileData.insurance && profileData.insurance.length > 0"
            :data="profileData.insurance"
            border
            stripe
            style="margin-top: 12px"
            size="small"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="type" :label="$t('customer.profile360.insuranceType')" min-width="120" />
            <el-table-column prop="company" :label="$t('customer.profile360.insuranceCompany')" width="140" />
            <el-table-column prop="policyNo" :label="$t('customer.profile360.policyNo')" width="160" />
            <el-table-column prop="startDate" :label="$t('customer.profile360.startDate')" width="110" />
            <el-table-column prop="endDate" :label="$t('customer.profile360.endDate')" width="110" />
            <el-table-column prop="purchaseDate" :label="$t('customer.profile360.purchaseDate')" width="110" />
            <el-table-column prop="renewalSpecialistName" :label="$t('customer.profile360.renewalSpecialist')" width="100" />
            <el-table-column prop="amount" :label="$t('customer.profile360.insuranceAmount')" width="110" align="right">
              <template #default="scope">{{ formatCurrency(scope.row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('customer.profile360.status')" width="100">
              <template #default="scope">
                <el-tag size="small" :type="getInsuranceStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" :label="$t('customer.profile360.source')" width="90" />
          </el-table>
          <el-empty v-else :description="$t('common.noData')" />
        </el-tab-pane>

        <!-- 沟通记录（与 H5 第3个 Tab） -->
        <el-tab-pane :label="$t('customer.profile360.communicationRecords')" name="interactions">
          <el-timeline v-if="profileData.interactions && profileData.interactions.length > 0">
            <el-timeline-item
              v-for="item in profileData.interactions"
              :key="item.id"
              :timestamp="item.communicationTime || formatDateTime(item.date || '')"
              placement="top"
              :type="getInteractionTimelineType(item.type)"
            >
              <el-card shadow="hover" class="interaction-card">
                <div class="interaction-item">
                  <div class="interaction-header">
                    <el-tag :type="getInteractionType(item.type)" size="small">
                      {{ getInteractionTypeLabel(item.type) || item.type }}
                    </el-tag>
                    <span class="operator">{{ $t("customer.profile360.operator") }}: {{ item.operator || "—" }}</span>
                    <span v-if="item.duration" class="duration">
                      {{ $t("customer.profile360.duration") }}:
                      {{ typeof item.duration === "number" ? formatDuration(item.duration) : item.duration }}
                    </span>
                  </div>
                  <div class="interaction-content">{{ item.content || "—" }}</div>
                  <div v-if="item.result" class="interaction-result">
                    <el-tag type="info" size="small">
                      {{ $t("customer.profile360.result") || "沟通结果" }}: {{ item.result }}
                    </el-tag>
                  </div>
                  <div v-if="item.notes" class="interaction-notes">
                    {{ $t("customer.profile360.notes") || "备注" }}: {{ item.notes }}
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else :description="$t('common.noData')" />
        </el-tab-pane>

        <!-- 线下活动（与 H5 第4个 Tab） -->
        <el-tab-pane :label="$t('customer.profile360.offlineActivities')" name="offlineActivities">
          <pro-table
            v-if="profileData.offlineActivities && profileData.offlineActivities.length > 0"
            :columns="offlineActivityColumns"
            :data="profileData.offlineActivities"
            :pagination="false"
            :tool-button="false"
            :border="true"
            :row-key="'id'"
          />
          <el-empty v-else :description="$t('common.noData')" />
        </el-tab-pane>

        <!-- 金融贷款（与 H5 第5个 Tab） -->
        <el-tab-pane :label="$t('customer.profile360.financialLoans')" name="financialLoans">
          <div class="tab-header" v-if="profileData.financialLoans && profileData.financialLoans.length > 0">
            <div class="tab-header-right">
              <span class="data-count">{{ $t("customer.profile360.total") }}: {{ profileData.financialLoans.length }}</span>
            </div>
          </div>
          <el-table
            v-if="profileData.financialLoans && profileData.financialLoans.length > 0"
            :data="profileData.financialLoans"
            border
            stripe
            style="margin-top: 12px"
            size="small"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="vehicleModel" :label="$t('customer.profile360.vehicleModel')" min-width="140" />
            <el-table-column prop="status" :label="$t('customer.profile360.loanStatus')" width="100">
              <template #default="scope">
                <el-tag size="small" :type="getLoanStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submitDate" :label="$t('customer.profile360.submitDate')" width="110" />
            <el-table-column prop="signStatus" :label="$t('customer.profile360.signStatus')" width="90" />
            <el-table-column prop="signDate" :label="$t('customer.profile360.signDate')" width="110" />
            <el-table-column prop="issueCenter" :label="$t('customer.profile360.issueCenter')" width="90" />
            <el-table-column prop="startDate" :label="$t('customer.profile360.startDate')" width="110" />
            <el-table-column
              prop="expectedExpiryMonths"
              :label="$t('customer.profile360.maturityMonths')"
              width="100"
              align="right"
            >
              <template #default="scope">
                {{ scope.row.expectedExpiryMonths ?? scope.row.maturityMonths ?? "—" }}
                {{ $t("customer.profile360.months") }}
              </template>
            </el-table-column>
            <el-table-column prop="loanInfo" :label="$t('customer.profile360.loanInfo')" min-width="140" show-overflow-tooltip />
            <el-table-column prop="bank" :label="$t('customer.profile360.lendingBank')" width="110" />
            <el-table-column prop="repaymentDay" :label="$t('customer.profile360.repaymentDay')" width="90" align="right" />
            <el-table-column prop="repaymentDate" :label="$t('customer.profile360.repaymentDate')" width="110" />
            <el-table-column prop="period" :label="$t('customer.profile360.startEndMonth')" min-width="140" />
            <el-table-column prop="financeInstitution" :label="$t('customer.profile360.financeInstitution')" width="110" />
            <el-table-column prop="loanTerm" :label="$t('customer.profile360.loanTerm')" width="90" />
            <el-table-column prop="customerRate" :label="$t('customer.profile360.customerRate')" width="90" align="right">
              <template #default="scope">{{ scope.row.customerRate != null ? scope.row.customerRate + "%" : "—" }}</template>
            </el-table-column>
            <el-table-column prop="loanAmount" :label="$t('customer.profile360.loanAmount')" width="110" align="right">
              <template #default="scope">{{
                scope.row.loanAmount != null ? formatCurrency(scope.row.loanAmount) : "—"
              }}</template>
            </el-table-column>
            <el-table-column prop="bankRebate" :label="$t('customer.profile360.bankRebate')" width="100" align="right">
              <template #default="scope">{{
                scope.row.bankRebate != null ? formatCurrency(scope.row.bankRebate) : "—"
              }}</template>
            </el-table-column>
            <el-table-column prop="loanServiceFee" :label="$t('customer.profile360.loanServiceFee')" width="110" align="right">
              <template #default="scope">{{
                scope.row.loanServiceFee != null ? formatCurrency(scope.row.loanServiceFee) : "—"
              }}</template>
            </el-table-column>
            <el-table-column
              prop="vehicleRegistrationFee"
              :label="$t('customer.profile360.vehicleRegistrationFee')"
              width="130"
              align="right"
            >
              <template #default="scope">{{
                scope.row.vehicleRegistrationFee != null ? formatCurrency(scope.row.vehicleRegistrationFee) : "—"
              }}</template>
            </el-table-column>
            <el-table-column
              prop="vehicleRegistrationCitySubsidy"
              :label="$t('customer.profile360.vehicleRegistrationCitySubsidy')"
              width="160"
              align="right"
            >
              <template #default="scope">{{
                scope.row.vehicleRegistrationCitySubsidy != null ? formatCurrency(scope.row.vehicleRegistrationCitySubsidy) : "—"
              }}</template>
            </el-table-column>
            <el-table-column prop="discountRate" :label="$t('customer.profile360.discountRate')" width="100" align="right">
              <template #default="scope">{{ scope.row.discountRate != null ? scope.row.discountRate + "%" : "—" }}</template>
            </el-table-column>
          </el-table>
          <el-empty v-else :description="$t('common.noData')" />
        </el-tab-pane>

        <!-- 车辆信息：表格 + 右上角编辑 icon，表格内直接修改状态 -->
        <el-tab-pane :label="$t('customer.profile360.vehicleInfo')" name="vehicles">
          <div v-if="profileData.vehicles && profileData.vehicles.length > 0" class="tab-header">
            <span></span>
            <div class="tab-header-right">
              <el-tooltip
                :content="isVehicleEditMode ? $t('customer.profile360.viewMode') : $t('customer.profile360.editMode')"
                placement="left"
              >
                <el-icon
                  class="tab-edit-icon"
                  :class="{ 'is-edit': isVehicleEditMode }"
                  @click="isVehicleEditMode = !isVehicleEditMode"
                >
                  <View v-if="isVehicleEditMode" />
                  <Edit v-else />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <el-table
            v-if="profileData.vehicles && profileData.vehicles.length > 0"
            :data="profileData.vehicles"
            border
            stripe
            size="small"
            style="margin-top: 12px"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="vehicleModel" :label="$t('customer.profile360.vehicleModel')" min-width="140" />
            <el-table-column prop="licensePlate" :label="$t('customer.licensePlate')" width="110" />
            <el-table-column prop="registrationCity" :label="$t('customer.profile360.registrationCity')" width="110" />
            <el-table-column prop="vin" :label="$t('customer.profile360.vin')" width="140" />
            <el-table-column prop="purchaseDate" :label="$t('customer.profile360.purchaseDate')" width="110" />
            <el-table-column prop="status" :label="$t('customer.profile360.status')" width="120" align="center">
              <template #default="scope">
                <el-select
                  v-if="isVehicleEditMode"
                  :model-value="scope.row.status"
                  size="small"
                  style="width: 100%"
                  @update:model-value="(val: string) => handleVehicleStatusChange(scope.row.id, val)"
                >
                  <el-option v-for="opt in vehicleStatusOptions" :key="opt.value" :label="opt.name" :value="opt.value" />
                </el-select>
                <el-tag v-else size="small" :type="getVehicleStatusTagType(scope.row.status)">
                  {{ scope.row.status || $t("customer.profile360.vehicleStatusNone") }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-for="entry in vehicleRoleEntries"
              :key="entry.key"
              :label="entry.label"
              min-width="100"
              align="left"
            >
              <template #default="scope">
                <el-select
                  v-if="isVehicleEditMode && canEditVehicleRole"
                  :model-value="getVehicleRoleSelectValue(scope.row, entry.key)"
                  size="small"
                  style="width: 100%"
                  @update:model-value="(val: string) => handleVehicleRoleSelect(scope.row, entry.key, val)"
                >
                  <el-option v-for="opt in vehicleRolePickerOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
                <span v-else>{{ getVehicleRolePerson(scope.row, entry.key) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="source" :label="$t('customer.profile360.source')" width="90" />
            <el-table-column prop="contractNo" :label="$t('customer.profile360.contractNo')" width="120" />
            <el-table-column prop="signStatus" :label="$t('customer.profile360.signStatus')" width="90" />
            <el-table-column prop="submitTime" :label="$t('customer.profile360.submitTime')" width="110" />
            <el-table-column prop="signTime" :label="$t('customer.profile360.signTime')" width="110" />
            <el-table-column prop="issueCenter" :label="$t('customer.profile360.issueCenter')" width="100" />
            <el-table-column prop="newCarMsrp" :label="$t('customer.profile360.newCarMsrp')" width="130" align="right">
              <template #default="scope">{{
                scope.row.newCarMsrp != null ? formatCurrency(scope.row.newCarMsrp) : "—"
              }}</template>
            </el-table-column>
            <el-table-column
              prop="newCarContractPrice"
              :label="$t('customer.profile360.newCarContractPrice')"
              width="130"
              align="right"
            >
              <template #default="scope">{{
                scope.row.newCarContractPrice != null ? formatCurrency(scope.row.newCarContractPrice) : "—"
              }}</template>
            </el-table-column>
            <el-table-column
              prop="nonCashDiscountAmount"
              :label="$t('customer.profile360.nonCashDiscountAmount')"
              width="140"
              align="right"
            >
              <template #default="scope">{{
                scope.row.nonCashDiscountAmount != null ? formatCurrency(scope.row.nonCashDiscountAmount) : "—"
              }}</template>
            </el-table-column>
            <el-table-column prop="salesItemAmount" :label="$t('customer.profile360.salesItemAmount')" width="130" align="right">
              <template #default="scope">{{
                scope.row.salesItemAmount != null ? formatCurrency(scope.row.salesItemAmount) : "—"
              }}</template>
            </el-table-column>
            <el-table-column
              prop="salesItemName"
              :label="$t('customer.profile360.salesItemName')"
              min-width="120"
              show-overflow-tooltip
            />
          </el-table>
          <el-empty v-else :description="$t('common.noData')" />
        </el-tab-pane>

        <!-- 资产中心：表格形式，竖排（优惠券表在上 + 代金券表在下） -->
        <el-tab-pane :label="$t('customer.profile360.assets')" name="assets">
          <div v-if="profileData.assets" class="asset-center-vertical">
            <div class="asset-section">
              <div class="section-header">
                <h4>{{ $t("customer.profile360.coupons") }}</h4>
                <el-tag type="success" size="small">
                  {{ $t("customer.profile360.totalValue") }}: {{ formatCurrency(profileData.assets.totalCouponValue || 0) }}
                </el-tag>
              </div>
              <el-table :data="profileData.assets.coupons || []" border size="small" style="margin-top: 12px" max-height="400">
                <el-table-column prop="name" :label="$t('customer.profile360.couponName')" min-width="120" />
                <el-table-column prop="type" :label="$t('customer.profile360.assetType')" width="90" />
                <el-table-column prop="amount" :label="$t('customer.profile360.amount')" width="100" align="right">
                  <template #default="scope">{{ scope.row.amount != null ? formatCurrency(scope.row.amount) : "—" }}</template>
                </el-table-column>
                <el-table-column prop="discount" :label="$t('customer.profile360.discount')" width="80" align="right" />
                <el-table-column prop="validFrom" :label="$t('customer.profile360.validFrom')" width="110" />
                <el-table-column prop="validTo" :label="$t('customer.profile360.validTo')" width="110" />
                <el-table-column prop="status" :label="$t('customer.profile360.status')" width="90">
                  <template #default="scope">
                    <el-tag size="small" :type="getAssetStatusTagType(scope.row.status)">
                      {{ getCouponStatusLabel(scope.row.status) || scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="commissionNo" :label="$t('customer.profile360.commissionNo')" width="120" />
                <el-table-column prop="newCarModel" :label="$t('customer.profile360.vehicleModel')" min-width="120" />
                <el-table-column prop="vin" :label="$t('customer.profile360.vin')" width="140" />
                <el-table-column prop="contractNo" :label="$t('customer.profile360.contractNo')" width="120" />
                <el-table-column prop="submitTime" :label="$t('customer.profile360.submitTime')" width="110" />
                <el-table-column prop="signTime" :label="$t('customer.profile360.signTime')" width="110" />
                <el-table-column prop="issueCenter" :label="$t('customer.profile360.issueCenter')" width="100" />
                <el-table-column
                  prop="packageName"
                  :label="$t('customer.profile360.packageName')"
                  min-width="120"
                  show-overflow-tooltip
                />
                <el-table-column prop="itemAmount" :label="$t('customer.profile360.itemAmount')" width="110" align="right">
                  <template #default="scope">{{
                    scope.row.itemAmount != null ? formatCurrency(scope.row.itemAmount) : "—"
                  }}</template>
                </el-table-column>
                <el-table-column prop="itemSource" :label="$t('customer.profile360.itemSource')" width="100" />
                <el-table-column prop="source" :label="$t('customer.profile360.source')" width="90" />
              </el-table>
            </div>
            <div class="asset-section">
              <div class="section-header">
                <h4>{{ $t("customer.profile360.vouchers") }}</h4>
                <el-tag type="primary" size="small">
                  {{ $t("customer.profile360.totalBalance") }}: {{ formatCurrency(profileData.assets.totalVoucherBalance || 0) }}
                </el-tag>
              </div>
              <el-table :data="profileData.assets.vouchers || []" border size="small" style="margin-top: 12px" max-height="400">
                <el-table-column prop="name" :label="$t('customer.profile360.voucherName')" min-width="120" />
                <el-table-column prop="balance" :label="$t('customer.profile360.balance')" width="100" align="right">
                  <template #default="scope">{{ formatCurrency(scope.row.balance) }}</template>
                </el-table-column>
                <el-table-column prop="totalAmount" :label="$t('customer.profile360.totalAmount')" width="110" align="right">
                  <template #default="scope">{{ formatCurrency(scope.row.totalAmount || 0) }}</template>
                </el-table-column>
                <el-table-column prop="commissionNo" :label="$t('customer.profile360.commissionNo')" width="110" />
                <el-table-column prop="newCarModel" :label="$t('customer.profile360.vehicleModel')" min-width="110" />
                <el-table-column prop="vin" :label="$t('customer.profile360.vin')" width="130" />
                <el-table-column prop="contractNo" :label="$t('customer.profile360.contractNo')" width="110" />
                <el-table-column prop="submitTime" :label="$t('customer.profile360.submitTime')" width="100" />
                <el-table-column prop="signTime" :label="$t('customer.profile360.signTime')" width="100" />
                <el-table-column prop="issueCenter" :label="$t('customer.profile360.issueCenter')" width="90" />
                <el-table-column
                  prop="packageName"
                  :label="$t('customer.profile360.packageName')"
                  width="110"
                  show-overflow-tooltip
                />
                <el-table-column prop="itemAmount" :label="$t('customer.profile360.itemAmount')" width="100" align="right">
                  <template #default="scope">{{
                    scope.row.itemAmount != null ? formatCurrency(scope.row.itemAmount) : "—"
                  }}</template>
                </el-table-column>
                <el-table-column prop="itemSource" :label="$t('customer.profile360.itemSource')" width="90" />
              </el-table>
            </div>
          </div>
          <el-empty v-else :description="$t('customer.profile360.noAssetInfo')" />
        </el-tab-pane>
      </el-tabs>

      <!-- 消费统计 -->
      <el-card shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <el-icon><DataAnalysis /></el-icon>
              <span>{{ $t("errorCorrection.customerReference.consumptionStats") }}</span>
            </div>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-label">{{ $t("errorCorrection.customerReference.totalSpend") }}</div>
              <div class="stat-value money-font">¥{{ formatMoney(consumptionStats.totalSpend) }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-label">{{ $t("errorCorrection.customerReference.avgSpend") }}</div>
              <div class="stat-value money-font">¥{{ formatMoney(consumptionStats.avgSpend) }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-label">{{ $t("errorCorrection.customerReference.orderCount") }}</div>
              <div class="stat-value">{{ consumptionStats.orderCount }}{{ $t("errorCorrection.customerReference.times") }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-label">{{ $t("errorCorrection.customerReference.visit90d") }}</div>
              <div class="stat-value">{{ consumptionStats.visit90d }}{{ $t("errorCorrection.customerReference.times") }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-label">{{ $t("errorCorrection.customerReference.lastVisit") }}</div>
              <div class="stat-value">{{ consumptionStats.lastVisit || $t("errorCorrection.customerReference.none") }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 身份血缘溯源 -->
      <el-card v-if="profileData.customer.lineage" class="reference-card" shadow="hover">
        <LineageView :lineage="profileData.customer.lineage" :customer="profileData.customer" />
      </el-card>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CopyDocument,
  Search,
  User,
  Setting,
  Opportunity,
  PriceTag,
  DataAnalysis,
  Edit,
  View,
  Check,
  Close,
  OfficeBuilding,
  Connection,
  Location,
  Phone,
  UserFilled,
  ChatDotSquare,
  MagicStick
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { Customer360View, LifecycleStatus } from "../interface";
import LineageView from "./LineageView.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { h } from "vue";

const { t } = useI18n();

interface Props {
  modelValue: boolean;
  profileData?: Customer360View;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  feedback: [customer: Customer360View["customer"]];
  export: [];
  /** 与 H5 一致：修改车辆状态 */
  vehicleStatusChange: [vehicleId: string, status: string];
  /** 与 H5 一致：设置车辆相关人员（使用人/联系人/送修人） */
  vehicleRoleChange: [
    payload: { vehicle: Customer360View["vehicles"][number]; role: string; selectedValue: string; selectedLabel: string }
  ];
}>();

const visible = ref(props.modelValue);
const activeInfoTab = ref("transactions");
const transactionSearch = ref("");
const transactionTypeFilter = ref("");
const isBasicInfoEditMode = ref(false);
const isTagsEditMode = ref(false);
const isVehicleEditMode = ref(false);
const isCompanyEditMode = ref(false);
// 公司客户当前选中的经办人（与 H5 一致）
const selectedHandlerIdLocal = ref<string>("");
// 车辆信息 Tab：与 H5 一致的修改功能
const editingVehicleStatusId = ref<string | null>(null);
const editingVehicleRole = ref<{ vehicle: Customer360View["vehicles"][number]; role: string } | null>(null);

// 是否为公司客户（用于展示多角色人员信息卡片）
const isCompanyCustomer = computed(() => {
  const data = props.profileData;
  if (!data) return false;
  return !!(data.company || (data.customer && (data.customer as { customerType?: string }).customerType === "company"));
});

// 当前选中的经办人（公司客户时用于切换展示的联系人基本信息）
const selectedHandler = computed(() => {
  const handlers = props.profileData?.handlers;
  const id = selectedHandlerIdLocal.value;
  if (!id || !handlers?.length) return null;
  return handlers.find((h: { id: string }) => h.id === id) ?? null;
});

const handleFeedbackClick = () => {
  if (!props.profileData) return;
  emit("feedback", props.profileData.customer);
};

// 当前展示的“客户”信息：公司类型且选中经办人时为该经办人，否则为 profileData.customer（与 H5 按角色切换一致）
const currentDisplayCustomer = computed(() => {
  const data = props.profileData;
  if (!data) return null;
  const customer = data.customer;
  // 公司内联系人无独立 OneID，仅公司主体有；联系人通过 id + 所属公司 oneId 标识
  if (isCompanyCustomer.value && selectedHandler.value) {
    const h = selectedHandler.value as import("@/views/customerList/interface").HandlerInfo;
    return {
      oneId: undefined as string | undefined,
      name: h.name ?? "",
      ageGroup: h.age != null ? String(h.age) : "",
      gender: (h.gender as string) ?? "",
      city: (h.city as string) ?? "",
      familyStatus: (customer.familyStatus as string) ?? "",
      address: customer.address,
      phone: customer.phone,
      role: h.role
    };
  }
  return { ...customer, role: (customer as { role?: string }).role };
});

// 联系人档案卡片标题：与 H5 一致，统一为「联系人档案」，当前经办人由上方 Tab（人名+角色）表达，避免与联系人信息重叠
const contactArchiveTitle = computed(() => {
  return t("customer.profile360.contactArchive");
});

// 车辆信息 Tab 修改功能（与 H5 一致）
const vehicleRoleEntries = computed(() => [
  { key: "使用人", label: t("customer.profile360.vehicleRoleUser") },
  { key: "联系人", label: t("customer.profile360.vehicleRoleContact") },
  { key: "送修人", label: t("customer.profile360.vehicleRoleRepair") }
]);
const vehicleStatusOptions = computed(() => {
  const base = [
    { name: t("customer.profile360.vehicleStatusSold"), value: "已售" },
    {
      name: isCompanyCustomer.value
        ? t("customer.profile360.vehicleStatusSelfUseCompany")
        : t("customer.profile360.vehicleStatusSelfUse"),
      value: "自用"
    },
    { name: t("customer.profile360.vehicleStatusRepairing"), value: "维修中" },
    { name: t("customer.profile360.vehicleStatusOrderInTransit"), value: "订车中-在途" },
    { name: t("customer.profile360.vehicleStatusRemoteUse"), value: "异地用车" }
  ];
  return base;
});
const canEditVehicleRole = computed(() => {
  const data = props.profileData;
  if (!data) return false;
  const hasPhoneItems = data.customer?.phone && Array.isArray(data.customer.phone) && data.customer.phone.length > 0;
  const hasHandlers = isCompanyCustomer.value && (data.handlers?.length ?? 0) > 0;
  return hasPhoneItems || hasHandlers;
});
const getVehicleRolePerson = (vehicle: Customer360View["vehicles"][number], roleKey: string): string => {
  const rp = vehicle.rolePerson as Record<string, string> | undefined;
  return rp?.[roleKey] || t("customer.profile360.vehicleRoleNone");
};
const vehicleRolePickerOptions = computed(() => {
  const tags: { label: string; value: string }[] = [{ label: t("customer.profile360.vehicleRoleNone"), value: "__none__" }];
  const data = props.profileData;
  if (!data) return tags;
  if (isCompanyCustomer.value && data.handlers?.length) {
    data.handlers.forEach((h: { id: string; name?: string }) => {
      tags.push({ label: h.name || t("customer.profile360.handler"), value: `handler_${h.id}` });
    });
  }
  const phone = data.customer?.phone;
  if (phone && Array.isArray(phone)) {
    phone.forEach((item: Record<string, unknown>, idx: number) => {
      const id = (item.id as string) ?? (item.value as string) ?? `phone_${idx}`;
      const label =
        (item.contactName as string) ||
        (item.relationTagName as string) ||
        (item.value ? `${String(item.value).slice(0, 3)}****${String(item.value).slice(-4)}` : "—");
      tags.push({ label, value: id });
    });
  }
  return tags;
});
function handleVehicleStatusChange(vehicleId: string, status: string) {
  editingVehicleStatusId.value = null;
  emit("vehicleStatusChange", vehicleId, status);
}
/** 表格内编辑：当前行该角色对应的下拉选项 value（用于 el-select model-value） */
function getVehicleRoleSelectValue(row: Customer360View["vehicles"][number], roleKey: string): string {
  const label = getVehicleRolePerson(row, roleKey);
  if (!label || label === t("customer.profile360.vehicleRoleNone")) return "__none__";
  const opt = vehicleRolePickerOptions.value.find(o => o.label === label);
  return opt ? opt.value : "__none__";
}
/** 表格内编辑：选择使用人/联系人/送修人后触发 */
function handleVehicleRoleSelect(vehicle: Customer360View["vehicles"][number], roleKey: string, selectedValue: string) {
  const opt = vehicleRolePickerOptions.value.find(o => o.value === selectedValue);
  if (!opt) return;
  emit("vehicleRoleChange", {
    vehicle,
    role: roleKey,
    selectedValue: opt.value,
    selectedLabel: opt.label
  });
}

// 线下活动表格列配置
const offlineActivityColumns = computed<ColumnProps[]>(() => [
  {
    type: "index",
    label: "#",
    width: 60
  },
  {
    prop: "activityCode",
    label: t("customer.profile360.activityCode"),
    minWidth: 140,
    align: "left"
  },
  {
    prop: "activityName",
    label: t("customer.profile360.activityName"),
    minWidth: 200,
    align: "left"
  },
  {
    prop: "activityType",
    label: t("customer.profile360.activityType"),
    minWidth: 120,
    align: "left"
  },
  {
    prop: "activityTime",
    label: t("customer.profile360.activityTime"),
    minWidth: 160,
    align: "left",
    render: scope => {
      return formatDateTime(scope.row.activityTime);
    }
  },
  {
    prop: "activityLocation",
    label: t("customer.profile360.activityLocation"),
    minWidth: 140,
    align: "left"
  },
  {
    prop: "organizer",
    label: t("customer.profile360.organizer"),
    minWidth: 140,
    align: "left"
  },
  {
    prop: "uploader",
    label: t("customer.profile360.uploader"),
    minWidth: 120,
    align: "left"
  },
  {
    prop: "validExamples",
    label: t("customer.profile360.validExamples"),
    width: 120,
    align: "right",
    render: scope => {
      return scope.row.validExamples !== undefined ? scope.row.validExamples : "-";
    }
  },
  {
    prop: "status",
    label: t("customer.profile360.status"),
    width: 120,
    align: "center",
    render: scope => {
      const isParticipated = scope.row.status === "participated";
      return h(
        "el-tag",
        {
          type: isParticipated ? "success" : "warning",
          size: "small"
        },
        () => (isParticipated ? t("customer.profile360.participated") : t("customer.profile360.notParticipated"))
      );
    }
  },
  {
    prop: "activityDescription",
    label: t("customer.profile360.activityDescription"),
    minWidth: 250,
    align: "left",
    showOverflowTooltip: true
  }
]);

// 关系标签选项（与 H5 一致：本人、配偶、公司电话等）
const RELATION_TAG_KEYS = [
  "self",
  "spouse",
  "companyPhone",
  "father",
  "mother",
  "son",
  "daughter",
  "friend",
  "colleague",
  "other"
] as const;
const relationTagOptions = computed(() =>
  RELATION_TAG_KEYS.map(key => ({ value: key, label: t(`customer.relationTag.${key}`) }))
);

// 基础信息编辑表单
const basicInfoForm = ref<{
  name: string;
  gender: string;
  ageGroup: string;
  city: string;
  familyStatus: string;
  address: string;
  phoneList: string[];
  phoneRelationTags: string[]; // 每个号码的关系标签 key（与 H5 一致）
  primaryPhoneIndex: number;
  lifecycleStatus: LifecycleStatus;
  originalLifecycleStatus: LifecycleStatus;
}>({
  name: "",
  gender: "",
  ageGroup: "",
  city: "",
  familyStatus: "",
  address: "",
  phoneList: [],
  phoneRelationTags: [],
  primaryPhoneIndex: 0,
  lifecycleStatus: "active",
  originalLifecycleStatus: "active"
});

// 公司信息编辑表单（仅 company 类型 OneID，在公司卡片右上角进行编辑）
const companyForm = ref<{
  name: string;
  address: string;
  phone: string;
  contactPerson: string;
  lifecycleStatus: LifecycleStatus;
  originalLifecycleStatus: LifecycleStatus;
}>({
  name: "",
  address: "",
  phone: "",
  contactPerson: "",
  lifecycleStatus: "active",
  originalLifecycleStatus: "active"
});

// 公司当前展示用生命周期状态（优先使用 company.lifecycleStatus，其次 customer.lifecycleStatus）
const companyStatusValue = computed(() => {
  const company = props.profileData?.company;
  const customer = props.profileData?.customer;
  return (
    (company?.lifecycleStatus as LifecycleStatus | undefined) ??
    (customer?.lifecycleStatus as LifecycleStatus | undefined) ??
    null
  );
});

// 编辑模式下的标签选中状态（用于临时存储，保存时才提交）
const editModeSelectedTags = ref<Record<string, string[]>>({});

// 所有可用的标签分类（用于编辑模式下显示所有可选标签）
const allCategoryTags: Record<string, string[]> = {
  意向级别: ["冷", "暖", "热"],
  "SC【必选】": [
    "PMP邀约",
    "全款",
    "员工介绍",
    "市场活动",
    "新车",
    "易手车",
    "老客介绍",
    "老客重购",
    "自然客流",
    "贷款",
    "销售邀约",
    "公牌",
    "其他"
  ],
  "SA【必选】": ["本市", "省内外市", "私牌"],
  "续保【必选】": [
    "人保",
    "人寿",
    "保险到期月份-10月",
    "保险到期月份-11月",
    "保险到期月份-12月",
    "保险到期月份-1月",
    "保险到期月份-2月",
    "保险到期月份-3月",
    "保险到期月份-4月",
    "保险到期月份-5月",
    "保险到期月份-6月",
    "保险到期月份-7月",
    "保险到期月份-8月",
    "保险到期月份-9月",
    "其他",
    "在修不在保",
    "太保",
    "平安",
    "新保",
    "续保",
    "太平",
    "大地"
  ],
  "POC【必选】": ["其他评估", "区间报价", "售后评估", "精确报价", "销售评估"],
  免打扰车主: ["车主免打扰"],
  线上活动: ["8月再购活动抽奖"],
  "爱好(≥1项)": ["亲子", "品酒", "宠物", "潮玩", "自驾游", "艺术文化", "赛车", "运动", "高尔夫"],
  服务偏好: ["下午联系", "微信沟通", "需要代步车", "预约保养", "周末有空", "喜欢喝茶", "关注新款", "预算充足", "偏好SUV"]
};

// 转换数据格式（公司类型且选中经办人时展示该经办人手机号，与 H5 一致）
const phoneValues = computed(() => {
  if (!props.profileData) return [];
  if (isCompanyCustomer.value && selectedHandler.value) {
    const h = selectedHandler.value as { mobile?: string; role?: string };
    if (h.mobile) {
      return [{ value: h.mobile, source: "DMS", isPrimary: true, updateTime: "", relationTagName: h.role }];
    }
    return [];
  }
  const phone = props.profileData.customer.phone;
  if (typeof phone === "string") {
    return [{ value: phone, source: "DMS", isPrimary: true, updateTime: "" }];
  }
  if (Array.isArray(phone)) {
    return phone.map((item, index) => ({
      value: typeof item === "string" ? item : item.value,
      source: typeof item === "object" ? item.source || "DMS" : "DMS",
      isPrimary: typeof item === "object" ? !!item.isPrimary : index === 0,
      updateTime: typeof item === "object" ? item.updateTime || "" : "",
      relationTagName: typeof item === "object" ? (item as { relationTagName?: string }).relationTagName : undefined
    }));
  }
  return [];
});

// 转换地址数据格式（公司类型时仍用客户/公司地址）
const addressValues = computed(() => {
  if (!props.profileData) return [];
  const address = (currentDisplayCustomer.value ?? props.profileData.customer).address;
  if (typeof address === "string") {
    // 如果是JSON字符串，尝试解析
    try {
      const parsed = JSON.parse(address);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, index: number) => ({
          value: typeof item === "string" ? item : item.value || "",
          source: typeof item === "object" ? item.source || "DMS" : "DMS",
          isPrimary: typeof item === "object" ? item.isPrimary || index === 0 : index === 0,
          updateTime: typeof item === "object" ? item.updateTime || "" : ""
        }));
      }
    } catch (e) {
      // 如果不是JSON，直接作为字符串返回
      return [{ value: address, source: "DMS", isPrimary: true, updateTime: "" }];
    }
  }
  if (Array.isArray(address)) {
    return address.map((item, index) => ({
      value: typeof item === "string" ? item : item.value || "",
      source: typeof item === "object" ? item.source || "DMS" : "DMS",
      isPrimary: typeof item === "object" ? item.isPrimary || index === 0 : index === 0,
      updateTime: typeof item === "object" ? item.updateTime || "" : ""
    }));
  }
  return [];
});

// 商机信息列表（从customer数据中提取或使用默认值）
const opportunityInfoList = computed(() => {
  if (!props.profileData) return [];
  // 从customer的opportunityLevel或其他字段中提取
  const opportunities: Array<{
    leadType: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "pushed" | "processing" | "completed";
    ruleName: string;
  }> = [];

  // 如果有opportunityLevel，创建一个商机
  if (props.profileData.customer.opportunityLevel) {
    opportunities.push({
      leadType: `BDC${props.profileData.customer.opportunityLevel}级商机`,
      priority:
        props.profileData.customer.opportunityLevel === "A级"
          ? "high"
          : props.profileData.customer.opportunityLevel === "B级"
            ? "medium"
            : "low",
      status: "pending",
      ruleName: "自动识别规则"
    });
  }

  // 强制合并mock数据(仅demo演示用)
  const mockOpportunities: Array<{
    leadType: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "pushed" | "processing" | "completed";
    ruleName: string;
  }> = [
    { leadType: "BDC续保商机", priority: "high" as const, status: "pending" as const, ruleName: "续保规则" },
    { leadType: "售后满意度回访", priority: "medium" as const, status: "processing" as const, ruleName: "满意度回访规则" },
    { leadType: "BDC Campaign", priority: "high" as const, status: "pending" as const, ruleName: "Campaign规则" },
    { leadType: "新车满意度回访", priority: "high" as const, status: "pushed" as const, ruleName: "新车回访规则" },
    { leadType: "TTR调研", priority: "low" as const, status: "completed" as const, ruleName: "调研规则" },
    { leadType: "PCN售后 Campaign", priority: "medium" as const, status: "pending" as const, ruleName: "PCN规则" }
  ];

  return [...opportunities, ...mockOpportunities];
});

// 标签分类（从customer数据中提取或使用默认值）
const selectedTags = computed(() => {
  if (!props.profileData) return {};

  const tags: Record<string, string[]> = {};

  // 从customer.tags中提取标签
  if (props.profileData.customer.tags && Array.isArray(props.profileData.customer.tags)) {
    // 如果tags是字符串数组，需要根据业务逻辑分类
    // 这里先简单处理，将所有标签放到"其他"分类
    if (props.profileData.customer.tags.length > 0) {
      tags["其他"] = props.profileData.customer.tags;
    }
  }

  // 强制合并mock数据(仅demo演示用)
  const mockTags: Record<string, string[]> = {
    意向级别: ["热", "高意向", "近期购车"],
    SC: ["老客重购", "全款", "置换"],
    SA: ["本市", "私牌", "首次保养"],
    续保: ["平安", "保险到期月份-3月", "续保", "出险1次"],
    POC: ["精确报价", "试驾完成"],
    "爱好(≥1项)": ["自驾游", "运动", "高尔夫", "摄影", "美食"],
    服务偏好: ["下午联系", "微信沟通", "需要代步车", "预约保养", "周末有空"],
    职业信息: ["企业高管", "金融行业"],
    家庭情况: ["二胎家庭", "有宠物"]
  };

  // 合并对象
  return { ...tags, ...mockTags };
});

// 消费统计（从profileData中提取）
const consumptionStats = computed(() => {
  if (!props.profileData) {
    return {
      totalSpend: 0,
      avgSpend: 0,
      orderCount: 0,
      visit90d: 0,
      lastVisit: undefined
    };
  }
  return {
    totalSpend: props.profileData.metrics?.totalConsumption || 0,
    avgSpend: props.profileData.metrics?.avgOrderValue || 0,
    orderCount: props.profileData.metrics?.orderCount || 0,
    visit90d: props.profileData.metrics?.visitFrequency || 0,
    lastVisit: props.profileData.statistics?.lastOrderDate
  };
});

const formatMoney = (amount: number) => {
  return amount.toLocaleString("zh-CN");
};

// 计算过滤后的维保记录（支持 serviceType/serviceTime 与 兼容 type/date/storeName）

const filteredTransactions = computed(() => {
  if (!props.profileData) return [];
  let result = [...props.profileData.transactions];

  if (transactionTypeFilter.value) {
    result = result.filter(
      item =>
        item.type === transactionTypeFilter.value ||
        (item.serviceType &&
          String(item.serviceType)
            .toLowerCase()
            .includes(transactionTypeFilter.value === "sale" ? "销售" : "售后"))
    );
  }

  if (transactionSearch.value) {
    const keyword = transactionSearch.value.toLowerCase();
    result = result.filter(item => {
      const desc = (item.description || "").toLowerCase();
      const time = (item.serviceTime || item.date || "").toLowerCase();
      const store = (item.serviceStore || item.storeName || "").toLowerCase();
      const orderNo = (item.orderNo || "").toLowerCase();
      return desc.includes(keyword) || time.includes(keyword) || store.includes(keyword) || orderNo.includes(keyword);
    });
  }

  return result;
});

watch(
  () => props.profileData,
  data => {
    if (data?.selectedHandlerId) selectedHandlerIdLocal.value = data.selectedHandlerId;
    else if (data?.handlers?.length) selectedHandlerIdLocal.value = data.handlers[0].id;
    else selectedHandlerIdLocal.value = "";
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  val => {
    visible.value = val;
  }
);

watch(visible, val => {
  emit("update:modelValue", val);
  if (!val) {
    editingVehicleStatusId.value = null;
    editingVehicleRole.value = null;
    isVehicleEditMode.value = false;
  }
});

const handleClose = () => {
  // 如果正在编辑模式，先退出编辑模式
  if (isBasicInfoEditMode.value) {
    exitBasicInfoEditMode();
  }
  if (isTagsEditMode.value) {
    exitTagsEditMode();
  }
  visible.value = false;
};

const getStatusType = (status: LifecycleStatus): "success" | "info" | "warning" | "danger" => {
  const map: Record<LifecycleStatus, "success" | "info" | "warning" | "danger"> = {
    active: "success",
    inactive: "info",
    pending: "warning",
    conflict: "danger"
  };
  return map[status] || "info";
};

const getStatusLabel = (status: LifecycleStatus) => {
  return t(`customer.lifecycleStatusOptions.${status}`);
};

const formatCurrency = (amount: number) => {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN");
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return t("customer.profile360.durationSeconds", { seconds });
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return t("customer.profile360.durationMinutesSeconds", {
    minutes,
    seconds: secs
  });
};

const getGenderLabel = (gender: string) => {
  const map: Record<string, string> = {
    male: t("customer.gender.male"),
    female: t("customer.gender.female"),
    other: t("customer.gender.other")
  };
  return map[gender] || gender;
};

const getCouponStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    valid: t("customer.profile360.valid"),
    used: t("customer.profile360.used"),
    expired: t("customer.profile360.expired")
  };
  return map[status] || status;
};

const getAssetStatusTagType = (status: string): "success" | "info" | "warning" | "danger" => {
  const s = (status || "").toLowerCase();
  if (s === "valid" || s === "未使用") return "success";
  if (s === "used" || s === "已使用") return "info";
  if (s === "expired" || s === "已过期") return "danger";
  return "warning";
};

const getVehicleStatusTagType = (status: string): "success" | "info" | "warning" | "primary" => {
  const map: Record<string, "success" | "info" | "warning" | "primary"> = {
    已售: "info",
    自用: "success",
    企业自用: "success",
    维修中: "warning",
    "订车中-在途": "primary",
    异地用车: "info"
  };
  return map[status || ""] || "info";
};

const getMaintenanceStatusType = (status: string): "success" | "primary" | "warning" | "info" | "danger" => {
  const map: Record<string, "success" | "primary" | "warning" | "info" | "danger"> = {
    已完成: "success",
    进行中: "primary",
    待处理: "warning",
    已取消: "info"
  };
  return map[status] || "info";
};

const getInsuranceStatusType = (status: string): "success" | "warning" | "primary" | "info" | "danger" => {
  const map: Record<string, "success" | "warning" | "primary" | "info" | "danger"> = {
    已生效: "success",
    生效中: "success",
    已过期: "warning",
    待续保: "primary",
    已退保: "info"
  };
  return map[status] || "info";
};

const getLoanStatusType = (status: string): "success" | "warning" | "primary" | "danger" | "info" => {
  const map: Record<string, "success" | "warning" | "primary" | "danger" | "info"> = {
    正常: "success",
    即将到期: "warning",
    已结清: "primary",
    逾期: "danger"
  };
  return map[status] || "info";
};

const getInteractionType = (type: string): "primary" | "success" | "warning" | "info" => {
  const map: Record<string, "primary" | "success" | "warning" | "info"> = {
    call: "primary",
    wechat: "success",
    visit: "warning",
    email: "info",
    sms: "info"
  };
  return map[type] || "info";
};

const getInteractionTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    call: t("customer.profile360.call"),
    wechat: t("customer.profile360.wechat"),
    visit: t("customer.profile360.visit"),
    email: t("customer.profile360.email"),
    sms: t("customer.profile360.sms")
  };
  return map[type] || type;
};

const getInteractionTimelineType = (type: string): "primary" | "success" | "warning" | undefined => {
  const map: Record<string, "primary" | "success" | "warning"> = {
    call: "primary",
    wechat: "success",
    visit: "warning"
  };
  return map[type] || undefined;
};

// 判断是否有选中的标签
const hasSelectedTags = computed(() => {
  if (!selectedTags.value) return false;
  const tags = selectedTags.value;
  for (const category in tags) {
    const tagList = tags[category];
    if (tagList && Array.isArray(tagList) && tagList.length > 0) {
      return true;
    }
  }
  return false;
});

// 获取分类显示名称（去掉【必选】等标记）
const getCategoryDisplayName = (category: string): string => {
  return category
    .replace(/【必选】/g, "")
    .replace(/必选/g, "")
    .trim();
};

// 判断某个标签分类是否为自动计算类
const isAutoCategory = (category: string): boolean => {
  const displayName = getCategoryDisplayName(category);
  const autoCategories = ["意向级别", "SC", "SA", "续保", "POC", "免打扰车主", "线上活动"];
  return autoCategories.some(key => displayName.includes(key));
};

// 获取标签分类来源说明（自动 / 手工）
const getCategoryOriginLabel = (category: string): string => {
  const isAuto = isAutoCategory(category);
  return isAuto ? t("customer.tagOrigin.auto") : t("customer.tagOrigin.manual");
};

// 获取单个标签来源说明（目前按分类规则区分）
const getTagOriginLabel = (category: string, tag: string): string => {
  // 预留 tag 参数，后续可按标签粒度细分来源
  void tag;
  return getCategoryOriginLabel(category);
};

// 获取标签来源样式 class（用于着色自动 / 手工）
const getTagOriginClass = (category: string, tag: string): string => {
  // 预留 tag 参数，后续可按标签粒度细分样式
  void tag;
  return isAutoCategory(category) ? "auto" : "manual";
};

// 获取分类颜色索引（用于区分不同分类）
const getCategoryColorIndex = (category: string): number => {
  const categoryMap: Record<string, number> = {
    意向级别: 0,
    SC: 1,
    SA: 2,
    续保: 3,
    POC: 4,
    免打扰车主: 5,
    线上活动: 6,
    "爱好(≥1项)": 7,
    服务偏好: 2
  };

  for (const key in categoryMap) {
    if (category.includes(key)) {
      return categoryMap[key];
    }
  }

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 8;
};

const copyOneId = () => {
  if (props.profileData) {
    navigator.clipboard.writeText(props.profileData.customer.oneId);
    ElMessage.success(t("customer.profile360.copySuccess"));
  }
};

// 基础信息编辑模式（公司类型时编辑当前选中经办人信息，与 H5 一致）
const enterBasicInfoEditMode = () => {
  const display = currentDisplayCustomer.value ?? props.profileData?.customer;
  if (!display) return;

  const addr = display.address;
  const addressStr = Array.isArray(addr)
    ? (typeof addr[0] === "object" ? (addr[0] as { value?: string })?.value : addr[0]) || ""
    : (typeof addr === "string" ? addr : "") || "";

  const phones = phoneValues.value;
  const phoneList = phones.length > 0 ? phones.map(p => p.value) : [""];
  const primaryIdx = phones.findIndex(p => p.isPrimary);
  const primaryPhoneIndex = primaryIdx >= 0 ? primaryIdx : 0;
  const phoneRelationTags = phoneList.map((_, i) => {
    const name = phones[i]?.relationTagName;
    if (!name) return "";
    const found = RELATION_TAG_KEYS.find(k => t(`customer.relationTag.${k}`) === name);
    return found ?? "";
  });

  basicInfoForm.value = {
    name: display.name || "",
    gender: (display.gender as string) || "",
    ageGroup: display.ageGroup || "",
    city: (display as { city?: string }).city || "",
    familyStatus: (display.familyStatus as string) || "",
    address: addressStr,
    phoneList,
    phoneRelationTags,
    primaryPhoneIndex,
    lifecycleStatus: (props.profileData?.customer.lifecycleStatus as LifecycleStatus) ?? "active",
    originalLifecycleStatus: (props.profileData?.customer.lifecycleStatus as LifecycleStatus) ?? "active"
  };

  isBasicInfoEditMode.value = true;
};

/** 每行「主号/副号」单选变更：主号唯一，选副号时把主号落到其他行 */
function onPhonePrimarySecondaryChange(rowIndex: number, value: string) {
  if (value === "primary") {
    basicInfoForm.value.primaryPhoneIndex = rowIndex;
    return;
  }
  // 选「副号」：把主号设到其他任意一行（优先 0，否则第一个非当前行）
  const len = basicInfoForm.value.phoneList.length;
  if (len <= 1) return;
  const next = Array.from({ length: len }, (_, j) => j).find(j => j !== rowIndex);
  basicInfoForm.value.primaryPhoneIndex = next !== undefined ? next : 0;
}

function addBasicInfoPhone() {
  basicInfoForm.value.phoneList.push("");
  basicInfoForm.value.phoneRelationTags.push("");
}

function removeBasicInfoPhone(index: number) {
  const list = basicInfoForm.value.phoneList;
  if (list.length <= 1) return;
  list.splice(index, 1);
  basicInfoForm.value.phoneRelationTags.splice(index, 1);
  const primary = basicInfoForm.value.primaryPhoneIndex;
  if (primary >= list.length) basicInfoForm.value.primaryPhoneIndex = Math.max(0, list.length - 1);
  else if (primary > index) basicInfoForm.value.primaryPhoneIndex = primary - 1;
}

const exitBasicInfoEditMode = () => {
  isBasicInfoEditMode.value = false;
  basicInfoForm.value = {
    name: "",
    gender: "",
    ageGroup: "",
    city: "",
    familyStatus: "",
    address: "",
    phoneList: [],
    phoneRelationTags: [],
    primaryPhoneIndex: 0,
    lifecycleStatus: "active",
    originalLifecycleStatus: "active"
  };
};

// 公司信息编辑模式
const enterCompanyEditMode = () => {
  const company = props.profileData?.company;
  if (!company) return;

  const phone =
    typeof company.phone === "string"
      ? company.phone
      : Array.isArray(company.phone) && company.phone.length > 0
        ? typeof company.phone[0] === "string"
          ? (company.phone[0] as string)
          : (company.phone[0] as { value?: string })?.value || ""
        : "";

  const lifecycle =
    (company.lifecycleStatus as LifecycleStatus) || (props.profileData.customer.lifecycleStatus as LifecycleStatus) || "active";

  companyForm.value = {
    name: company.name || "",
    address: company.address || "",
    phone: phone || "",
    contactPerson: company.contactPerson || "",
    lifecycleStatus: lifecycle,
    originalLifecycleStatus: lifecycle
  };

  isCompanyEditMode.value = true;
};

const exitCompanyEditMode = () => {
  isCompanyEditMode.value = false;
  companyForm.value = {
    name: "",
    address: "",
    phone: "",
    contactPerson: "",
    lifecycleStatus: "active",
    originalLifecycleStatus: "active"
  };
};

// 提交基础信息修改（需要审核）
const handleSubmitBasicInfo = async () => {
  if (!props.profileData) return;

  try {
    const originalStatus = basicInfoForm.value.originalLifecycleStatus;
    const targetStatus = basicInfoForm.value.lifecycleStatus;
    const isSupportStatusChange =
      (originalStatus === "active" && targetStatus === "inactive") ||
      (originalStatus === "inactive" && targetStatus === "active");

    if (isSupportStatusChange) {
      await ElMessageBox.confirm(
        t("customer.maintenance.lifecycleChangeWarning"),
        t("customer.maintenance.lifecycleChangeTitle"),
        {
          type: "warning",
          confirmButtonText: t("customer.profile360.submit"),
          cancelButtonText: t("customer.profile360.cancel")
        }
      );
      // 这里仅模拟：实际应调用数据异常 / 审批中心接口，提交客户支持状态变更工单
      console.log("提交客户支持状态变更（数据异常申请）:", {
        oneId: props.profileData.customer.oneId,
        from: originalStatus,
        to: targetStatus
      });
      ElMessage.success(t("errorCorrection.messages.submitForApproval"));
    } else {
      await ElMessageBox.confirm(t("customer.maintenance.submitWarning"), t("customer.maintenance.submitTitle"), {
        type: "warning",
        confirmButtonText: t("customer.profile360.submit"),
        cancelButtonText: t("customer.profile360.cancel")
      });
      ElMessage.success(t("customer.maintenance.submitSuccess"));
    }

    const phonePayload = basicInfoForm.value.phoneList
      .map((value, i) => ({
        value,
        relationTagName: basicInfoForm.value.phoneRelationTags[i]
          ? t(`customer.relationTag.${basicInfoForm.value.phoneRelationTags[i]}`)
          : undefined,
        isPrimary: basicInfoForm.value.primaryPhoneIndex === i
      }))
      .filter(p => p.value);
    console.log("提交基础信息:", {
      name: basicInfoForm.value.name,
      gender: basicInfoForm.value.gender,
      ageGroup: basicInfoForm.value.ageGroup,
      familyStatus: basicInfoForm.value.familyStatus,
      address: basicInfoForm.value.address,
      phoneList: phonePayload,
      primaryPhoneIndex: basicInfoForm.value.primaryPhoneIndex,
      lifecycleStatus: basicInfoForm.value.lifecycleStatus
    });
    exitBasicInfoEditMode();
  } catch (error) {
    // 客户取消
  }
};

// 提交公司信息修改（需要审核）
const handleSubmitCompanyInfo = async () => {
  if (!props.profileData?.company) return;

  try {
    const originalStatus = companyForm.value.originalLifecycleStatus;
    const targetStatus = companyForm.value.lifecycleStatus;
    const isSupportStatusChange =
      (originalStatus === "active" && targetStatus === "inactive") ||
      (originalStatus === "inactive" && targetStatus === "active");

    if (isSupportStatusChange) {
      await ElMessageBox.confirm(
        t("customer.maintenance.lifecycleChangeWarning"),
        t("customer.maintenance.lifecycleChangeTitle"),
        {
          type: "warning",
          confirmButtonText: t("customer.profile360.submit"),
          cancelButtonText: t("customer.profile360.cancel")
        }
      );
      console.log("提交公司生命周期状态变更（数据异常申请）:", {
        companyOneId: props.profileData.company.oneId,
        from: originalStatus,
        to: targetStatus
      });
      ElMessage.success(t("errorCorrection.messages.submitForApproval"));
    } else {
      await ElMessageBox.confirm(t("customer.maintenance.submitWarning"), t("customer.maintenance.submitTitle"), {
        type: "warning",
        confirmButtonText: t("customer.profile360.submit"),
        cancelButtonText: t("customer.profile360.cancel")
      });
      ElMessage.success(t("customer.maintenance.submitSuccess"));
    }

    console.log("提交公司信息修改:", {
      companyOneId: props.profileData.company.oneId,
      name: companyForm.value.name,
      address: companyForm.value.address,
      phone: companyForm.value.phone,
      contactPerson: companyForm.value.contactPerson,
      lifecycleStatus: companyForm.value.lifecycleStatus
    });

    exitCompanyEditMode();
  } catch (error) {
    // 取消
  }
};

// 标签编辑模式
const enterTagsEditMode = () => {
  if (!props.profileData) return;

  // 初始化编辑模式下的标签选中状态（深拷贝）
  editModeSelectedTags.value = JSON.parse(JSON.stringify(selectedTags.value));

  isTagsEditMode.value = true;
};

const exitTagsEditMode = () => {
  isTagsEditMode.value = false;
  // 重置编辑模式下的标签选中状态
  editModeSelectedTags.value = {};
};

// 判断标签是否被选中（编辑模式下）
const isTagSelected = (category: string, tag: string): boolean => {
  if (!isTagsEditMode.value) return false;

  // 查找匹配的分类（处理【必选】标记的差异）
  for (const key in editModeSelectedTags.value) {
    // 去掉【必选】标记后比较分类名
    const normalizedKey = getCategoryDisplayName(key);
    const normalizedCategory = getCategoryDisplayName(category);
    if (normalizedKey === normalizedCategory) {
      const tags = editModeSelectedTags.value[key] || [];
      return tags.includes(tag);
    }
  }

  return false;
};

// 切换标签选中状态（编辑模式下）
const toggleTag = (category: string, tag: string) => {
  if (!isTagsEditMode.value) return;

  // 查找匹配的分类（处理【必选】标记的差异）
  let matchedKey: string | null = null;
  for (const key in editModeSelectedTags.value) {
    const normalizedKey = getCategoryDisplayName(key);
    const normalizedCategory = getCategoryDisplayName(category);
    if (normalizedKey === normalizedCategory) {
      matchedKey = key;
      break;
    }
  }

  // 如果没找到匹配的分类，使用原始分类名创建新分类
  if (!matchedKey) {
    matchedKey = category;
    editModeSelectedTags.value[matchedKey] = [];
  }

  const tagIndex = editModeSelectedTags.value[matchedKey].indexOf(tag);
  if (tagIndex > -1) {
    // 取消选中
    editModeSelectedTags.value[matchedKey].splice(tagIndex, 1);
  } else {
    // 选中
    editModeSelectedTags.value[matchedKey].push(tag);
  }
};

// 保存标签修改
const handleSaveTags = async () => {
  if (!props.profileData) return;

  try {
    // 保存标签修改（这里应该调用API）
    // 更新本地数据（实际应该从API响应中获取）
    if (props.profileData) {
      // 将编辑模式下的标签选中状态同步到实际数据
      // 这里应该调用API保存标签，然后从API响应更新数据
      // 暂时直接更新本地数据用于演示
      Object.assign(selectedTags.value, editModeSelectedTags.value);
    }

    ElMessage.success(t("customer.profile360.saveSuccess"));
    exitTagsEditMode();
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error(t("common.error"));
  }
};
</script>

<style scoped lang="scss">
.profile-360-drawer {
  :deep(.el-drawer__body) {
    padding: 20px;
    overflow-y: auto;
  }
}
.profile-360-container {
  padding: 0;
  &.customer-reference-panel {
    // 完全复刻 CustomerReferencePanel 的样式
    .reference-card {
      margin-bottom: 16px;
      :deep(.el-card__body) {
        padding: 20px;
      }
      .card-header {
        display: flex;
        gap: 8px;
        align-items: center;
        font-weight: 600;
      }
    }
    .stat-item {
      padding: 12px;
      text-align: center;
      background: var(--el-fill-color-lighter);
      border-radius: 6px;
      .stat-label {
        margin-bottom: 6px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
      .stat-value {
        font-size: 16px;
        font-weight: 700;
        color: var(--el-text-color-primary);
      }
      .money-font {
        font-family: Consolas, "Courier New", monospace;
        color: var(--el-color-success);
      }
    }
    .phone-tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      .phone-tag {
        padding: 4px 10px;
        font-size: 12px;
      }
    }

    // 卡片头部图标样式
    .header-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-right: 8px;
      border-radius: 6px;
      transition: all 0.3s ease;
      .el-icon {
        font-size: 18px;
      }
      &.company-icon {
        color: #409eff;
        background: rgb(64 158 255 / 10%);
      }
      &.customer-icon {
        color: #67c23a;
        background: rgb(103 194 58 / 10%);
      }
    }

    // 描述项值样式
    .description-value {
      display: flex;
      gap: 6px;
      align-items: center;
      .value-icon {
        flex-shrink: 0;
        font-size: 14px;
        color: #909399;
      }
      span {
        flex: 1;
      }
    }

    // 公司卡片样式
    .company-card {
      position: relative;
      margin-bottom: 12px;
      .company-status-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-left: 12px;
        .company-status-tag {
          font-size: 12px;
        }
        .company-status-select {
          min-width: 140px;
        }
      }

      // 层级连接指示器
      .hierarchy-indicator {
        position: relative;
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
        padding: 12px 0;
        margin-top: 16px;
        .indicator-line {
          position: absolute;
          top: 0;
          left: 50%;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, #e4e7ed, #409eff, #e4e7ed);
          opacity: 0.3;
          transform: translateX(-50%);
        }
        .indicator-icon {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          font-size: 16px;
          color: #409eff;
          background: #ffffff;
          border: 2px solid #409eff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgb(64 158 255 / 20%);
        }
        .indicator-text {
          position: relative;
          z-index: 1;
          padding: 0 8px;
          font-size: 12px;
          color: #909399;
          background: #ffffff;
        }
      }
    }

    // 客户属于公司时的样式
    .customer-under-company {
      position: relative;
      margin-top: 0;
      border-top: 2px dashed #e4e7ed;
      &::before {
        position: absolute;
        top: -2px;
        left: 0;
        width: 40px;
        height: 2px;
        content: "";
        background: #e4e7ed;
      }

      // 公司关系标签样式
      .company-relation-tag {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        padding: 4px 10px;
        margin-left: 12px;
        font-size: 12px;
        color: #409eff;
        background: rgb(64 158 255 / 8%);
        border-color: rgb(64 158 255 / 30%);
        border-radius: 4px;
        .tag-icon {
          font-size: 12px;
        }
      }
    }
    .address-tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      .address-tag {
        padding: 4px 10px;
        font-size: 12px;
      }
    }
    .preferences-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      .preference-tag {
        margin: 0;
      }
    }
    .opportunity-tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 0;
      .opportunity-tag {
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 400;
      }
    }
    .category-tags-container {
      .empty-tags {
        padding: 30px 0;
        text-align: center;
        .empty-text {
          font-size: 13px;
          color: #c0c4cc;
        }
      }
      .tags-flow {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        padding: 4px;
        margin: -10px; /* Offset the margin of children to keep alignment */
      }
      .category-tags-group {
        position: relative;
        display: flex;
        flex: 1 1 300px; /* Allow items to grow/shrink but maintain a base width */
        flex-direction: column;
        min-width: 250px;
        max-width: calc(33.333% - 20px); /* Max 3 per row on large screens */
        padding: 16px;
        margin: 10px; /* Explicit margin to create the "gap" */
        overflow: hidden;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 12px;
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 4%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        @media (width <= 1400px) {
          max-width: calc(50% - 20px); /* 2 per row */
        }

        @media (width <= 1000px) {
          max-width: 100%; /* 1 per row */
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px; /* Space between individual tags */
          margin-top: 4px;
        }
        .category-tag {
          display: inline-flex;
          gap: 10px;
          align-items: center;
          height: auto;
          padding: 6px 16px 6px 10px;
          margin-bottom: 4px; /* Fallback for older browsers or nested flex issues */
          font-size: 12px;
          font-weight: 500;
          line-height: normal;
          cursor: pointer;
          border: 1px solid transparent;
          border-radius: 8px;
          transition: all 0.2s ease;
          .tag-origin {
            display: inline-flex;
            gap: 4px;
            align-items: center;
            padding: 2px 8px;
            margin-right: 6px; /* Added right margin to separate from tag text */
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-radius: 4px;
            .el-icon {
              font-size: 11px;
            }
            &.auto {
              color: #a0814f; /* Muted Gold/Brown */
              background: #fdf6ec;
              border: 1px solid #e9d8c0;
            }
            &.manual {
              color: #7f8c8d; /* Muted Slate */
              background: #f8f9f9;
              border: 1px solid #d5dbdb;
            }
          }
          .tag-text {
            font-weight: 500;
            color: inherit;
            white-space: nowrap;
          }
          &.tag-selected {
            box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
            transform: scale(1.02);
          }
          &.tag-unselected {
            color: var(--el-text-color-placeholder) !important;
            background-color: var(--el-fill-color-lighter) !important;
            filter: grayscale(0.8);
            border-color: var(--el-border-color-lighter) !important;
            opacity: 0.4;
          }

          /* Muted, Low-Saturation Professional Palettes */
          &.category-tag-0 {
            color: #4a5c7a;
            background-color: #f0f4f8; /* Steel Blue Muted */
            border-color: #d1d9e6;
            &:hover {
              background-color: #e6edf4;
            }
          }
          &.category-tag-1 {
            color: #527a61;
            background-color: #f1f8f3; /* Sage Green Muted */
            border-color: #d2e4d9;
            &:hover {
              background-color: #e7f2eb;
            }
          }
          &.category-tag-2 {
            color: #6a5e8c;
            background-color: #f4f2f8; /* Muted Lavender */
            border-color: #dcd7e8;
            &:hover {
              background-color: #eceaf4;
            }
          }
          &.category-tag-3 {
            color: #8c5e5e;
            background-color: #f9f2f2; /* Muted Rose */
            border-color: #e8d2d2;
            &:hover {
              background-color: #f4e7e7;
            }
          }
          &.category-tag-4 {
            color: #7a7352;
            background-color: #f7f6f0; /* Sand/Beige */
            border-color: #e6e3d2;
            &:hover {
              background-color: #f2f1e8;
            }
          }
          &.category-tag-5 {
            color: #526f7a;
            background-color: #f1f7f8; /* Muted Cyan/Teal */
            border-color: #d2dee4;
            &:hover {
              background-color: #e7f1f4;
            }
          }
          &.category-tag-6 {
            color: #8c5e70;
            background-color: #f8f2f4; /* Muted Mauve */
            border-color: #e6d2d9;
            &:hover {
              background-color: #f4e7eb;
            }
          }
          &.category-tag-7 {
            color: #6f7a52;
            background-color: #f5f6f1; /* Muted Olive Gray */
            border-color: #e1e4d2;
            &:hover {
              background-color: #eff1e7;
            }
          }
        }
      }
    }
    .info-tabs {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .tab-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      .tab-header-left {
        display: flex;
        align-items: center;
      }
      .tab-header-right {
        .data-count {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
        .tab-edit-icon {
          padding: 4px;
          font-size: 18px;
          color: var(--el-text-color-secondary);
          cursor: pointer;
          border-radius: 4px;
          &:hover {
            color: var(--el-color-primary);
          }
          &.is-edit {
            color: var(--el-color-primary);
          }
        }
      }
    }
    .amount-text {
      font-weight: 600;
      color: var(--el-color-primary);
    }
    .asset-center-vertical {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .asset-section {
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
    .asset-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .asset-item-card {
      overflow: hidden;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
    }
    .asset-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    .asset-item-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    .asset-item-content {
      padding: 16px;
    }
    .asset-info-row-double {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
      margin-bottom: 12px;
    }
    .asset-info-row-single {
      margin-top: 12px;
      margin-bottom: 0;
    }
    .asset-info-cell,
    .asset-info-row-single {
      .label {
        margin-right: 4px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
      .value {
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
      .value.amount {
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
    .vehicle-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .vehicle-item-card {
      overflow: hidden;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
    }
    .vehicle-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    .vehicle-main {
      .vehicle-model {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      .vehicle-vin {
        margin-left: 8px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
    .vehicle-status-wrapper {
      display: flex;
      gap: 4px;
      align-items: center;
      cursor: pointer;
      .status-arrow-icon {
        transition: transform 0.2s;
      }
      .status-arrow-icon.is-expanded {
        transform: rotate(180deg);
      }
    }
    .vehicle-status-inline-picker {
      padding: 12px 16px;
      background: var(--el-fill-color-lighter);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    .vehicle-status-inline-picker-title {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
    .vehicle-status-inline-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .vehicle-status-inline-tag {
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      &.is-current {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }
    }
    .vehicle-status-inline-cancel {
      font-size: 12px;
      color: var(--el-color-primary);
      cursor: pointer;
    }
    .vehicle-item-content {
      padding: 16px;
    }
    .vehicle-detail-section {
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .vehicle-detail-section-title {
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-secondary);
    }
    .vehicle-detail-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .vehicle-info-row.detail-info {
      display: flex;
      align-items: center;
      font-size: 13px;
      .label {
        margin-right: 4px;
        color: var(--el-text-color-secondary);
      }
      .value {
        flex: 1;
        color: var(--el-text-color-primary);
      }
      .role-set-link {
        margin-left: 8px;
        font-size: 12px;
        color: var(--el-color-primary);
        cursor: pointer;
      }
      &.is-editable {
        cursor: pointer;
      }
    }
    .vehicle-role-inline-picker {
      padding: 12px;
      margin-top: 12px;
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
    }
    .vehicle-role-inline-picker-title {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
    .vehicle-role-inline-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .vehicle-role-tag {
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }
    }
    .vehicle-role-inline-cancel {
      font-size: 12px;
      color: var(--el-color-primary);
      cursor: pointer;
    }
    .interaction-item {
      .interaction-header {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;
        .operator {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
        .duration {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
      .interaction-content {
        margin-bottom: 8px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
      }
      .interaction-result {
        margin-top: 8px;
      }
    }
    .interaction-card {
      :deep(.el-card__body) {
        padding: 12px 16px;
      }
    }
  }
  .metrics-card {
    .metric-item {
      display: flex;
      align-items: center;
      padding: 20px;
      background: var(--el-bg-color-page);
      border-radius: 8px;
      transition: all 0.3s;
      &:hover {
        background: var(--el-color-primary-light-9);
        box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
        transform: translateY(-2px);
      }
      .metric-icon {
        margin-right: 16px;
        color: var(--el-color-primary);
      }
      .metric-content {
        flex: 1;
        .metric-value {
          margin-bottom: 4px;
          font-size: 24px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
        .metric-label {
          margin-bottom: 4px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
        .metric-sub-label {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
        .metric-trend {
          display: flex;
          gap: 4px;
          align-items: center;
          margin-top: 4px;
          font-size: 12px;
        }
      }
    }
  }
  .warning-text {
    font-weight: 500;
    color: var(--el-color-warning);
  }
  .phone-list-edit {
    .phone-item-edit {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      .phone-input {
        width: 200px;
      }
      .relation-tag-select {
        width: 120px;
      }
    }
  }
  .profile-alert-bar {
    margin-bottom: 12px;
  }
  .operation-alert .operation-time {
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .sync-monitor-card {
    .sync-monitor-header {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 600;
      .sync-time {
        margin-left: auto;
        font-size: 12px;
        font-weight: 400;
        color: var(--el-text-color-secondary);
      }
    }
    .sync-source-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      .sync-source-item {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 6px 12px;
        background: var(--el-fill-color-lighter);
        border-radius: 6px;
        .source-name {
          font-size: 13px;
        }
      }
    }
  }
  .handler-selector-block {
    margin-bottom: 16px;
  }

  /* 与 H5 一致：人名+角色 Tab pill 样式，直接展示、切换即动态更新下方联系人档案 */
  .handler-pill-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .handler-pill {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 6px 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    cursor: pointer;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .handler-pill .handler-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .handler-pill .handler-role-tag {
    padding: 2px 8px;
    font-size: 11px;
    line-height: 1;
    color: var(--el-color-primary);
    background: rgb(64 158 255 / 10%);
    border: 1px solid rgb(64 158 255 / 30%);
    border-radius: 999px;
  }
  .handler-pill:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
  .handler-pill.active {
    font-weight: 500;
    color: #ffffff;
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
  .handler-pill.active .handler-role-tag {
    color: #ffffff;
    background: rgb(255 255 255 / 20%);
    border-color: rgb(255 255 255 / 40%);
  }
  .phone-tag-wrap {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    margin-right: 12px;
    margin-bottom: 6px;
    .relation-tag {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      &.primary {
        font-weight: 500;
        color: var(--el-color-primary);
      }
      &.secondary {
        color: var(--el-text-color-secondary);
      }
    }
  }
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .card-header-left {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .card-header-right {
    display: flex;
    gap: 8px;
  }
}
</style>

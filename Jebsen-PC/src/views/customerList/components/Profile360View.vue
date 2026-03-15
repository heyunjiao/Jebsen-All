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
      <!-- 客户基本信息（联系人档案） -->
      <el-card shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <div class="header-icon-wrapper customer-icon">
                <el-icon><User /></el-icon>
              </div>
              <span>{{ contactArchiveTitle }}</span>
              <el-tag
                v-if="profileData.customer && profileData.customer.companyName"
                type="info"
                size="small"
                class="company-relation-tag"
              >
                <el-icon class="tag-icon"><Connection /></el-icon>
                <span>{{ $t("customer.company.belongsTo") }}: {{ profileData.customer.companyName }}</span>
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
          <el-descriptions-item label="OneID">
            {{ (currentDisplayCustomer || profileData.customer).oneId }}
            <el-button link type="primary" size="small" :icon="CopyDocument" @click="copyOneId" style="margin-left: 8px" />
          </el-descriptions-item>
          <el-descriptions-item v-if="(currentDisplayCustomer || profileData.customer).bpid" label="BPID">
            {{ (currentDisplayCustomer || profileData.customer).bpid }}
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
                  <span v-if="phoneItem.isPreferred" class="relation-tag preferred">{{
                    $t("customer.profile360.preferredNumber")
                  }}</span>
                  <span v-if="phoneItem.relationTagName" class="relation-tag">{{ phoneItem.relationTagName }}</span>
                  <span v-if="phoneItem.isPrimaryContact" class="relation-tag highlight">{{ $t("customer.profile360.primaryContact") }}</span>
                  <span v-if="phoneItem.isPreferredRepairer" class="relation-tag highlight">{{ $t("customer.profile360.preferredRepairer") }}</span>
                  <span v-if="phoneItem.readonly" class="relation-tag readonly">售后同步</span>
                </span>
              </div>
            </template>
            <div v-else class="phone-list-edit h5-style-contact">
              <div class="phone-edit-section-title">{{ $t("customer.profile360.viewAllPhones") || "查看全部联系电话" }}</div>
              <div v-for="group in groupedPhoneItems" :key="group.key" class="phone-group">
                <div class="phone-group-header">
                  <span class="group-contact-name">{{ group.contactName }}</span>
                  <!-- 公司类型：设为优选联系人仅展示在名字后面 -->
                  <template v-if="isCompanyCustomer">
                    <span v-if="group.items.some(i => i.isPrimaryContact)" class="relation-tag highlight">{{ $t("customer.profile360.primaryContact") }}</span>
                    <span
                      v-else
                      class="set-preferred-link"
                      @click="setPrimaryContactIndex(group.items[0].index)"
                    >{{ $t("customer.profile360.setAsPrimaryContact") }}</span>
                  </template>
                  <el-tag v-if="group.relationTagLabel" type="info" size="small" plain class="group-relation-tag">
                    {{ group.relationTagLabel }}
                  </el-tag>
                  <el-button type="primary" link size="small" :icon="Plus" class="add-number-btn" @click="addNumberInGroup(group)">
                    {{ $t("customer.profile360.addPhone") }}
                  </el-button>
                </div>
                <div v-for="item in group.items" :key="item.index" class="phone-row" :class="{ 'is-preferred': basicInfoForm.preferredPhoneIndex === item.index }">
                  <template v-if="editingPhoneIndex === item.index">
                    <!-- 在本组下点击「添加号码」新增的行：仅输入号码即可，联系人/关系已继承该组 -->
                    <div v-if="isNumberRowInGroup(item, group)" class="phone-row-edit phone-row-edit-single">
                      <el-input
                        v-model="basicInfoForm.phoneItems[item.index].value"
                        :placeholder="$t('customer.placeholder.phone')"
                        size="small"
                        clearable
                        class="phone-input"
                        :disabled="item.readonly"
                      />
                      <el-button type="primary" link size="small" @click="editingPhoneIndex = null">{{ $t("customer.profile360.doneEdit") || "完成" }}</el-button>
                    </div>
                    <div v-else class="phone-row-edit">
                      <el-input
                        v-model="basicInfoForm.phoneItems[item.index].value"
                        :placeholder="$t('customer.placeholder.phone')"
                        size="small"
                        clearable
                        class="phone-input"
                        :disabled="item.readonly"
                      />
                      <el-input
                        v-model="basicInfoForm.phoneItems[item.index].contactName"
                        :placeholder="$t('customer.profile360.contactName') || '联系人姓名'"
                        size="small"
                        clearable
                        class="contact-name-input"
                        :disabled="item.readonly"
                      />
                      <el-select
                        v-model="basicInfoForm.phoneItems[item.index].relationTagKey"
                        :placeholder="$t('customer.relationTag.label')"
                        size="small"
                        clearable
                        class="relation-tag-select"
                        :disabled="item.readonly"
                      >
                        <el-option v-for="opt in relationTagOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                      </el-select>
                      <el-button type="primary" link size="small" @click="editingPhoneIndex = null">{{ $t("customer.profile360.doneEdit") || "完成" }}</el-button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="phone-row-display">
                      <span class="phone-number">{{ item.value || ($t('customer.placeholder.phone') || '请输入手机号') }}</span>
                      <span v-if="basicInfoForm.preferredPhoneIndex === item.index" class="preferred-badge">{{ $t("customer.profile360.preferredNumber") }}</span>
                      <span
                        v-if="basicInfoForm.preferredPhoneIndex !== item.index && !item.readonly"
                        class="set-preferred-link"
                        @click="setPreferredPhoneIndex(item.index)"
                      >{{ $t("customer.profile360.setAsPreferred") }}</span>
                      <!-- 公司类型：优选送修人（订单同步的号码可设为首选送修人）；优选联系人已移至分组标题名字后 -->
                      <template v-if="isCompanyCustomer">
                        <template v-if="item.readonly">
                          <span v-if="item.isPreferredRepairer" class="relation-tag highlight">{{ $t("customer.profile360.preferredRepairer") }}</span>
                          <span
                            v-else
                            class="set-preferred-link"
                            @click="setPreferredRepairerIndex(item.index)"
                          >{{ $t("customer.profile360.setAsPreferredRepairer") }}</span>
                        </template>
                      </template>
                      <template v-if="!item.readonly">
                        <el-button type="primary" link size="small" @click="editingPhoneIndex = item.index">{{ $t("customer.profile360.edit") || "编辑" }}</el-button>
                        <el-button
                          type="danger"
                          link
                          size="small"
                          :icon="Delete"
                          :disabled="basicInfoForm.phoneItems.length <= 1"
                          @click="removeBasicInfoPhone(item.index)"
                        />
                      </template>
                      <div v-if="item.readonly" class="readonly-tip">{{ $t("customer.profile360.phoneFromOrderSync") }}</div>
                    </div>
                  </template>
                </div>
              </div>
              <el-button type="primary" link size="small" :icon="Plus" class="add-contact-btn" @click="addNewContact">
                {{ $t("customer.profile360.addContact") || "新增联系人" }}
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
            <el-select
              v-else
              v-model="basicInfoForm.ageGroup"
              :placeholder="$t('customer.placeholder.ageGroup')"
              size="small"
              clearable
              style="width: 100%"
            >
              <el-option v-for="opt in ageGroupOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.listFields.birthDate')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).birthDate || "—" }}
            </template>
            <el-input v-else v-model="basicInfoForm.birthDate" :placeholder="$t('customer.placeholder.birthDate')" size="small" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.city')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).city || "—" }}
            </template>
            <el-input v-else v-model="basicInfoForm.city" :placeholder="$t('customer.placeholder.city')" size="small" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.listFields.residenceArea')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).residenceArea || "—" }}
            </template>
            <el-input v-else v-model="basicInfoForm.residenceArea" :placeholder="$t('customer.placeholder.residenceArea')" size="small" />
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
          <el-descriptions-item :label="$t('customer.listFields.identityType')">
            <template v-if="!isBasicInfoEditMode">
              {{ (currentDisplayCustomer || profileData.customer).identityType || "—" }}
            </template>
            <el-select
              v-else
              v-model="basicInfoForm.identityType"
              :placeholder="$t('customer.placeholder.identityType')"
              size="small"
              style="width: 100%"
              clearable
            >
              <el-option :label="$t('customer.identityType.prospective')" value="准车主" />
              <el-option :label="$t('customer.identityType.owner')" value="车主" />
              <el-option :label="$t('customer.identityType.formerOwner')" value="曾用车主" />
            </el-select>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.address')" :span="2">
            <template v-if="!isBasicInfoEditMode">
              <div class="address-tags-container">
                <el-tag v-for="(addressItem, index) in addressValues" :key="index" type="info" size="small" class="address-tag">
                  {{ formatAddressDisplay(addressItem) }}
                </el-tag>
                <span v-if="addressValues.length === 0">-</span>
              </div>
            </template>
            <div v-else class="address-list-edit">
              <div class="address-edit-hint">{{ $t("customer.profile360.addressSlotsHint") }}</div>
              <div v-for="(address, index) in basicInfoForm.addresses" :key="address.slotKey" class="address-item-edit">
                <div class="address-meta">
                  <span class="slot-label">{{ address.slotLabel }}</span>
                  <span class="slot-weight">{{ address.weightLabel }}</span>
                </div>
                <el-input
                  v-model="basicInfoForm.addresses[index].value"
                  :placeholder="$t('customer.placeholder.address')"
                  size="small"
                />
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 客户价值 -->
      <el-card v-if="profileData.valueInfo" shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <el-icon><Medal /></el-icon>
              <span>{{ $t("customer.profile360.customerValue") }}</span>
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item :label="$t('customer.profile360.compositeScore')">
            {{ profileData.valueInfo?.compositeScore ?? "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.postSalesSelfPaidAmount')">
            {{ profileData.valueInfo?.postSalesSelfPaidAmount != null ? formatCurrency(profileData.valueInfo!.postSalesSelfPaidAmount!) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.addonPurchaseAmount')">
            {{ profileData.valueInfo?.addonPurchaseAmount != null ? formatCurrency(profileData.valueInfo!.addonPurchaseAmount!) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.isSalesDiamond')">
            <el-tag v-if="profileData.valueInfo?.isSalesDiamond" type="warning" size="small">
              {{ $t("common.yes") }}
            </el-tag>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.isAftersalesDiamond')">
            <el-tag v-if="profileData.valueInfo?.isAftersalesDiamond" type="primary" size="small">
              {{ $t("common.yes") }}
            </el-tag>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.activitySegment')">
            <span v-if="profileData.valueInfo?.isLost">{{ $t("customer.profile360.segmentLost") }}</span>
            <span v-else-if="profileData.valueInfo?.isDormant">{{ $t("customer.profile360.segmentDormant") }}</span>
            <span v-else-if="profileData.valueInfo?.isActiveAfterSales">{{ $t("customer.profile360.segmentActive") }}</span>
            <span v-else>—</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 销售 / 售后行为（需求侧字段：销售行为 + 售后行为 + 保险/营销/粘性） -->
      <el-card v-if="profileData.behaviorInfo" shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ $t("customer.profile360.behavior") }}</span>
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border size="small">
          <!-- 销售行为 -->
          <el-descriptions-item :label="$t('customer.profile360.purchaseAmount')">
            {{ profileData.behaviorInfo?.purchaseAmount != null ? formatCurrency(profileData.behaviorInfo!.purchaseAmount!) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.optionAmount')">
            {{ profileData.behaviorInfo?.optionAmount != null ? formatCurrency(profileData.behaviorInfo!.optionAmount!) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.addonProductAmount')">
            {{ profileData.behaviorInfo?.addonProductAmount != null ? formatCurrency(profileData.behaviorInfo!.addonProductAmount!) : "—" }}
          </el-descriptions-item>
          <!-- 售后行为（与标签重复的项如增购换购、推荐行为、达标定保、12月首保/回厂、投诉、粘性产品、活动参与等仅在下方标签卡片展示，此处不重复） -->
          <el-descriptions-item :label="$t('customer.profile360.serviceFrequencyLastYear')">
            {{ profileData.behaviorInfo?.serviceFrequencyLastYear ?? "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.lastMaintenanceStore')">
            {{ profileData.behaviorInfo?.lastMaintenanceStore || "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.lastReturnStore')">
            {{ profileData.behaviorInfo?.lastReturnStore || "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.lastMaintenanceDate')">
            {{ profileData.behaviorInfo?.lastMaintenanceDate || "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.lastServiceDate')">
            {{ profileData.behaviorInfo?.lastServiceDate || "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.repairAmountLastYear')">
            {{ profileData.behaviorInfo?.repairAmountLastYear != null ? formatCurrency(profileData.behaviorInfo!.repairAmountLastYear!) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.accidentRepairCountLastYear')">
            {{ profileData.behaviorInfo?.accidentRepairCountLastYear ?? "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.firstMaintenanceDone')">
            {{ profileData.behaviorInfo?.firstMaintenanceDone != null ? (profileData.behaviorInfo.firstMaintenanceDone ? $t('common.yes') : $t('common.no')) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.inWarrantyPeriod')">
            {{ profileData.behaviorInfo?.inWarrantyPeriod != null ? (profileData.behaviorInfo.inWarrantyPeriod ? $t('common.yes') : $t('common.no')) : "—" }}
          </el-descriptions-item>
          <!-- 保险/续保 -->
          <el-descriptions-item :label="$t('customer.profile360.newInsuranceAtSale')">
            {{ profileData.behaviorInfo?.newInsuranceAtSale != null ? (profileData.behaviorInfo.newInsuranceAtSale ? $t('common.yes') : $t('common.no')) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.renewedAfterExpiry')">
            {{ profileData.behaviorInfo?.renewedAfterExpiry != null ? (profileData.behaviorInfo.renewedAfterExpiry ? $t('common.yes') : $t('common.no')) : "—" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('customer.profile360.renewCountInStoreRepairOutStoreInsurance')">
            {{ profileData.behaviorInfo?.renewCountInStoreRepairOutStoreInsurance != null ? profileData.behaviorInfo.renewCountInStoreRepairOutStoreInsurance : "—" }}
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
                      {{ getCategoryDisplayLabel(category) }}
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
                      <span class="tag-text">{{ getCategoryFullPath(TAG_CATEGORY_OPTIONS, tag) || tag }}</span>
                    </el-tag>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <!-- 查看模式：已选中的画像标签 + 风控状态（同一卡片内，标签样式一致） -->
            <div class="tags-flow">
              <template v-for="(tags, category) in selectedTags" :key="category">
                <template v-if="tags && Array.isArray(tags) && tags.length > 0">
                  <div class="category-tags-group">
                    <div class="category-header">
                      <span class="category-name">
                        {{ getCategoryDisplayLabel(category) }}
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
                        <span class="tag-text">{{ getCategoryFullPath(TAG_CATEGORY_OPTIONS, tag) || tag }}</span>
                      </el-tag>
                    </div>
                  </div>
                </template>
              </template>
              <!-- 风控状态：作为标签分组展示在同一卡片内 -->
              <div v-if="riskStatusTags.length > 0" class="category-tags-group">
                <div class="category-header">
                  <span class="category-name">{{ $t("customer.profile360.riskStatus") }}</span>
                </div>
                <div class="tags-list">
                  <el-tag
                    v-for="item in riskStatusTags"
                    :key="item.key"
                    size="small"
                    :type="item.type"
                    :class="['category-tag', 'risk-status-tag']"
                  >
                    <span class="tag-text">{{ item.label }}</span>
                  </el-tag>
                </div>
              </div>
            </div>
            <div v-if="!hasSelectedTags && riskStatusTags.length === 0" class="empty-tags">
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
            <el-table-column prop="insuredPerson" :label="$t('customer.profile360.insuredPerson')" width="100" show-overflow-tooltip />
            <el-table-column prop="company" :label="$t('customer.profile360.insuranceCompany')" width="140" />
            <el-table-column prop="policyNo" :label="$t('customer.profile360.policyNo')" width="160" />
            <el-table-column prop="compulsoryInsuranceStartDate" :label="$t('customer.profile360.compulsoryInsuranceStartDate')" width="130" />
            <el-table-column prop="commercialInsuranceExpiryDate" :label="$t('customer.profile360.commercialInsuranceExpiryDate')" width="140" />
            <el-table-column prop="insuranceExpiryDate" :label="$t('customer.profile360.insuranceExpiryDate')" width="120" />
            <el-table-column prop="startDate" :label="$t('customer.profile360.startDate')" width="110" />
            <el-table-column prop="endDate" :label="$t('customer.profile360.endDate')" width="110" />
            <el-table-column prop="purchaseDate" :label="$t('customer.profile360.purchaseDate')" width="110" />
            <el-table-column prop="insurancePurchaseType" :label="$t('customer.profile360.insurancePurchaseType')" width="120" />
            <el-table-column prop="renewalSpecialistName" :label="$t('customer.profile360.renewalSpecialist')" width="100" />
            <el-table-column prop="amount" :label="$t('customer.profile360.insuranceAmount')" width="110" align="right">
              <template #default="scope">{{ formatCurrency(scope.row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="vehicleDamageAmount" :label="$t('customer.profile360.vehicleDamageAmount')" width="110" align="right">
              <template #default="scope">{{ scope.row.vehicleDamageAmount != null ? formatCurrency(scope.row.vehicleDamageAmount) : '—' }}</template>
            </el-table-column>
            <el-table-column prop="driverSeatAmount" :label="$t('customer.profile360.driverSeatAmount')" width="120" align="right">
              <template #default="scope">{{ scope.row.driverSeatAmount != null ? scope.row.driverSeatAmount + '万' : '—' }}</template>
            </el-table-column>
            <el-table-column prop="passengerSeatAmount" :label="$t('customer.profile360.passengerSeatAmount')" width="130" align="right">
              <template #default="scope">{{ scope.row.passengerSeatAmount != null ? scope.row.passengerSeatAmount + '万' : '—' }}</template>
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

        <el-tab-pane :label="$t('customer.profile360.communicationRecords')" name="interactions">
          <el-alert type="info" :closable="false" show-icon class="sync-notice-alert" style="margin-bottom: 16px">
            <template #title> 数据同步提示：沟通记录由各业务系统 T+1 同步，暂不支持在本平台直接记录。 </template>
          </el-alert>
          <el-timeline v-if="profileData.interactions && profileData.interactions.length > 0">
            <el-timeline-item
              v-for="item in profileData.interactions"
              :key="item.id"
              :timestamp="item.time || item.communicationTime || formatDateTime(String(item.date || ''))"
              placement="top"
              :type="getInteractionTimelineType(item.channel || item.type)"
            >
              <el-card shadow="hover" class="interaction-card">
                <div class="interaction-item">
                  <div class="interaction-header">
                    <el-tag :type="getInteractionType(item.channel || item.type)" size="small">
                      {{ getInteractionTypeLabel(item.channel || item.type) || item.channel || item.type }}
                    </el-tag>
                  </div>
                  <div class="interaction-content">{{ item.content || "—" }}</div>
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
                  @update:model-value="val => handleVehicleStatusChange(scope.row.id, String(val))"
                >
                  <el-option v-for="opt in vehicleStatusOptions" :key="opt.value" :label="opt.name" :value="opt.value" />
                </el-select>
                <el-tag v-else size="small" :type="getVehicleStatusTagType(scope.row.status)">
                  {{ scope.row.status || $t("customer.profile360.vehicleStatusNone") }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('customer.profile360.vehicleBuyer')" min-width="180">
              <template #default="scope">
                <div class="vehicle-repairer-cell">
                  <template v-if="getVehicleBuyers(scope.row).length > 0">
                    <div v-for="buyer in getVehicleBuyers(scope.row)" :key="buyer.id" class="vehicle-repairer-chip">
                      <span>{{ buyer.name }}</span>
                      <span v-if="buyer.phone" class="vehicle-repairer-phone">{{ buyer.phone }}</span>
                    </div>
                  </template>
                  <span v-else>暂无购车人</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('customer.profile360.vehicleRepairers')" min-width="220">
              <template #default="scope">
                <div class="vehicle-repairer-cell">
                  <template v-if="getVehicleRepairers(scope.row).length > 0">
                    <div v-for="repairer in getVehicleRepairers(scope.row)" :key="repairer.id" class="vehicle-repairer-chip">
                      <span>{{ repairer.name }}</span>
                      <span v-if="repairer.phone" class="vehicle-repairer-phone">{{ repairer.phone }}</span>
                      <span v-if="repairer.isPreferred" class="vehicle-repairer-badge">首选送修人</span>
                    </div>
                  </template>
                  <span v-else>暂无送修人</span>
                </div>
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

      <!-- 消费统计（UI 参照「客户价值」，使用表格型展示） -->
      <el-card shadow="never" class="reference-card">
        <template #header>
          <div class="card-header">
            <div class="card-header-left">
              <el-icon><DataAnalysis /></el-icon>
              <span>{{ $t("errorCorrection.customerReference.consumptionStats") }}</span>
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item :label="$t('errorCorrection.customerReference.totalSpend')">
            <span class="money-font">¥{{ formatMoney(consumptionStats.totalSpend) }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.avgSpend')">
            <span class="money-font">¥{{ formatMoney(consumptionStats.avgSpend) }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.orderCount')">
            {{ consumptionStats.orderCount }}{{ $t("errorCorrection.customerReference.times") }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.visit90d')">
            {{ consumptionStats.visit90d }}{{ $t("errorCorrection.customerReference.times") }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('errorCorrection.customerReference.lastVisit')">
            {{ consumptionStats.lastVisit || $t("errorCorrection.customerReference.none") }}
          </el-descriptions-item>
        </el-descriptions>
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
  Plus,
  Delete,
  OfficeBuilding,
  Connection,
  Location,
  Phone,
  UserFilled,
  MagicStick
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { Customer360View, LifecycleStatus, VehicleRelatedPerson } from "../interface";
import LineageView from "./LineageView.vue";
import { TAG_CATEGORY_OPTIONS, getCategoryFullPath } from "@/constants/tagCategory";
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
// 车辆信息 Tab：与 H5 一致的修改功能
const editingVehicleStatusId = ref<string | null>(null);
const editingVehicleRole = ref<{ vehicle: Customer360View["vehicles"][number]; role: string } | null>(null);

// 是否为公司客户：仅依赖客户类型，不再维护公司档案和经办人列表
const isCompanyCustomer = computed(() => {
  const data = props.profileData;
  if (!data) return false;
  return (data.customer as { customerType?: string }).customerType === "company";
});

// 当前展示的“客户”信息：公司类型也统一展示 OneID 客户本身（不再按经办人切换）
const currentDisplayCustomer = computed(() => {
  const data = props.profileData;
  if (!data) return null;
  const customer = data.customer;
  return { ...customer, role: (customer as { role?: string }).role };
});

// 联系人档案卡片标题：与 H5 一致，统一为「联系人档案」，当前经办人由上方 Tab（人名+角色）表达，避免与联系人信息重叠
const contactArchiveTitle = computed(() => {
  return t("customer.profile360.contactArchive");
});

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
function handleVehicleStatusChange(vehicleId: string, status: string) {
  editingVehicleStatusId.value = null;
  emit("vehicleStatusChange", vehicleId, status);
}

/** 车辆下所有购车人（公司可有多名） */
const getVehicleBuyers = (vehicle: Customer360View["vehicles"][number]) =>
  vehicle.relatedPersons?.filter((person): person is VehicleRelatedPerson & { id: string } => person.role === "购车人") ?? [];

const getVehicleRepairers = (vehicle: Customer360View["vehicles"][number]) =>
  vehicle.relatedPersons?.filter(person => person.role === "送修人") || [];

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
    prop: "activityDate",
    label: t("customer.profile360.date"),
    minWidth: 160,
    align: "left",
    render: scope => {
      return scope.row.activityDate || formatDateTime(scope.row.activityTime);
    }
  }
]);

/** 个人客户：与车主关系标签（value 存中文，与列表/后端一致） */
const PERSONAL_RELATION_TAGS = [
  { value: "本人", labelKey: "self" },
  { value: "配偶", labelKey: "spouse" },
  { value: "子女", labelKey: "child" },
  { value: "父母", labelKey: "parent" },
  { value: "朋友", labelKey: "friend" },
  { value: "其他", labelKey: "other" }
];
/** 公司客户：与车主关系标签 */
const COMPANY_RELATION_TAGS = [
  { value: "法人", labelKey: "legalPerson" },
  { value: "股东/高管", labelKey: "shareholder" },
  { value: "法人亲属", labelKey: "legalPersonRelative" },
  { value: "员工", labelKey: "employee" },
  { value: "其他", labelKey: "otherCompany" }
];

/** 年龄段选项（与列表/批量操作一致） */
const ageGroupOptions = ["18-25", "26-35", "36-45", "46-55", "56-65"];

const relationTagOptions = computed(() => {
  const list = isCompanyCustomer.value ? COMPANY_RELATION_TAGS : PERSONAL_RELATION_TAGS;
  return list.map(o => ({ value: o.value, label: t(`customer.relationTag.${o.labelKey}`) }));
});

// 基础信息编辑表单
const basicInfoForm = ref<{
  name: string;
  gender: string;
  ageGroup: string;
  birthDate: string;
  city: string;
  residenceArea: string;
  familyStatus: string;
  identityType: string;
  addresses: Array<{ slotKey: string; slotLabel: string; value: string; weightLabel: string }>;
  /** 联系电话列表（与 H5 一致：按人分组展示，每项含联系人姓名+关系+号码） */
  phoneItems: Array<{
    value: string;
    contactName: string;
    relationTagKey: string;
    readonly: boolean;
    /** 公司类型：是否优选联系人（仅一个） */
    isPrimaryContact?: boolean;
    /** 公司类型：是否优选送修人（仅一个，通常为订单同步过来的号码） */
    isPreferredRepairer?: boolean;
  }>;
  /** 优选号码在 phoneItems 中的下标 */
  preferredPhoneIndex: number;
  lifecycleStatus: LifecycleStatus;
  originalLifecycleStatus: LifecycleStatus;
}>({
  name: "",
  gender: "",
  ageGroup: "",
  birthDate: "",
  city: "",
  residenceArea: "",
  familyStatus: "",
  identityType: "",
  addresses: [],
  phoneItems: [],
  preferredPhoneIndex: 0,
  lifecycleStatus: "active",
  originalLifecycleStatus: "active"
});

/** 当前正在编辑的号码项下标（与 H5 一致：点击编辑展开表单，null 为未编辑） */
const editingPhoneIndex = ref<number | null>(null);

/** 是否为「在某类型下点击添加号码」新增的行：同一组内非首条，仅需输入号码即可 */
function isNumberRowInGroup(
  item: { index: number },
  group: { items: Array<{ index: number }> }
): boolean {
  const idx = group.items.findIndex(i => i.index === item.index);
  return idx > 0;
}

/** 按人分组联系电话（与 H5「查看全部联系电话」一致：contactName 或关系标签为组键） */
const groupedPhoneItems = computed(() => {
  const items = basicInfoForm.value.phoneItems.map((item, index) => ({ ...item, index }));
  const getKey = (item: (typeof items)[0]) =>
    (item.contactName || "").trim() || item.relationTagKey || `i-${item.index}`;
  const map = new Map<string, (typeof items)[0][]>();
  for (const item of items) {
    const k = getKey(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return Array.from(map.entries()).map(([key, groupItems]) => {
    const first = groupItems[0];
    const relationTagLabel =
      relationTagOptions.value.find(o => o.value === first.relationTagKey)?.label || "";
    return {
      key,
      contactName: (first.contactName || "").trim() || relationTagLabel || "未知联系人",
      relationTagKey: first.relationTagKey,
      relationTagLabel,
      items: groupItems
    };
  });
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

// 所有可用的标签分类（仅保留系统默认标签：会员分层、售后行为、活跃度相关、粘性产品、投诉相关）
// 说明：这里的 tag 值统一使用「叶子编码」，与 TAG_CATEGORY_OPTIONS 中的 value 对齐。
const allCategoryTags: Record<string, string[]> = {
  会员分层: [
    "会员分层-销售钻石客户",
    "会员分层-售后钻石客户",
    "会员分层-普通活跃售后客户",
    "会员分层-休眠客户",
    "会员分层-流失客户"
  ],
  售后行为: [
    "售后行为-12个月内完成首保",
    "售后行为-12个月内完成首次回厂",
    "售后行为-12个月内回厂",
    "售后行为-13-24个月回厂"
  ],
  活跃度相关: [
    "活跃度-购买附加产品",
    "活跃度-推荐其他客户",
    "活跃度-有增购换购",
    "活跃度-参加社群市场活动"
  ],
  粘性产品: ["粘性产品-粘性产品"],
  投诉相关: ["投诉相关-6个月内有投诉"],
  定保相关: ["定保相关-达标定保"]
};

// 转换数据格式：根据当前客户手机号（支持多值）生成展示列表
const phoneValues = computed(() => {
  if (!props.profileData) return [];
  const phone = props.profileData.customer.phone;
  if (typeof phone === "string") {
    return [{ value: phone, source: "DMS", isPreferred: true, updateTime: "" }];
  }
  if (Array.isArray(phone)) {
    return phone.map((item, index) => {
      const obj = typeof item === "object" ? item : null;
      const isPreferred = obj ? !!(obj.isPreferred ?? obj.isPrimary) : index === 0;
      return {
        value: typeof item === "string" ? item : item.value,
        source: obj?.source || "DMS",
        isPreferred,
        updateTime: obj?.updateTime || "",
        relationTagName: obj?.relationTagName,
        contactName: obj?.contactName ?? "",
        isPreferredRepairer: obj?.isPreferredRepairer ?? false,
        isPrimaryContact: obj?.isPrimaryContact ?? false,
        readonly: obj?.readonly ?? false
      };
    });
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
          updateTime: typeof item === "object" ? item.updateTime || "" : "",
          slotKey: typeof item === "object" ? item.slotKey : `address${index + 1}`,
          weightLabel: typeof item === "object" ? item.weightLabel : undefined
        }));
      }
    } catch (e) {
      // 如果不是JSON，直接作为字符串返回
      return [{ value: address, source: "DMS", isPrimary: true, updateTime: "", slotKey: "address1", weightLabel: "高权重" }];
    }
  }
  if (Array.isArray(address)) {
    return address.map((item, index) => ({
      value: typeof item === "string" ? item : item.value || "",
      source: typeof item === "object" ? item.source || "DMS" : "DMS",
      isPrimary: typeof item === "object" ? item.isPrimary || index === 0 : index === 0,
      updateTime: typeof item === "object" ? item.updateTime || "" : "",
      slotKey: typeof item === "object" ? item.slotKey : `address${index + 1}`,
      weightLabel: typeof item === "object" ? item.weightLabel : undefined
    }));
  }
  return [];
});

const formatAddressDisplay = (addressItem: { slotKey?: string; weightLabel?: string; value: string }) => {
  const slotLabel = addressItem.slotKey ? addressItem.slotKey.replace("address", "地址") : "地址";
  return [slotLabel, addressItem.weightLabel, addressItem.value].filter(Boolean).join(" · ");
};

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
    { leadType: "PCN召回Campaign", priority: "medium" as const, status: "pending" as const, ruleName: "PCN规则" }
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

  // 强制合并 mock 数据（仅 demo 演示用，仅使用默认标签分类）
  const mockTags: Record<string, string[]> = {
    会员分层: ["会员分层-售后钻石客户"],
    售后行为: ["售后行为-12个月内完成首保", "售后行为-12个月内回厂"],
    活跃度相关: ["活跃度-购买附加产品"],
    粘性产品: [],
    投诉相关: [],
    定保相关: []
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

const getGenderLabel = (gender?: string) => {
  const map: Record<string, string> = {
    male: t("customer.gender.male"),
    female: t("customer.gender.female"),
    other: t("customer.gender.other")
  };
  return gender ? map[gender] || gender : "—";
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
    电话: "primary",
    wechat: "success",
    微信: "success",
    visit: "warning",
    到店: "warning",
    email: "info",
    sms: "info"
  };
  return map[type] || "info";
};

const getInteractionTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    call: t("customer.profile360.call"),
    电话: "电话",
    wechat: t("customer.profile360.wechat"),
    微信: "微信",
    visit: t("customer.profile360.visit"),
    到店: "到店",
    email: t("customer.profile360.email"),
    sms: t("customer.profile360.sms")
  };
  return map[type] || type;
};

const getInteractionTimelineType = (type: string): "primary" | "success" | "warning" | undefined => {
  const map: Record<string, "primary" | "success" | "warning"> = {
    call: "primary",
    电话: "primary",
    wechat: "success",
    微信: "success",
    visit: "warning",
    到店: "warning"
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

// 风控状态转为标签列表（在画像标签卡片内展示，与其它分类样式一致）
const riskStatusTags = computed(() => {
  const risk = props.profileData?.riskStatus;
  if (!risk) return [];
  const list: Array<{ key: string; label: string; type: "danger" | "warning" | "info" }> = [];
  if (risk.hasComplaint6Months) {
    list.push({ key: "complaint6m", label: t("customer.profile360.hasComplaint6Months"), type: "danger" });
  }
  if (risk.churnRiskLevel) {
    list.push({
      key: "churn",
      label: `${t("customer.profile360.churnRiskLevel")}：${risk.churnRiskLevel}`,
      type: "warning"
    });
  }
  if (risk.isVehicleSold) {
    list.push({ key: "vehicleSold", label: t("customer.profile360.isVehicleSold"), type: "info" });
  }
  if (risk.isRemoteUse) {
    list.push({ key: "remoteUse", label: t("customer.profile360.isRemoteUse"), type: "info" });
  }
  return list;
});

// 获取分类显示名称（去掉【必选】等标记）
const getCategoryDisplayName = (category: string): string => {
  return category
    .replace(/【必选】/g, "")
    .replace(/必选/g, "")
    .trim();
};

// 获取分类多级展示名称（完整路径，与系统标签多级一致）
const getCategoryDisplayLabel = (category: string): string => {
  const clean = getCategoryDisplayName(category);
  return getCategoryFullPath(TAG_CATEGORY_OPTIONS, clean) || clean;
};

// 判断某个标签分类是否为自动计算类（默认标签均为系统自动）
const isAutoCategory = (category: string): boolean => {
  const displayName = getCategoryDisplayName(category);
  const autoCategories = ["会员分层", "售后行为", "活跃度相关", "粘性产品", "投诉相关", "定保相关"];
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

// 获取分类颜色索引（仅默认标签分类）
const getCategoryColorIndex = (category: string): number => {
  const categoryMap: Record<string, number> = {
    会员分层: 0,
    售后行为: 1,
    活跃度相关: 2,
    粘性产品: 3,
    投诉相关: 4,
    定保相关: 5
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

  const phones = phoneValues.value;
  const phoneItems =
    phones.length > 0
      ? phones.map(p => {
          const relationTagKey =
            relationTagOptions.value.find(opt => opt.label === p.relationTagName)?.value ?? "";
          return {
            value: p.value,
            contactName: p.contactName ?? "",
            relationTagKey,
            readonly: !!p.readonly,
            isPrimaryContact: !!(p as { isPrimaryContact?: boolean }).isPrimaryContact,
            isPreferredRepairer: !!(p as { isPreferredRepairer?: boolean }).isPreferredRepairer
          };
        })
      : [{ value: "", contactName: "", relationTagKey: "", readonly: false }];
  const preferredIdx = phones.findIndex(p => p.isPreferred ?? p.isPrimary);
  const preferredPhoneIndex = preferredIdx >= 0 ? preferredIdx : 0;
  // 与 H5 一致：固定 4 个地址槽位（地址1-4），可新增/编辑
  const weightLabels = ["高权重", "中高权重", "中权重", "低权重"];
  const addressSlots: Array<{ slotKey: string; slotLabel: string; value: string; weightLabel: string }> = [];
  for (let i = 1; i <= 4; i++) {
    const slotKey = `address${i}` as "address1" | "address2" | "address3" | "address4";
    const existing = addressValues.value.find(
      (item: { slotKey?: string }) => (item.slotKey || "").toLowerCase() === slotKey
    ) || addressValues.value[i - 1];
    addressSlots.push({
      slotKey,
      slotLabel: `地址${i}`,
      value: existing?.value ?? "",
      weightLabel: weightLabels[i - 1] || "普通"
    });
  }
  const addresses = addressSlots;

  basicInfoForm.value = {
    name: display.name || "",
    gender: (display.gender as string) || "",
    ageGroup: display.ageGroup || "",
    birthDate: (display as { birthDate?: string }).birthDate || "",
    city: (display as { city?: string }).city || "",
    residenceArea: (display as { residenceArea?: string }).residenceArea || "",
    familyStatus: (display.familyStatus as string) || "",
    identityType: (display as { identityType?: string }).identityType || "",
    addresses,
    phoneItems,
    preferredPhoneIndex,
    lifecycleStatus: (props.profileData?.customer.lifecycleStatus as LifecycleStatus) ?? "active",
    originalLifecycleStatus: (props.profileData?.customer.lifecycleStatus as LifecycleStatus) ?? "active"
  };

  isBasicInfoEditMode.value = true;
};

/** 在当前联系人组下添加一个号码（与 H5 一致） */
function addNumberInGroup(group: { relationTagKey: string; contactName: string }) {
  basicInfoForm.value.phoneItems.push({
    value: "",
    contactName: group.contactName,
    relationTagKey: group.relationTagKey,
    readonly: false,
    isPrimaryContact: false,
    isPreferredRepairer: false
  });
  editingPhoneIndex.value = basicInfoForm.value.phoneItems.length - 1;
}

/** 新增联系人（与 H5「新增联系人」一致） */
function addNewContact() {
  basicInfoForm.value.phoneItems.push({
    value: "",
    contactName: "",
    relationTagKey: "",
    readonly: false,
    isPrimaryContact: false,
    isPreferredRepairer: false
  });
  editingPhoneIndex.value = basicInfoForm.value.phoneItems.length - 1;
}

function setPreferredPhoneIndex(index: number) {
  basicInfoForm.value.preferredPhoneIndex = index;
}

/** 公司类型：设为优选联系人（仅一个） */
function setPrimaryContactIndex(index: number) {
  basicInfoForm.value.phoneItems.forEach((item, i) => {
    (item as { isPrimaryContact?: boolean }).isPrimaryContact = i === index;
  });
}

/** 公司类型：设为优选送修人（仅一个，通常为订单同步的号码） */
function setPreferredRepairerIndex(index: number) {
  basicInfoForm.value.phoneItems.forEach((item, i) => {
    (item as { isPreferredRepairer?: boolean }).isPreferredRepairer = i === index;
  });
}

function removeBasicInfoPhone(index: number) {
  const list = basicInfoForm.value.phoneItems;
  if (list.length <= 1) return;
  list.splice(index, 1);
  const preferred = basicInfoForm.value.preferredPhoneIndex;
  if (preferred >= list.length) basicInfoForm.value.preferredPhoneIndex = Math.max(0, list.length - 1);
  else if (preferred > index) basicInfoForm.value.preferredPhoneIndex = preferred - 1;
  if (editingPhoneIndex.value === index) editingPhoneIndex.value = null;
  else if (editingPhoneIndex.value != null && editingPhoneIndex.value > index) editingPhoneIndex.value = editingPhoneIndex.value - 1;
}

const exitBasicInfoEditMode = () => {
  isBasicInfoEditMode.value = false;
  basicInfoForm.value = {
    name: "",
    gender: "",
    ageGroup: "",
    birthDate: "",
    city: "",
    residenceArea: "",
    familyStatus: "",
    identityType: "",
    addresses: [],
    phoneItems: [],
    preferredPhoneIndex: 0,
    lifecycleStatus: "active",
    originalLifecycleStatus: "active"
  };
  editingPhoneIndex.value = null;
};

// 公司信息编辑模式：公司档案已下线，保留空实现以兼容调用
const enterCompanyEditMode = () => {};

const exitCompanyEditMode = () => {};

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
      console.log("提交客户支持状态变更:", {
        oneId: props.profileData.customer.oneId,
        from: originalStatus,
        to: targetStatus
      });
      ElMessage.success("状态变更已提交");
    } else {
      ElMessage.success("保存成功");
    }

    const phonePayload = basicInfoForm.value.phoneItems
      .map((item, i) => ({
        value: item.value,
        contactName: item.contactName || undefined,
        relationTagName: relationTagOptions.value.find(opt => opt.value === item.relationTagKey)?.label,
        isPreferred: basicInfoForm.value.preferredPhoneIndex === i,
        readonly: item.readonly,
        isPrimaryContact: item.isPrimaryContact,
        isPreferredRepairer: item.isPreferredRepairer
      }))
      .filter(p => p.value);
    console.log("提交基础信息:", {
      name: basicInfoForm.value.name,
      gender: basicInfoForm.value.gender,
      ageGroup: basicInfoForm.value.ageGroup,
      birthDate: basicInfoForm.value.birthDate,
      city: basicInfoForm.value.city,
      residenceArea: basicInfoForm.value.residenceArea,
      familyStatus: basicInfoForm.value.familyStatus,
      identityType: basicInfoForm.value.identityType,
      addresses: basicInfoForm.value.addresses,
      phoneList: phonePayload,
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
      console.log("提交公司生命周期状态变更:", {
        companyOneId: props.profileData.company.oneId,
        from: originalStatus,
        to: targetStatus
      });
      ElMessage.success("状态变更已提交");
    } else {
      ElMessage.success("保存成功");
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
    .address-list-edit {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .address-edit-hint {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 4px;
    }
    .address-item-edit {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .address-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      .slot-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      .slot-weight {
        font-size: 12px;
        color: var(--el-text-color-secondary);
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
            color: #606266 !important;
            background-color: #f5f7fa !important;
            border-color: #dcdfe6 !important;
            opacity: 0.85;
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

.risk-status-tag {
  border-radius: 8px;
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
      }
      .interaction-content {
        margin-bottom: 8px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
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
  .handler-flag {
    padding: 2px 8px;
    font-size: 11px;
    line-height: 1;
    color: #94724a;
    background: rgb(148 114 74 / 12%);
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
      &.preferred {
        font-weight: 500;
        color: var(--el-color-primary);
      }
      &.highlight {
        font-weight: 600;
        color: #94724a;
      }
      &.readonly {
        color: #909399;
      }
    }
  }
  .readonly-tip {
    width: 100%;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  /* 与 H5「查看全部联系电话」一致的编辑区 */
  .h5-style-contact {
    .phone-edit-section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
    }
    .phone-group {
      margin-bottom: 16px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      overflow: hidden;
    }
    .phone-group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--el-fill-color-light);
      .group-contact-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      .group-relation-tag {
        flex-shrink: 0;
      }
      .set-preferred-link {
        font-size: 12px;
        color: var(--el-color-primary);
        cursor: pointer;
        margin-left: 6px;
        text-underline-offset: 2px;
        transition: opacity 0.2s;
        &:hover {
          text-decoration: underline;
          opacity: 0.85;
        }
      }
      .add-number-btn {
        margin-left: auto;
      }
    }
    .phone-row {
      padding: 8px 12px;
      border-top: 1px solid var(--el-border-color-lighter);
      &.is-preferred {
        background: var(--el-color-primary-light-9);
      }
    }
    .phone-row-display {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      .phone-number {
        font-weight: 500;
      }
      .preferred-badge {
        font-size: 12px;
        color: var(--el-color-primary);
        font-weight: 500;
      }
      .set-preferred-link {
        font-size: 12px;
        color: var(--el-color-primary);
        cursor: pointer;
        margin-left: 6px;
        text-underline-offset: 2px;
        transition: opacity 0.2s;
        &:hover {
          text-decoration: underline;
          opacity: 0.85;
        }
      }
    }
    .phone-row-edit {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      .phone-input {
        width: 140px;
      }
      .contact-name-input {
        width: 120px;
      }
      .relation-tag-select {
        width: 140px;
      }
    }
    .phone-row-edit-single .phone-input {
      width: 200px;
    }
    .add-contact-btn {
      margin-top: 8px;
    }
  }
  .vehicle-person-cell {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .vehicle-repairer-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .vehicle-repairer-chip {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .vehicle-repairer-phone {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .vehicle-repairer-badge {
    padding: 2px 8px;
    font-size: 11px;
    line-height: 1;
    color: #0f766e;
    background: rgb(15 118 110 / 10%);
    border-radius: 999px;
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

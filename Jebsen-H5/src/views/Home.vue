<template>
  <div class="home-container">

    <!-- 手机号搜索多 OneId 时：顶部 OneId 切换栏（少量横向 Tab，多个时下拉列表） -->
    <div v-if="hasMultipleOneIds" class="oneid-switcher-bar" :class="{ 'oneid-bar-many': useOneIdDropdown }">
      <div class="oneid-switcher-inner">
        <span class="oneid-switcher-label">
          当前身份
          <span class="oneid-count-badge">共 {{ oneIdList.length }} 个 OneID</span>
        </span>
        <!-- 少量（≤4）：横向 Tab，支持横向滚动 -->
        <div v-if="!useOneIdDropdown" class="oneid-tabs oneid-tabs-scroll">
          <div
            v-for="opt in oneIdList"
            :key="opt.oneId"
            class="oneid-tab"
            :class="{ active: activeOneId === opt.oneId }"
            @click="switchOneId(opt)"
          >
            <van-icon :name="opt.type === 'company' ? 'shop-o' : 'user-o'" class="oneid-tab-icon" />
            <span class="oneid-tab-name">{{ opt.name }}</span>
            <span class="oneid-tab-oneid">ONEID: {{ opt.oneId }}</span>
          </div>
        </div>
        <!-- 多个（>4）：当前选中 + 点击展开列表 -->
        <div v-else class="oneid-dropdown-wrap">
          <div class="oneid-dropdown-trigger" @click="showOneIdSheet = true">
            <van-icon :name="currentOneIdOption?.type === 'company' ? 'shop-o' : 'user-o'" class="oneid-tab-icon" />
            <span class="oneid-dropdown-text">{{ currentOneIdOption?.name }} · ONEID: {{ activeOneId }}</span>
            <van-icon name="arrow-down" class="oneid-dropdown-arrow" />
          </div>
          <van-action-sheet
            v-model:show="showOneIdSheet"
            :actions="oneIdSheetActions"
            cancel-text="取消"
            close-on-click-action
            @select="onOneIdSheetSelect"
          />
        </div>
      </div>
    </div>

    <!-- 强力便捷切换工具 (支持拖拽)：仅非手机号多 OneId 时显示 -->
    <div 
      v-if="showQuickAccountToggle"
      class="fixed-account-toggle" 
      :style="{ top: floatingPos.y + 'px' }"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @click="handleToggleClick"
    >
      <van-icon name="exchange" class="toggle-icon" />
      <span>{{ isCompany ? '回个人' : '看公司' }}</span>
    </div>




    <!-- 手机号搜索：拉取 OneId 列表中（全屏） -->
    <div v-if="isOneIdLoadingState" class="oneid-fullscreen oneid-fullscreen-loading">
      <van-loading type="spinner" size="40px" vertical color="#c9a227">正在查询该手机号关联身份...</van-loading>
    </div>

    <!-- 手机号搜索无结果：全屏空状态 -->
    <div v-else-if="isOneIdEmptyState" class="oneid-fullscreen oneid-fullscreen-empty">
      <div class="oneid-fullscreen-content">
        <van-empty
          image="search"
          description=""
          class="oneid-empty-inner"
        />
        <h2 class="oneid-empty-title">未找到关联的客户身份</h2>
        <p class="oneid-empty-desc">该手机号未关联到任何 OneID，请确认是否输入正确，或联系管理员处理。</p>
        <van-button type="primary" block round class="oneid-empty-btn" @click="handleEmptyCheckPhone">查看本次搜索手机号</van-button>
      </div>
    </div>

    <!-- 首屏内容 -->
    <div v-else-if="!customerStore.loading && customerStore.profile" class="first-screen">
      
      <!-- [新增层级] 公司主体信息层：仅在公司账户下显示 -->

      <!-- 公司视图：顶部企业级状态栏（功能保持与个人 alert-system 一致） -->
      <div
        v-if="false"
        class="alert-system context-alert enterprise-alert"
      >
        <!-- 企业维度：经办人/账号存在冲突提示（点击仍然打开冲突解决弹窗） -->
        <van-notice-bar
          v-if="currentConflicts && currentConflicts.length > 0"
          left-icon="warning"
          color="#D46B08"
          background="#FFFBE6"
          class="alert-bar conflict-alert-bar"
          @click="showConflictResolver = true"
        >
          检测到该企业存在多条记录冲突，请核实身份与合并策略。
        </van-notice-bar>

        <!-- 企业维度：最新操作提示（点击仍然打开操作日志弹窗） -->
        <van-notice-bar
          v-if="latestOperationDisplay"
          left-icon="info-o"
          color="#94724A"
          background="#FEF9F3"
          mode="link"
          class="alert-bar operation-alert-bar"
          @click="showOperationLogDialog = true"
        >
          {{ latestOperationText }} {{ formatOperationTime(latestOperationDisplay.operationTime) }}
        </van-notice-bar>
      </div>

      <!-- [新增层级] 公司主体信息层：仅在公司账户下显示 -->
      <div v-if="false" class="company-identity-layer">
        <div class="company-basic-info">
          <div class="comp-icon"><van-icon name="shop-o" /></div>
          <div class="comp-main">
            <h2 class="comp-name">
              <span class="comp-name-text">{{ customerStore.profile?.name?.value }}</span>
              <span class="enterprise-pill">企</span>
              <span class="comp-oneid-pill">ONEID：{{ currentAgentId }}</span>
            </h2>
            <div class="company-meta-row">
              <!-- ONEID 级别的数据监控与溯源入口 -->
              <div class="company-sync-trace">
                <van-popover
                  v-model:show="showSyncInfoPopover"
                  placement="bottom-start"
                  trigger="click"
                >
                  <div class="sync-details-popover">
                    <div class="sync-header">
                      <div class="sync-title-row">
                        <van-icon name="shield-o" />
                        <span>数据状态监控</span>
                      </div>
                      <div class="sync-time-subtitle">同步至: {{ syncTime }}</div>
                    </div>
                    <div class="sync-source-list">
                      <div class="source-item" v-for="source in platformSyncStatus" :key="source.name">
                        <div class="source-info">
                          <div class="source-icon-box">
                            <van-icon :name="source.name.includes('DMS') ? 'setting-o' : source.name.includes('BDC') ? 'phone-o' : source.name.includes('Voucher') ? 'coupon-o' : source.name.includes('手工') ? 'description-o' : 'service-o'" />
                          </div>
                          <span class="source-name">{{ source.name }}</span>
                        </div>
                        <div class="status-badge" :class="source.status === 'success' ? 'is-success' : 'is-error'">
                          <span class="status-dot-mini"></span>
                          {{ source.status === 'success' ? '正常' : '异常' }}
                        </div>
                      </div>
                    </div>
                    <div class="sync-footer">
                      <i class="footer-i">i</i>
                      <span>业务数据 T+1 同步，若与最新操作有偏差属正常现象。</span>
                    </div>
                  </div>
                  <template #reference>
                    <div class="sync-status-icon-wrapper" :class="isSyncHealthy ? 'is-healthy' : 'is-error'">
                      <van-icon name="bulb-o" :style="{ color: isSyncHealthy ? '#07c160' : '#ee0a24' }" />
                    </div>
                  </template>
                </van-popover>
                <van-icon name="cluster-o" class="trace-icon" @click="showPlatformFlow = true" />
              </div>
            </div>
            <!-- 公司级标签（VIP车主、钻石客户、首保流失15个月、PCN售后增项等），跟随 ONEID 展示 -->
            <div
              v-if="displayedHeaderTags.length > 0"
              class="company-header-tags"
            >
              <span
                v-for="(tag, index) in displayedHeaderTags"
                :key="index"
                :class="getHeaderTagClass(tag)"
                @click="isOpportunityTag(tag) ? (showOpportunityDialog = true) : undefined"
              >
                <van-icon v-if="getTagIcon(tag)" :name="getTagIcon(tag)" class="tag-icon" />
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        
      </div>

      <!-- 顶部状态栏系统：个人视图下保留原有提示 -->
      <div class="alert-system context-alert" :class="{ 'enterprise-alert': isCompany }">
        <!-- 冲突提示 -->
        <van-notice-bar
          v-if="currentConflicts && currentConflicts.length > 0"
          left-icon="warning"
          color="#D46B08"
          background="#FFFBE6"
          class="alert-bar conflict-alert-bar"
          @click="showConflictResolver = true"
        >
          该顾客疑似存在多条记录冲突，请核实身份信息
        </van-notice-bar>

        <!-- 最新操作提示 -->
        <van-notice-bar
          v-if="latestOperationDisplay"
          left-icon="info-o"
          color="#94724A"
          background="#FEF9F3"
          mode="link"
          class="alert-bar operation-alert-bar"
          @click="showOperationLogDialog = true"
        >
          {{ latestOperationText }} {{ formatOperationTime(latestOperationDisplay.operationTime) }}
        </van-notice-bar>
      </div>

      <!-- 核心画像层：个人视图显示，企业视图隐藏 -->
      <div class="premium-header" :class="{ 'premium-header-company': isCompany }">
        <div class="watermark-bg"></div>
        <div class="header-main">
          <div class="avatar-wrapper">
            <div class="avatar-circle">
              <span class="avatar-text">{{ String(currentAgentName).charAt(0) }}</span>
            </div>
          </div>
          <div class="header-info-wrapper">
            <div class="user-name-row">
              <div class="name-left">
                <!-- 经办人姓名 + 经办人标签 + 同步信息（公司名称与 ONEID 已上移到白色公司区域） -->
                <div class="name-main-row">
                  <h1>{{ currentAgentName }}</h1>
                  <span v-if="isCompany" class="handler-role-pill">
                    公司客户
                  </span>
                  <!-- 仅个人视图下展示 VIP 车主头衔，避免与公司级标签重复 -->
                  <span
                    v-if="!isCompany && displayedHeaderTags.includes('VIP 车主')"
                    class="handler-role-pill"
                  >
                    VIP车主
                  </span>
                  <!-- 同步监控与溯源入口：个人模式下仍在黑金卡展示 -->
                  <template v-if="!isCompany">
                    <van-popover
                      v-model:show="showSyncInfoPopover"
                      placement="bottom-start"
                      trigger="click"
                    >
                      <div class="sync-details-popover">
                        <div class="sync-header">
                          <div class="sync-title-row">
                            <van-icon name="shield-o" />
                            <span>数据状态监控</span>
                          </div>
                          <div class="sync-time-subtitle">同步至: {{ syncTime }}</div>
                        </div>
                        <div class="sync-source-list">
                          <div class="source-item" v-for="source in platformSyncStatus" :key="source.name">
                            <div class="source-info">
                              <div class="source-icon-box">
                                <van-icon :name="source.name.includes('DMS') ? 'setting-o' : source.name.includes('BDC') ? 'phone-o' : source.name.includes('Voucher') ? 'coupon-o' : source.name.includes('手工') ? 'description-o' : 'service-o'" />
                              </div>
                              <span class="source-name">{{ source.name }}</span>
                            </div>
                            <div class="status-badge" :class="source.status === 'success' ? 'is-success' : 'is-error'">
                              <span class="status-dot-mini"></span>
                              {{ source.status === 'success' ? '正常' : '异常' }}
                            </div>
                          </div>
                        </div>
                        <div class="sync-footer">
                          <i class="footer-i">i</i>
                          <span>业务数据 T+1 同步，若与最新操作有偏差属正常现象。</span>
                        </div>
                      </div>
                      <template #reference>
                        <div class="sync-status-icon-wrapper" :class="isSyncHealthy ? 'is-healthy' : 'is-error'">
                          <van-icon name="bulb-o" :style="{ color: isSyncHealthy ? '#07c160' : '#ee0a24' }" />
                        </div>
                      </template>
                    </van-popover>
                    <van-icon name="cluster-o" class="trace-icon" @click="showPlatformFlow = true" />
                  </template>
                </div>
              </div>

              <div class="meta-right">
                <!-- 个人模式下：黑金卡片右上角继续显示 ONEID 与 [个人] -->
                <span class="oneid-pill">ONEID：{{ currentAgentId }}</span>
                <span class="customer-type-badge">
                  <van-icon
                    :name="customerTypeIcon"
                    class="identity-icon"
                  />
                  <span class="identity-text">{{ customerTypeText }}</span>
                </span>
              </div>
            </div>
            <div v-if="isCompany" class="company-profile-meta">
              <span v-if="companyDisplayName" class="company-profile-pill">公司：{{ companyDisplayName }}</span>
              <span v-if="companyPrimaryContactName" class="company-profile-pill">首选联系人：{{ companyPrimaryContactName }}</span>
            </div>
            <div class="header-tags">
              <span
                v-for="(tag, index) in displayedHeaderTags"
                :key="index"
                :class="getHeaderTagClass(tag)"
                @click="isOpportunityTag(tag) ? (showOpportunityDialog = true) : undefined"
              >
                <van-icon v-if="getTagIcon(tag)" :name="getTagIcon(tag)" class="tag-icon" />
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
      

      <!-- 一、联系电话：号码列表，按身份 / 经办人 Tab 筛选；编辑仅含号码+主副号+联系人姓名+关系 -->
      <div
        class="phone-card section-contact-phone"
        :class="{ 'is-company': isCompany }"
      >
        <div class="section-title-inner" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>联系电话</span>
          <span
            v-if="showMorePhonesLink && customerStore.profile?.mobile && 'items' in customerStore.profile.mobile && (customerStore.profile.mobile.editable || isCompany)"
            style="font-size: 11px; color: #9ca3af; font-weight: 400; cursor: pointer;"
            @click="openMobileEditorForAll"
          >
            查看更多 ›
          </span>
        </div>
        <!-- 企业视图：经办人 Chip Tab -->
        <div
          v-if="isCompany && companyHandlers.length > 0"
          class="handler-tab-wrapper"
        >
          <div
            v-for="handler in companyHandlers"
            :key="handler.id"
            class="handler-pill"
            :class="{ active: selectedHandler && selectedHandler.id === handler.id }"
            @click="onSelectHandler(handler.id)"
          >
            <span class="handler-name">{{ handler.name || '经办人' }}</span>
            <span v-if="handler.role" class="handler-role-tag">{{ handler.role }}</span>
          </div>
        </div>

        <!-- 个人视图：身份 Chip Tab -->
        <div
          v-else-if="!isCompany && personalIdentities.length >= 2"
          class="handler-tab-wrapper"
        >          <div
            v-for="identity in personalIdentities"
            :key="identity.id"
            class="handler-pill"
            :class="{ active: selectedPersonalIdentityId === identity.id }"
            @click="selectedPersonalIdentityId = identity.id"
          >
            <span class="handler-name">{{ identity.label }}</span>
            <span v-if="identity.isBuyer" class="handler-flag" style="color: #ed6a0c; background: rgba(255, 151, 106, 0.12);">购车人</span>
            <span v-if="identity.isPreferredRepairer" class="handler-flag">首选送修人</span>
          </div>
        </div>

        <!-- 将设置首选送修人的操作转移到电话卡片中，与上方身份 Tab 联动更紧密 -->
        <div v-if="showPreferredPersonAction && !isSelectedPreferredPerson" style="margin: 0 0 12px 0; display: flex; justify-content: flex-end;">
          <span style="font-size: 12px; font-weight: 500; color: #94724a; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" @click="markSelectedPersonAsPreferred">
            <van-icon name="edit" /> {{ preferredPersonActionCta }}
          </span>
        </div>

        <div class="phone-entry">
          <div
            v-for="(item, index) in displayedPhones"
            :key="item.id"
          >
            <div class="phone-row">
              <div class="num-main">
                <span v-if="item.contactName" class="num-contact-name">{{ item.contactName }}</span>
                <span class="num-val" :class="{ 'is-secondary': !item.isPrimary }">
                  {{ item.formattedMobile || formatMobile(item.mobile) }}
                </span>
              </div>
              <div class="num-tags">
                <span v-if="item.isPrimary" class="n-tag active">主号</span>
                <!-- 仅显示关系标签（本人、配偶、公司电话），与公司类型保持一致的填充标签样式 -->
                <span v-if="item.relationTagName && RELATION_TAGS_FOR_FIRST_SCREEN.includes(item.relationTagName)" class="n-tag is-relation">
                  {{ item.relationTagName }}
                </span>
              </div>
              <span
                v-if="!item.readonly && customerStore.profile.mobile && 'items' in customerStore.profile.mobile && (customerStore.profile.mobile.editable || isCompany)"
                class="edit-icon"
                @click="openMobileEditorForItem(item.id)"
              >✏️</span>
            </div>
            <!-- 分隔线：在两个手机号之间显示 -->
            <div v-if="index < displayedPhones.length - 1" class="phone-divider"></div>
          </div>
        </div>
      </div>

      <!-- 二、车辆信息（车）：列表 + 相关人员在此设置 使用人/送修人/联系人 -->
      <div class="container section-vehicles">
        <div class="block-h">
          <span class="title-text">车辆列表 ({{ vehiclesForCurrentContext.length }})</span>
          <span class="block-more" @click="openVehicleDialog()">查看列表 ›</span>
        </div>
        <div class="asset-box">
          <template v-if="displayedVehiclesForCurrentTab.length > 0">
            <div
              v-for="vehicle in displayedVehiclesForCurrentTab"
              :key="vehicle.id"
              class="asset-row"
              @click="openVehicleDialog()"
            >
              <span class="model-name ellipsis">{{ vehicle.vehicleModel }}</span>
              <span class="plate-val ellipsis">{{ vehicle.licensePlate || '未知' }}</span>
              <span class="vin-val ellipsis">{{ vehicle.vin || '未知' }}</span>
              <div class="asset-row-actions">
                <span
                  class="status-text"
                  @click.stop="openVehicleDialogAndEditStatus(vehicle.id)"
                >
                  {{ getVehicleStatusLabel(vehicle.status) }}
                </span>
              </div>
            </div>
          </template>
          <div v-else class="section-empty">
            暂无车辆信息
          </div>
        </div>
      </div>

      <!-- 三、联系人（人）：当前选中人的档案 -->
      <div class="container contact-profile-card section-contact-person">
        <div class="block-h block-h-contact">
          <span class="title-text">联系人</span>
          <span class="block-more" @click="handleOpenBasicInfoEditor">查看更多 ›</span>
        </div>
        <div class="info-grid">
          <div class="info-node">
            <div class="node-l">姓名</div>
            <div class="node-v">{{ currentAgentName }}</div>
          </div>
          <div class="info-node">
            <div class="node-l">年龄</div>
            <div class="node-v">{{ contactProfileAge }}</div>
          </div>
          <div class="info-node">
            <div class="node-l">性别</div>
            <div class="node-v">{{ contactProfileGender }}</div>
          </div>
          <div class="info-node">
            <div class="node-l">城市</div>
            <div class="node-v">{{ contactProfileCity }}</div>
          </div>
          <div v-if="isCompany" class="info-node">
            <div class="node-l">客户类型</div>
            <div class="node-v">公司客户</div>
          </div>
          <div v-if="isCompany && companyDisplayName" class="info-node">
            <div class="node-l">公司名称</div>
            <div class="node-v">{{ companyDisplayName }}</div>
          </div>
          <div v-if="isCompany && companyPrimaryContactName" class="info-node">
            <div class="node-l">首选联系人</div>
            <div class="node-v">{{ companyPrimaryContactName }}</div>
          </div>
          <div v-if="displayedAddresses.length > 0" class="info-node info-node-summary">
            <span class="summary-chip">地址 {{ displayedAddresses.length }} 条<span v-if="displayedAddressLabels" class="summary-labels">（{{ displayedAddressLabels }}）</span></span>
          </div>
        </div>
      </div>

      <!-- 账户权益 / 企业账户权益 -->
      <div class="container" v-if="nearestExpiringAsset">
        <div class="block-h">
          <span class="title-text">{{ isCompany ? '企业账户权益' : '账户权益' }}</span>
          <span class="block-more" @click="handleCouponCardClick">查看更多 ›</span>
        </div>
        <div class="asset-coupon-box">
          <div class="asset-coupon-name">{{ nearestExpiringAsset.name }} <small>至 {{ nearestExpiringAsset.validTo }}</small></div>
          <div class="asset-coupon-amount">¥{{ formatAmount(nearestExpiringAsset.amount || 0) }}</div>
        </div>
      </div>

      <!-- 画像标签 / 企业画像标签 -->
      <div class="container">
        <div class="block-h">
          <span class="title-text">{{ isCompany ? '企业画像标签' : '画像标签' }}</span>
          <span class="block-more" @click="showTagManager = true">管理</span>
        </div>
        <div class="tags-list-container">
          <span
            v-for="(tag, index) in portraitTags"
            :key="index"
            class="tag-item-custom"
            :class="getTagCustomClass(tag)"
            :style="getTagStyle(tag)"
            @click="showTagManager = true"
          >
            <span
              class="tag-source-badge"
              :class="isAutoPortraitTag(tag) ? 'auto' : 'manual'"
            >
              {{ isAutoPortraitTag(tag) ? '自动' : '手工' }}
            </span>
            <span class="tag-name-text">
              {{ tag }}
            </span>
          </span>
          <span v-if="customerStore.profile.tags.length === 0" class="empty-tags-text">暂无标签</span>
        </div>
      </div>

      <!-- Tab 切换（维保、保险、沟通记录） -->
      <div class="container tab-container">
        <div class="tab-nav-wrapper">
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'maintenance' }"
            @click="activeTab = 'maintenance'"
          >
            维保记录
          </div>
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'insurance' }"
            @click="activeTab = 'insurance'"
          >
            保险合同
          </div>
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'communication' }"
            @click="activeTab = 'communication'"
          >
            沟通记录
          </div>
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'marketing' }"
            @click="activeTab = 'marketing'"
          >
            线下活动
          </div>
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'loan' }"
            @click="activeTab = 'loan'"
          >
            金融贷款
          </div>
        </div>
        
        <!-- Tab 内容 -->
        <div class="tab-content-wrapper">
          <div v-if="activeTab === 'maintenance'" class="tab-content">
            <MaintenanceRecords />
          </div>
          <div v-if="activeTab === 'insurance'" class="tab-content">
            <Maintenance />
          </div>
          <div v-if="activeTab === 'communication'" class="tab-content">
            <CommunicationRecords />
          </div>
          <div v-if="activeTab === 'marketing'" class="tab-content">
            <MarketingCampaigns />
          </div>
          <div v-if="activeTab === 'loan'" class="tab-content">
            <FinancialLoan type="all" />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading
      v-if="customerStore.loading"
      type="spinner"
      vertical
      class="loading"
    >
      加载中...
    </van-loading>

    <!-- 预约信息卡片（提前显示，业务人员重点关注） -->
    <!-- <div v-if="customerStore.appointments && customerStore.appointments.length > 0 && !customerStore.loading" class="appointment-card-top">
      <div class="card-header">
        <div class="card-title">预约信息</div>
      </div>
      <div class="card-content">
        <div
          v-for="appointment in customerStore.appointments"
          :key="appointment.id"
          class="appointment-item"
        >
          <div class="appointment-header">
            <div class="appointment-type">{{ appointment.type }}</div>
            <van-tag
              :type="getAppointmentStatusType(appointment.status)"
              :size="'small' as any"
            >
              {{ appointment.status }}
            </van-tag>
          </div>
          <div class="appointment-info">
            <div class="info-row">
              <span class="label">预约时间：</span>
              <span class="value">{{ appointment.date }} {{ appointment.time }}</span>
            </div>
            <div class="info-row">
              <span class="label">预约门店：</span>
              <span class="value">{{ appointment.store }}</span>
            </div>
            <div v-if="appointment.vehicleModel" class="info-row">
              <span class="label">相关车型：</span>
              <span class="value">{{ appointment.vehicleModel }}</span>
            </div>
            <div v-if="appointment.description" class="info-row">
              <span class="label">预约描述：</span>
              <span class="value">{{ appointment.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div> -->




    <!-- 客户标签选择器弹窗 -->
    <van-popup
      v-model:show="showTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签</h3>
          <van-icon name="cross" @click="showTagSelector = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag-option"
            @click="handleAddTag(tag.id)"
          >
            <van-tag
              :type="getTagType(tag.name)"
              size="medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </van-tag>
            <van-icon
              v-if="isTagSelected(tag.name)"
              name="success"
              color="#52c41a"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 用户偏好标签选择器弹窗（多选） -->
    <van-popup
      v-model:show="showPreferredCarTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签（可多选）</h3>
          <van-icon name="cross" @click="closePreferredCarTagSelector" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in customerStore.tagPool"
            :key="tag.id"
            class="tag-option"
            :class="{ 'is-selected': isPreferredCarTagSelected(tag.name) }"
            @click="togglePreferredCarTag(tag.name)"
          >
            <van-tag
              :type="getTagType(tag.name)"
              size="medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </van-tag>
            <van-icon
              v-if="isPreferredCarTagSelected(tag.name)"
              name="success"
              color="#52c41a"
            />
          </div>
        </div>
        <div class="popup-footer">
          <van-button
            type="default"
            size="large"
            @click="closePreferredCarTagSelector"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="savingPreferredCarTags"
            @click="handleSavePreferredCarTags"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 冲突处理弹窗 -->
    <ConflictResolver
      v-if="currentConflicts.length > 0"
      v-model:show="showConflictResolver"
      :conflicts="currentConflicts"
      @submitted="handleConflictSubmitted"
    />

    <!-- 平台溯源流程图 -->
    <PlatformFlow
      v-model:show="showPlatformFlow"
      :sources="customerStore.platformSources"
      :customer-id="customerStore.profile?.id"
    />

    <!-- 电话号码管理弹窗 -->
    <MobileEditor
      v-if="customerStore.profile?.mobile && 'items' in customerStore.profile.mobile"
      v-model="showMobileManager"
      :mobile-data="customerStore.profile.mobile as MobileData"
      :customer-type="isCompany ? 'company' : 'individual'"
      :initial-edit-item-id="mobileEditorEditItemId"
      @update="handleMobileUpdate"
    />

    <!-- 操作日志弹窗 -->
    <OperationLogDialog
      v-model:show="showOperationLogDialog"
      :logs="customerStore.operationLogs"
      :loading="operationLogsLoading"
    />

    <!-- 商机信息弹窗 -->
    <van-popup
      v-model:show="showOpportunityDialog"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="opportunity-dialog">
        <div class="popup-header">
          <h3>商机信息</h3>
          <van-icon name="cross" @click="showOpportunityDialog = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="opportunity in customerStore.opportunities"
            :key="opportunity.id"
            class="opportunity-item"
          >
            <div class="opportunity-header">
              <div class="opportunity-type-wrapper">
                <van-tag
                  :type="getOpportunityTypeTagType(opportunity.type)"
                  :size="'small' as any"
                  class="opportunity-type-tag"
                >
                  {{ opportunity.type }}
                </van-tag>
              </div>
              <div class="opportunity-status-wrapper">
                <van-tag
                  :type="getOpportunityStatusType(opportunity.status)"
                  :size="'small' as any"
                >
                  {{ opportunity.status }}
                </van-tag>
                <van-tag
                  v-if="opportunity.pushStatus"
                  :type="getPushStatusType(opportunity.pushStatus)"
                  :size="'small' as any"
                  class="push-status-tag"
                >
                  {{ opportunity.pushStatus }}
                </van-tag>
              </div>
            </div>
            <div class="opportunity-info">
              <div class="info-row">
                <span class="label">触发规则：</span>
                <span class="value">{{ opportunity.triggerRule }}</span>
              </div>
              <div v-if="opportunity.salesConsultant" class="info-row">
                <span class="label">销售顾问：</span>
                <span class="value">{{ opportunity.salesConsultant }}</span>
              </div>
              <div class="info-row">
                <span class="label">优先级：</span>
                <van-tag
                  :type="getPriorityType(opportunity.priority)"
                  :size="'small' as any"
                  class="priority-tag"
                >
                  {{ opportunity.priority }}
                </van-tag>
              </div>
              <div v-if="opportunity.pushTarget" class="info-row">
                <span class="label">推送目标：</span>
                <span class="value">{{ formatPushTarget(opportunity.pushTarget) }}</span>
              </div>
              <div class="info-row">
                <span class="label">创建时间：</span>
                <span class="value">{{ opportunity.createTime }}</span>
              </div>
              <template v-if="opportunity.description">
                <div
                  v-for="(item, index) in parseOpportunityDescription(opportunity.description)"
                  :key="index"
                  class="info-row"
                >
                  <span class="label">{{ item.label }}：</span>
                  <span class="value">{{ item.value }}</span>
                </div>
              </template>
            </div>
          </div>
          <div v-if="!customerStore.opportunities || customerStore.opportunities.length === 0" class="empty-state">
            <van-empty description="暂无商机信息" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 车辆信息弹窗 -->
    <van-popup
      v-model:show="showVehicleDialog"
      position="bottom"
      :style="{ height: '76%' }"
      round
      lock-scroll
    >
      <div class="vehicle-dialog">
        <div class="popup-header">
          <div class="popup-header-main">
            <h3>车辆列表</h3>
            <span v-if="vehicleDialogSubtitle" class="popup-header-subtitle">{{ vehicleDialogSubtitle }}</span>
          </div>
          <div class="popup-header-actions">
            <van-icon name="cross" @click="showVehicleDialog = false" />
          </div>
        </div>
        <div class="popup-content">
          <div
            v-for="vehicle in vehiclesInVehicleDialog"
            :key="vehicle.id"
            class="vehicle-item-full"
          >
            <div class="vehicle-header">
              <div class="vehicle-main">
                <div class="vehicle-model">
                  {{ vehicle.vehicleModel }}
                  <span v-if="vehicle.vin" class="vehicle-vin">{{ vehicle.vin }}</span>
                </div>
              </div>
	              <div
	                class="vehicle-status-wrapper"
	                @click="editingVehicleStatusId = editingVehicleStatusId === vehicle.id ? null : vehicle.id"
	              >
                <van-tag
                  :type="getVehicleStatusType(vehicle.status)"
                  :size="'small' as any"
                  class="status-tag-clickable"
                >
                  {{ getVehicleStatusLabel(vehicle.status) }}
                </van-tag>
                <van-icon
                  name="arrow-down"
                  class="status-arrow-icon"
	                  :class="{ 'is-expanded': editingVehicleStatusId === vehicle.id }"
	                />
	              </div>
	            </div>
	            <!-- 在当前弹窗内直接选状态，禁止二次弹窗 -->
	            <div
	              v-if="editingVehicleStatusId === vehicle.id"
	              class="vehicle-status-inline-picker"
            >
              <div class="vehicle-status-inline-picker-title">修改车辆状态</div>
              <div class="vehicle-status-inline-tags">
                <span
                  v-for="opt in vehicleStatusOptions"
                  :key="opt.value"
                  class="vehicle-status-inline-tag"
                  :class="{ 'is-current': vehicle.status === opt.value }"
                  @click="handleVehicleStatusChange(vehicle.id, opt.value)"
                >
                  {{ opt.name }}
                </span>
              </div>
              <div class="vehicle-status-inline-cancel" @click="editingVehicleStatusId = null">取消</div>
            </div>
            <div class="vehicle-info">
              <div class="vehicle-detail">
                <!-- 相关人员：仅展示购车人/送修人，来源于销售/售后订单，同步后只读 -->
                <div class="vehicle-detail-section vehicle-detail-section-roles">
                  <div class="vehicle-detail-section-title">相关人员</div>
                  <div class="vehicle-detail-grid vehicle-person-grid">
                    <div class="vehicle-info-row detail-info" style="grid-column: 1 / -1; display: flex; flex-direction: row; align-items: baseline;">
                      <span class="label">购车人：</span>
                      <span class="value" style="margin-left: 4px;">{{ getVehicleBuyerDisplay(vehicle) }}</span>
                    </div>
                    
                    <div v-if="getVehicleRepairers(vehicle).length === 0" class="vehicle-info-row detail-info" style="grid-column: 1 / -1; display: flex; flex-direction: row; align-items: baseline;">
                      <span class="label">送修人：</span>
                      <span class="value vehicle-repairer-empty" style="margin-left: 4px;">暂无送修人</span>
                    </div>
                  </div>
                  
                  <div v-if="getVehicleRepairers(vehicle).length > 0" class="vehicle-repairer-section">
                    <div class="vehicle-info-row detail-info" style="margin-bottom: 8px; display: flex; flex-direction: row; align-items: baseline;">
                      <span class="label">送修人：</span>
                    </div>
                    <div class="vehicle-repairer-list" style="margin-top: -4px;">
                      <div
                        v-for="repairer in getVehicleRepairers(vehicle)"
                        :key="repairer.id"
                        class="vehicle-repairer-item"
                        style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 12px; border-radius: 10px; background: #f7f8fa;"
                      >
                        <span class="vehicle-repairer-name" style="font-size: 13px; font-weight: 600; color: #1f2937;">{{ repairer.name }}</span>
                        <span class="vehicle-repairer-phone" style="font-size: 12px; color: #6b7280;">{{ formatMobile(repairer.phone) }}</span>
                        <span v-if="repairer.isPreferred" class="vehicle-repairer-badge" style="padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; color: #0f766e; background: rgba(15, 118, 110, 0.12);">首选送修人</span>
                        <span v-if="repairer.orderNo" class="vehicle-repairer-order" style="font-size: 12px; color: #6b7280;">{{ repairer.orderNo }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="vehicle-detail-section">
                  <div class="vehicle-detail-section-title">车辆与合同</div>
                  <div class="vehicle-detail-grid">
                    <div v-if="vehicle.licensePlate" class="vehicle-info-row detail-info">
                      <span class="label">车牌号：</span>
                      <span class="value">{{ vehicle.licensePlate }}</span>
                    </div>
                    <div v-if="getRegistrationCityLabel(vehicle)" class="vehicle-info-row detail-info">
                      <span class="label">上牌城市：</span>
                      <span class="value">{{ getRegistrationCityLabel(vehicle) }}</span>
                    </div>
                    <div v-if="vehicle.purchaseDate" class="vehicle-info-row detail-info">
                      <span class="label">购买日期：</span>
                      <span class="value">{{ formatDateOnly(vehicle.purchaseDate) }}</span>
                    </div>
                    <div v-if="vehicle.source" class="vehicle-info-row detail-info">
                      <span class="label">来源：</span>
                      <span class="value">{{ vehicle.source }}</span>
                    </div>
                    <div v-if="vehicle.contractNo" class="vehicle-info-row detail-info">
                      <span class="label">合同号：</span>
                      <span class="value">{{ vehicle.contractNo }}</span>
                    </div>
                    <div v-if="vehicle.signStatus" class="vehicle-info-row detail-info">
                      <span class="label">签单状态：</span>
                      <span class="value">{{ vehicle.signStatus }}</span>
                    </div>
                    <div v-if="vehicle.submitTime" class="vehicle-info-row detail-info">
                      <span class="label">提交日期：</span>
                      <span class="value">{{ formatDateOnly(vehicle.submitTime) }}</span>
                    </div>
                    <div v-if="vehicle.signTime" class="vehicle-info-row detail-info">
                      <span class="label">签单日期：</span>
                      <span class="value">{{ formatDateOnly(vehicle.signTime) }}</span>
                    </div>
                    <div v-if="vehicle.issueCenter" class="vehicle-info-row detail-info">
                      <span class="label">发放中心：</span>
                      <span class="value">{{ vehicle.issueCenter }}</span>
                    </div>
                  </div>
                </div>

                <div class="vehicle-detail-section">
                  <div class="vehicle-detail-section-title">价格与项目</div>
                  <div class="vehicle-detail-grid">
                    <template v-if="hasVehiclePriceInfo(vehicle)">
                      <div v-if="vehicle.newCarMsrp != null" class="vehicle-info-row detail-info">
                        <span class="label">新车建议零售总价：</span>
                        <span class="value">¥{{ formatAmount(vehicle.newCarMsrp || 0) }}</span>
                      </div>
                      <div v-if="vehicle.newCarContractPrice != null" class="vehicle-info-row detail-info">
                        <span class="label">新车合同价：</span>
                        <span class="value">¥{{ formatAmount(vehicle.newCarContractPrice || 0) }}</span>
                      </div>
                      <div v-if="vehicle.nonCashDiscountAmount != null" class="vehicle-info-row detail-info">
                        <span class="label">非现金折扣金额：</span>
                        <span class="value">¥{{ formatAmount(vehicle.nonCashDiscountAmount || 0) }}</span>
                      </div>
                      <div v-if="vehicle.salesItemAmount != null" class="vehicle-info-row detail-info">
                        <span class="label">销售项目金额：</span>
                        <span class="value">¥{{ formatAmount(vehicle.salesItemAmount || 0) }}</span>
                      </div>
                      <div v-if="vehicle.salesItemName" class="vehicle-info-row detail-info">
                        <span class="label">销售项目名称：</span>
                        <span class="value">{{ vehicle.salesItemName }}</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="vehicle-info-row detail-info">
                        <span class="label">价格信息：</span>
                        <span class="value">暂无相关数据</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!vehiclesInVehicleDialog || vehiclesInVehicleDialog.length === 0" class="empty-state">
            <van-empty description="暂无车辆信息" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 资产信息弹窗（还原为简洁优惠券列表） -->
    <van-popup
      v-model:show="showAssetDialog"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="asset-dialog">
        <div class="popup-header">
          <h3>资产信息</h3>
          <van-icon name="cross" @click="showAssetDialog = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="asset in displayedAssets"
            :key="asset.id"
            class="asset-item"
          >
            <div class="card-header">
              <div class="record-title">{{ asset.name }}</div>
              <van-tag
                :type="getAssetStatusType(asset.status)"
                :size="'small' as any"
              >
                {{ asset.status }}
              </van-tag>
            </div>
            <div class="card-content">
              <div class="info-row-double">
                <div class="info-cell">
                  <span class="label">Commission：</span>
                  <span class="value">{{ asset.commissionNo || '—' }}</span>
                </div>
                <div class="info-cell">
                  <span class="label">新车车系：</span>
                  <span class="value">{{ asset.newCarSeries || '—' }}</span>
                </div>
              </div>
              <div class="info-row-double">
                <div class="info-cell">
                  <span class="label">新车车型：</span>
                  <span class="value">{{ asset.newCarModel || '—' }}</span>
                </div>
                <div class="info-cell">
                  <span class="label">车架号：</span>
                  <span class="value">{{ asset.vin || '—' }}</span>
                </div>
              </div>
              <div class="info-row-double">
                <div class="info-cell">
                  <span class="label">合同号：</span>
                  <span class="value">{{ asset.contractNo || '—' }}</span>
                </div>
                <div class="info-cell">
                  <span class="label">提交时间：</span>
                  <span class="value">{{ asset.submitTime || '—' }}</span>
                </div>
              </div>
              <div class="info-row-double">
                <div class="info-cell">
                  <span class="label">签单时间：</span>
                  <span class="value">{{ asset.signTime || '—' }}</span>
                </div>
                <div class="info-cell">
                  <span class="label">发放中心：</span>
                  <span class="value">{{ asset.issueCenter || '—' }}</span>
                </div>
              </div>
              <div class="info-row-double">
                <div class="info-cell">
                  <span class="label">附加套餐名称：</span>
                  <span class="value">{{ asset.packageName || '—' }}</span>
                </div>
                <div class="info-cell">
                  <span class="label">项目金额：</span>
                  <span class="value amount">{{ asset.itemAmount != null ? '¥' + formatAmount(asset.itemAmount) : '—' }}</span>
                </div>
              </div>
              <div class="info-row-single">
                <span class="label">项目来源：</span>
                <span class="value">{{ asset.itemSource || '—' }}</span>
              </div>
            </div>
          </div>
          <div v-if="!customerStore.assets || customerStore.assets.length === 0" class="empty-state">
            <van-empty description="暂无资产信息" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 标签管理弹窗（点击任意标签可操作所有标签） -->
    <van-popup
      v-model:show="showTagManager"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="tag-manager">
        <div class="popup-header">
          <h3>管理标签</h3>
          <van-icon name="cross" @click="showTagManager = false" />
        </div>
        <div class="popup-content tag-manager-content">
          <!-- 空状态：无真实数据且无 mock 时显示（effectiveTagPool 会 fallback 到 mock，通常不会空） -->
          <div v-if="effectiveTagPool.length === 0" class="empty-state">
            <van-empty description="标签数据加载中..." />
          </div>

          <div v-else>
            <!-- 已拥有标签（点击移除） -->
            <div class="tag-manager-section">
              <div class="tag-manager-section-title">
                <span>已拥有标签（点击移除）</span>
              </div>
              <div class="tag-manager-tag-list">
                <template v-if="selectedTagsInManager.length > 0">
                  <div
                    v-for="tagName in selectedTagsInManager"
                    :key="tagName"
                    class="tag-manager-tag selected"
                    @click="toggleTag(tagName)"
                  >
                    <span class="tag-manager-tag-text">{{ tagName }}</span>
                    <span class="tag-manager-tag-close">✕</span>
                  </div>
                </template>
                <div v-else class="tag-manager-empty-text">暂无已选标签</div>
              </div>
            </div>

            <!-- 标签池（点击添加，按分类展示） -->
            <div class="tag-manager-section">
              <div class="tag-manager-section-title">
                <span>标签池（点击添加）</span>
              </div>

              <template v-if="Object.keys(groupedTags).length > 0">
                <div
                  v-for="(tags, category) in groupedUnselectedTags"
                  :key="category"
                  class="tag-manager-category"
                >
                  <div class="tag-manager-category-title">
                    {{ category }}
                  </div>
                  <div class="tag-manager-tag-list tag-manager-tag-list--pool">
                    <template v-if="tags && tags.length">
                      <div
                        v-for="tag in tags"
                        :key="tag.id"
                        class="tag-manager-tag tag-manager-tag--pool"
                        @click="toggleTag(tag.name)"
                      >
                        <span class="tag-manager-tag-text">{{ tag.name }}</span>
                      </div>
                    </template>
                    <div v-else class="tag-manager-empty-text">
                      该分类暂无可添加标签
                    </div>
                  </div>
                </div>
              </template>

              <div v-else class="tag-manager-empty-text">暂无可添加标签</div>
            </div>
          </div>
        </div>
        <div class="popup-footer">
          <van-button
            type="default"
            size="large"
            @click="showTagManager = false"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="savingTags"
            @click="handleSaveTags"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 基础信息编辑弹窗 -->
    <van-popup
      v-model:show="showBasicInfoEditor"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="basic-info-editor">
        <div class="popup-header">
          <h3>编辑基础信息</h3>
          <van-icon name="cross" @click="showBasicInfoEditor = false" />
        </div>
        <div class="popup-content">
          <van-form ref="basicInfoFormRef" @submit="handleSaveBasicInfo">
            <van-field
              v-model="basicInfoForm.name"
              name="name"
              label="姓名"
              placeholder="请输入姓名"
              clearable
            />
            <van-field
              v-model="basicInfoForm.age"
              name="age"
              label="年龄"
              type="number"
              placeholder="请输入年龄"
              clearable
            />
            <!-- 手机号已在姓名卡片中管理，这里不再显示 -->
            <!-- 性别：仅能选择，单选展示（选中项高亮，避免被误读为「男女」） -->
            <div class="basic-info-field-row">
              <div class="field-label">性别</div>
              <div class="gender-options">
                <span
                  v-for="opt in GENDER_OPTIONS"
                  :key="opt"
                  class="gender-opt"
                  :class="{ active: basicInfoForm.gender === opt }"
                  @click="basicInfoForm.gender = opt"
                >{{ opt }}</span>
              </div>
            </div>
            <van-field
              v-model="basicInfoForm.city"
              name="city"
              label="城市"
              placeholder="请输入城市"
            />
            <!-- 地址（最多 4 条）：按排序体现优先级，可调整顺序或标记首选 -->
            <div class="basic-info-multi-section">
              <div class="multi-section-label">地址（最多4条）</div>
              <div v-for="(addr, idx) in basicInfoForm.addresses" :key="'addr-' + idx" class="multi-block">
                <div class="multi-row multi-row-with-tag">
                  <div class="inline-tags">
                    <span class="address-order-label">地址{{ idx + 1 }}</span>
                    <span
                      v-if="idx > 0"
                      class="address-order-link"
                      @click="moveAddressUp(idx)"
                    >
                      上移
                    </span>
                    <span
                      v-if="idx < basicInfoForm.addresses.length - 1"
                      class="address-order-link"
                      @click="moveAddressDown(idx)"
                    >
                      下移
                    </span>
                    <span
                      class="address-primary-chip"
                      :class="{ active: idx === 0 }"
                      @click="setPrimaryAddress(idx)"
                    >
                      首选
                    </span>
                  </div>
                  <span class="multi-remove" @click="removeBasicInfoAddress(idx)">删</span>
                </div>
                <div class="multi-row">
                  <van-field
                    :model-value="addr.address"
                    :placeholder="'请选择' + getAddressSlotMeta(addr.slotKey).label"
                    readonly
                    is-link
                    @click="toggleAreaInline(idx)"
                  />
                </div>
                <!-- 省市区内联（不二次弹窗） -->
                <div v-show="areaPickerEditIndex === idx && showAreaInline" class="area-inline-wrap">
                  <van-area
                    title="选择省市区"
                    :area-list="areaList"
                    :columns-num="3"
                    @confirm="onAreaConfirm"
                    @cancel="showAreaInline = false"
                  />
                </div>
              </div>
              <van-button
                size="small"
                type="primary"
                plain
                :disabled="basicInfoForm.addresses.length >= ADDRESS_SLOTS.length"
                @click="addBasicInfoAddress"
              >+ 添加地址</van-button>
            </div>
            <van-field
              v-model="basicInfoForm.reason"
              name="reason"
              label="更改理由"
              type="textarea"
              placeholder="请输入更改理由（必填）"
              rows="3"
              maxlength="200"
              show-word-limit
              :rules="[{ required: true, message: '请输入更改理由' }]"
            />
            <div class="edit-actions">
              <van-button
                type="default"
                size="large"
                native-type="button"
                @click="showBasicInfoEditor = false"
              >
                取消
              </van-button>
              <van-button
                type="primary"
                size="large"
                native-type="submit"
                :loading="savingBasicInfo"
                :disabled="savingBasicInfo"
              >
                提交
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import C360Field from '@/components/C360Field.vue'
import Maintenance from '@/views/Maintenance.vue'
import MaintenanceRecords from '@/views/MaintenanceRecords.vue'
import CommunicationRecords from '@/views/CommunicationRecords.vue'
import MarketingCampaigns from '@/views/MarketingCampaigns.vue'
import FinancialLoan from '@/views/FinancialLoan.vue'
import ConflictResolver from '@/components/business/ConflictResolver.vue'
import PlatformFlow from '@/components/business/PlatformFlow.vue'
import MobileEditor from '@/components/business/MobileEditor.vue'
import OperationLogDialog from '@/components/business/OperationLogDialog.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { areaList } from '@/utils/areaData'
import { customerApi } from '@/api/customer'
import type { TagPool, OneIdOption, MobileData, MobileItem, VehicleRelation } from '@/api/customer'
// 导入 Lucide 图标
import { Phone, CarFront, Ticket, Tag, UserCircle, Edit2 } from 'lucide-vue-next'

const customerStore = useCustomerStore()
const activeTab = ref('maintenance')
const showTagSelector = ref(false)
const showTagManager = ref(false)
const showPreferredCarTagSelector = ref(false)
const selectedPreferredCarTags = ref<string[]>([])
const savingPreferredCarTags = ref(false)
const showConflictResolver = ref(false)
const showPlatformFlow = ref(false)
const showMobileManager = ref(false)
/** 打开号码管理弹窗时直接编辑的条目 id（与当前 tab 关联，点哪条就编辑哪条） */
const mobileEditorEditItemId = ref<string | null>(null)
// 全部 tab 下保留完整「管理电话号码」弹窗；选中某身份（如李芳）时点编辑只显示红框表单
const openMobileEditorForItem = (itemId: string) => {
  const items =
    customerStore.profile?.mobile && 'items' in customerStore.profile.mobile
      ? (customerStore.profile.mobile as MobileData).items
      : []
  const target = items.find(item => item.id === itemId)
  if (target?.readonly) {
    showToast('送修人信息由售后订单同步，当前不可修改')
    return
  }
  mobileEditorEditItemId.value = selectedPersonalIdentityId.value ? itemId : null
  showMobileManager.value = true
}
const showBasicInfoEditor = ref(false)
// 个人视图下选中的身份（车主/送修人/联系人等不同人）：按 mobile.item.id 区分，选谁显示谁的联系方式与档案
const selectedPersonalIdentityId = ref<string | null>(null)
const savingBasicInfo = ref(false)
const showOperationLogDialog = ref(false)
const operationLogsLoading = ref(false)
const showOpportunityDialog = ref(false)
const showVehicleDialog = ref(false)
const showAssetDialog = ref(false)
// 车辆「相关人员」设置：在车辆信息弹窗内为某车某角色选择关联号码（内联展示，不二次弹窗）
const editingVehicleRole = ref<{ vehicle: any; role: string } | null>(null)
const showSyncInfoPopover = ref(false)
const syncTime = ref('2026-03-01 06:00')

// 模拟平台同步状态
const platformSyncStatus = ref([
  { name: 'DMS系统', status: 'success' },
  { name: 'BDC系统', status: 'success' },
  { name: 'Voucher系统', status: 'success' },
  { name: '手工上传', status: 'success' }
])

// 是否整体健康：
// - 仅核心系统（DMS / BDC）异常时才判定为不健康
// - 非核心系统（Voucher / 手工上传）异常时，图标仍保持绿色，靠弹窗明细查看
const isSyncHealthy = computed(() => {
  const criticalSystems = ['DMS系统', 'BDC系统']
  return !platformSyncStatus.value.some(
    (s) => criticalSystems.includes(s.name) && s.status === 'error'
  )
})

const router = useRouter()
const route = useRoute()

// 手机号搜索多 OneId：列表与当前选中
const oneIdList = ref<OneIdOption[]>([])
const oneIdListLoading = ref(false)
const hasMultipleOneIds = computed(() => oneIdList.value.length > 1)
// 手机号搜索无结果：有 phone 参数、已拉完列表且为空
const isOneIdEmptyState = computed(
  () => !!route.query.phone && !oneIdListLoading.value && oneIdList.value.length === 0
)
// 手机号搜索拉取 OneId 列表中
const isOneIdLoadingState = computed(() => !!route.query.phone && oneIdListLoading.value)
// 超过 4 个 OneId 时用下拉列表展示，避免顶部栏过长
const useOneIdDropdown = computed(() => oneIdList.value.length > 4)
const showOneIdSheet = ref(false)
const oneIdSheetActions = computed(() =>
  oneIdList.value.map(opt => ({
    name: opt.name,
    subname: `${opt.type === 'company' ? '企业' : '个人'} · ONEID: ${opt.oneId}`,
  }))
)
const onOneIdSheetSelect = (_item: { name: string }, index: number) => {
  showOneIdSheet.value = false
  const opt = oneIdList.value[index]
  if (opt) switchOneId(opt)
}

// 空状态：点击后弹出本次搜索使用的手机号，便于用户确认是否输错
const handleEmptyCheckPhone = () => {
  const phone = route.query.phone as string
  if (phone) {
    showToast(`本次搜索手机号：${decodeURIComponent(phone)}`)
  }
}
const activeOneId = computed(() => {
  const q = route.query.oneId
  const qStr = Array.isArray(q) ? q[0] : q
  if (qStr) return qStr
  if (oneIdList.value.length > 0) return oneIdList.value[0].oneId
  return undefined
})
const currentOneIdOption = computed(() =>
  oneIdList.value.find(o => o.oneId === activeOneId.value) || null
)
// 当前应加载的 customerId：多 OneId 模式用 oneId，否则用 type
const currentCustomerIdForLoad = computed(() => {
  if (hasMultipleOneIds.value && activeOneId.value) return activeOneId.value
  if (route.query.type === 'company') return 'COMP001'
  return undefined
})

const switchOneId = (opt: OneIdOption) => {
  if (opt.oneId === activeOneId.value) return
  const query = { ...route.query, oneId: opt.oneId } as Record<string, string>
  if (!query.phone) query.phone = (route.query.phone as string) || ''
  showLoadingToast({ message: '切换中...', forbidClick: true, duration: 0 })
  router.replace({ query }).then(() => {
    loadAllData(opt.oneId).then(() => closeToast())
  })
}

// 悬浮球拖拽逻辑
const floatingPos = ref({ x: 0, y: 200 })
const isDragging = ref(false)
let startY = 0
let initialY = 0

const onTouchStart = (e: TouchEvent) => {
  isDragging.value = false
  startY = e.touches[0].clientY
  initialY = floatingPos.value.y
}

const onTouchMove = (e: TouchEvent) => {
  const moveY = e.touches[0].clientY - startY
  if (Math.abs(moveY) > 5) {
    isDragging.value = true
    let newY = initialY + moveY
    // 限制范围
    const h = window.innerHeight
    if (newY < 80) newY = 80
    if (newY > h - 120) newY = h - 120
    floatingPos.value.y = newY
  }
}

const onTouchEnd = () => {
  // 延迟重置拖拽状态，让 click 事件能够正确识别距离上一次移动的时间
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

const handleToggleClick = () => {
  if (!isDragging.value) {
    toggleAccountType()
  }
}

// 切换账户类型
const toggleAccountType = () => {
  if (customerStore.loading) return
  
  const currentIsCompany = route.query.type === 'company'
  const newType = currentIsCompany ? 'personal' : 'company'
  
  showLoadingToast({
    message: `切往${newType === 'company' ? '公司' : '个人'}...`,
    forbidClick: true,
    duration: 0 // 持续显示直到手动关闭
  })
  
  router.push({ query: { type: newType } }).then(() => {
    console.log('[Home] 路由跳转完成:', newType)
  })
}

const loadAllData = async (customerId?: string) => {
  console.log('[Home] loadAllData, customerId:', customerId)
  
  // 先清空一些关键数据，避免切换时看到旧数据
  customerStore.profile = null
  
  try {
    await customerStore.fetchProfile(customerId)
    await customerStore.fetchTagPool()
    
    // 并行拉取其他所有关联数据
    await Promise.all([
      customerStore.fetchTransactions(customerId),
      customerStore.fetchVehicles(customerId),
      customerStore.fetchAssets(customerId), // 强制重新获取
      customerStore.fetchAppointments(customerId),
      customerStore.fetchPlatformSources(customerId),
      customerStore.fetchOpportunities(customerId),
      customerStore.fetchOperationLogs(customerId),
      customerStore.fetchFinancialLoanRecordsPage(1, 10, customerId),
    ])
  } catch (error) {
    console.error('[Home] 数据加载失败:', error)
  }
}

// 监听路由参数变化（type 或 oneId），实现无刷新切换
watch(
  () => ({ type: route.query.type, oneId: route.query.oneId }),
  ({ type, oneId }) => {
    // 手机号入口且尚未确定 oneId 时先不加载，等 onMounted 拉取列表并设置 oneId 后再加载
    if (route.query.phone && !oneId) return
    const oneIdStr = Array.isArray(oneId) ? oneId[0] : oneId
    const customerId: string | undefined = oneIdStr || (type === 'company' ? 'COMP001' : undefined)
    console.log('[Home] Watch 监听到变化:', { type, oneId, customerId })
    loadAllData(customerId).then(() => closeToast())
  },
  { immediate: true }
)
// 地址只保留地址1-地址4，通过排序体现优先级
const ADDRESS_SLOTS = [
  { key: 'address1', label: '地址1' },
  { key: 'address2', label: '地址2' },
  { key: 'address3', label: '地址3' },
  { key: 'address4', label: '地址4' },
] as const
const DEFAULT_ADDRESS_SLOT = ADDRESS_SLOTS[0]
const getAddressSlotMeta = (slotKey?: string) =>
  ADDRESS_SLOTS.find(slot => slot.key === slotKey) || DEFAULT_ADDRESS_SLOT
// 性别仅能选择（仅允许「男」「女」，避免展示成「男女」等异常值）
const GENDER_OPTIONS = ['男', '女'] as const
const normalizeGender = (val: string): string => {
  const v = String(val || '').trim()
  if (v === '男' || v === '女') return v
  if (/男/.test(v)) return '男'
  if (/女/.test(v)) return '女'
  return ''
}

const basicInfoFormRef = ref()
const basicInfoForm = ref({
  name: '',
  age: '',
  mobile: '',
  gender: '',
  city: '',
  addresses: [] as { address: string; label: string; slotKey: string }[],
  reason: '',
})

const showQuickAccountToggle = computed(() => false)

const COMPANY_RELATION_TAGS = ['公司电话', '公司总机', '采购联系人', '财务联系人', '行政联系人', '其他公司关系', '售后送修人']
const getProfileMobileItems = () => {
  const mobile = customerStore.profile?.mobile
  if (!mobile || !('items' in mobile)) return [] as MobileItem[]
  return (mobile as MobileData).items
}
const getVehicleBuyerCandidate = () => {
  const profileName = String(customerStore.profile?.name?.value || '')
  for (const vehicle of customerStore.vehicles || []) {
    const buyer = vehicle.relatedPersons?.find(person => person.role === '购车人' && person.name && person.name !== profileName)
    if (buyer) return buyer
  }
  return null
}

// 手机号或座机：11位手机 / 带区号座机(0开头10-11位) / 7-8位本地
const isPhoneOrLandline = (val: string) => /^(1[3-9]\d{9}|0\d{2,3}\d{7,8}|\d{7,8})$/.test((val || '').replace(/[\s-]/g, ''))
const mobileRules = [
  { required: true, message: '请输入手机号或座机号' },
  { validator: (val: string) => isPhoneOrLandline(val), message: '手机号或座机号格式不正确' },
]

// 客户类型相关：多 OneId 时由选中项类型决定，否则由路由 type 或 profile 决定
const isCompanyByRoute = computed(() => route.query.type === 'company')
const isCompanyByOneId = computed(() => currentOneIdOption.value?.type === 'company')
const hasCompanyFields = computed(() => {
  const profile = customerStore.profile
  if (!profile) return false
  if (profile.customerType?.value === '公司') return true
  if ((profile.handlers?.length ?? 0) > 0) return true
  return getProfileMobileItems().some(item => COMPANY_RELATION_TAGS.includes(item.relationTagName || ''))
})

const isCompany = computed(() => {
  if (hasCompanyFields.value) return true
  if (hasMultipleOneIds.value && currentOneIdOption.value)
    return currentOneIdOption.value.type === 'company'
  return isCompanyByRoute.value
})

const customerTypeText = computed(() => {
  return isCompany.value ? '公司' : '个人'
})

const customerTypeIcon = computed(() => {
  return isCompany.value ? 'shop-o' : 'user-o'
})

// 公司视图：经办人列表
const companyHandlers = computed(() => customerStore.profile?.handlers || [])

const companyBuyerIdentity = computed(() => {
  const items = getProfileMobileItems()
  const buyerItem = items.find(item => item.personRole === '购车人' || item.businessTags?.includes('购车人'))
  if (buyerItem) return buyerItem
  const vehicleBuyer = getVehicleBuyerCandidate()
  if (vehicleBuyer) {
    return {
      id: vehicleBuyer.id,
      contactName: vehicleBuyer.name,
      mobile: vehicleBuyer.phone,
      personRole: '购车人',
    } as MobileItem
  }
  return null
})

const companyPrimaryContact = computed(() => {
  const handlers = customerStore.profile?.handlers || []
  return handlers.find(handler => handler.isPrimaryContact) || handlers[0] || null
})

const companyPortraitHandler = computed(() => {
  const handlers = customerStore.profile?.handlers || []
  if (!isCompany.value || handlers.length === 0) return null
  const buyerName = companyBuyerIdentity.value?.contactName
  if (buyerName) {
    const matched = handlers.find(handler => handler.name === buyerName)
    if (matched) return matched
  }
  return handlers.find(handler => handler.role === '购车人') || companyPrimaryContact.value
})

const companyDisplayName = computed(() => (isCompany.value ? String(customerStore.profile?.name?.value || '') : ''))
const companyPrimaryContactName = computed(() => companyPrimaryContact.value?.name || '')

// 当前画像主体对象：公司类型下优先使用选中的经办人（selectedHandlerId），无则回退到购车人/首选联系人
const selectedHandler = computed(() => {
  if (!isCompany.value) return null
  const handlers = customerStore.profile?.handlers || []
  const selectedId = customerStore.profile?.selectedHandlerId
  if (selectedId && handlers.length > 0) {
    const found = handlers.find(h => h.id === selectedId)
    if (found) return found
  }
  return companyPortraitHandler.value
})

// 个人视图下的「身份」列表：按人分组，同一联系人（同一 contactName）只占一个 Tab，一人多号时选中该 Tab 展示该人全部号码
const personalIdentities = computed(() => {
  const profile = customerStore.profile
  if (isCompany.value || !profile?.mobile || !('items' in profile.mobile)) return []
  const items = (profile.mobile as MobileData).items
  const personKey = (item: MobileItem) => item.contactName || item.relationTagName || item.id
  const groups = new Map<string, MobileItem[]>()
  for (const item of items) {
    const key = personKey(item)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  return Array.from(groups.entries()).map(([key, groupItems]) => {
    const first = groupItems[0]
    return {
      id: first.id,
      label: first.contactName || first.relationTagName || (first.mobile ? `尾号${String(first.mobile).slice(-4)}` : ''),
      role: first.businessTags?.[0] || '',
      isBuyer: groupItems.some(item => item.personRole === '购车人' || item.businessTags?.includes('购车人')),
      isPreferredRepairer: groupItems.some(item => item.isPreferredRepairer),
    }
  })
})

// 个人视图下当前选中的身份对应的 mobile 项（用于姓名、角色提示）
const selectedPersonalIdentity = computed(() => {
  if (isCompany.value || !selectedPersonalIdentityId.value) return null
  const profile = customerStore.profile
  if (!profile?.mobile || !('items' in profile.mobile)) return null
  return (profile.mobile as MobileData).items.find((i: MobileItem) => i.id === selectedPersonalIdentityId.value) || null
})

// 监听 personalIdentities 的变化，如果没有选中项则默认选中第一项
watch(personalIdentities, (newVal) => {
  if (newVal.length > 0 && !selectedPersonalIdentityId.value) {
    selectedPersonalIdentityId.value = newVal[0].id
  }
}, { immediate: true })

// 当前画像主体姓名：公司=购车人/首选联系人；个人=始终使用画像主数据（不随任何 Tab / Chip 联动）
const currentAgentName = computed(() => {
  if (isCompany.value) {
    return companyPortraitHandler.value?.name || companyBuyerIdentity.value?.contactName || '—'
  }
  return String(customerStore.profile?.name?.value || 'XX')
})

// 联系人档案区展示的年龄/性别/城市（公司=购车人/首选联系人；个人=画像主数据，与身份 Chip 选谁一致时后续可接按身份扩展）
const contactProfileAge = computed(() => {
  if (isCompany.value && companyPortraitHandler.value?.age != null) return companyPortraitHandler.value.age
  return customerStore.profile?.age?.value ?? '未知'
})
const contactProfileGender = computed(() => {
  if (isCompany.value && companyPortraitHandler.value?.gender != null) return companyPortraitHandler.value.gender
  return customerStore.profile?.gender?.value ?? '未知'
})
const contactProfileCity = computed(() => {
  if (isCompany.value && companyPortraitHandler.value?.city != null) return companyPortraitHandler.value.city
  return customerStore.profile?.city?.value ?? '未知'
})

const showPreferredPersonAction = computed(() => {
  return !!selectedPersonalIdentity.value && (selectedPersonalIdentity.value.personRole === '送修人' || selectedPersonalIdentity.value.businessTags?.includes('送修人'))
})

const isSelectedPreferredPerson = computed(() => !!selectedPersonalIdentity.value?.isPreferredRepairer)

const preferredPersonActionLabel = computed(() => '首选送修人')
const preferredPersonActionCta = computed(() => '标记为首选送修人')

const markSelectedPersonAsPreferred = () => {
  const profile = customerStore.profile
  if (!profile) return
  if (!profile.mobile || !('items' in profile.mobile) || !selectedPersonalIdentity.value) return
  const items = (profile.mobile as MobileData).items
  const selectedKey =
    selectedPersonalIdentity.value.contactName ||
    selectedPersonalIdentity.value.relationTagName ||
    selectedPersonalIdentity.value.id
  items.forEach(item => {
    const itemKey = item.contactName || item.relationTagName || item.id
    item.isPreferredRepairer = itemKey === selectedKey && (item.personRole === '送修人' || item.businessTags?.includes('送修人'))
  })
  showToast('已更新首选送修人')
}

// 当前显示的 ONEID（公司归属）
const currentAgentId = computed(() => {
  const profile = customerStore.profile
  if (!profile) return 'C001'
  // 公司与个人统一使用画像主体的 id 作为 ONEID
  return profile.id || 'C001'
})

// 格式化手机号：13800138000 -> 138 0013 8000
const formatMobile = (mobile: string): string => {
  if (!mobile) return ''
  // 移除所有空格
  const cleaned = mobile.replace(/\s/g, '')
  // 如果是11位数字，格式化为 138 0013 8000
  if (/^\d{11}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }
  // 否则保持原样
  return mobile
}

const isLoanExpiring = computed(() => {
  return customerStore.financialLoanRecords.some(r => r.status === '即将到期')
})

// 画像标签（包含动态计算的“贷款客户”；公司视图不随经办人切换）
const portraitTags = computed(() => {
  const profileTags = customerStore.profile?.tags || []
  const tags = [...profileTags]
  if (customerStore.financialLoanRecords.length > 0 && !tags.includes('贷款客户')) {
    tags.push('贷款客户')
  }
  return tags
})

// 地址（多个）：来自画像
const displayedAddresses = computed(() => customerStore.profile?.addresses?.items ?? [])

// 地址/邮箱标签摘要（用于首屏展示，便于区分家庭、公司、工作等）
const displayedAddressLabels = computed(() => {
  const labels = displayedAddresses.value.map((item) => {
    const meta = getAddressSlotMeta(item.slotKey)
    return `${meta.label}`
  }).filter(Boolean)
  return labels.length > 0 ? labels.join('、') : ''
})

// 画像标签来源：区分系统自动 vs 手工维护（当前仅“贷款客户”为前端自动标签）
const autoPortraitTagNames = computed(() => {
  const names: string[] = []
  if (customerStore.financialLoanRecords.length > 0) {
    names.push('贷款客户')
  }
  return Array.from(new Set(names))
})

const isAutoPortraitTag = (tag: string): boolean => {
  return autoPortraitTagNames.value.includes(tag)
}

// 公司视图：切换经办人
const onSelectHandler = (handlerId: string) => {
  if (!handlerId || !isCompany.value) return
  customerStore.setHandler(handlerId)
}

// 判断号码项是否属于当前选中的经办人（公司视图下：选谁显示谁的联系方式）
const isItemBelongToSelectedHandler = (item: MobileItem, handler: { name?: string; mobile?: string }): boolean => {
  if (!handler) return false
  const nameMatch = (item.contactName && item.contactName === handler.name) ||
    (item.relationTagName && item.relationTagName === handler.name)
  const mobileMatch = handler.mobile && String(item.mobile).trim() === String(handler.mobile).trim()
  return Boolean(nameMatch || mobileMatch)
}

// 电话相关：首页卡片与「管理电话号码」弹窗共用 profile.mobile，保证两处显示一致
// 公司视图：切换经办人时只显示「当前经办人」对应的联系方式，满足「使用人/联系人/送修人不同则显示不同联系信息」
const displayedPhones = computed(() => {
  const profile = customerStore.profile
  if (!profile) return []

  // 优先使用 profile.mobile.items（与弹窗编辑的数据源一致）
  if (profile.mobile && 'items' in profile.mobile) {
    let items = (profile.mobile as MobileData).items
    // 个人视图且已选身份：展示该联系人全部号码（一人多号时都展示），按优先级排序，不限制条数
    if (!isCompany.value && selectedPersonalIdentityId.value) {
      const selectedItem = items.find((item: MobileItem) => item.id === selectedPersonalIdentityId.value)
      if (selectedItem) {
        const personKey = selectedItem.contactName || selectedItem.relationTagName || selectedItem.id
        items = items.filter((item: MobileItem) => (item.contactName || item.relationTagName || item.id) === personKey)
      }
    }
    // 公司视图且已选经办人：只展示属于当前经办人的号码（及公司级主号），实现「选谁显示谁」
    if (isCompany.value && selectedHandler.value) {
      const handler = selectedHandler.value
      if (handler) {
        const handlerItems = items.filter((item: MobileItem) => isItemBelongToSelectedHandler(item, handler))
        // 公司电话可与当前经办人号码同时展示；若无匹配项则置空以走下方「经办人电话」回退
        if (handlerItems.length > 0) {
          const companyPhone = items.find((item: MobileItem) => ['公司电话', '公司总机'].includes(item.relationTagName || ''))
          const combined = companyPhone && !handlerItems.some((i: MobileItem) => i.id === companyPhone.id)
            ? [companyPhone, ...handlerItems]
            : handlerItems
          items = combined
        } else {
          items = [] // 无匹配时交给下方回退逻辑，显示 handler.mobile
        }
      }
    }

    if (items.length > 0) {
      // 按客户类型 + 业务角色（车主 / 送修人 / 联系人）计算联系优先级
      const itemsWithMeta = items.map((item, index) => {
        const businessTags = item.businessTags || []
        const isBuyer = businessTags.includes('购车人')
        const isRepairer = businessTags.includes('送修人')
        const isContact = businessTags.includes('联系人')

        let priority = 99

        if (!isCompany.value) {
          if (item.isPreferredRepairer) {
            priority = 1
          } else if (isBuyer) {
            priority = 2
          } else if (item.isPrimary) {
            priority = 3
          } else if (isRepairer || isContact) {
            priority = 4
          } else {
            priority = 5
          }
        } else {
          if (isBuyer) {
            priority = 1
          } else if (item.isPrimaryContact) {
            priority = 2
          } else if (item.isPreferredRepairer) {
            priority = 3
          } else if (isContact) {
            priority = 4
          } else if (item.isPrimary) {
            priority = 5
          } else if (isRepairer) {
            priority = 6
          } else {
            priority = 7
          }
        }

        return {
          ...item,
          formattedMobile: formatMobile(item.mobile),
          _priority: priority,
          _index: index,
        }
      })

      const sorted = itemsWithMeta.sort((a, b) => {
        if (a._priority !== b._priority) return a._priority - b._priority
        return a._index - b._index
      })

      // 默认视图：最多展示 2 条；已选某联系人时展示该人全部号码（一人多号不截断）
      const limit = !isCompany.value && selectedPersonalIdentityId.value ? undefined : 2
      const result = limit != null ? sorted.slice(0, limit) : sorted
      return result.map(({ _priority, _index, ...rest }) => rest)
    }
  }

  // 兼容：无 profile.mobile 或无匹配项时，企业视图回退到经办人电话 + 车辆标签
  if (isCompany.value && selectedHandler.value) {
    const handler = selectedHandler.value
    if (handler?.mobile) {
      const vehicleDescriptors: string[] = []
      if (Array.isArray((handler as any).vehicles)) {
        ;(handler as any).vehicles.forEach((v: any) => {
          const desc = v?.vehicleModel || v?.licensePlate
          if (desc) vehicleDescriptors.push(String(desc))
        })
      }
      const businessTags: string[] = []
      if (vehicleDescriptors.length > 0) {
        businessTags.push(...vehicleDescriptors.slice(0, 2))
      }
      return [{
        id: 'handler_mobile_' + handler.id,
        mobile: handler.mobile,
        isPrimary: true,
        relationTagName: '经办人电话',
        businessTags,
        formattedMobile: formatMobile(handler.mobile)
      }]
    }
  }

  return []
})

const hasMorePhones = computed(() => {
  if (!customerStore.profile?.mobile || !('items' in customerStore.profile.mobile)) {
    return false
  }
  const items = (customerStore.profile.mobile as MobileData).items
  // 只要有电话号码就显示"更多"按钮，让用户可以管理号码
  return items.length > 0
})

// 默认 tab 下只展示 2 条号码，多于 2 条时显示「查看更多」入口，点击打开全部联系电话弹窗进行查看/编辑
const showMorePhonesLink = computed(() => {
  if (!customerStore.profile?.mobile || !('items' in customerStore.profile.mobile)) return false
  const items = (customerStore.profile.mobile as MobileData).items
  return items.length > 0
})

const openMobileEditorForAll = () => {
  mobileEditorEditItemId.value = null
  showMobileManager.value = true
}

// 商机类型列表（从opportunities中提取所有类型）
const opportunityTypeList = computed(() => {
  if (!customerStore.opportunities || customerStore.opportunities.length === 0) {
    return []
  }
  const types = customerStore.opportunities.map(opp => opp.type)
  return Array.from(new Set(types)) // 去重
})

// 商机列表（支持多条，从 sources 中提取或使用 value）
const opportunityList = computed(() => {
  const opportunityType = customerStore.profile?.opportunityType
  if (!opportunityType) return []
  
  // 如果有 sources，提取所有不同的值
  if (opportunityType.sources && opportunityType.sources.length > 0) {
    const values = opportunityType.sources.map(s => String(s.value))
    // 去重并保持顺序
    return Array.from(new Set(values))
  }
  
  // 否则使用主值
  return opportunityType.value ? [String(opportunityType.value)] : []
})

// 所有显示的资产（响应经办人切换）
const displayedAssets = computed(() => {
  return selectedHandler.value?.assets || customerStore.assets || []
})

// 最近到期的优惠券
const nearestExpiringAsset = computed(() => {
  const assets = displayedAssets.value
  if (!assets || assets.length === 0) {
    return null
  }
  // 按到期日期排序，取最近的一个
  const sorted = [...assets].sort((a, b) => {
    const dateA = new Date(a.validTo).getTime()
    const dateB = new Date(b.validTo).getTime()
    return dateA - dateB
  })
  return sorted[0]
})

const getVehicleRelatedPersons = (vehicle: VehicleRelation) => vehicle.relatedPersons || []
const getVehicleBuyerDisplay = (vehicle: VehicleRelation): string => {
  const buyer = getVehicleRelatedPersons(vehicle).find(person => person.role === '购车人')
  if (!buyer) return '暂无购车人'
  return `${buyer.name} ${formatMobile(buyer.phone)}`
}
const getVehicleRepairers = (vehicle: VehicleRelation) =>
  getVehicleRelatedPersons(vehicle).filter(person => person.role === '送修人')

// ========== 车辆角色逻辑（车-角色-人） ==========
// 规则：一人可关联多辆车、每车可担任多角色；数据存于 profile.vehicleRoleAssignments（vehicleId -> role -> mobileItemId），不占用 mobile.items。
// 首页「车辆信息」：默认/公司 tab 显示全部车；选「某人」tab 时只显示「跟这人有关」的车（即 vehicleRoleAssignments 里任一角为该人任一条目 id 的车）。
function ensureVehicleRoleAssignmentsMigrated() {
  const profile = customerStore.profile
  if (!profile || (profile as any).vehicleRoleAssignments != null) return
  if (!profile.mobile || !('items' in profile.mobile)) return
  const items = (profile.mobile as MobileData).items
  const vehicles = customerStore.vehicles || []
  const map: Record<string, Record<string, string>> = {}
  ;(profile as any).vehicleRoleAssignments = map
  for (const v of vehicles) {
    const vid = v.id
    for (const item of items) {
      const label = item.vehicleLabel || ''
      if (!label) continue
      const match = label === v.vehicleModel || label === v.licensePlate
      if (!match) continue
      const tags = item.businessTags || []
      for (const role of tags) {
        if (!['车主', '使用人', '联系人', '送修人'].includes(role)) continue
        if (!map[vid]) map[vid] = {}
        map[vid][role] = item.id
      }
    }
  }
}

/** 当前选中人对应的所有 mobile 条目 id（同一人可能多条号码，按 contactName/relationTagName 归为同一人） */
const selectedPersonItemIds = computed(() => {
  if (!selectedPersonalIdentityId.value) return []
  const profile = customerStore.profile
  if (!profile?.mobile || !('items' in profile.mobile)) return []
  const items = (profile.mobile as MobileData).items
  const selected = items.find((i: MobileItem) => i.id === selectedPersonalIdentityId.value)
  if (!selected) return []
  const key = selected.contactName || selected.relationTagName || selected.id
  return items.filter((i: MobileItem) => (i.contactName || i.relationTagName || i.id) === key).map((i: MobileItem) => i.id)
})

/** 在 vehicleRoleAssignments 中，至少有一个角色被赋给这些 itemId 之一的车辆 id 集合 */
const vehicleIdsLinkedToSelectedPerson = computed(() => {
  const profile = customerStore.profile
  if (!profile?.mobile || !('items' in profile.mobile) || !selectedPersonalIdentityId.value) return new Set<string>()
  const items = (profile.mobile as MobileData).items
  const selected = items.find((item: MobileItem) => item.id === selectedPersonalIdentityId.value)
  if (!selected) return new Set<string>()
  const selectedKey = selected.contactName || selected.relationTagName || selected.id
  const out = new Set<string>()
  items.forEach(item => {
    const itemKey = item.contactName || item.relationTagName || item.id
    if (itemKey !== selectedKey) return
    item.linkedVehicleIds?.forEach(id => out.add(id))
  })
  ;(customerStore.vehicles || []).forEach(vehicle => {
    const matched = vehicle.relatedPersons?.some(person => person.name === (selected.contactName || selected.relationTagName))
    if (matched) out.add(vehicle.id)
  })
  return out
})

/** 公司类型：当前选中的经办人（tab）在任意角色下关联的车辆 id 集合（含 companyVehicleRoleAssignments 与 legacy handler.vehicles） */
const vehicleIdsLinkedToSelectedHandler = computed(() => {
  const profile = customerStore.profile
  const handlerId = selectedHandler.value?.id
  if (!isCompany.value || !handlerId) return new Set<string>()
  const out = new Set<string>()
  const companyMap = (profile as any)?.companyVehicleRoleAssignments as Record<string, Record<string, string>> | undefined
  if (companyMap) {
    for (const [vehicleId, roles] of Object.entries(companyMap)) {
      if (roles && Object.values(roles).includes(handlerId)) out.add(vehicleId)
    }
  }
  const baseVehicles = customerStore.vehicles || []
  const h = profile?.handlers?.find((x: any) => x.id === handlerId)
  if (Array.isArray(h?.vehicles)) {
    baseVehicles.forEach((v: any) => {
      if (!h.vehicles.some((hv: any) => vehicleMatches(hv, v))) return
      if (v?.id) out.add(v.id)
      if (v?.vin) out.add(v.vin)
      if (v?.licensePlate) out.add(v.licensePlate)
    })
  }
  return out
})

/** 当前选中的这个人是否为「默认车主」（未在车-角色里显式设置时也视为车主，名下应显示全部车） */
const isSelectedPersonDefaultOwner = computed(() => {
  if (!selectedPersonalIdentityId.value) return false
  const profile = customerStore.profile
  if (!profile?.mobile || !('items' in profile.mobile)) return false
  const items = (profile.mobile as MobileData).items
  const selected = items.find((i: MobileItem) => i.id === selectedPersonalIdentityId.value)
  if (!selected) return false
  return selected.personRole === '购车人' || selected.businessTags?.includes('购车人') || false
})

// 根据车辆查找所有相关人员（使用人/联系人/送修人/车主）
// 优先从 profile.vehicleRoleAssignments（车-角色-人）取，同一人可多车多角；无则回退 mobile.items 或公司经办人
const getVehicleHandlers = (vehicle: any): any[] => {
  const profile = customerStore.profile
  if (!profile) return []

  const mobileData = profile.mobile
  const items = mobileData && typeof mobileData === 'object' && 'items' in mobileData ? (mobileData as any).items : []
  const needRoles = ['车主', '使用人', '联系人', '送修人']
  const pickedByRole = new Map<string, any>()

  const defaultOwnerName =
    (isCompany.value && profile.handlers?.[0]?.name) ||
    (Array.isArray(items) && items.length > 0 && (items[0].contactName || items[0].relationTagName)) ||
    (profile as any)?.name?.value ||
    '车主'

  // 公司类型：优先从「车-角色-经办人」映射取，支持一人多角色多车（车辆 key 与 onVehicleRoleSelect 一致：id > vin > licensePlate）
  const vehicleKeyForAssign = (v: any) => v?.id || v?.vin || v?.licensePlate || ''
  const companyAssignments = (profile as any).companyVehicleRoleAssignments as Record<string, Record<string, string>> | undefined
  const companyVehicleAssign = isCompany.value && companyAssignments?.[vehicleKeyForAssign(vehicle)]
  if (companyVehicleAssign && typeof companyVehicleAssign === 'object') {
    for (const role of needRoles) {
      const handlerId = companyVehicleAssign[role]
      if (handlerId && profile.handlers?.length) {
        const h = profile.handlers.find((x: any) => x.id === handlerId)
        pickedByRole.set(role, { role, name: h?.name || '暂无' })
      } else {
        pickedByRole.set(role, { role, name: role === '车主' ? defaultOwnerName : '暂无' })
      }
    }
    return Array.from(pickedByRole.values())
  }

  ensureVehicleRoleAssignmentsMigrated()
  const assignments = (profile as any).vehicleRoleAssignments as Record<string, Record<string, string>> | undefined
  const vehicleAssign = vehicle?.id && assignments?.[vehicle.id]
  if (vehicleAssign && typeof vehicleAssign === 'object') {
    for (const role of needRoles) {
      const itemId = vehicleAssign[role]
      if (itemId) {
        const item = items.find((i: any) => i.id === itemId)
        const name = item ? (item.contactName || item.relationTagName || (item.mobile ? `${String(item.mobile).slice(0, 3)}****${String(item.mobile).slice(-4)}` : '')) : '暂无'
        pickedByRole.set(role, { role, name: name || '暂无' })
      } else {
        // 该车已走「车-角色-人」映射但此角色未设置：车主显示默认车主名，其余显示暂无（避免设置使用人后车主被清空）
        pickedByRole.set(role, { role, name: role === '车主' ? defaultOwnerName : '暂无' })
      }
    }
    return Array.from(pickedByRole.values())
  }

  if (Array.isArray(items) && items.length > 0) {
    const vehicleLabel = vehicle.vehicleModel || vehicle.licensePlate || ''
    for (const item of items) {
      const label = item.vehicleLabel || ''
      const matchesVehicle = label && vehicleLabel && (label === vehicle.vehicleModel || label === vehicle.licensePlate || label === vehicleLabel)
      if (!matchesVehicle) continue
      const tags = item.businessTags || []
      for (const role of needRoles) {
        if (pickedByRole.has(role)) continue
        if (!tags.includes(role)) continue
        const displayName = item.contactName || item.relationTagName || (item.mobile ? `${String(item.mobile).slice(0, 3)}****${String(item.mobile).slice(-4)}` : '')
        pickedByRole.set(role, { role, name: displayName || '暂无' })
      }
    }
    if (pickedByRole.size > 0) return Array.from(pickedByRole.values())
  }

  // 公司类型且无 mobile.items 数据时：从经办人列表按车辆匹配
  if (isCompany.value && profile.handlers?.length) {
    const handlers = profile.handlers
    const related = handlers.filter(h =>
      Array.isArray(h.vehicles) &&
      h.vehicles.some((hv: any) =>
        (hv.vin && vehicle.vin && hv.vin === vehicle.vin) ||
        (hv.licensePlate && vehicle.licensePlate && hv.licensePlate === vehicle.licensePlate)
      )
    )
    if (related.length > 0) {
      const rolePriority: Record<string, number> = { '车主': 1, '使用人': 2, '联系人': 3, '送修人': 4 }
      const sorted = [...related].sort((a, b) => (rolePriority[a.role || ''] ?? 99) - (rolePriority[b.role || ''] ?? 99))
      for (const h of sorted) {
        const role = h.role || '其他'
        if (!pickedByRole.has(role)) pickedByRole.set(role, h)
      }
      return Array.from(pickedByRole.values())
    }
  }

  // 未配置相关人员时，车辆默认在车主名下，展示默认车主
  return [{ role: '车主', name: defaultOwnerName }]
}

// 车辆信息弹窗中需要固定展示的三个角色字段
// 车辆默认在车主名下，相关人员展示顺序：车主、使用人、联系人、送修人
const vehicleRoleLabels = ['车主', '使用人', '联系人', '送修人']

// 公司/个人视图：存在号码列表或（公司且有经办人）时均可设置「相关人员」——支持随时绑定或换人
const canEditVehicleRole = computed(() => {
  const profile = customerStore.profile
  const mobile = profile?.mobile
  const hasMobileItems = mobile && 'items' in mobile && (mobile as MobileData).items.length > 0
  const hasHandlers = isCompany.value && (profile?.handlers?.length ?? 0) > 0
  return hasMobileItems || hasHandlers
})

// 为「车辆-角色」选择关联号码时的选项（供 onVehicleRoleSelect 使用）；个人用户不展示「公司电话」
const vehicleRoleSheetActions = computed(() => {
  const base = [{ name: '暂无', value: '__none__' }]
  const profile = customerStore.profile
  const mobile = profile?.mobile
  if (!mobile || !('items' in mobile)) return base
  const items = (mobile as MobileData).items
  items.forEach((item: MobileItem) => {
    if (!isCompany.value && item.relationTagName === '公司电话') return
    const displayName = item.contactName || item.relationTagName || item.mobile || '号码'
    base.push({ name: displayName, value: item.id })
  })
  return base
})

// 业务角色名（仅用于判断 relationTagName 是否为人名：为人名则展示，为角色则展示脱敏号码）
const VEHICLE_ROLE_NAMES = ['使用人', '联系人', '送修人', '车主']
// 首屏号码区域仅展示的关系标签（本人、配偶、公司电话等），不展示人名如汪洁、张雪
const RELATION_TAGS_FOR_FIRST_SCREEN = ['本人', '配偶', '公司电话', '公司总机', '采购联系人', '财务联系人', '行政联系人']

// 选择区展示：暂无 + 可选人。公司=暂无+全部经办人+公司电话；个人=暂无+号码列表（不含公司电话）。支持随时绑定或换人
const vehicleRolePickerTags = computed(() => {
  const tags: { label: string; value: string; disabled: boolean }[] = [{ label: '暂无', value: '__none__', disabled: false }]
  const profile = customerStore.profile
  const mobile = profile?.mobile
  const ctx = editingVehicleRole.value

  // 公司类型：先加全部经办人（汪洁、张雪、周杰等），再加公司电话（来自 mobile.items）
  if (isCompany.value && profile?.handlers?.length) {
    profile.handlers.forEach((h: any) => {
      tags.push({ label: h.name || '经办人', value: `handler_${h.id}`, disabled: false })
    })
    if (mobile && 'items' in mobile) {
      const items = (mobile as MobileData).items
      items.forEach((item: MobileItem) => {
        if (item.relationTagName === '公司电话') {
          tags.push({ label: '公司电话', value: item.id, disabled: false })
        }
      })
    }
    return tags
  }

  // 个人类型：暂无 + 号码列表（不含公司电话）
  if (!mobile || !('items' in mobile)) return tags
  const items = (mobile as MobileData).items
  items.forEach((item: MobileItem) => {
    if (!isCompany.value && item.relationTagName === '公司电话') return
    const isRole = item.relationTagName && VEHICLE_ROLE_NAMES.includes(item.relationTagName)
    const label = item.contactName
      ? item.contactName + (item.relationTagName && !isRole ? ` (${item.relationTagName})` : '')
      : !isRole && item.relationTagName
        ? item.relationTagName
        : (item.mobile ? `${String(item.mobile).slice(0, 3)}****${String(item.mobile).slice(-4)}` : '号码')
    tags.push({ label, value: item.id, disabled: false })
  })
  return tags
})

// 根据车辆和角色名称，获取对应人员姓名（无则返回“暂无”）
const getVehicleRolePerson = (vehicle: any, role: string): string => {
  const handlers = getVehicleHandlers(vehicle)
  const matched = handlers.find(h => h.role === role)
  return matched?.name || '暂无'
}

// 判断是否为同一车辆（用于内联选择器展示）
const isSameVehicle = (v1: any, v2: any) =>
  v1 && v2 && (v1.id === v2.id || (v1.vin && v2.vin && v1.vin === v2.vin) || (v1.licensePlate && v2.licensePlate && v1.licensePlate === v2.licensePlate))

// 打开「为某车某角色设置关联号码」选择（在当前弹窗内展示，不二次弹窗）
const openVehicleRolePicker = (vehicle: any, role: string) => {
  editingVehicleRole.value = { vehicle, role }
}

// 判断车辆是否与当前车一致（vin 或 licensePlate）
const vehicleMatches = (v: any, vehicle: any) =>
  (v?.vin && vehicle?.vin && v.vin === vehicle.vin) || (v?.licensePlate && vehicle?.licensePlate && v.licensePlate === vehicle.licensePlate)

// 公司类型默认经办人（与 store 补全逻辑一致，用于点击时仍未注入的兜底）
const ensureCompanyHandlers = (profile: any) => {
  if (!profile || profile.customerType?.value !== '公司') return
  if (profile.handlers && profile.handlers.length > 0) return
  profile.handlers = [
    { id: 'H001', name: '汪洁', role: '使用人', mobile: '' },
    { id: 'H002', name: '张雪', role: '联系人', mobile: '' },
    { id: 'H003', name: '周杰', role: '送修人', mobile: '' },
  ]
  if (!profile.selectedHandlerId) profile.selectedHandlerId = 'H001'
}

/** 公司类型：根据「车-角色-经办人」映射重算每个经办人的 vehicles 列表，支持一人多车多角色 */
function syncCompanyHandlerVehiclesFromAssignments(profile: any) {
  if (!profile?.handlers?.length) return
  const companyMap = (profile as any).companyVehicleRoleAssignments as Record<string, Record<string, string>> | undefined
  const baseVehicles = customerStore.vehicles || []
  const keyOf = (v: any) => v?.id || v?.vin || v?.licensePlate || ''
  for (const h of profile.handlers) {
    const handlerId = h.id
    const vehicles: any[] = []
    if (companyMap) {
      for (const [vid, roles] of Object.entries(companyMap)) {
        if (!roles || !Object.values(roles).includes(handlerId)) continue
        const vehicle = baseVehicles.find((v: any) => keyOf(v) === vid)
        if (vehicle && !vehicles.some((v: any) => vehicleMatches(v, vehicle))) vehicles.push({ ...vehicle })
      }
    }
    h.vehicles = vehicles
  }
}

// 选择关联号码/经办人后：公司更新 handlers，个人更新 mobile.items
const onVehicleRoleSelect = async (action: { name: string; value: string }) => {
  const ctx = editingVehicleRole.value
  editingVehicleRole.value = null
  if (!ctx?.vehicle || !ctx.role) {
    showToast('请重新点击「设置」再选择')
    return
  }
  const profile = customerStore.profile
  const vehicle = ctx.vehicle
  const role = ctx.role

  showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 })
  try {
    if (action.value === '__none__') {
      // 清除该车该角色的绑定（车-角色-人映射或公司车-角色-经办人映射）
      if (isCompany.value && profile) {
        const companyMap = (profile as any).companyVehicleRoleAssignments as Record<string, Record<string, string>> | undefined
        const vid = (v: any) => v?.id || v?.vin || v?.licensePlate || ''
        const vehicleId = vid(vehicle)
        if (companyMap && vehicleId && companyMap[vehicleId]) {
          const next = { ...companyMap[vehicleId] }
          delete next[role]
          if (Object.keys(next).length === 0) {
            const nextMap = { ...companyMap }
            delete nextMap[vehicleId]
            ;(profile as any).companyVehicleRoleAssignments = nextMap
          } else {
            ;(profile as any).companyVehicleRoleAssignments = { ...companyMap, [vehicleId]: next }
          }
          syncCompanyHandlerVehiclesFromAssignments(profile)
          showToast('已清除关联')
        }
      } else {
        const map = (profile as any).vehicleRoleAssignments as Record<string, Record<string, string>> | undefined
        const vid = vehicle?.id
        if (map && vid && map[vid]) {
          delete map[vid][role]
          if (Object.keys(map[vid]).length === 0) delete map[vid]
          showToast('已清除关联')
        }
      }
      return
    }

    // 公司类型：选择经办人，写入「车-角色-经办人」映射（点击时若尚未有经办人列表则先补全，再执行）
    const vehicleKey = (v: any) => v?.id || v?.vin || v?.licensePlate || ''
    if (action.value.startsWith('handler_') && isCompany.value && profile) {
      ensureCompanyHandlers(profile)
      if (!profile.handlers?.length) {
        showToast('经办人列表加载异常，请刷新页面重试')
        return
      }
      const handlerId = action.value.slice(7)
      const handler = profile.handlers.find((h: any) => h.id === handlerId)
      if (!handler) {
        showToast('经办人不存在，请刷新重试')
        return
      }
      const vid = vehicleKey(vehicle)
      if (!vid) {
        showToast('车辆信息不完整，无法设置')
        return
      }
      // 仅更新「该车-该角色」为当前经办人，不触碰其他车/其他角色，支持一人多车多角色
      let companyMap = (profile as any).companyVehicleRoleAssignments as Record<string, Record<string, string>> | undefined
      if (!companyMap) {
        companyMap = {}
      }
      if (!companyMap[vid]) companyMap[vid] = {}
      companyMap[vid] = { ...companyMap[vid], [role]: handlerId }
      ;(profile as any).companyVehicleRoleAssignments = Object.fromEntries(
        Object.entries(companyMap).map(([k, v]) => [k, typeof v === 'object' && v !== null ? { ...v } : v])
      )
      syncCompanyHandlerVehiclesFromAssignments(profile)
      showToast('已设置关联')
      return
    }

    // 个人类型或选择的是号码条目：只写「车-角色-人」映射，不写 mobile.items，联系电话条数不变、同一人可多车多角
    if (!profile?.mobile || !('items' in profile.mobile)) {
      showToast('暂无可用联系人，请刷新后重试')
      return
    }
    const items = (profile.mobile as MobileData).items
    const selectedItem = items.find((i) => i.id === action.value)
    if (!selectedItem) {
      showToast('未找到该选项，请刷新后重试')
      return
    }
    const vid = vehicle?.id
    if (!vid) {
      showToast('车辆信息不完整，无法设置')
      return
    }
    let map = (profile as any).vehicleRoleAssignments as Record<string, Record<string, string>> | undefined
    if (!map) {
      map = {}
      ;(profile as any).vehicleRoleAssignments = map
    }
    if (!map[vid]) map[vid] = {}
    map[vid][role] = selectedItem.id
    showToast('已设置关联')
  } catch (e: any) {
    showToast(e?.message || '操作失败')
  } finally {
    closeToast()
  }
}

// 当前上下文下的完整车辆集合：不做任何人与车的关联过滤，始终展示全部车辆
const vehiclesForCurrentContext = computed(() => {
  const baseVehicles = customerStore.vehicles || []

  if (!baseVehicles || baseVehicles.length === 0) {
    return []
  }

  // 直接返回全部车辆，不按经办人/联系人做过滤
  return baseVehicles
})

// 首页只展示前两辆，完整列表放到车辆列表/360 弹层
const displayedVehiclesForCurrentTab = computed(() => vehiclesForCurrentContext.value.slice(0, 2))

// 车辆信息弹窗内展示的列表：始终展示当前上下文下的完整车辆清单
const allVehiclesInVehicleDialog = computed(() => vehiclesForCurrentContext.value)

const vehiclesInVehicleDialog = computed(() => allVehiclesInVehicleDialog.value)

const vehicleDialogSubtitle = computed(() => {
  return allVehiclesInVehicleDialog.value.length > 0 ? `共 ${allVehiclesInVehicleDialog.value.length} 辆` : ''
})

// 头部标签：显示当前 ONEID 下的所有商机类型（不再单独注入 VIP 车主）
const displayedHeaderTags = computed(() => {
  const tags: string[] = []

  // 1. 添加当前 ONEID 下的所有商机类型
  // 公司视图：直接使用 enterprise ONEID 对应的 customerStore.opportunities
  // 个人视图：优先使用经办人商机，其次使用全局 opportunities
  const opps = selectedHandler.value?.opportunities || customerStore.opportunities || []

  if (opps.length > 0) {
    const opportunityTypes = opps.map(opp => opp.type)
    tags.push(...opportunityTypes)
  }

  // 2. 商机标签处理
  // 保持 header-tags 区域仅显示商机相关标签
  // 不再去重：一个 ONEID 下，若同类型商机出现多次，则在首屏标签中按次数重复展示
  return tags
})

// 获取头部标签的样式类（商机类型）
const getHeaderTagClass = (tag: string) => {
  // 钻石客户使用 vip-tag 样式（琥珀金实色背景，黑色文字）
  if (tag === '钻石客户') {
    return 'vip-tag'
  }

  // 其他商机标签：统一基类为 biz-badge，不同类型叠加不同配色类
  let themeClass = ''

  const isType = (keywords: string[]) => keywords.some(k => tag.includes(k))

  if (isType(['企业大客户', '高价值企业客户', '重点维护企业'])) {
    themeClass = 'opp-tag-gold'
  } else if (isType(['首保流失'])) {
    themeClass = 'opp-tag-warning'
  } else if (isType(['PCN'])) {
    themeClass = 'opp-tag-purple'
  } else if (isType(['商务合作伙伴', '年度采购意向'])) {
    themeClass = 'opp-tag-blue'
  } else if (isType(['企业车队升级机会'])) {
    themeClass = 'opp-tag-teal'
  } else if (isType(['企业保养关怀活动', '企业轮胎关怀计划'])) {
    themeClass = 'opp-tag-green'
  }

  return themeClass ? `biz-badge ${themeClass}` : 'biz-badge'
}

// 判断是否为商机标签
const isOpportunityTag = (tag: string): boolean => {
  // 所有标签（包括钻石客户）都是商机标签（从 opportunities 中提取）
  return true
}

// 获取标签图标
const getTagIcon = (tag: string): string | null => {
  // 钻石客户显示钻石图标
  if (tag === '钻石客户') {
    return 'gem-o'
  }
  // 贷款即将到期显示时钟图标
  if (tag === '贷款即将到期') {
    return 'clock-o'
  }
  return null
}

// 获取标签的自定义样式类
// 将颜色转换为浅色背景和深色文字
const getTagColors = (color: string) => {
  if (!color) {
    return {
      background: 'white',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)'
    }
  }
  
  // 将hex颜色转换为RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // 计算亮度（使用相对亮度公式）
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // 标签池中的颜色已经是浅色，直接使用作为背景
  const background = color
  // 根据背景亮度决定文字颜色（阈值调整为140，因为标签颜色都比较浅）
  const textColor = brightness > 140 ? '#1E293B' : '#FFFFFF'
  // 边框使用原色，如果太浅则加深
  let borderColor = color
  if (brightness > 200) {
    // 如果颜色太浅，边框稍微加深
    const darkerR = Math.max(0, r - 20)
    const darkerG = Math.max(0, g - 20)
    const darkerB = Math.max(0, b - 20)
    borderColor = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`
  }
  
  return {
    background,
    color: textColor,
    border: `1px solid ${borderColor}`
  }
}

const getTagCustomClass = (tag: string) => {
  const tagInfo = customerStore.tagPool.find(t => t.name === tag)
  
  // 热度极高：红色背景和边框
  if (tag.includes('热度极高') || tag.includes('热度')) {
    return 'tag-hot'
  }
  
  // 根据分类返回不同的样式类
  if (tagInfo?.category) {
    const category = tagInfo.category
    if (category.includes('意向级别')) return 'tag-intent'
    if (category.includes('SC')) return 'tag-sc'
    if (category.includes('SA')) return 'tag-sa'
    if (category.includes('续保')) return 'tag-insurance'
    if (category.includes('POC')) return 'tag-poc'
    if (category.includes('免打扰')) return 'tag-dnd'
    if (category.includes('线上活动')) return 'tag-online'
    if (category.includes('爱好')) return 'tag-hobby'
  }
  
  // 其他标签：默认样式
  return 'tag-normal'
}

// 获取标签的样式对象（用于内联样式）
const getTagStyle = (tag: string) => {
  // 贷款客户：按照设计稿，浅绿色底 + 深绿色文字
  if (tag === '贷款客户') {
    return {
      background: '#E6F4EF', // 近似设计稿的浅绿
      color: '#047857',
      border: '1px solid #BFD8CC'
    }
  }

  // 热度极高：红色样式（保持原有告警语义）
  if (tag.includes('热度极高') || tag.includes('热度')) {
    return {
      background: '#FFF5F5',
      color: '#E53E3E',
      border: '1px solid #FEB2B2'
    }
  }
  
  // 其他标签：统一浅灰色矩形，靠近设计稿
  return {
    background: '#F1F5F9',
    color: '#4B5563',
    border: '1px solid #E2E8F0'
  }
}

// 车辆状态选项（弹窗展示文案也做公司/个人映射）
const vehicleStatusOptions = computed(() => {
  const base = [
    { name: '已售', value: '已售' },
    { name: '自用', value: '自用' },
    { name: '维修中', value: '维修中' },
    // 准车主：已下订单，车辆生产中/在途
    { name: '订车中-在途', value: '订车中-在途' },
    // 异地使用中的车辆
    { name: '异地用车', value: '异地用车' },
  ]
  if (!isCompany.value) return base
  // 公司视图下把“自用”文案替换为“企业自用”
  return base.map(item =>
    item.value === '自用' ? { ...item, name: '企业自用' } : item,
  )
})

// 车辆状态内联编辑：当前正在编辑状态的车辆 id（在当前弹窗内展开，禁止二次弹窗）
const editingVehicleStatusId = ref<string | null>(null)

// 分群列表（支持多条，从 sources 中提取或使用 value）
const segmentList = computed(() => {
  const segmentType = customerStore.profile?.segmentType
  if (!segmentType) return []
  
  // 如果有 sources，提取所有不同的值
  if (segmentType.sources && segmentType.sources.length > 0) {
    const values = segmentType.sources.map(s => String(s.value))
    // 去重并保持顺序
    return Array.from(new Set(values))
  }
  
  // 否则使用主值
  return segmentType.value ? [String(segmentType.value)] : []
})

// 格式化操作时间（展示为日期）
const formatOperationTime = (time: string): string => {
  try {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  } catch (e) {
    return time
  }
}

// 将日期时间字符串格式化为纯日期（YYYY-MM-DD）
const formatDateOnly = (dateTime?: string | null): string => {
  if (!dateTime) return ''
  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) {
      // 如果无法被 Date 正确解析，则优先截取前 10 位（常见格式：YYYY-MM-DD HH:mm:ss）
      return dateTime.length >= 10 ? dateTime.slice(0, 10) : dateTime
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (e) {
    return dateTime
  }
}

// 根据车牌号推断上牌城市（当接口未返回 registrationCity 时兜底）
const deriveRegistrationCityFromPlate = (plate?: string | null): string | undefined => {
  if (!plate) return undefined
  const first = plate.charAt(0)
  const map: Record<string, string> = {
    '京': '北京',
    '沪': '上海',
    '津': '天津',
    '渝': '重庆',
    '粤': '广东',
    '浙': '浙江',
    '苏': '江苏',
    '鲁': '山东',
    '豫': '河南',
    '川': '四川',
    '鄂': '湖北',
    '湘': '湖南',
    '闽': '福建',
    '赣': '江西',
    '皖': '安徽',
    '辽': '辽宁',
    '吉': '吉林',
    '黑': '黑龙江',
    '晋': '山西',
    '陕': '陕西',
    '甘': '甘肃',
    '宁': '宁夏',
    '蒙': '内蒙古',
    '桂': '广西',
    '云': '云南',
    '贵': '贵州',
    '青': '青海',
    '藏': '西藏',
    '琼': '海南',
    '新': '新疆',
  }
  return map[first]
}

// 获取展示用的上牌城市（优先接口字段，其次从车牌推断）
const getRegistrationCityLabel = (vehicle: any): string => {
  return vehicle.registrationCity || deriveRegistrationCityFromPlate(vehicle.licensePlate) || ''
}

// 具体的最新操作对象（响应经办人切换）
const latestOperationDisplay = computed(() => {
  const profile = customerStore.profile
  if (!profile) return null
  
  if (isCompany.value && selectedHandler.value?.latestOperation) {
    return selectedHandler.value.latestOperation
  }
  
  return profile.latestOperation || null
})

// 当前画像主体存在的冲突（响应经办人切换）
const currentConflicts = computed(() => {
  const profile = customerStore.profile
  if (!profile) return []
  
  if (isCompany.value && selectedHandler.value?.nameMobileConflict) {
    return selectedHandler.value.nameMobileConflict
  }
  
  return profile.nameMobileConflict || []
})

// 最新操作信息文本
const latestOperationText = computed(() => {
  const op = latestOperationDisplay.value
  if (!op) return ''
  return `该顾客已被 ${op.operator} ${op.operationType}`
})

// 可用标签（排除已选标签）
const availableTags = computed(() => {
  const selectedTags = customerStore.profile?.tags || []
  return customerStore.tagPool.filter(
    (tag) => !selectedTags.includes(tag.name)
  )
})

// 检查标签是否已选
const isTagSelected = (tagName: string) => {
  return customerStore.profile?.tags.includes(tagName) || false
}

// 将颜色转换为浅色系的辅助函数
const convertToLightColor = (color: string): string => {
  if (!color) return color
  
  // 如果是 hex 颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    
    // 转换为 HSL
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255
    
    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const delta = max - min
    
    let h = 0
    let s = 0
    let l = (max + min) / 2
    
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
      
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / delta + 2) / 6
      } else {
        h = ((rNorm - gNorm) / delta + 4) / 6
      }
    }
    
    // 转换为浅色系：提高亮度到 0.88-0.92，降低饱和度到 0.25-0.35
    l = Math.max(0.88, Math.min(0.92, l * 1.2)) // 提高亮度
    s = Math.max(0.25, Math.min(0.35, s * 0.6)) // 降低饱和度但保持一定色彩
    
    // 转换回 RGB
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = l - c / 2
    
    let rNew = 0, gNew = 0, bNew = 0
    
    if (h < 1/6) {
      rNew = c; gNew = x; bNew = 0
    } else if (h < 2/6) {
      rNew = x; gNew = c; bNew = 0
    } else if (h < 3/6) {
      rNew = 0; gNew = c; bNew = x
    } else if (h < 4/6) {
      rNew = 0; gNew = x; bNew = c
    } else if (h < 5/6) {
      rNew = x; gNew = 0; bNew = c
    } else {
      rNew = c; gNew = 0; bNew = x
    }
    
    rNew = Math.round((rNew + m) * 255)
    gNew = Math.round((gNew + m) * 255)
    bNew = Math.round((bNew + m) * 255)
    
    return `#${rNew.toString(16).padStart(2, '0')}${gNew.toString(16).padStart(2, '0')}${bNew.toString(16).padStart(2, '0')}`
  }
  
  return color
}

// 获取标签信息（用于颜色和样式）
const getTagInfo = (tagName: string) => {
  const tag = customerStore.tagPool.find((t) => t.name === tagName)
  if (!tag) {
    return {
      type: 'default' as const,
      color: undefined,
      className: '',
    }
  }
  
  // 特殊标签处理："首保流失15个月"和"PCN售后"
  const specialTags = ['首保流失15个月', 'PCN售后']
  const isSpecialTag = specialTags.includes(tagName)
  
  // 如果标签有color属性，使用自定义颜色（转换为浅色系）
  if (tag.color) {
    return {
      type: 'default' as const,
      color: convertToLightColor(tag.color),
      className: isSpecialTag ? 'special-tag' : '',
    }
  }
  
  // 否则使用默认类型
  return {
    type: 'default' as const,
    color: undefined,
    className: isSpecialTag ? 'special-tag' : '',
  }
}

// 获取标签类型（用于向后兼容）
const getTagType = (tagName: string): any => {
  return getTagInfo(tagName).type
}

// 获取业务标签类型（车主、送修人等）
const getBusinessTagType = (tagName: string): any => {
  const typeMap: Record<string, any> = {
    '车主': 'success',
    '送修人': 'primary',
  }
  return typeMap[tagName] || 'primary'
}

// 获取关系标签类型
const getRelationTagType = (tagName: string): any => {
  const typeMap: Record<string, any> = {
    '车主': 'success',
    '送修人': 'primary',
    '联系人': 'default',
  }
  return typeMap[tagName] || 'default'
}

// 处理字段更新
const handleFieldUpdate = (data: { field: string; value: string | number }) => {
  if (customerStore.profile) {
    // 字段已通过 API 更新，这里只需要更新本地状态（如果需要）
    console.log('字段已更新:', data)
  }
}

// 添加标签
const handleAddTag = async (tagId: string) => {
  await customerStore.addTag(tagId)
  // 如果标签已添加，可以关闭弹窗
  if (customerStore.profile?.tags.includes(
    customerStore.tagPool.find((t) => t.id === tagId)?.name || ''
  )) {
    showTagSelector.value = false
  }
}

// 删除标签
const handleRemoveTag = async (tagName: string) => {
  await customerStore.removeTag(tagName)
}

// 标签管理相关
const selectedTags = ref<string[]>([])
const savingTags = ref(false)

// 初始化选中的标签
watch(
  () => customerStore.profile?.tags,
  (tags) => {
    if (tags) {
      selectedTags.value = [...tags]
    }
  },
  { immediate: true }
)

// 当打开标签管理弹窗时，同步标签数据
watch(
  () => showTagManager.value,
  (isOpen) => {
    if (isOpen && customerStore.profile?.tags) {
      selectedTags.value = [...customerStore.profile.tags]
    }
  }
)

// 切换标签选中状态
const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagName)
  }
}

// 标签管理弹窗中判断标签是否选中（使用 selectedTags）
const isTagSelectedInManager = (tagName: string) => {
  return selectedTags.value.includes(tagName)
}

// 已选标签列表（用于标签管理弹窗）
const selectedTagsInManager = computed(() => {
  return selectedTags.value
})

// 标签池 mock 数据：用于没有后端数据时预览 UI
const mockTagPool: Array<{
  id: number
  name: string
  category?: string
}> = [
  { id: 1, name: '热', category: '意向级别' },
  { id: 2, name: 'PMP邀约', category: '意向级别' },
  { id: 3, name: '本市', category: '其他' },
  { id: 4, name: '人保', category: '续保【必选】' },
  { id: 5, name: '精确报价', category: '意向级别' },
  { id: 6, name: '亲子', category: '爱好(≥1项)' },
  { id: 7, name: '品酒', category: '爱好(≥1项)' },
  { id: 8, name: '贷款客户', category: 'SC【必选】' },
  { id: 9, name: '准车主', category: '意向级别' },
  { id: 10, name: '转介绍', category: '其他' },
  { id: 11, name: '再购', category: '其他' },
  { id: 12, name: '投诉', category: '其他' },
  { id: 13, name: '预约', category: '其他' }
]

// 有真实数据优先用真实数据，否则使用 mock 数据
const effectiveTagPool = computed(() => {
  if (customerStore.tagPool && customerStore.tagPool.length > 0) {
    return customerStore.tagPool
  }
  return mockTagPool
})

// 按分类分组的标签（用于标签管理弹窗）
const groupedTags = computed(() => {
  const source = effectiveTagPool.value
  const groups: Record<string, typeof source> = {}
  
  source.forEach(tag => {
    const category = tag.category || '其他'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(tag)
  })
  
  // 按分类名称排序
  const sortedGroups: Record<string, typeof source> = {}
  const categoryOrder = [
    '意向级别',
    'SC【必选】',
    'SA【必选】',
    '续保【必选】',
    'POC【必选】',
    '免打扰车主',
    '线上活动',
    '爱好(≥1项)',
  ]
  
  // 先按顺序添加已知分类
  categoryOrder.forEach(category => {
    if (groups[category]) {
      sortedGroups[category] = groups[category]
    }
  })
  
  // 再添加其他分类
  Object.keys(groups).forEach(category => {
    if (!categoryOrder.includes(category)) {
      sortedGroups[category] = groups[category]
    }
  })
  
  console.log('[标签管理] 分组后的数据:', sortedGroups)
  console.log('[标签管理] 分类数量:', Object.keys(sortedGroups).length)
  
  return sortedGroups
})

// 标签池用：按分组只包含未选中的标签（选中在上方「已拥有」展示，池子里只展示可添加的）
const groupedUnselectedTags = computed(() => {
  const grouped = groupedTags.value
  const result: Record<string, Array<{ id: number; name: string; category?: string }>> = {}
  Object.keys(grouped).forEach(category => {
    const list = (grouped[category] || []).filter(
      tag => tag && tag.name && !selectedTags.value.includes(tag.name)
    )
    result[category] = list
  })
  return result
})

// 获取分类中已选标签数量
const getSelectedCountInCategory = (category: string) => {
  const categoryTags = groupedTags.value[category] || []
  return categoryTags.filter(tag => selectedTags.value.includes(tag.name)).length
}

// 验证必选标签
const validateRequiredTags = (): string | null => {
  const requiredCategories: string[] = []
  
  // 检查所有必选分类
  Object.keys(groupedTags.value).forEach(category => {
    const categoryTags = groupedTags.value[category]
    const requiredTags = categoryTags.filter(tag => tag.required)
    
    if (requiredTags.length > 0) {
      const selectedInCategory = categoryTags.filter(tag => 
        selectedTags.value.includes(tag.name)
      )
      
      if (selectedInCategory.length === 0) {
        requiredCategories.push(category)
      }
    }
    
    // 检查最少选择数量要求
    const minSelectTag = categoryTags.find(tag => tag.minSelect)
    if (minSelectTag && minSelectTag.minSelect) {
      const selectedInCategory = categoryTags.filter(tag => 
        selectedTags.value.includes(tag.name)
      )
      
      if (selectedInCategory.length < minSelectTag.minSelect) {
        return `${category}至少需要选择${minSelectTag.minSelect}项`
      }
    }
  })
  
  if (requiredCategories.length > 0) {
    return `请至少选择一项：${requiredCategories.join('、')}`
  }
  
  return null
}

// 保存标签（一次性提交）
const handleSaveTags = async () => {
  // 验证必选标签
  const validationError = validateRequiredTags()
  if (validationError) {
    showToast(validationError)
    return
  }
  
  savingTags.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    // 一次性提交所有选中的标签
    await customerStore.updateTags(selectedTags.value)
    showTagManager.value = false
  } catch (error: any) {
    // 错误已在store中处理
  } finally {
    savingTags.value = false
    closeToast()
  }
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化总消费字段（将数字转换为带货币符号的字符串）
const formattedTotalConsumption = computed(() => {
  if (!customerStore.profile?.totalConsumption) return null
  const consumption = customerStore.profile.totalConsumption
  return {
    ...consumption,
    value: `¥${formatAmount(consumption.value as number)}`,
  }
})

// 获取交易状态类型
const getTransactionStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已完成': 'success',
    '待支付': 'warning',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 获取车辆状态类型（使用颜色标识）
const getVehicleStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已售': 'default',
    '自用': 'success',
    '维修中': 'warning',
    '订车中': 'primary',
    '订车中-在途': 'primary', // 准车主：已下单生产中/在途
    '异地用车': 'primary',
    '异地用车-在途': 'primary', // 兼容旧数据
  }
  return typeMap[status] || 'default'
}

// 公司/个人视图下的车辆状态展示文案（轻量映射）
const getVehicleStatusLabel = (status: string): string => {
  if (!isCompany.value) return status
  if (status === '自用') return '企业自用'
  return status
}

// 是否存在价格相关信息
const hasVehiclePriceInfo = (vehicle: VehicleRelation): boolean => {
  return !!(
    vehicle &&
    (
      vehicle.newCarMsrp != null ||
      vehicle.newCarContractPrice != null ||
      vehicle.nonCashDiscountAmount != null ||
      vehicle.salesItemAmount != null ||
      !!vehicle.salesItemName
    )
  )
}

// 获取资产状态类型
const getAssetStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '未使用': 'success',
    '已使用': 'default',
    '已过期': 'danger',
  }
  return typeMap[status] || 'default'
}

// 用户偏好标签相关
const preferredCarTags = computed(() => {
  return customerStore.profile?.preferredCarModel?.tags || []
})

const openPreferredCarTagSelector = () => {
  selectedPreferredCarTags.value = [...preferredCarTags.value]
  showPreferredCarTagSelector.value = true
}

const closePreferredCarTagSelector = () => {
  showPreferredCarTagSelector.value = false
  selectedPreferredCarTags.value = []
}

const isPreferredCarTagSelected = (tagName: string) => {
  return selectedPreferredCarTags.value.includes(tagName)
}

const togglePreferredCarTag = (tagName: string) => {
  const index = selectedPreferredCarTags.value.indexOf(tagName)
  if (index > -1) {
    selectedPreferredCarTags.value.splice(index, 1)
  } else {
    selectedPreferredCarTags.value.push(tagName)
  }
}

const handleSavePreferredCarTags = async () => {
  savingPreferredCarTags.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    await customerStore.updatePreferredCarModelTags(selectedPreferredCarTags.value)
    closePreferredCarTagSelector()
  } catch (error: any) {
    showToast(error.message || '保存失败，请重试')
  } finally {
    savingPreferredCarTags.value = false
    closeToast()
  }
}

const handleRemovePreferredCarTag = async (tagName: string) => {
  const newTags = preferredCarTags.value.filter((t) => t !== tagName)
  
  showLoadingToast({
    message: '删除中...',
    forbidClick: true,
  })

  try {
    // 传递 false 参数，避免 store 中显示 toast（由这里统一处理）
    await customerStore.updatePreferredCarModelTags(newTags, false)
    showToast('删除成功')
  } catch (error: any) {
    showToast(error.message || '删除失败，请重试')
  } finally {
    closeToast()
  }
}

// 获取预约状态类型
const getAppointmentStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待确认': 'warning',
    '已确认': 'primary',
    '已完成': 'success',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 获取商机类型标签类型（使用颜色标识）
const getOpportunityTypeTagType = (type: string): any => {
  const typeMap: Record<string, any> = {
    '维保到期': 'warning',
    '代金券到期': 'warning',
    '高价值客户': 'danger',
    '流失预警': 'danger',
    '复购机会': 'success',
    '升级机会': 'primary',
  }
  return typeMap[type] || 'primary'
}

// 获取商机状态类型
const getOpportunityStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待处理': 'warning',
    '处理中': 'primary',
    '已推送': 'primary',
    '已完成': 'success',
  }
  return typeMap[status] || 'default'
}

// 获取推送状态类型
const getPushStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待推送': 'warning',
    '成功': 'success',
    '失败': 'danger',
  }
  return typeMap[status] || 'default'
}

// 解析商机详情描述，将 "label：value\nlabel：value" 格式解析为数组
const parseOpportunityDescription = (description: string): Array<{ label: string; value: string }> => {
  if (!description) return []
  
  const lines = description.split('\n').filter(line => line.trim())
  return lines.map(line => {
    // 匹配 "label：value" 或 "label:value" 格式
    const match = line.match(/^(.+?)[：:](.+)$/)
    if (match) {
      return {
        label: match[1].trim(),
        value: match[2].trim(),
      }
    }
    // 如果没有匹配到，返回整行作为 value
    return {
      label: '',
      value: line.trim(),
    }
  })
}

// 获取优先级类型
const getPriorityType = (priority: string): any => {
  const typeMap: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'default',
  }
  return typeMap[priority] || 'default'
}

// 格式化推送目标
const formatPushTarget = (target: string): string => {
  const targetMap: Record<string, string> = {
    'bdc': 'BDC系统',
    'wechat': '微信',
    'crm': 'CRM系统',
  }
  return targetMap[target] || target
}

// 处理冲突提交完成
const handleConflictSubmitted = () => {
  // 可以在这里刷新数据或做其他处理
  console.log('冲突处理已提交')
}

// 处理电话号码更新：同步到 store 并触发响应式，联系人设置的「使用车辆」+「业务角色」会同步到车辆信息/相关人员
const handleMobileUpdate = async (data: MobileData) => {
  if (!customerStore.profile?.mobile || !('items' in customerStore.profile.mobile)) return
  const mobile = customerStore.profile.mobile as MobileData
  const nextItems = data.items ?? mobile.items
  // 用新数组 + 每项浅拷贝，确保 vehicleLabel/businessTags 等写入 store 并触发车辆信息、相关人员等依赖更新
  mobile.items = nextItems.map((i: MobileItem) => ({ ...i }))
  mobile.isConflict = data.isConflict ?? mobile.isConflict
  if (data.editable !== undefined) mobile.editable = data.editable
}

// 打开基础信息编辑弹窗（公司=当前经办人；个人=与身份 Chip 联动，选谁编辑谁）
const openBasicInfoEditor = () => {
  const profile = customerStore.profile
  if (profile) {
    const handler = selectedHandler.value
    const identity = selectedPersonalIdentity.value
    const addresses =
      profile.addresses?.items?.map((item, index) => {
        const meta = getAddressSlotMeta(item.slotKey || ADDRESS_SLOTS[index]?.key)
        return {
          address: item.address,
          label: meta.label,
          slotKey: meta.key,
        }
      }) ?? []
    const nameStr = handler
      ? handler.name
      : !isCompany.value && identity
        ? (identity.contactName || identity.relationTagName || '')
        : (profile.name.value || '')
    basicInfoForm.value = {
      name: String(nameStr),
      age: String(handler ? (handler.age || '') : (profile.age.value || '')),
      mobile: '', // 手机号已在MobileEditor中管理，这里不再使用
      gender: normalizeGender(handler ? (handler.gender as string) || '' : (profile.gender?.value as string) || ''),
      city: String(handler ? (handler.city || '') : (profile.city.value || '')),
      addresses: addresses.length
        ? [...addresses]
        : [{ address: '', label: DEFAULT_ADDRESS_SLOT.label, slotKey: DEFAULT_ADDRESS_SLOT.key }],
      reason: '',
    }
  }
}

// 省市区内联展开（不二次弹窗）
const showAreaInline = ref(false)
const areaPickerEditIndex = ref(-1)

const toggleAreaInline = (idx: number) => {
  if (areaPickerEditIndex.value === idx && showAreaInline.value) {
    showAreaInline.value = false
    return
  }
  areaPickerEditIndex.value = idx
  showAreaInline.value = true
}

// 地址槽位：根据下标自动分配标签，不再使用权重
const setAddressSlot = (idx: number, slotKey: string) => {
  const meta = getAddressSlotMeta(slotKey)
  if (basicInfoForm.value.addresses[idx] !== undefined) {
    basicInfoForm.value.addresses[idx].label = meta.label
    basicInfoForm.value.addresses[idx].slotKey = meta.key
  }
}

// Vant Area confirm：可能传 (values, selectedOptions) 或 单对象 { selectedValues, selectedOptions }
const onAreaConfirm = (first: any, second?: any) => {
  let list: any[] = []
  if (Array.isArray(second) && second.length > 0) {
    list = second
  } else if (Array.isArray(first) && first.length > 0) {
    list = first
  } else if (first && typeof first === 'object' && Array.isArray(first.selectedOptions)) {
    list = first.selectedOptions
  }
  // 只取可展示的文案：选项可能是 { name } 或 { text }，避免 [object Object]
  const parts = list.map((item: any) => {
    if (item == null) return ''
    if (typeof item === 'string') return item
    if (typeof item === 'object' && (item.name != null || item.text != null)) {
      return String(item.name ?? item.text ?? '')
    }
    return ''
  }).filter(Boolean)
  const fullAddress = parts.join(' ')
  const idx = areaPickerEditIndex.value
  if (basicInfoForm.value.addresses[idx] !== undefined) {
    basicInfoForm.value.addresses[idx].address = fullAddress
  }
  showAreaInline.value = false
}

const addBasicInfoAddress = () => {
  if (basicInfoForm.value.addresses.length >= ADDRESS_SLOTS.length) return
  const meta = ADDRESS_SLOTS[basicInfoForm.value.addresses.length] || DEFAULT_ADDRESS_SLOT
  basicInfoForm.value.addresses = [
    ...basicInfoForm.value.addresses,
    { address: '', label: meta.label, slotKey: meta.key }
  ]
}
const removeBasicInfoAddress = (idx: number) => {
  const next = basicInfoForm.value.addresses.filter((_, i) => i !== idx)
  basicInfoForm.value.addresses = next.length
    ? next.map((item, index) => {
        const meta = ADDRESS_SLOTS[index] || DEFAULT_ADDRESS_SLOT
        return { ...item, label: meta.label, slotKey: meta.key }
      })
    : [{ address: '', label: DEFAULT_ADDRESS_SLOT.label, slotKey: DEFAULT_ADDRESS_SLOT.key }]
}

// 调整地址顺序（上移/下移），通过排序体现优先级
const moveAddressUp = (idx: number) => {
  if (idx <= 0) return
  const list = [...basicInfoForm.value.addresses]
  const tmp = list[idx - 1]
  list[idx - 1] = list[idx]
  list[idx] = tmp
  basicInfoForm.value.addresses = list
}

const moveAddressDown = (idx: number) => {
  if (idx >= basicInfoForm.value.addresses.length - 1) return
  const list = [...basicInfoForm.value.addresses]
  const tmp = list[idx + 1]
  list[idx + 1] = list[idx]
  list[idx] = tmp
  basicInfoForm.value.addresses = list
}

// 标记首选地址：将选中的地址移动到第一位
const setPrimaryAddress = (idx: number) => {
  if (idx <= 0) return
  const list = [...basicInfoForm.value.addresses]
  const [item] = list.splice(idx, 1)
  list.unshift(item)
  basicInfoForm.value.addresses = list
}

// 提交基础信息修改
const handleSaveBasicInfo = async () => {
  console.log('[Home] 开始提交基础信息', {
    profile: customerStore.profile,
    form: basicInfoForm.value,
  })

  if (!customerStore.profile) {
    console.warn('[Home] customerStore.profile 不存在')
    showToast('客户信息不存在')
    return
  }

  // 验证更改理由
  if (!basicInfoForm.value.reason || !basicInfoForm.value.reason.trim()) {
    console.warn('[Home] 更改理由为空')
    showToast('请输入更改理由')
    return
  }

  // 手机号已在MobileEditor中管理，这里不再验证

  // 先检查是否有字段变更（在显示 loading 之前）
  const updateData: Record<string, any> = {}
  
  // 基础对比数据源：公司=当前经办人；个人=与身份 Chip 联动，选谁对比谁
  const profile = customerStore.profile
  const handler = selectedHandler.value
  const identity = selectedPersonalIdentity.value
  const baseName = String(
    handler ? handler.name
    : !isCompany.value && identity
      ? (identity.contactName || identity.relationTagName || '')
      : (profile.name.value || '')
  )
  const baseAge = String(handler ? (handler.age || '') : (profile.age.value || ''))
  const baseGender = normalizeGender(handler ? (handler.gender as string) || '' : (profile.gender?.value as string) || '')
  const baseCity = String(handler ? (handler.city || '') : (profile.city.value || ''))

  // 收集所有变更的字段
  if (basicInfoForm.value.name !== baseName) {
    updateData.name = basicInfoForm.value.name
  }
  if (basicInfoForm.value.age !== baseAge) {
    updateData.age = basicInfoForm.value.age ? Number(basicInfoForm.value.age) : null
  }
  if (basicInfoForm.value.gender !== baseGender) {
    updateData.gender = basicInfoForm.value.gender
  }
  if (basicInfoForm.value.city !== baseCity) {
    updateData.city = basicInfoForm.value.city
  }

  // 地址变更仅更新本地 profile（接口暂不支持）
  const curItems = profile.addresses?.items ?? []
  const newAddresses = basicInfoForm.value.addresses.filter((a) => a.address.trim())
  const addressesChanged =
    newAddresses.length !== curItems.length ||
    newAddresses.some(
      (a, i) =>
        a.address !== curItems[i]?.address ||
        a.slotKey !== curItems[i]?.slotKey
    )

  // 检查是否有需要更新的字段（除了reason）
  const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'reason')
  const hasBasicFields = fieldsToUpdate.length > 0
  if (!hasBasicFields && !addressesChanged) {
    console.warn('[Home] 没有需要更新的字段')
    showToast('请至少修改一个字段后再提交')
    return
  }

  console.log('[Home] 验证通过，开始提交')

  savingBasicInfo.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
  })

  try {
    // 先写回地址到本地 profile（按排序和首选标记）
    if (addressesChanged) {
      if (!profile.addresses) (profile as any).addresses = { items: [] }
      profile.addresses.items = newAddresses.map((item, i) => ({
        id: profile.addresses!.items[i]?.id ?? `addr_${Date.now()}_${i}`,
        address: item.address.trim(),
        label: item.label || undefined,
        slotKey: item.slotKey as any,
        isPrimary: i === 0,
      }))
    }

    // 若有姓名/年龄/性别/城市变更，则调用接口提交审核
    if (hasBasicFields) {
      updateData.reason = basicInfoForm.value.reason.trim()
      if (!updateData.reason) {
        showToast('请输入更改理由')
        savingBasicInfo.value = false
        closeToast()
        return
      }
      console.log('[Home] 准备提交的数据:', updateData)
      const res = await customerApi.updateBasicInfo(updateData as { reason: string } & typeof updateData)
      if (res.code === 200) {
        // 个人视图下若修改了当前选中身份的姓名，同步到本地 mobile 项，便于档案区与 Chip 展示一致
        if (!isCompany.value && selectedPersonalIdentityId.value && updateData.name != null && profile.mobile && 'items' in profile.mobile) {
          const item = (profile.mobile as MobileData).items.find((i: MobileItem) => i.id === selectedPersonalIdentityId.value)
          if (item) item.contactName = String(updateData.name)
        }
        showToast('提交成功，等待后台审核')
        showBasicInfoEditor.value = false
        basicInfoForm.value.reason = ''
      } else {
        showToast(res.message || '提交失败，请重试')
      }
    } else {
      showToast('地址权重已更新')
      showBasicInfoEditor.value = false
    }
  } catch (error: any) {
    console.error('[Home] 提交失败:', error)
    showToast(error.message || '提交失败，请重试')
  } finally {
    savingBasicInfo.value = false
    closeToast()
  }
}

// 打开基础信息编辑弹窗（处理函数）
const handleOpenBasicInfoEditor = () => {
  openBasicInfoEditor()
  showBasicInfoEditor.value = true
}

// 加载操作日志
const loadOperationLogs = async () => {
  operationLogsLoading.value = true
  try {
    await customerStore.fetchOperationLogs()
  } catch (error) {
    console.error('加载操作日志失败:', error)
  } finally {
    operationLogsLoading.value = false
  }
}

// 处理优惠券卡片点击
const handleCouponCardClick = () => {
  if (displayedAssets.value.length > 0) {
    showAssetDialog.value = true
  }
}

const openVehicleDialog = () => {
  showVehicleDialog.value = true
}

// 首页卡片点击状态：打开车辆信息弹窗并直接展开该车状态内联选择（不二次弹窗）
const openVehicleDialogAndEditStatus = (vehicleId: string) => {
  openVehicleDialog()
  nextTick(() => {
    editingVehicleStatusId.value = vehicleId
  })
}

// 处理车辆状态变更（内联选择后直接请求，成功后收起内联区域）
const handleVehicleStatusChange = async (vehicleId: string, status: string) => {
  editingVehicleStatusId.value = null
  showLoadingToast({
    message: '更新中...',
    forbidClick: true,
  })
  try {
    const res = await customerApi.updateVehicleStatus(vehicleId, status)
    if (res.code === 200) {
      // 更新本地数据
      const vehicle = customerStore.vehicles.find(v => v.id === vehicleId)
      if (vehicle) {
        vehicle.status = status
      }
      showToast('更新成功')
    } else {
      showToast(res.message || '更新失败，请重试')
    }
  } catch (error: any) {
    showToast(error.message || '更新失败，请重试')
  } finally {
    closeToast()
  }
}

// 关闭车辆弹窗时收起内联状态选择
watch(showVehicleDialog, (v) => {
  if (!v) {
    editingVehicleStatusId.value = null
  }
})

// 切换到公司视图时清除个人身份选中，避免状态错位
watch(isCompany, (company) => {
  if (company) selectedPersonalIdentityId.value = null
})

// 关闭号码管理弹窗时清除「本次要编辑的条目」，下次打开不预选
watch(showMobileManager, (open) => {
  if (!open) mobileEditorEditItemId.value = null
})

// 初始化：若 URL 带 phone，拉取该手机号关联的 OneId 列表，多 OneId 时补全 query.oneId
onMounted(async () => {
  console.log('Home 组件 mounted')
  const phone = route.query.phone as string | undefined
  if (!phone) return
  oneIdListLoading.value = true
  try {
    const res = await customerApi.getOneIdsByPhone(phone)
    if (res.code === 200 && Array.isArray(res.data)) {
      oneIdList.value = res.data
      if (res.data.length >= 1 && !route.query.oneId) {
        const first = res.data[0]
        await router.replace({
          query: { ...route.query, oneId: first.oneId } as Record<string, string>,
        })
      }
    }
  } catch (e) {
    console.error('[Home] getOneIdsByPhone 失败:', e)
  } finally {
    oneIdListLoading.value = false
  }
})
</script>

<style scoped lang="scss">
// 手机号搜索多 OneId 时顶部切换栏
.oneid-switcher-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 12px 16px;
  margin: -12px -12px 12px -12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.oneid-switcher-inner {
  max-width: 100%;
}
.oneid-switcher-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.oneid-count-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--accent-gold, #c9a227);
  color: #1a1a2e;
  font-size: 12px;
  font-weight: 600;
}
// 少量 OneId：横向 Tab，可横向滚动防止挤爆
.oneid-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.oneid-tabs-scroll {
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin: 0 -4px;
  padding: 0 4px;
  &::-webkit-scrollbar {
    display: none;
  }
}
.oneid-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 13px;
  transition: background 0.2s;
  flex: 1;
  min-width: 0;
}
.oneid-tabs-scroll .oneid-tab {
  flex: 0 0 auto;
  min-width: 120px;
  max-width: 180px;
}
.oneid-tab:active {
  background: rgba(255, 255, 255, 0.2);
}
.oneid-tab.active {
  background: var(--accent-gold, #c9a227);
  color: #1a1a2e;
  font-weight: 600;
}
.oneid-tab-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.oneid-tab-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.oneid-tab-oneid {
  font-size: 11px;
  opacity: 0.9;
  flex-shrink: 0;
}
// 多个 OneId（>4）：当前选中 + 下拉
.oneid-bar-many .oneid-switcher-label {
  margin-bottom: 6px;
}
.oneid-dropdown-wrap {
  width: 100%;
}
.oneid-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 14px;
  color: #fff;
  transition: background 0.2s;
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}
.oneid-dropdown-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.oneid-dropdown-arrow {
  font-size: 14px;
  opacity: 0.8;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.oneid-dropdown-trigger:active .oneid-dropdown-arrow {
  transform: rotate(-180deg);
}

// 手机号搜索：加载中 / 无结果 — 全屏展示
.oneid-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
.oneid-fullscreen-loading {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  color: #fff;
}
.oneid-fullscreen-empty {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
}
.oneid-fullscreen-content {
  width: 100%;
  max-width: 340px;
  text-align: center;
}
.oneid-fullscreen-empty .oneid-empty-inner {
  padding: 0;
  :deep(.van-empty__image) {
    width: 120px;
    height: 120px;
    filter: brightness(0) invert(1);
    opacity: 0.9;
  }
}
.oneid-fullscreen-empty .oneid-empty-title {
  margin: 24px 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
}
.oneid-fullscreen-empty .oneid-empty-desc {
  margin: 0 0 32px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
}
.oneid-fullscreen-empty .oneid-empty-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: var(--accent-gold, #c9a227);
  border: none;
  color: #1a1a2e;
}

// 悬浮账号切换球
.fixed-account-toggle {
  position: fixed;
  right: 0;
  z-index: 9999;
  background: var(--accent-gold);
  color: black;
  padding: 10px 14px;
  border-radius: 30px 0 0 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: -2px 4px 12px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  touch-action: none; // 禁止触发系统拖拽/滚动
  transition: opacity 0.2s, background-color 0.2s;

  &:active {
    background: #a5845b;
    opacity: 0.9;
  }
  
  .toggle-icon {
    font-size: 18px;
  }
}

// 整页全屏且由整页滚动：不在此容器内产生滚动，由 #app 整页滚动
.home-container {
  min-height: 100vh;
  min-height: 100dvh;
  background: #F1F5F9; // 明确的浅灰蓝背景，拉开层次
  padding: 12px;
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 50px;
  overflow-x: hidden;
  overflow-y: visible;
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;
  color: #1E293B;
  line-height: 1.5;
}

// 状态栏系统
.alert-system {
  margin-bottom: 6px;
  
  &.context-alert {
    margin: 2px 0 6px;
  }
}

.alert-bar {
  border-radius: 6px;
  min-height: 30px;
  padding: 4px 8px;
  margin-bottom: 4px;
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  
  &:last-child {
    margin-bottom: 0;
  }

  :deep(.van-notice-bar__content) {
    font-weight: 500;
  }
}

// 首屏内容：紧凑布局，确保tab可见
.first-screen {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
  padding: 0;
  background: transparent;
}

// 公司主体信息层 - 2.0 高级感重构
.company-identity-layer {
  background: #FFFFFF;
  margin: -10px -12px 0px; 
  padding: 18px 16px 14px;
  position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);

  // 增加一个极细的顶部装饰线条（保时捷金）
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #94724A 0%, #D1B894 100%);
  }

  .company-basic-info {
    display: flex;
    // align-items: center;
    gap: 10px;
    margin-bottom: 12px;

    .comp-icon {
      width: 48px;
      height: 48px;
      background: #FDFBFA;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--accent-gold);
      border: 1.5px solid #F1E9DE;
      box-shadow: inset 0 2px 4px rgba(148, 114, 74, 0.05);
    }

    .comp-main {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;

      .comp-name {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        color: #111827;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .comp-name-text {
        flex-shrink: 0;
      }

      .enterprise-pill {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 999px;
        background: #111827;
        color: #FACC15;
        border: 1px solid #FACC15;
        line-height: 1.2;
      }

      .comp-oneid-pill {
        font-size: 11px;
        color: #4B5563;
        background: #F3F4F6;
        border-radius: 999px;
        padding: 1px 8px;
        line-height: 1.2;
      }

      .company-sync-trace {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .company-header-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }

      .company-header-tags span {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
    }
  }

  .handler-selector-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    // gap: 8px;

    .handler-chips-wrapper {
      display: flex;
      // gap: 10px;
      overflow-x: auto;
      padding-bottom: 6px;
      flex: 1;
      &::-webkit-scrollbar { display: none; }
    }

    .handler-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 18px;
      background: #F8FAFC;
      // border-radius: 20px;
      font-size: 12px;
      color: #64748B;
      white-space: nowrap;
      border: 1px solid #E2E8F0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      .handler-name {
        max-width: 96px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .handler-role-tag {
        padding: 2px 6px;
        border-radius: 999px;
        font-size: 10px;
        line-height: 1;
        background: #EFF6FF;
        color: #1D4ED8;
        border: 1px solid #BFDBFE;
      }

      &:active {
        transform: scale(0.96);
      }

      &.active {
        background: #0F172A; // 更深邃的 Slate-900 作为选中态
        color: #FFFFFF;
        border-color: #0F172A;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);

        .handler-role-tag {
          background: rgba(255, 255, 255, 0.12);
          color: #FACC15;
          border-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}

/* 手机号卡内的经办人 Chip，复用与公司信息区一致的视觉 */
.phone-card .handler-tab-wrapper .handler-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  background: #F8FAFC;
  font-size: 12px;
  color: #64748B;
  white-space: nowrap;
  border: 1px solid #E2E8F0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex-shrink: 0;                  // 联系人变多时保持每项完整，由外层横向滚动
}

.phone-card .handler-tab-wrapper .handler-pill .handler-name {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phone-card .handler-tab-wrapper .handler-pill .handler-role-tag {
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

.phone-card .handler-tab-wrapper .handler-pill:active {
  transform: scale(0.96);
}

.phone-card .handler-tab-wrapper .handler-pill.active {
  background: #0F172A;
  color: #FFFFFF;
  border-color: #0F172A;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
}

.phone-card .handler-tab-wrapper .handler-pill.active .handler-role-tag {
  background: rgba(255, 255, 255, 0.12);
  color: #FACC15;
  border-color: rgba(255, 255, 255, 0.2);
}

// 简洁头部：参考图片排版，带多个Jebsen水印
.premium-header {
  background-color: var(--porsche-black);
  padding: 14px 16px;
  padding-bottom: 50px; // 为悬浮的手机号卡片留出空间
  color: white;
  position: relative;
  border-radius: 6px;
  margin-bottom: 0;
  z-index: 1;
  overflow: hidden;
}

// 多个Jebsen水印背景 - 铺满背景，不重叠（增强可见度）
.watermark-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  // 使用SVG创建重复的JEBSEN水印图案（增强透明度）
  background-image: url("data:image/svg+xml,%3Csvg width='180' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='50' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 10 50)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3Ctext x='100' y='50' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 100 50)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3Ctext x='10' y='90' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 10 90)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3Ctext x='100' y='90' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 100 90)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3C/svg%3E");
  background-repeat: repeat;
  background-position: 0 0;
  background-size: 160px 80px;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 2; // 确保在水印之上
}

// 头像区域
.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

// 右侧信息区域
.header-info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;

  .name-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .company-header-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .company-name-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
      line-height: 1.2;
    }

    .name-main-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
      line-height: 1.2;
    }

    .handler-role-pill {
      padding: 2px 6px;
      border-radius: 999px;
      font-size: 10px;
      line-height: 1;
      background: rgba(255, 255, 255, 0.12);
      color: #FACC15;
      border: 1px solid rgba(250, 204, 21, 0.7);
      max-width: 88px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .account-switch-tag {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 10px;
      padding: 0 4px;
      height: 18px;
      line-height: 16px;
      cursor: pointer;
      &:active {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .trace-icon {
      margin-left: 0;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.2s;

      &:active {
        opacity: 0.7;
        transform: scale(0.9);
      }
    }

      .sync-status-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &.is-healthy {
          background: rgba(7, 193, 96, 0.2);
        }

        &.is-error {
          background: rgba(238, 10, 36, 0.2);
          animation: status-pulse-red 2s infinite;
        }

        &:active {
          transform: scale(0.9);
        }

        .van-icon {
          font-size: 14px;
          font-weight: bold;
        }

        &.is-healthy .van-icon {
          color: #07c160;
        }

        &.is-error .van-icon {
          color: #ee0a24;
        }
      }
  }

  .meta-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.oneid-pill {
  background: rgba(148, 114, 74, 0.1);
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 2px;
  flex-shrink: 0;
}

.customer-type-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 2px;
  flex-shrink: 0;
  // margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  
  :deep(.van-icon) {
    font-size: 12px;
  }
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
  z-index: 1;
  margin-top: 2px;
}

.company-profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  position: relative;
  z-index: 1;
}

.company-profile-pill {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.header-tags span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.header-tags .tag-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.vip-tag {
  background: var(--accent-gold);
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 2px;
  color: #000;
}

.vip-tag .tag-icon {
  color: #000;
}

.biz-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 2px;
  /* 调整为在白色公司卡上也能清晰可见 */
  background: rgba(148, 114, 74, 0.06);
  border: 1px solid rgba(148, 114, 74, 0.35);
  color: #4B5563;
}

.biz-badge .tag-icon {
  color: #94724A;
}

/* 商机标签配色主题（叠加在 biz-badge 上，整体饱和度降低） */
.opp-tag-gold {
  background: #FFF7E6;
  border-color: #F5D5A8;
  color: #8B5E1A;
}
.opp-tag-gold .tag-icon {
  color: #B7791F;
}

.opp-tag-warning {
  background: #FFF4E5;
  border-color: #F8CBA8;
  color: #9A5B26;
}
.opp-tag-warning .tag-icon {
  color: #EA7A26;
}

.opp-tag-purple {
  background: #F5F0FF;
  border-color: #D3C4F5;
  color: #5B4B8A;
}
.opp-tag-purple .tag-icon {
  color: #7C65C2;
}

.opp-tag-blue {
  background: #EDF4FF;
  border-color: #B4CCF5;
  color: #28518A;
}
.opp-tag-blue .tag-icon {
  color: #3B82F6;
}

.opp-tag-teal {
  background: #E9F9F9;
  border-color: #A5E4DA;
  color: #14635C;
}
.opp-tag-teal .tag-icon {
  color: #0F766E;
}

.opp-tag-green {
  background: #EAF7EE;
  border-color: #A8DFC0;
  color: #1E6540;
}
.opp-tag-green .tag-icon {
  color: #16A34A;
}

.warning-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 2px;
  background: #ED6A0C; // 使用与 NoticeBar 一致的警告橘色
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 800;
}

.warning-badge .tag-icon {
  color: white;
}

// 手机号区域：悬浮在黑色头部之上（紧凑版）
.phone-card {
  margin: -40px 16px 0px; // 负边距向上移动，悬浮在头部底部
  background: white;
  border-radius: 6px;
  border: none;
  padding: 8px 14px; // 与车辆信息 asset-row 一致，保证列对齐
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); // 阴影，突出悬浮效果
  position: relative;
  z-index: 10; // 确保在头部之上
}

.phone-card.is-company {
  margin: -26px 16px 0px; // 企业视图下稍微贴近公司卡，保持整体紧凑
}

.phone-card .section-title-inner {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
  letter-spacing: 0.02em;
  margin-bottom: 10px;
}

// 拆开三块：联系电话 / 联系人 / 车辆信息，块间留白
.section-contact-person {
  margin-top: 12px;
}
.section-vehicles {
  margin-top: 12px;
}

// 企业/个人视图：联系人 Tab 横向列表，联系人变多时可横向滚动不溢出
.phone-card .handler-tab-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 2px 4px 0;            // 右侧留一点空间，便于感知可滚动
  border: none;
  background: transparent;
  width: 100%;
  max-width: 100%;
  min-width: 0;                    // 允许在 flex 子项中收缩，避免撑破父级
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
}

.phone-card .handler-tab-item .handler-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phone-card .handler-tab-item .handler-role-tag {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 9px;
  line-height: 1.2;
  background: rgba(255, 255, 255, 0.12);
  color: #FACC15;
  border: 1px solid rgba(250, 204, 21, 0.7);
}

.phone-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

// 与车辆信息 asset-row 同网格，保证车辆标签与车辆信息列对齐
.phone-row {
  display: grid;
  grid-template-columns: minmax(128px, 1fr) 1.3fr 1.8fr 40px;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  margin-bottom: 0;

  &:not(:last-child) {
    margin-bottom: 4px;
  }
}

.num-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.num-contact-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.num-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--porsche-black);
  font-family: ui-monospace, monospace;
  letter-spacing: 0.3px;
  line-height: 1.3;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.is-secondary {
    color: var(--text-sub);
    font-size: 14px;
  }
}

.num-tags {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  align-items: center;
  align-self: center;
  grid-column: 2 / 4;
  min-width: 0;
}

.phone-row .edit-icon {
  grid-column: 4;
  justify-self: end;
  align-self: center;
}

.n-tag {
  font-size: 7px;
  padding: 1px 3px;
  border-radius: 2px;
  border: 1px solid var(--border-color);
  color: var(--text-sub);
  white-space: nowrap;
  line-height: 1.1;

  &.active {
    color: var(--accent-gold);
    border-color: var(--accent-gold);
    background: rgba(148, 114, 74, 0.08);
  }
}

// 手机号区域：统一放大标签尺寸，并使用 pill 形态，保证车辆 tag 与主号 tag 视觉统一
.phone-card .num-tags .n-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 999px;
}

// 车辆定语标签：在统一基础上，仅增加车 icon，不再单独改变尺寸，避免不一致
.phone-card .num-tags .vehicle-tag .vehicle-tag-icon {
  font-size: 12px;
  line-height: 1;
}

// 手机号身份标签（公司多经办人场景）
.n-tag.is-contact {
  color: #1D4ED8;
  border-color: #DBEAFE;
  background: #EFF6FF;
}

.n-tag.is-servicer {
  color: #6D28D9;
  border-color: #EDE9FE;
  background: #F5F3FF;
}

// 个人类型关系标签（本人、配偶、公司电话）：与公司类型一致的填充标签样式，提升辨识度
.n-tag.is-relation {
  color: #1D4ED8;
  border-color: #DBEAFE;
  background: #EFF6FF;
}

.edit-icon {
  font-size: 12px;
  cursor: pointer;
  padding: 2px;
  opacity: 0.7;
  color: #1989fa;
  transition: opacity 0.2s;
  flex-shrink: 0;
  
  &:active {
    opacity: 1;
  }
}

.phone-divider {
  height: 1px;
  background: #F1F5F9;
  margin: 4px 0;
}

.phone-more-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 12px;
  margin-top: 4px;
  color: var(--brand-primary, #94724A);
  font-size: 13px;
  background: #FAFAF9;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  .phone-more-arrow {
    font-size: 16px;
    font-weight: 600;
  }
  &:active {
    opacity: 0.85;
  }
}

// 内容板块：统一间距和分隔（紧凑版）
.container {
  padding: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.block-h {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  padding: 8px 14px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.block-h .title-text {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  font-weight: 600;
}

.block-more {
  font-size: 12px;
  color: var(--text-sub);
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  text-transform: none;
  transition: color 0.2s;
  
  &:active {
    color: var(--accent-gold);
  }
}

// 资产档案：简化样式
.asset-box {
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.asset-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.6fr auto;
  align-items: center;
  padding: 8px 14px;
  gap: 10px;
  cursor: pointer;

  &:not(:last-child) {
    margin-bottom: 4px;
  }
}

.asset-row-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.model-name {
  font-weight: 400;
  font-size: 12px;
  color: var(--text-main);
}

.plate-val {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-gold);
  letter-spacing: 0.5px;
}

.vin-val {
  font-size: 10px;
  color: var(--text-sub);
  font-family: ui-monospace, monospace;
}

.status-text {
  font-size: 10px;
  color: var(--text-sub);
  text-align: right;
  cursor: pointer;
}

.section-empty {
  padding: 12px 14px;
  font-size: 12px;
  color: var(--text-sub);
}

// 账户权益：简化样式（紧凑版）
.asset-coupon-box {
  background: #fff;
  border: none;
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0;
  margin: 0;
}

.asset-coupon-name {
  font-size: 11px;
  font-weight: 700;

  small {
    font-weight: normal;
    color: var(--text-sub);
    margin-left: 3px;
    font-size: 10px;
  }
}

.asset-coupon-amount {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-gold);
}

// 画像标签：严格对齐设计稿（行距、圆角、字号都用 px 固定）
.tags-list-container {
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 8px;
  padding: 12px 14px 4px;
}

.tag-item-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  min-height: 24px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.1s ease,
    opacity 0.2s ease;

  &:active {
    opacity: 0.9;
    transform: scale(0.97);
  }
}

.tag-source-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}

// 手工标签：灰底小块，和整体 tag 融合
.tag-source-badge.manual {
  background-color: #E2E8F0;
  color: #4B5563;
}

// 自动标签（贷款客户）：左侧绿色块
.tag-source-badge.auto {
  background-color: #22C55E;
  color: #FFFFFF;
}

.tag-name-text {
  white-space: nowrap;
}

.empty-tags-text {
  color: var(--text-sub);
  font-size: 11px;
}

// 联系人档案卡片：极简首屏，少占空间
.contact-profile-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.contact-profile-card .block-h-contact {
  padding: 6px 12px;
  font-size: 13px;
}
.contact-profile-card .block-more {
  font-size: 12px;
  color: var(--accent-gold);
  font-weight: 500;
}
.contact-profile-card .title-role-hint {
  font-size: 12px;
  color: var(--text-sub);
  font-weight: 400;
  margin-left: 4px;
}

// 联系人档案网格（极紧凑）
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #fff;
  padding: 6px 12px 8px;
  gap: 0;
}

.info-node {
  background: transparent;
  padding: 4px 4px;
  text-align: center;
  border-right: 1px solid var(--border-color);
}
.info-node:nth-child(4n) {
  border-right: none;
}

.node-l {
  font-size: 10px;
  color: var(--text-sub);
  margin-bottom: 2px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.node-v {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.25;
}

// 首屏仅显示「地址 N 条 · 邮箱 N 条」一行
.info-node-summary {
  grid-column: 1 / -1;
  border-right: none;
  text-align: left;
  padding: 4px 0 0;
  margin-top: 4px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.summary-chip {
  font-size: 11px;
  color: var(--text-sub);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 8px;
  border-radius: 4px;
}
.summary-labels {
  margin-left: 2px;
  color: var(--text-sub);
  opacity: 0.9;
}

// 底部 Tab 固定栏
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-top: none;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  z-index: 100;
}

.nav-item {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub);

  &.active {
    color: var(--accent-gold);
  }
}

// 姓名卡片（简化样式）
.info-card.name-card {
  background: #ffffff !important;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: none;
  position: relative;
  
  .name-section {
    padding: 12px 16px;
    padding-bottom: 12px;
    position: relative;
    
    .name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: nowrap;
      
      .name-with-icon {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        
        .name-text {
          font-size: 20px; // 稍微减小字体
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.2px;
          line-height: 1.2;
          white-space: nowrap;
        }
        
        .source-icon {
          font-size: 16px; // 减小图标
          color: var(--van-tag-primary-color);
          cursor: pointer;
          transition: all 0.2s;
          padding: 3px; // 减少内边距
          border-radius: 50%;
          flex-shrink: 0;
          
          &:hover {
            background: #FCFAF6;
            transform: scale(1.1);
          }
          
          &:active {
            transform: scale(0.95);
          }
        }
      }
      
      .name-row-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        flex-wrap: nowrap;
      }
      
      .customer-id {
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        
        .id-label {
          font-size: 12px;
          color: #969799;
          font-weight: 400;
          letter-spacing: 0.2px;
        }
        
        .id-value {
          font-size: 11px; // 减小字体
          color: #646566;
          font-weight: 500;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          letter-spacing: 0.3px; // 减少字间距
          padding: 2px 5px; // 减少内边距
          background: #f7f8fa;
          border-radius: 3px; // 减小圆角
        }
      }
      
        .identity-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px; // 减少间距
          padding: 4px 10px; // 减少内边距
          background: #f0f7ff;
          border-radius: 12px; // 减小圆角
          border: none;
          flex-shrink: 0;
          white-space: nowrap;
          
          .identity-icon {
            font-size: 12px; // 减小图标
            color: var(--van-tag-primary-color);
            
            &.is-company {
              color: var(--van-tag-primary-color);
            }
          }
          
          .identity-text {
            font-size: 11px; // 减小字体
            color: var(--van-tag-primary-color);
            font-weight: 500;
            letter-spacing: 0.2px;
          }
        }
    }
  }
  
  .card-content-wrapper {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .phone-section {
      .phone-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
        
        .phone-icon {
          flex-shrink: 0;
          color: #646566;
        }
        
        .section-title {
          font-size: 11px; // 使用弱化样式，类似客户ID
          font-weight: 400; // 弱化字重
          color: #969799; // 弱化颜色，类似客户ID标签
          flex-shrink: 0;
          white-space: nowrap;
          letter-spacing: 0.2px; // 与客户ID保持一致
        }
      }
      
      .phone-list {
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        align-items: center;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        min-width: 0;
        
        &::-webkit-scrollbar {
          display: none;
        }
        
        .phone-item {
          display: flex;
          align-items: center;
          gap: 4px; // 增加间距，让号码更突出
          padding: 4px 8px; // 增加内边距，让号码更突出
          background: #f7f8fa;
          border-radius: 4px; // 稍微增加圆角
          border: 1px solid #ebedf0;
          white-space: nowrap;
          flex-shrink: 0;
          
          
          
          .phone-number {
            font-size: 14px; // 增大字体，突出重要信息
            font-weight: 700; // 加粗，突出重要信息
            color: #1a1a1a; // 使用更深的颜色，增强对比度
            white-space: nowrap;
            line-height: 1.4;
            letter-spacing: 0.3px; // 增加字间距，提升可读性
          }
          
          .tag-primary,
          .tag-business {
            margin: 0;
            flex-shrink: 0;
          }
        }
        
        .more-phone-btn {
          flex-shrink: 0;
        }
      }
    }
    
    .opportunity-section {
      .opportunity-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
        
        .section-title {
          font-size: 11px; // 使用弱化样式，类似客户ID
          font-weight: 400; // 弱化字重
          color: #969799; // 弱化颜色，类似客户ID标签
          flex-shrink: 0;
          white-space: nowrap;
          letter-spacing: 0.2px; // 与客户ID保持一致
        }
      }
      
      .opportunity-types {
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        cursor: pointer;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        min-width: 0;
        
        &::-webkit-scrollbar {
          display: none;
        }
        
        .opportunity-tag {
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
      }
    }
  }
}


// 优惠券卡片：简化样式
.coupon-card {
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.8;
  }
  
  .coupon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
    
    .coupon-title {
      font-size: 12px; // 减小字体
      font-weight: 600;
      color: #323233;
    }
    
    .arrow-icon {
      font-size: 12px;
      color: #969799;
    }
  }
  
  .coupon-info {
    padding: 12px 16px;
    display: flex;
    gap: 12px;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .coupon-row {
      display: flex;
      font-size: 11px; // 减小字体
      white-space: nowrap;
      flex-shrink: 0;
      line-height: 1.3; // 优化行高
      
      .label {
        color: #969799;
        margin-right: 3px;
      }
      
      .value {
        color: #323233;
        
        &.amount {
          color: #323233;
          font-weight: 600;
        }
      }
    }
  }
}

// 车辆卡片：统一样式
.vehicle-card {
  .card-header {
    padding: 12px 16px;
    background: #fafafa;
  }
  
  .vehicle-list {
    padding: 12px 16px;
    
    .vehicle-item {
      padding: 6px 8px; // 减少内边距
      background: #f7f8fa;
      border-radius: 4px;
      margin-bottom: 4px; // 减少间距
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .vehicle-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        flex-wrap: nowrap;
        
        .vehicle-main-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
          min-width: 0;
          flex-wrap: nowrap;
          overflow: hidden;
          
          .vehicle-icon {
            flex-shrink: 0;
            color: #646566;
          }
          
          .vehicle-info-wrapper {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .vehicle-info-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 6px;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            flex: 1;
            min-width: 0;
            
            &::-webkit-scrollbar {
              display: none;
            }
            
            .vehicle-model {
              font-size: 12px; // 减小字体
              font-weight: 600;
              color: #323233;
              flex-shrink: 0;
              white-space: nowrap;
              line-height: 1.3;
            }
            
            .info-value {
              font-size: 11px; // 减小字体
              color: #646566;
              line-height: 1.3; // 优化行高
              white-space: nowrap;
              flex-shrink: 0;
              
              &.plate-number {
                font-weight: 500;
                color: #323233;
              }
            }
            
            .vehicle-status-wrapper {
              display: flex;
              align-items: center;
              gap: 2px; // 减少间距
              cursor: pointer;
              padding: 2px 5px; // 减少内边距
              border-radius: 3px; // 减小圆角
              transition: background-color 0.2s;
              flex-shrink: 0;
              margin-left: auto; // 状态标签靠右对齐
              
              &:hover {
                background-color: #ebedf0;
              }
              
              &:active {
                background-color: #dcdee0;
              }
              
              .status-tag-clickable {
                margin: 0;
              }
              
              .status-arrow-icon {
                font-size: 10px; // 减小图标
                color: #969799;
                transition: transform 0.2s;
              }
              
              &:active .status-arrow-icon {
                transform: rotate(180deg);
              }
            }
          }
        }
      }
    }
  }
}

// 标签卡片：统一样式
.tags-card {
  .card-header {
    padding: 12px 16px;
    background: #fafafa;
  }
  
  .tags-content {
    padding: 12px 16px;
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .clickable-tag {
        cursor: pointer;
        transition: all 0.2s;
        margin: 0;
        
        &:active {
          transform: scale(0.95);
        }
        
        // 特殊标签样式："首保流失15个月"和"PCN售后"
        &.special-tag {
          opacity: 0.85;
          font-weight: 500;
        }
      }
    }
    
    .empty-tags {
      color: #969799;
      font-size: 11px; // 减小字体
      padding: 2px 0;
    }
  }
}

// 弹窗样式（统一设计规范 - 紧凑版）
.opportunity-dialog,
.vehicle-dialog,
.asset-dialog,
.tag-manager {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0;
    flex-shrink: 0;
    
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .popup-header-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .popup-header-subtitle {
      font-size: 11px;
      color: var(--text-sub);
      line-height: 1.3;
    }

    .popup-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .van-icon {
      font-size: 16px;
      color: var(--text-sub);
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s;
      
      &:active {
        opacity: 0.7;
      }
    }
  }
  
  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding-top: 10px;
  }
  
  .popup-footer {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
    margin-top: auto;
    
    .van-button {
      flex: 1;
      font-size: 14px !important;
      height: 40px;
    }
  }

  .opportunity-item {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    padding: 10px 12px;
    margin-bottom: 6px;
    border: 1px solid var(--border-color);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .opportunity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 6px;
      
      .opportunity-type-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        
        .opportunity-type-tag {
          margin: 0;
          font-weight: 500;
        }
      }
      
      .opportunity-status-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        
        .push-status-tag {
          margin: 0;
        }
      }
    }
    
    .opportunity-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        font-size: 12px;
        min-height: 20px;
        line-height: 1.3;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: var(--text-sub);
          min-width: 70px;
          flex-shrink: 0;
          font-size: 12px;
        }
        
        .value {
          color: var(--text-main);
          flex: 1;
          word-break: break-all;
          font-size: 12px;
        }
        
        .priority-tag {
          margin: 0;
        }
      }
    }
  }
  
  .asset-item {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    margin-bottom: 10px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
      
      .record-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-main);
      }
    }
    
    .card-content {
      padding: 12px 14px;
      
      .info-row-double {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 16px;
        margin-bottom: 6px;
        font-size: 12px;
        line-height: 1.4;
        &:last-of-type {
          margin-bottom: 0;
        }
        .info-cell {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          .label {
            color: var(--text-sub);
            flex-shrink: 0;
            font-size: 11px;
            min-width: 72px;
          }
          .value {
            color: var(--text-main);
            flex: 1;
            word-break: break-all;
            font-size: 12px;
          }
          .value.amount {
            font-weight: 600;
            color: var(--accent-gold, #b8860b);
          }
        }
      }
      
      .info-row-single {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.4;
        .label {
          color: var(--text-sub);
          flex-shrink: 0;
          font-size: 11px;
          min-width: 72px;
        }
        .value {
          color: var(--text-main);
          flex: 1;
          word-break: break-all;
        }
      }
      
      .info-row {
        display: flex;
        margin-bottom: 4px;
        font-size: 12px;
        line-height: 1.3;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: var(--text-sub);
          min-width: 80px;
          flex-shrink: 0;
          font-size: 12px;
        }
        
        .value {
          color: var(--text-main);
          flex: 1;
          word-break: break-all;
          font-size: 12px;
          
          &.amount {
            color: var(--accent-gold);
            font-weight: 700;
            font-size: 13px;
          }
        }
      }
    }
  }
  
  .vehicle-item-full {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    padding: 10px 12px;
    margin-bottom: 6px;
    border: 1px solid var(--border-color);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .vehicle-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      
      .vehicle-main {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }
      
      .vehicle-model {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .vehicle-handler-inline {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        font-size: 11px;
        color: var(--text-sub);
      }

      .vehicle-handler-label {
        color: var(--text-sub);
      }

      .vehicle-handler-name {
        color: var(--text-main);
        font-weight: 500;
      }

      .vehicle-role-row {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
      }

      .vehicle-role-label {
        color: var(--text-sub);
      }

      .vehicle-role-name {
        color: var(--text-main);
        font-weight: 500;
      }

      .vehicle-handler-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
      }

      .vehicle-handler-role-pill {
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 10px;
        line-height: 1.2;
        background: rgba(148, 114, 74, 0.08);
        color: var(--accent-gold);
        border: 1px solid rgba(148, 114, 74, 0.4);
      }

      .vehicle-vin {
        font-size: 11px;
        color: var(--text-sub);
        margin-left: 8px;
        font-weight: 400;
      }
      
      .vehicle-status-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: var(--bg-slate);
        }
        
        &:active {
          background-color: var(--border-color);
        }
        
        .status-tag-clickable {
          margin: 0;
        }
        
        .status-arrow-icon {
          font-size: 12px;
          color: var(--text-sub);
          transition: transform 0.2s;
        }
        
        &:active .status-arrow-icon {
          transform: rotate(180deg);
        }
      }
    }
    
    .vehicle-info {
      .info-item {
        display: flex;
        margin-bottom: 6px;
        font-size: 12px;
        line-height: 1.3;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: var(--text-sub);
          min-width: 70px;
          flex-shrink: 0;
          font-size: 12px;
        }
        
        .value {
          color: var(--text-main);
          flex: 1;
          font-size: 12px;
        }
      }

      .vehicle-detail {
        margin-top: 8px;
        padding: 8px 8px 6px;
        background: #f7f8fa;
        border-radius: 6px;
      }

      .vehicle-detail-section {
        & + .vehicle-detail-section {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed var(--border-color);
        }
      }

      .vehicle-detail-section-title {
        font-size: 11px;
        color: var(--text-sub);
        margin-bottom: 4px;
        display: inline-flex;
        align-items: center;
        gap: 4px;

        &::before {
          content: '';
          width: 3px;
          height: 10px;
          border-radius: 999px;
          background: var(--accent-gold);
        }
      }

      .vehicle-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 12px;
        row-gap: 4px;
      }

      .detail-info {
        flex-direction: column;
        align-items: flex-start;

        .label {
          min-width: auto;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .value {
          font-size: 12px;
          font-weight: 500;
        }

        &.is-editable {
          flex-direction: row;
          align-items: center;
          cursor: pointer;
          padding: 4px 0;

          .role-set-link {
            margin-left: auto;
            font-size: 11px;
            color: var(--accent-gold);
          }
        }
      }

      .vehicle-role-inline-picker {
        margin-top: 8px;
        padding: 10px 12px;
        background: var(--bg-page, #fff);
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }
      .vehicle-role-inline-picker-title {
        font-size: 12px;
        color: var(--text-sub);
        margin-bottom: 8px;
      }
      .vehicle-role-inline-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .vehicle-role-tag {
        padding: 4px 10px;
        font-size: 12px;
        color: var(--accent-gold);
        background: rgba(148, 114, 74, 0.08);
        border: 1px solid rgba(148, 114, 74, 0.35);
        border-radius: 999px;
        cursor: pointer;
      }
      .vehicle-role-tag:active {
        opacity: 0.8;
      }
      .vehicle-role-tag.is-disabled {
        color: var(--text-sub);
        background: var(--bg-page, #f0f0f0);
        border-color: var(--border-color);
        cursor: not-allowed;
        opacity: 0.6;
      }
      .vehicle-role-inline-cancel {
        margin-top: 10px;
        font-size: 12px;
        color: var(--text-sub);
        text-align: center;
        cursor: pointer;
      }
      .vehicle-role-inline-cancel:active {
        opacity: 0.8;
      }
    }

    // 车辆状态内联选择器：与 .vehicle-header / .vehicle-info 同级
    .vehicle-status-inline-picker {
      margin-top: 8px;
      padding: 10px 12px;
      background: var(--bg-page, #fff);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .vehicle-status-inline-picker-title {
      font-size: 12px;
      color: var(--text-sub);
      margin-bottom: 8px;
    }
    .vehicle-status-inline-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .vehicle-status-inline-tag {
      padding: 4px 10px;
      font-size: 12px;
      color: var(--accent-gold);
      background: rgba(148, 114, 74, 0.08);
      border: 1px solid rgba(148, 114, 74, 0.35);
      border-radius: 999px;
      cursor: pointer;
    }
    .vehicle-status-inline-tag:active {
      opacity: 0.8;
    }
    .vehicle-status-inline-tag.is-current {
      color: #fff;
      background: var(--accent-gold);
      border-color: var(--accent-gold);
    }
    .vehicle-status-inline-cancel {
      margin-top: 10px;
      font-size: 12px;
      color: var(--text-sub);
      text-align: center;
      cursor: pointer;
    }
    .vehicle-status-inline-cancel:active {
      opacity: 0.8;
    }
    .vehicle-header .status-arrow-icon.is-expanded {
      transform: rotate(180deg);
    }
  }
  
// 标签管理弹窗样式：上方已拥有标签 / 下方标签池
&.tag-manager {
  .tag-manager-content {
    padding-top: 8px;
    padding-bottom: 12px;
  }

  .tag-manager-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .tag-manager-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #1F2933;
    margin-bottom: 10px;
  }

  .tag-manager-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
  }

  .tag-manager-category {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .tag-manager-category-title {
    font-size: 12px;
    color: #6B7280;
    margin-bottom: 6px;
  }

  .tag-manager-tag-list--pool {
    /* 与已拥有同布局：flex wrap，仅下方分类用 */
  }

  /* 已拥有：棕色胶囊 + 删除 icon */
  .tag-manager-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    min-height: 28px;
    border-radius: 4px;
    background-color: #8B6A3D;
    color: #FFFFFF;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    border: 1px solid transparent;
    transition:
      background-color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.1s ease,
      opacity 0.15s ease;

    &:active {
      transform: scale(0.97);
      opacity: 0.9;
    }

    &.selected {
      opacity: 0.95;
    }
  }

  /* 标签池未选中：必须写在 .tag-manager-tag 后面，才能覆盖基础色，避免样式串用 */
  .tag-manager-tag--pool {
    background-color: #FFFFFF;
    color: #6B7280;
    border: 1px solid #D1D5DB;
    box-shadow: none;
  }

  .tag-manager-tag--pool:active {
    background-color: #F9FAFB;
    border-color: #9CA3AF;
    color: #374151;
  }

  .tag-manager-tag-text {
    white-space: nowrap;
  }

  .tag-manager-tag-close {
    margin-left: 6px;
    font-size: 12px;
  }

  .tag-manager-empty-text {
    font-size: 12px;
    color: #9CA3AF;
  }
}
  
    .empty-state {
      padding: 40px 0;
      text-align: center;
    }
  }

// Tab 容器（统一tab和内容的视觉连接）
.tab-container {
  margin-top: 0;
  margin-bottom: 8px;
  background: white;
  border: none;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

// Tab 导航样式（与内容区域统一）
.tab-nav-wrapper {
  display: flex;
  align-items: stretch;
  background: #fafafa;
  border-bottom: none;
  margin: 0;
  
  .tab-nav-item {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-sub);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    padding: 8px 6px;
    user-select: none;
    position: relative;
    background: transparent;
    min-width: 0;
    
    // 底部指示线
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: transparent;
      transition: background 0.2s;
    }
    
    &.active {
      color: var(--accent-gold);
      background: white;
      font-weight: 700;
      
      // 激活状态的底部指示线
      &::after {
        background: var(--accent-gold);
      }
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}

.tab-content-wrapper {
  margin: 0;
  background: white;
  
  .tab-content {
    min-height: 200px;
    
    // 确保内容区域与tab无缝连接
    :deep(.maintenance-container),
    :deep(.insurance-container) {
      background: transparent;
      padding: 12px;
      padding-top: 8px;
      margin: 0;
    }
    
    // 确保内容区域有合适的间距
    :deep(.container) {
      padding: 0;
    }
  }
}

.header {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 12px;
  color: white;

  .title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .customer-id {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .header-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .header-info-item {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      line-height: 1.5;

      .header-info-icon {
        font-size: 16px;
        margin-right: 6px;
        margin-top: 2px;
        flex-shrink: 0;
        opacity: 0.9;

        &.opportunity-icon {
          color: #ffd700;
        }

        &.consumption-icon {
          color: #ffeb3b;
        }

        &.tag-icon {
          color: #4fc3f7;
        }

        &.segment-icon {
          color: #81c784;
        }
      }

      .header-info-label {
        font-weight: 500;
        opacity: 0.95;
        flex-shrink: 0;
        margin-right: 4px;
      }

      .header-info-values {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      .header-info-value {
        opacity: 0.95;

        &.consumption-value {
          font-weight: 600;
          color: #ffeb3b;
        }
      }

      .separator {
        margin: 0 2px;
        opacity: 0.8;
      }
    }
  }
}

.appointment-card-top {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  border: 2px solid var(--van-tag-primary-color);

  .card-header {
    padding: 16px;
    border-bottom: 1px solid #ebedf0;
    background: linear-gradient(135deg, #FCFAF6 0%, #F5F0E8 100%);
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-tag-primary-color);
  }

  .card-content {
    padding: 0;
  }
}

// 顶部状态栏系统
.alert-system {
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
  width: 100%;
  background: white;
}

.alert-bar {
  width: 100%;
  cursor: pointer;
  transition: opacity 0.2s;
  --van-notice-bar-height: 20px;
  --van-notice-bar-font-size: 10px;

  &:active {
    opacity: 0.8;
  }

  :deep(.van-notice-bar) {
    width: 100%;
    padding: 2px 8px;
    font-size: var(--van-notice-bar-font-size);
    font-weight: 600;
    min-height: auto;
    height: 20px;
    line-height: 1.2;
  }

  :deep(.van-notice-bar__content) {
    width: 100%;
    line-height: 1.2;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: var(--van-notice-bar-font-size);
  }

  :deep(.van-notice-bar__left-icon) {
    font-size: 10px;
    margin-right: 3px;
  }
}

// 冲突提示样式 - 橙色背景
.conflict-alert-bar {
  border-bottom: 1px solid var(--border-color);

  :deep(.van-notice-bar) {
    background: #FFFBEB;
    color: #B45309;
  }

  :deep(.van-notice-bar__left-icon) {
    color: #B45309;
  }
}

// 操作提示样式 - 琥珀金浅色背景，与冲突提示区分
.operation-alert-bar {
  border-top: 1px solid #F5E6D3;
  border-bottom: 1px solid var(--border-color);

  :deep(.van-notice-bar) {
    background: #FEF9F3;
    color: #94724A;
  }

  :deep(.van-notice-bar__left-icon) {
    color: #94724A;
  }

  .operation-text {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .operation-time {
    margin-left: 4px;
    font-weight: 500;
  }
}

.multi-source-alert {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);

  :deep(.van-notice-bar) {
    padding: 12px 16px;
    
    .van-notice-bar__content {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
  }

  .source-link {
    color: var(--van-tag-primary-color);
    text-decoration: underline;
    cursor: pointer;
    margin-left: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.important-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 16px;

  .info-item {
    background: white;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .info-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .info-content {
      flex: 1;
      min-width: 0;

      .info-label {
        font-size: 11px;
        color: #969799;
        margin-bottom: 4px;
        font-weight: 400;
      }

      .info-value {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        word-break: break-all;
        line-height: 1.4;

        &.consumption-value {
          font-size: 15px;
          font-weight: 700;
          color: #ee0a24;
        }
      }
    }

    &.opportunity-type {
      .info-icon {
        background: linear-gradient(135deg, #e8f8f0 0%, #d0f0e0 100%);
        color: #07c160;
      }
    }

    &.segment-type {
      .info-icon {
        background: linear-gradient(135deg, #fff4e8 0%, #ffe8d0 100%);
        color: #ff976a;
      }
    }

    &.consumption-type {
      .info-icon {
        background: linear-gradient(135deg, #ffe8e8 0%, #ffd0d0 100%);
        color: #ee0a24;
      }
    }
  }
}

.loading {
  padding: 40px 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card {
  background: white;
  border-radius: 8px; // 减小圆角，更紧凑
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); // 减小阴影
  margin-top: 0;
  
  // 排除名片卡片，名片卡片使用特殊样式
  &:not(.name-card) {
    background: white;
  }

  &.mobile-manager-card {
    border: 2px solid var(--van-tag-primary-color);
    
    .card-header {
      background: linear-gradient(135deg, #FCFAF6 0%, #F5F0E8 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .card-header {
    padding: 5px 10px; // 减少内边距
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 12px; // 减小字体
    font-weight: 600;
    color: #323233;
    display: flex;
    align-items: center;
    gap: 6px;
    
    .title-icon {
      flex-shrink: 0;
      color: #646566;
    }
  }
  
  .edit-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .edit-icon {
      flex-shrink: 0;
    }
  }

  .card-content {
    padding: 0;
    
    // 基本信息卡片样式优化 - 两列布局
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    :deep(.van-cell) {
      padding: 5px 10px; // 减少内边距
      font-size: 11px; // 减小字体
      border-bottom: 1px solid #f7f8fa;
      border-right: 1px solid #f7f8fa;
      line-height: 1.3; // 优化行高
      
      &:nth-child(2n) {
        border-right: none;
      }
      
      &:nth-last-child(-n+2) {
        border-bottom: none;
      }
      
      .van-cell__title {
        font-size: 11px; // 减小字体
        color: #969799;
        min-width: auto;
      }
      
      .van-cell__value {
        font-size: 11px; // 减小字体
        color: #323233;
      }
    }
  }
  
  // 基本信息网格布局
  &.basic-info-card {
    .card-content {
      // 基本信息卡片不使用 card-content 的网格布局
      display: block;
      padding: 0;
    }
    
    .basic-info-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr); // 改为5列
      gap: 0;
      padding: 0;
      
      .info-grid-item {
        padding: 6px 3px; // 进一步减少内边距，适应5列布局
        display: flex;
        flex-direction: column;
        align-items: center; // 水平居中
        justify-content: center; // 垂直居中
        gap: 2px; // 减少标签和值之间的间距
        border-bottom: 1px solid #f7f8fa;
        border-right: 1px solid #f7f8fa;
        text-align: center; // 文本居中
        
        &:nth-child(5n) {
          border-right: none;
        }
        
        &:nth-last-child(-n+5) {
          border-bottom: none;
        }
        
        // 跨列显示（客户类型）
        &[style*="grid-column"] {
          grid-column: 1 / -1;
          border-right: none;
          border-bottom: 1px solid #f7f8fa;
          padding: 6px 3px; // 保持一致的紧凑内边距
          
          &:last-child {
            border-bottom: none;
          }
        }
        
        .info-label {
          font-size: 10px; // 减小字体
          color: #969799;
          font-weight: 400;
          line-height: 1.2;
          text-align: center; // 文本居中
        }
        
        .info-value {
          font-size: 11px; // 减小字体
          color: #323233;
          font-weight: 500;
          line-height: 1.3;
          text-align: center; // 文本居中
        }
      }
    }
  }
}

.basic-info-editor {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;

  /* 弹窗内容区：预留右侧空间，避免「删」被滚动条或边缘遮挡 */
  .popup-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: 10px;
    padding-right: 16px;
    scrollbar-gutter: stable;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .van-icon {
      font-size: 16px;
      color: var(--text-sub);
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s;
      
      &:active {
        opacity: 0.7;
      }
    }
  }

  .basic-info-field-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    margin-bottom: 0;
    background: var(--van-cell-background);
    .field-label {
      font-size: 14px;
      color: var(--van-cell-label-color);
      flex-shrink: 0;
      width: 60px;
    }
    .inline-tags { margin-bottom: 0; }
    .gender-options {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gender-opt {
      font-size: 14px;
      padding: 6px 14px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.06);
      color: var(--text-sub);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      &.active {
        background: rgba(201, 162, 39, 0.25);
        color: var(--theme-primary, #c9a227);
        font-weight: 600;
      }
    }
  }
  .basic-info-multi-section {
    margin-bottom: 16px;
    .multi-section-label {
      font-size: 12px;
      color: var(--text-sub);
      margin-bottom: 8px;
    }
    .multi-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      padding-right: 4px; /* 与右侧留白配合，避免「删」被遮挡 */
      :deep(.van-field) { flex: 1; min-width: 0; margin-bottom: 0; }
    }
    .multi-block {
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6px 8px;
    }
    .inline-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }
    .inline-tag {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: var(--text-sub);
      cursor: pointer;
      &.active {
        background: rgba(201, 162, 39, 0.2);
        color: var(--theme-primary, #c9a227);
        font-weight: 500;
      }
    }
    .area-inline-wrap {
      margin-top: 6px;
      padding: 8px 0;
      border-top: 1px solid var(--border-color);
      :deep(.van-area) { background: #fff; }
    }
    .multi-remove {
      font-size: 12px;
      color: var(--theme-primary, #c9a227);
      flex-shrink: 0;
      min-width: 28px;
      text-align: right;
      cursor: pointer;
      padding: 4px 0;
    }
    .address-order-label {
      font-size: 12px;
      color: var(--text-sub);
      margin-right: 4px;
    }
    .address-order-link {
      font-size: 12px;
      color: var(--theme-primary, #c9a227);
      padding: 2px 4px;
      border-radius: 3px;
      cursor: pointer;
    }
    .address-primary-chip {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 10px;
      border: 1px solid rgba(201, 162, 39, 0.3);
      color: var(--text-sub);
      background: rgba(0, 0, 0, 0.02);
      cursor: pointer;
      margin-left: 2px;
      &.active {
        background: rgba(201, 162, 39, 0.12);
        color: var(--theme-primary, #c9a227);
        border-color: rgba(201, 162, 39, 0.5);
        font-weight: 500;
      }
    }
    .van-button { margin-top: 6px; }
  }

  .popup-content :deep(.van-field) {
    background: white;
    border-radius: 4px;
    margin-bottom: 10px;

    .van-field__label {
      color: var(--text-sub);
      font-size: 12px;
    }

    .van-field__control {
      color: var(--text-main);
      font-size: 13px;
    }
  }

  .edit-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;

    .van-button {
      flex: 1;
      font-size: 14px !important;
      height: 40px;
    }
  }

.mobile-preview {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .mobile-preview-item {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    border: 1px solid #ebedf0;

    &.is-primary {
      background: #FCFAF6;
      border-color: var(--accent-gold);
    }

    .mobile-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .mobile-number {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        flex: 1;
      }
    }
  }
}

.tags-section {
  padding: 16px;

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tag-item {
    margin: 0;
  }

  .empty-tags {
    color: #969799;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .add-tag-btn {
    width: 100%;
  }
}

.preferred-car-field {
  .preferred-car-tags {
    padding: 12px 16px;
    border-top: 1px solid #ebedf0;

    .tags-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .tags-label {
        font-size: 14px;
        color: #323233;
        font-weight: 500;
      }
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-item {
      margin: 0;
    }

    .empty-tags {
      color: #969799;
      font-size: 14px;
    }
  }
}

.tab-content {
  min-height: 200px;
  background: #f7f8fa;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .maintenance-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .card-header {
      padding: 16px;
      border-bottom: 1px solid #ebedf0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .record-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }

    .card-content {
      padding: 16px;

      .info-row {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 80px;
          flex-shrink: 0;
        }

        .value {
          color: #323233;
          flex: 1;
          word-break: break-all;

          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
  }
  
  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}

.list-section {
  padding: 16px;

  .list-item {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        flex: 1;
      }
    }

    .item-content {
      .item-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 70px;
          flex-shrink: 0;
        }

        .value {
          color: #323233;
          flex: 1;
          word-break: break-all;

          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
  }
}

.tag-selector {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .van-icon {
      font-size: 16px;
      color: var(--text-sub);
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tag-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--border-color);

    &.is-selected {
      background: #FCFAF6;
      border-color: var(--accent-gold);
      box-shadow: 0 1px 4px rgba(148, 114, 74, 0.16);
    }

    &:active {
      background: #f2f3f5;
    }
  }

  .popup-footer {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;

    .van-button {
      flex: 1;
      font-size: 14px !important;
      height: 40px;
    }
  }

  .empty-state {
    padding: 30px 0;
    text-align: center;
  }
}

// 响应式适配（侧边栏宽度约 350px）
@media (max-width: 400px) {
  .home-container {
    padding: 8px;
  }

  .header {
    padding: 12px;

    .title {
      font-size: 18px;
    }

    .customer-id {
      font-size: 13px;
    }

    .header-info {
      margin-top: 10px;
      padding-top: 10px;
      gap: 6px;

      .header-info-item {
        font-size: 13px;
        line-height: 1.4;

        .header-info-icon {
          font-size: 14px;
          margin-right: 5px;
        }
      }
    }
  }

  .appointment-card-top {
    margin-bottom: 12px;

    .card-header {
      padding: 12px;
    }

    .card-title {
      font-size: 15px;
    }
  }

  .conflict-alert-top {
    :deep(.van-notice-bar) {
      padding: 3px 10px;
      font-size: 12px;
    }
  }

  .multi-source-alert {
    :deep(.van-notice-bar) {
      padding: 3px 10px;
      font-size: 12px;
    }
  }

  .operation-alert {
    :deep(.van-notice-bar) {
      padding: 3px 10px;
      font-size: 12px;
    }
  }

  .important-info {
    grid-template-columns: 1fr;
    gap: 8px;

    .info-item {
      padding: 10px 12px;

      .info-icon {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }

      .info-content {
        .info-label {
          font-size: 10px;
          margin-bottom: 3px;
        }

        .info-value {
          font-size: 13px;

          &.consumption-value {
            font-size: 14px;
          }
        }
      }
    }
  }

  .info-card {
    :deep(.van-card__header) {
      padding: 12px;
    }
  }

  .tags-section {
    padding: 12px;
  }
}

.appointment-item {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  .appointment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .appointment-type {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }

  .appointment-info {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
        min-width: 80px;
        flex-shrink: 0;
      }

      .value {
        color: #323233;
        flex: 1;
        word-break: break-all;
      }
    }
  }
}

.opportunity-card {
  border: 2px solid #ff976a;
  
  .card-header {
    background: linear-gradient(135deg, #fff4e8 0%, #ffe8d0 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .opportunity-header-icon {
      font-size: 20px;
      color: #ff976a;
    }
  }
}

.opportunity-item {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  .opportunity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;

    .opportunity-type-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .opportunity-type-tag {
        margin: 0;
        font-weight: 500;
      }
    }

    .opportunity-status-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .push-status-tag {
        margin: 0;
      }
    }
  }

  .opportunity-info {
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      min-height: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
        min-width: 80px;
        flex-shrink: 0;
      }

      .value {
        color: #323233;
        flex: 1;
        word-break: break-all;
      }

      .priority-tag {
        margin: 0;
      }
    }
  }
}

.warning-text {
  color: #ED6A0C !important;
  font-weight: 600;
}

.handler-flag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #94724a;
  background: rgba(148, 114, 74, 0.12);
}

.contact-priority-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  margin-top: 12px;
  border-radius: 12px;
  background: #f8f5f1;
}

.priority-badge {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.priority-action {
  font-size: 12px;
  font-weight: 600;
  color: #94724a;
}

.vehicle-person-grid {
  gap: 10px;
}

.vehicle-repairer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vehicle-repairer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vehicle-repairer-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f8fa;
}

.vehicle-repairer-name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.vehicle-repairer-phone,
.vehicle-repairer-order,
.vehicle-relation-hint,
.address-weight-text {
  font-size: 12px;
  color: #6b7280;
}

.vehicle-repairer-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.12);
}

.vehicle-repairer-empty {
  font-size: 12px;
  color: #9ca3af;
}

.address-weight-row {
  margin-top: -4px;
}

.sync-info-content {
  padding: 12px;
  font-size: 12px;
  line-height: 1.6;
  max-width: 180px;
  color: #fff;
  }
}

// 同步状态弹出层高级样式
.sync-details-popover {
  padding: 0;
  min-width: 240px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

  .sync-header {
    background: #f8f9fa;
    padding: 14px 16px;
    border-bottom: 1px solid #edf2f7;
    
    .sync-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      
      .van-icon {
        font-size: 16px;
        color: #94724A;
      }
      
      span {
        font-size: 14px;
        font-weight: 700;
        color: #2d3748;
      }
    }
    
    .sync-time-subtitle {
      font-size: 11px;
      color: #718096;
      font-weight: 500;
      padding-left: 24px;
    }
  }

  .sync-source-list {
    padding: 8px 0;
    display: flex;
    flex-direction: column;

    .source-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      transition: background 0.2s;
      
      &:hover {
        background: #f7fafc;
      }
      
      .source-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .source-icon-box {
          width: 28px;
          height: 28px;
          background: #edf2f7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          font-size: 14px;
        }
        
        .source-name {
          font-size: 13px;
          font-weight: 600;
          color: #2d3748;
        }
      }

      .status-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        
        &.is-success {
          background: #f0fff4;
          color: #2f855a;
        }
        
        &.is-error {
          background: #fff5f5;
          color: #c53030;
          animation: status-pulse-red 2s infinite;
        }
        
        .status-dot-mini {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
      }
    }
  }

  .sync-footer {
    padding: 12px 16px;
    background: #f8f9fa;
    border-top: 1px solid #edf2f7;
    font-size: 11px;
    color: #a0aec0;
    line-height: 1.5;
    display: flex;
    gap: 8px;
    
    .footer-i {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      background: #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: #718096;
      font-weight: 800;
      font-style: normal;
    }
  }
}

@keyframes status-pulse-red {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes sync-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes status-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>

<!-- 全局样式：深度定制 Teleport 组件 -->
<style lang="scss">
.sync-details-popover {
  padding: 0;
  width: 125px !important;
  background: #ffffff !important;
  border-radius: 6px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  border: 1px solid rgba(148, 114, 74, 0.25);

  .sync-header {
    background: #fdfaf6;
    padding: 6px 8px;
    border-bottom: 1px solid #f1e9de;
    
    .sync-title-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 1px;
      opacity: 0.7;
      
      .van-icon { font-size: 9px; color: #94724a; }
      span { font-size: 9px; font-weight: 600; color: #1a1a1a; }
    }
    
    .sync-time-subtitle {
      font-size: 11px;
      color: #94724a;
      font-weight: 900;
      display: block;
      letter-spacing: -0.2px;
    }
  }

  .sync-source-list {
    padding: 2px 0;
    
    .source-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 8px;
      
      .source-info {
        .source-name { font-size: 9px; color: #333; font-weight: 500; }
      }

      .status-badge {
        font-size: 8px;
        padding: 0 3px;
        border-radius: 2px;
        transform: scale(0.85);
        transform-origin: right;
        
        &.is-success { color: #52c41a; background: #f6ffed; }
        &.is-error { color: #f5222d; background: #fff1f0; animation: sync-flicker 2s infinite; }
      }
    }
  }

  .sync-footer {
    padding: 3px 8px;
    background: #fafafa;
    border-top: 1px solid #f0f0f0;
    font-size: 7px;
    color: #bbb;
    text-align: right;
  }
}

.sync-status-icon-wrapper.is-error {
  animation: status-pulse-red 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

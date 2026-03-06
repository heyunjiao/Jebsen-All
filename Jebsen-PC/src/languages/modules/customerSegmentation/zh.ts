export default {
  customerSegmentation: {
    // 页面标题
    pageTitle: "顾客筛选与分群",
    pageSubtitle: "Segmentation Builder",
    title: "智能分群构建器",
    subtitle: "Customer Segmentation & Rule Builder",

    // 快捷筛选区
    quickFilters: {
      title: "快捷筛选",
      keyword: "关键字搜索",
      keywordPlaceholder: "输入姓名、手机号、VIN码...",
      tags: "快速标签",
      tagsPlaceholder: "选择标签",
      store: "归属保时捷中心",
      storePlaceholder: "选择保时捷中心"
    },

    ruleBuilder: {
      title: "可视化规则引擎",
      rootOperator: "默认逻辑",
      all: "全部且",
      any: "全部或",
      addCondition: "添加条件",
      addConditionGroup: "添加条件组",
      addNestedGroup: "添加联合条件组",
      clearAll: "清空所有条件",
      existingSegment: "所属分群",
      remove: "删除",
      field: "字段",
      operator: "操作符",
      value: "值",
      selectField: "请选择字段",
      selectOperator: "请选择操作符",
      enterValue: "请输入值",
      and: "且",
      or: "或",
      not: "非"
    },

    estimatePanel: {
      title: "实时预估",
      totalCount: "预估总数",
      people: "人",
      changeFromLast: "较上一版本",
      increase: "增加",
      decrease: "减少",
      calculating: "计算中...",
      noData: "暂无数据"
    },

    // 实时洞察面板
    insightPanel: {
      title: "实时洞察",
      totalBase: "总基盘数",
      estimatedHits: "命中预估",
      hitRate: "命中率",
      highCoverageWarning: "覆盖率超过 {rate}%，请确认规则是否过于宽泛",
      zeroCoverageWarning: "当前规则未命中任何客户，请检查条件设置",
      calculationTimeout: "规则过于复杂，无法实时预估，请提交后由后台离线计算",
      privacyNotice: "为保护客户隐私，预览数据已自动脱敏"
    },

    samplePreview: {
      title: "样本数据预览",
      noData: "暂无数据",
      loading: "加载中...",
      total: "共 {total} 条",
      pageSize: "每页显示",
      items: "条"
    },

    // 底部操作栏
    actionBar: {
      reset: "重置",
      export: "导出名单",
      submit: "保存并提交审核"
    },

    // 审批弹窗
    approvalModal: {
      title: "分群创建申请单",
      segmentName: "分群名称",
      segmentNamePlaceholder: "例如：2026春季X5维保人群",
      priority: "优先级",
      priorityHigh: "高",
      priorityMedium: "中",
      priorityLow: "低",
      businessReason: "申请原因",
      businessReasonPlaceholder: "请说明为什么要圈这群人（必填）",
      ruleSnapshot: "规则快照",
      submitSuccess: "提交成功！规则 ID: #{id}，已进入审批队列，预计 2 小时内完成审核。"
    },

    fields: {
      ageGroup: "年龄段",
      gender: "性别",
      city: "所在省/市/区",
      familyStatus: "家庭状态",
      contactValidity: "联系方式有效性",
      modelLine: "车系+车型",
      modelLines: "车型（多选）",
      carAge: "车龄",
      usage: "使用强度",
      lastVisit: "最近到店时间",
      visits90D: "90天进店频次",
      annualSpend: "年均消费",
      segment: "现有客户分群",
      systemTag: "系统标签",
      oppLevel: "商机等级",
      loyalty: "忠诚度",
      totalCarPrice: "总车价",
      totalOptionPrice: "选配总价",
      afterSalesSelfPayAmount: "售后自费金额",
      customerValueTier: "客户价值分层",
      completedOrderCount: "已成交订单数",
      visitsIn2Years: "两年内进场次数",
      selfPayAmountIn2Years: "两年内自费金额",
      lastServiceOrderDate: "最近进店订单日期",
      lastPurchaseDeliveryDate: "最后购车订单交车日期",
      accidentRepairCountIn1Year: "最近一年事故维修次数",
      lastServiceAdvisor: "最后一次接待顾问",
      bdcComplaintTags: "来自BDC的投诉标签"
    },
    operators: {
      equals: "等于",
      notEquals: "不等于",
      contains: "包含",
      notContains: "不包含",
      belongsTo: "属于",
      notBelongsTo: "不属于",
      between: "介于",
      greaterThan: "大于",
      lessThan: "小于",
      before: "在此之前",
      after: "在此之后",
      allMatch: "全部满足"
    },
    form: {
      segmentName: "分群名称",
      enterSegmentName: "请输入分群名称",
      description: "分群描述",
      enterDescription: "请输入分群描述（选填）",
      businessReason: "业务理由",
      enterBusinessReason: "请输入业务理由（必填）",
      validityPeriod: "有效期",
      selectValidityPeriod: "请选择有效期（选填）",
      submitForApproval: "提交审核",
      saveDraft: "保存草稿",
      cancel: "取消"
    },
    status: {
      draft: "草稿",
      pending: "待审批",
      active: "已生效",
      inactive: "已停用"
    },
    actions: {
      export: "导出",
      pushToBDC: "推送到 BDC",
      pushToWeCom: "推送到企微营销台",
      viewHistory: "版本历史",
      rollback: "回滚"
    },
    messages: {
      submitSuccess: "分群已提交审核",
      saveDraftSuccess: "草稿已保存",
      exportSuccess: "导出任务已提交",
      pushSuccess: "推送任务已提交",
      ruleRequired: "请至少配置一个筛选条件",
      nameRequired: "分群名称不能为空",
      reasonRequired: "业务理由不能为空",
      exportConfirm: "确认导出当前分群数据？",
      pushConfirm: "确认推送分群到 {target}？",
      rollbackConfirm: "确认回滚到版本 {version}？",
      calculating: "正在计算预估人数...",
      calculateSuccess: "预估完成",
      calculateFailed: "预估失败，请稍后重试"
    },
    validation: {
      coverageTooHigh: "覆盖人数异常高（超过30%），请确认是否继续",
      coverageWarning: "当前覆盖 {count} 人（占总基盘 {rate}%）"
    },
    audit: {
      exportLog: "导出日志",
      exportTime: "导出时间",
      operator: "操作人",
      action: "操作",
      dataCount: "数据量",
      rulePayload: "规则负载"
    }
  }
};

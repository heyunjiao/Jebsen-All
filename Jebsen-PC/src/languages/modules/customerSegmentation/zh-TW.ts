export default {
  customerSegmentation: {
    title: "智能分群構建器",
    subtitle: "Customer Segmentation & Rule Builder",
    filterSections: {
      basic: "基礎檔案信息",
      value: "客戶價值",
      vehicle: "車輛關聯信息",
      sales: "銷售行為",
      afterSales: "售後行為",
      tags: "標籤"
    },
    quickFilters: {
      title: "快捷篩選",
      tagsPlaceholder: "選擇或輸入標籤",
      tagSection: "標籤篩選",
      tagLabel: "標籤",
      bdcComplaintTagsPlaceholder: "選擇或輸入投訴標籤",
      valueSection: "客戶價值"
    },
    ruleBuilder: {
      title: "可視化規則引擎",
      rootOperator: "滿足以下條件",
      all: "所有",
      any: "任意",
      addCondition: "添加條件",
      addConditionGroup: "添加條件組",
      remove: "刪除",
      field: "字段",
      operator: "操作符",
      value: "值",
      selectField: "請選擇字段",
      selectOperator: "請選擇操作符",
      enterValue: "請輸入值",
      and: "且",
      or: "或",
      not: "非"
    },
    estimatePanel: {
      title: "實時預估",
      totalCount: "預估總數",
      people: "人",
      changeFromLast: "較上一版本",
      increase: "增加",
      decrease: "減少",
      calculating: "計算中...",
      noData: "暫無數據"
    },
    samplePreview: {
      title: "樣本數據預覽",
      noData: "暫無數據",
      loading: "加載中...",
      total: "共 {total} 條",
      pageSize: "每頁顯示",
      items: "條"
    },
    fields: {
      ageGroup: "年齡段",
      gender: "性別",
      city: "所在城市",
      familyStatus: "家庭狀態",
      contactValidity: "聯繫方式有效性",
      modelLine: "車系+車型",
      modelLines: "車型（多選）",
      carAge: "車齡",
      usage: "使用強度",
      lastVisit: "最近到店時間",
      visits90D: "90天進店頻次",
      annualSpend: "年均消費",
      annualSpendRange: "年度消費金額",
      spendingLevel: "消費等級",
      loyaltyLevel: "忠誠度等級",
      segment: "現有客戶分群",
      systemTag: "系統標籤",
      oppLevel: "商機等級",
      loyalty: "忠誠度",
      totalCarPrice: "總車價",
      totalOptionPrice: "選配總價",
      afterSalesSelfPayAmount: "售後自費金額",
      customerValueTier: "客戶價值分層",
      completedOrderCount: "已成交訂單數",
      visitsIn2Years: "兩年內進場次數",
      selfPayAmountIn2Years: "兩年內自費金額",
      lastServiceOrderDate: "最近進店訂單日期",
      lastPurchaseDeliveryDate: "最後購車訂單交車日期",
      accidentRepairCountIn1Year: "最近一年事故維修次數",
      lastServiceAdvisor: "最後一次接待顧問",
      bdcComplaintTags: "來自BDC的投訴標籤"
    },
    operators: {
      equals: "等於",
      notEquals: "不等於",
      contains: "包含",
      notContains: "不包含",
      belongsTo: "屬於",
      notBelongsTo: "不屬於",
      between: "介於",
      greaterThan: "大於",
      lessThan: "小於",
      before: "在此之前",
      after: "在此之後",
      allMatch: "全部滿足"
    },
    form: {
      segmentName: "分群名稱",
      enterSegmentName: "請輸入分群名稱",
      description: "分群描述",
      enterDescription: "請輸入分群描述（選填）",
      businessReason: "業務理由",
      enterBusinessReason: "請輸入業務理由（必填）",
      validityPeriod: "有效期",
      selectValidityPeriod: "請選擇有效期（選填）",
      submitForApproval: "提交審核",
      saveDraft: "保存草稿",
      cancel: "取消"
    },
    status: {
      draft: "草稿",
      pending: "待審批",
      active: "已生效",
      inactive: "已停用"
    },
    actions: {
      export: "導出",
      pushToBDC: "推送到 BDC",
      pushToWeCom: "推送到企微營銷台",
      viewHistory: "版本歷史",
      rollback: "回滾"
    },
    messages: {
      submitSuccess: "分群已提交審核",
      saveDraftSuccess: "草稿已保存",
      exportSuccess: "導出任務已提交",
      pushSuccess: "推送任務已提交",
      ruleRequired: "請至少配置一個篩選條件",
      nameRequired: "分群名稱不能為空",
      reasonRequired: "業務理由不能為空",
      exportConfirm: "確認導出當前分群數據？",
      pushConfirm: "確認推送分群到 {target}？",
      rollbackConfirm: "確認回滾到版本 {version}？",
      calculating: "正在計算預估人數...",
      calculateSuccess: "預估完成",
      calculateFailed: "預估失敗，請稍後重試"
    },
    validation: {
      coverageTooHigh: "覆蓋人數異常高（超過30%），請確認是否繼續",
      coverageWarning: "當前覆蓋 {count} 人（佔總基盤 {rate}%）"
    },
    audit: {
      exportLog: "導出日誌",
      exportTime: "導出時間",
      operator: "操作人",
      action: "操作",
      dataCount: "數據量",
      rulePayload: "規則負載"
    }
  }
};

export default {
  approval: {
    tabs: {
      pending: "待我審批",
      history: "已處理歷史"
    },
    alert: {
      prefix: "這裡僅展示需人工決策的資料。系統自動合併成功的資料請移步",
      link: "【審計日誌】",
      suffix: "查看。"
    },
    mergeInto: "合併入",
    actions: {
      approve: "批准",
      reject: "駁回",
      detail: "詳情",
      viewDetail: "查看詳情",
      viewSnapshot: "查看快照",
      cancel: "取消",
      approveMerge: "批准合併",
      close: "關閉",
      review: "審核"
    },
    status: {
      pending: "待審批",
      approved: "已批准",
      rejected: "已駁回"
    },
    drawer: {
      title: "合併請求審核 #{id}",
      manualCorrection: "含人工修正",
      confidenceNeedReview: "置信度: {confidence}% (需審核)",
      submitter: "提交人",
      submitTime: "提交時間",
      confidenceLabel: "匹配規則置信度",
      confidenceThreshold: "免檢閾值: {threshold}%",
      onlyShowChanged: "僅看變更",
      manualAlert: "注意：操作員手動修改了部分字段，請重點核對高亮黃色區域。",
      confidenceAlert: "系統算法匹配置信度為 {confidence}%，未達到 {threshold}% 免檢閾值，需要人工審核確認以防止誤合併風險。",
      fieldName: "字段名",
      beforeMerge: "合併前 (原始數據)",
      afterMerge: "合併後 (擬入庫數據)",
      noChangedFields: "暫無變更字段",
      manualTag: "人工修"
    },
    triggerSource: {
      ruleEngine: "規則引擎",
      manual: "人工提交",
      systemAlert: "系統預警"
    },
    risk: {
      confidenceLow: "置信度低 ({confidence}%)",
      confidenceVeryLow: "置信度極低 ({confidence}%)",
      manualCorrection: "含人工修正",
      reasonLow: "手機號一致,但姓名模糊匹配",
      reasonVeryLow: "匹配度不足，需人工確認",
      autoRuleMatch: "自動規則匹配",
      confidenceLabel: "置信度: {confidence}%",
      defaultManualReason: "姓名與身份證不一致,手動修正"
    },
    table: {
      reqId: "申請單號",
      mergeTarget: "合併對象 (Incoming -> Master)",
      mergeTargetSimple: "合併對象",
      triggerSource: "觸發來源",
      riskAlert: "風險提示 (為何要審?)",
      submitTime: "提交時間",
      operation: "操作",
      result: "處理結果",
      originalReqId: "原始單號",
      mergeContent: "合併內容",
      approver: "審批人",
      processTime: "處理時間",
      approvalComment: "審批意見",
      status: "狀態",
      operator: "提交人"
    },
    placeholder: {
      reqId: "請輸入申請單號",
      mergeTarget: "搜索合併對象",
      submitTime: "請選擇提交時間",
      status: "請選擇狀態",
      originalReqId: "請輸入原始單號",
      approver: "請輸入審批人",
      processTime: "請選擇處理時間",
      operator: "請輸入提交人",
      riskType: "請選擇風險類型"
    },
    confirm: {
      quickApprove: "確認批准該合併請求？",
      quickApproveTitle: "批准確認",
      rejectPrompt: "請輸入駁回原因：",
      rejectTitle: "駁回操作",
      rejectPlaceholder: "例如：數據質量太差,建議直接刪除",
      finalApprove: "確認數據無誤，批准合併？該操作將寫入 OneID 黃金庫。",
      finalApproveTitle: "終審確認",
      finalApproveButton: "批准 (Approve)",
      rejectWithNotify: "請輸入駁回原因，將通知 Operator 修改：",
      rejectButton: "駁回 (Reject)",
      rejectNotifyPlaceholder: "例如：人工修改的姓名與身份證不符"
    },
    messages: {
      approved: "已批准",
      rejected: "請求已駁回",
      approveFailed: "批准失敗",
      rejectFailed: "駁回失敗",
      defaultApproveComment: "同意合併",
      defaultRejectComment: "數據質量太差,建議直接刪除",
      approveSuccessSync: "已批准。數據同步任務已下發至 DataWorks。",
      loadListFailed: "加載審批列表失敗",
      loadDetailFailed: "加載詳情失敗",
      loadStatsFailed: "加載統計數據失敗"
    },
    mock: {
      groups: {
        identity: "👤 身份信息 (Identity)",
        preference: "📞 互動偏好 (Preference)",
        value: "💰 價值與交易 (Value)",
        vehicle: "🚗 車輛資產 (Vehicle)"
      },
      fields: {
        userId: "用戶ID",
        name: "姓名",
        gender: "性別",
        ageRange: "年齡段",
        familyStatus: "家庭狀態",
        phone: "手機號碼",
        address: "地址",
        contactPreference: "聯繫偏好時間",
        serviceHabit: "服務習慣",
        projectPreference: "項目偏好",
        lastVisitTime: "最近到店時間",
        visit90Days: "近90天到店",
        annualOrderFrequency: "年度訂單頻次",
        avgConsumption: "平均消費金額",
        annualConsumption: "年度消費金額",
        loyaltyLevel: "忠誠度等級",
        complaintLastYear: "最近一年投訴",
        vin: "VIN信息",
        plate: "車牌號",
        carSeriesModel: "車系+車型",
        currentMileage: "當前里程"
      },
      values: {
        genderMale: "男",
        familyUnknown: "未知",
        familyMarriedTwoKids: "已婚 (2孩)",
        addressOld: "北京市朝陽區",
        addressNew: "北京市海淀區西二旗",
        weekdays: "工作日",
        weekendAllDay: "週末全天",
        empty: "-",
        needShuttle: "需要代步車",
        maintenance: "常規保養",
        maintenanceAndDetail: "常規保養, 美容清洗",
        loyaltyBasic: "普卡",
        loyaltySilver: "銀卡",
        no: "否",
        yes: "是",
        plate: "京A****1",
        carSeriesOld: "BMW 3系",
        carSeriesNew: "BMW 325Li M運動"
      }
    }
  }
};

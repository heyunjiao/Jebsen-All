export default {
  errorCorrection: {
    pendingConflicts: "待處理衝突",
    autoMerge: "自動合併",
    autoMergeSuccessRate: "自動合併成功率",
    simulateWeCom: "模擬 WeCom 銷售視角",
    duplicateProfileQueue: "疑似重複檔案隊列",
    exitDemo: "退出演示",
    weComSidebar: "企業微信側邊欄 (Sales View)",
    customerProfile: "客戶畫像",
    fullView: "360全貌",
    interactionTimeline: "互動動態",
    opportunities: "商機",
    totalConsumption: "累計消費",
    visitFrequency: "進店頻次",
    myVehicles: "我的車輛",
    certifiedOwner: "成交車主（真實下單客戶）",
    currentMileage: "當前里程",
    outOfWarranty: "過保",
    servicePreference: "服務偏好",
    afternoonContact: "下午聯繫",
    wechatContact: "微信溝通",
    needShuttle: "需要代步車",
    storeRepair: "到店維修",
    changeTire: "更換輪胎",
    wechatCommunication: "微信溝通",
    inquireMaintenance: "詢問保養套餐",
    regularMaintenance: "常規保養",
    highIntent: "高意向",
    airConditioningCleaning: "空調清洗",
    justNow: "剛剛",
    // 統計面板
    stats: {
      pendingConflicts: "待處理衝突",
      dataQualityIssues: "數據質量問題",
      syncFailures: "同步失敗"
    },
    // 篩選欄
    filter: {
      errorType: "異常類型",
      severity: "嚴重等級",
      sourceSystem: "來源系統",
      status: "狀態"
    },
    // 異常類型
    errorType: {
      all: "全部",
      identityConflict: "身份衝突",
      dataQuality: "數據質量",
      syncFailure: "同步失敗",
      h5Feedback: "H5反饋"
    },
    // 嚴重等級
    severity: {
      high: "高",
      medium: "中",
      low: "低"
    },
    // 狀態
    status: {
      pending: "待處理",
      processed: "已處理"
    },
    // 批量操作
    batchIgnore: "批量忽略",
    batchIgnoreConfirm: "確認忽略選中的 {count} 條異常？",
    messages: {
      ignoreConfirmTitle: "確認忽略",
      ignoreConfirm: "確認忽略任務 {taskNo}？",
      ignoreCompleted: "已忽略",
      batchIgnoreCompleted: "已忽略 {count} 條異常",
      submitForApproval: "已提交審批，等待審核"
    },
    // 快速編輯彈窗
    quickEdit: {
      title: "數據修正",
      viewTitle: "異常處理詳情",
      alertTitle: "格式校驗失敗",
      alertDesc: "字段 【{field}】 不符合規範，請修正後重新提交。",
      originalData: "原始數據",
      errorFields: "報錯字段",
      correction: "修正信息",
      enterCorrectValue: "請輸入正確的值",
      currentValue: "當前值",
      markAsInvalid: "標記為無效數據（將進入忽略名單）",
      saveAndReprocess: "提交審批",
      pleaseEnterCorrection: "請填寫修正值或標記為無效數據",
      saveSuccess: "修正已提交審批，等待審核",
      processInfo: "處理信息",
      processTime: "處理時間",
      createTime: "創建時間",
      processResult: "處理結果",
      trustedSource: "信任源",
      trustedSystem: "信任系統",
      suggestedFix: "修復建議"
    },
    // 同步重試彈窗
    syncRetry: {
      title: "同步失敗重試",
      errorInfo: "錯誤信息",
      targetSystem: "目標系統",
      system: "系統",
      endpoint: "接口地址",
      requestPayload: "請求體",
      retryResult: "重試結果",
      retryNow: "立即重試",
      retrying: "重試中...",
      retrySuccess: "重試成功",
      retryFailed: "重試失敗",
      successMessage: "數據已成功推送至 {system}",
      failedMessage: "重試失敗，請稍後再試或聯繫技術支持"
    },
    // 表格操作
    handle: "處理",
    retry: "重試",
    view: "查看",
    ignore: "忽略",
    // SLA
    sla: {
      expired: "已超時"
    },
    // 表格列標籤
    table: {
      taskNo: "任務編號",
      oneId: "OneID",
      customerName: "客戶姓名",
      errorType: "異常類型",
      status: "狀態",
      severity: "嚴重程度",
      slaCountdown: "SLA倒計時",
      mainIssue: "主要問題",
      sourceSystem: "來源系統",
      handler: "處理人",
      operation: "操作"
    },
    // 移動端演示相關
    mobile: {
      goldMember: "黃金會員",
      churnWarning: "流失預警",
      repairAtStore: "到店維修",
      changeTire: "更換輪胎",
      wechatChat: "微信溝通",
      askMaintenance: "詢問保養套餐",
      routineMaintenance: "常規保養",
      pushCoupon: "一鍵推送優惠券",
      insuranceReminder: "保險續保提醒",
      expireSoon: "車險將於 30 天後到期。",
      followQuote: "跟進報價",
      phone: "電話",
      wechat: "微信",
      createTicket: "建工單",
      addTag: "添加標籤",
      shareCard: "分享名片",
      feedback: "投訴/反饋",
      cancel: "取消",
      newTicket: "新建服務工單",
      ticketType: "工單類型",
      repair: "維修",
      remark: "備註",
      submit: "提交",
      ticketCreated: "工單已創建",
      systemDetectSummer: "系統檢測到夏季臨近，且客戶近一年未做空調管路清洗。",
      daysAgo: "{count}天前",
      consumption: "消費",
      satisfaction: "滿意度",
      duration: "時長",
      times: "次",
      // 數據衝突相關
      dataConflict: "數據衝突",
      conflictField: "衝突字段",
      conflictSource: "數據來源",
      conflictInfo: "衝突信息",
      conflictDetail: "衝突詳情",
      sourceSystem: "來源系統",
      conflictValue: "衝突值",
      currentValue: "當前值",
      recommendedValue: "推薦值",
      resolveConflict: "處理衝突",
      selectTrustedSource: "選擇信任來源",
      conflictResolved: "衝突已處理",
      // 手機號相關
      phoneNumber: "手機號碼",
      phoneConflict: "手機號衝突",
      phoneConflictDesc: "檢測到多個來源的手機號不一致",
      editPhone: "編輯手機號",
      addPhone: "添加手機號",
      phoneList: "手機號列表",
      phoneSource: "來源",
      phoneStatus: "狀態",
      phoneVerified: "已驗證",
      phoneUnverified: "未驗證",
      phoneInvalid: "無效",
      phonePrimary: "主號碼",
      setAsPrimary: "設為主號碼",
      deletePhone: "刪除",
      phoneFormatError: "手機號格式不正確",
      phoneRequired: "請輸入手機號",
      phoneDuplicate: "該手機號已存在",
      phoneValidation: "請輸入11位有效手機號",
      phoneAddSuccess: "手機號添加成功",
      phoneUpdateSuccess: "手機號更新成功",
      phoneDeleteSuccess: "手機號刪除成功",
      phoneSetPrimarySuccess: "已設為主號碼",
      confirmDeletePhone: "確認刪除該手機號？",
      // 標籤管理相關
      tagManagement: "標籤管理",
      myTags: "我的標籤",
      addCustomTag: "添加自定義標籤",
      tagName: "標籤名稱",
      tagNamePlaceholder: "請輸入標籤名稱",
      tagColor: "標籤顏色",
      tagCategory: "標籤分類",
      tagDescription: "標籤描述",
      tagDescriptionPlaceholder: "請輸入標籤描述（可選）",
      saveTag: "保存標籤",
      editTag: "編輯標籤",
      deleteTag: "刪除標籤",
      confirmDeleteTag: "確認刪除該標籤？",
      tagAddSuccess: "標籤添加成功",
      tagUpdateSuccess: "標籤更新成功",
      tagDeleteSuccess: "標籤刪除成功",
      tagNameRequired: "請輸入標籤名稱",
      tagNameMaxLength: "標籤名稱不能超過20個字符",
      // 通用
      edit: "編輯",
      save: "保存",
      delete: "刪除",
      btnCancel: "取消",
      confirm: "確認",
      close: "關閉",
      viewDetail: "查看詳情",
      noConflicts: "暫無數據衝突",
      conflictReadonlyTip: "提示：除手機號外，其他數據衝突僅支持查看，無法在此處理",
      viewOnly: "僅查看"
    },
    // 衝突解決工作台 (MergeWorkbenchDialog)
    mergeWorkbench: {
      title: "衝突解決工作台",
      taskNo: "任務編號",
      conflictAlert: "衝突提示：系統檢測到【{field}】不一致。請確認最終保留值。",
      // 標籤頁
      tabs: {
        comparison: "核心對比矩陣",
        lineage: "身份血緣溯源",
        evidence: "交互證據鏈",
        reference: "客戶信息參考"
      },
      // 表單
      correctionReason: "更正理由",
      correctionReasonPlaceholder: "請填寫更正理由，說明為什麼選擇這些值...",
      rejectReason: "駁回意見（如駁回）",
      rejectReasonPlaceholder: "如駁回，請填寫駁回意見...",
      // 按鈕
      saveDraft: "暫存",
      splitPerson: "非同一人，拆分",
      submitReview: "提交審核",
      close: "關閉",
      reject: "駁回",
      confirmMerge: "確認合併",
      // 狀態
      status: {
        pending: "待處理",
        draft: "草稿",
        review: "待審核",
        resolved: "已解決",
        rejected: "已駁回",
        unknown: "未知"
      },
      // 消息
      messages: {
        draftSaved: "草稿已保存",
        saveFailed: "保存失敗",
        pleaseEnterReason: "請填寫更正理由",
        submitting: "正在提交審核...",
        submitSuccess: "任務已提交審核。",
        submitSuccessWithSync: "任務已提交審核。合併後將有 {count} 個號碼同步至 BDC 系統（T+1 生效）",
        submitSuccessWaitApproval: "任務已提交審核，等待部門主管審批",
        submitFailed: "提交失敗",
        mergeConfirmWithSync:
          "確認合併後將更新系統內的黃金記錄，合併後將有 {count} 個號碼同步至 BDC 系統（T+1 生效）。是否繼續？",
        mergeConfirm: "確認合併後將更新系統內的黃金記錄，是否繼續？",
        mergeConfirmTitle: "確認合併",
        merging: "正在執行數據合併與 OneID 重算...",
        mergeSuccess: "合併成功",
        mergeSuccessWithSync: "檔案 {name} 更新完成，已下發至各源系統。{count} 個號碼將在 T+1 同步至 BDC 系統。",
        mergeSuccessNoSync: "檔案 {name} 更新完成，已下發至各源系統",
        pleaseEnterRejectReason: "請填寫駁回意見",
        rejectConfirm: "確認駁回該任務？",
        rejectConfirmTitle: "確認駁回",
        rejected: "已駁回，任務將退回給處理人",
        splitPrompt: "請確認拆分理由（將加入衝突檢測白名單，防止再次誤報）：",
        splitConfirmTitle: "確認非同一人",
        submitSplit: "提交拆分",
        splitSuccess: "已拆分檔案。"
      },
      // 源系統
      sourceSystems: {
        wechat: "企微",
        website: "官網"
      }
    },
    // H5 提交的數據糾錯反饋處理 (FeedbackResolutionDrawer)
    feedbackResolution: {
      title: "數據糾錯反饋處理",
      taskNo: "任務編號",
      // SLA 倒計時
      sla: {
        remaining: "剩餘 {time}",
        expired: "已超時",
        hours: "{hours}小時",
        hoursMinutes: "{hours}小時 {minutes}分鐘"
      },
      // 左側：黃金記錄
      goldenRecord: {
        title: "當前系統檔案",
        name: "姓名",
        phone: "手機號",
        jobTitle: "職位",
        company: "公司",
        tags: "標籤",
        lockTooltip: "將標記為人工修正",
        locked: "已鎖定（人工修正）"
      },
      // 右側：反饋與核實
      feedback: {
        title: "反饋與核實",
        rawInput: {
          title: "原始反饋",
          submittedBy: "提交人",
          submittedAt: "提交時間"
        },
        smartSuggestion: {
          title: "智能輔助",
          extractedPhone: "疑似電話",
          extractedName: "疑似姓名",
          clickToFill: "點擊自動回填"
        },
        verification: {
          title: "核實記錄",
          placeholder: "請填寫核實情況（如：已查詢 DMS 核實無誤）"
        }
      },
      // 底部操作欄
      actions: {
        reject: "駁回",
        confirm: "確認修正",
        cancel: "取消"
      },
      // 駁回對話框
      rejectDialog: {
        title: "駁回反饋",
        reason: "駁回理由",
        reasonPlaceholder: "請填寫駁回理由（必填）",
        reasonRequired: "請填寫駁回理由",
        confirm: "確認駁回",
        cancel: "取消"
      },
      // 消息提示
      messages: {
        confirmTitle: "確認修正",
        confirmMessage: "確認提交修正？修正後將更新系統內的黃金記錄。",
        rejectSuccess: "已駁回反饋",
        confirmSuccess: "修正已提交，等待審核",
        pleaseEnterVerification: "請填寫核實記錄",
        fieldLocked: "字段已鎖定，將標記為人工修正"
      }
    },
    // 客戶信息參考面板 (CustomerReferencePanel)
    customerReference: {
      categoryTags: "標籤分類",
      // 卡片標題
      customerInfo: "客戶基本信息",
      vehicleInfo: "車輛信息",
      consumptionStats: "消費統計",
      loyaltyValue: "忠誠度與價值",
      opportunityInfo: "商機信息",
      servicePreference: "服務偏好",
      remarks: "備註信息",
      // 客戶信息字段
      customerName: "客戶姓名",
      phone: "手機號碼",
      gender: "性別",
      ageGroup: "年齡段",
      familyStatus: "家庭狀態",
      address: "地址",
      tags: "標籤",
      // 車輛信息字段
      vin: "VIN碼",
      plate: "車牌號",
      brandModel: "品牌車型",
      purchaseDate: "購買日期",
      currentMileage: "當前里程",
      warrantyStatus: "保修狀態",
      inWarranty: "在保",
      outOfWarranty: "過保",
      // 消費統計字段
      totalSpend: "累計消費",
      yearlySpend: "年度消費",
      avgSpend: "平均消費",
      orderCount: "訂單頻次",
      visit90d: "近90天到店",
      lastVisit: "最近到店",
      times: "次",
      none: "無",
      // 忠誠度與價值字段
      loyaltyLevel: "忠誠度等級",
      opportunityLevel: "商機等級",
      customerLifecycle: "客戶生命週期",
      customerValue: "客戶價值",
      // 商機信息字段
      opportunityType: "商機類型",
      opportunityPriority: "優先級",
      opportunityStatus: "商機狀態",
      ruleName: "觸發規則",
      pushTarget: "推送目標",
      pushStatus: "推送狀態",
      priorityLow: "低",
      priorityMedium: "中",
      priorityHigh: "高",
      statusPending: "待推送",
      statusPushed: "已推送",
      statusProcessing: "處理中",
      statusCompleted: "已完成",
      pushTargetBdc: "BDC系統",
      pushTargetWechat: "微信系統",
      pushTargetCrm: "CRM系統",
      pushStatusPending: "待推送",
      pushStatusSuccess: "推送成功",
      pushStatusFailed: "推送失敗",
      opportunityCount: "{count} 個商機"
    },
    // 異常類型全景定義 (Exception Taxonomy)
    taxonomy: {
      title: "異常類型全景定義",
      description: "在清洗過程中，必須捕獲以下 5 大類異常，並在界面上用不同顏色/圖標區分",
      example: "場景舉例",
      actionsLabel: "處理策略",
      // A. 有效性異常 (Validity)
      validity: {
        name: "有效性異常",
        description: "數據格式、值域、枚舉值不符合規範",
        subTypes: {
          formatError: {
            name: "格式錯誤",
            description: "數據格式不符合規範",
            example: "手機號含橫杠、郵箱無@、身份證位數不對"
          },
          valueRangeError: {
            name: "值域越界",
            description: "數值超出合理範圍",
            example: "車齡 200 年、生日是未來時間、價格為負數"
          },
          enumMismatch: {
            name: "枚舉非法",
            description: "枚舉值與目標系統要求不匹配",
            example: '性別由源系統傳來 "M/F"，目標系統要求 "0/1"'
          }
        }
      },
      // B. 唯一性異常 (Uniqueness)
      uniqueness: {
        name: "唯一性異常",
        description: "數據重複或主鍵衝突",
        subTypes: {
          suspectedDuplicate: {
            name: "疑似重複",
            description: "多條記錄高度相似，但置信度不足",
            example: "姓名+手機號高度相似，OneID 算法置信度為 80%（不敢自動合併）"
          },
          primaryKeyConflict: {
            name: "主鍵衝突",
            description: "相同主鍵存在多條不同記錄",
            example: "源系統推了兩條 ID 一樣但內容不同的數據"
          }
        }
      },
      // C. 完整性異常 (Completeness)
      completeness: {
        name: "完整性異常",
        description: "關鍵字段缺失或數據孤立",
        subTypes: {
          criticalMissing: {
            name: "關鍵缺失",
            description: "必填字段或關鍵信息缺失",
            example: "有客戶名但無任何聯繫方式（殭屍數據）"
          },
          orphanData: {
            name: "孤兒數據",
            description: "數據缺少必要的關聯關係",
            example: '有"訂單記錄"但找不到對應的"客戶ID"'
          }
        }
      },
      // D. 關聯性異常 (Consistency)
      consistency: {
        name: "關聯性異常",
        description: "數據邏輯不一致或狀態衝突",
        subTypes: {
          logicalConflict: {
            name: "邏輯互斥",
            description: "不同字段之間存在邏輯矛盾",
            example: '身份證顯示是女性，性別字段卻是"男"'
          },
          statusConflict: {
            name: "狀態衝突",
            description: "不同系統對同一實體的狀態描述不一致",
            example: 'DMS 說"已交車"，CRM 說"未成交"'
          }
        }
      },
      // E. 合規性異常 (Compliance)
      compliance: {
        name: "合規性異常",
        description: "數據不符合合規要求或授權缺失",
        subTypes: {
          authorizationMissing: {
            name: "授權缺失",
            description: "缺少必要的授權或協議確認",
            example: '數據進來了，但沒有勾選"隱私協議"字段'
          }
        }
      },
      // 處理策略 (Actions)
      actions: {
        clean: "清洗",
        edit: "編輯",
        correct: "修正",
        empty: "置空",
        map: "映射",
        merge: "合併",
        override: "覆蓋",
        discard: "丟棄",
        supplement: "補錄",
        archive: "歸檔",
        associate: "關聯",
        trustChoice: "信任選擇",
        trustSource: "信任源",
        freeze: "凍結"
      }
    }
  }
};

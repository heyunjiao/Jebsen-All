export default {
  dataQualityWorkbench: {
    title: "數據文件上傳",
    subtitle: "Data Quality Gate Workbench",
    statusDashboard: {
      title: "今日數據上傳概覽",
      pendingUpload: "今日待傳",
      validated: "校驗通過",
      intercepted: "攔截錯誤",
      dataTimeliness: "數據時效",
      overdue: "逾期",
      normal: "正常",
      delayed: "延遲",
      rows: "行"
    },
    dataSource: {
      title: "選擇數據源",
      dms: {
        name: "DMS - 每日銷售台賬",
        tag: "強依賴"
      },
      poas: {
        name: "POAS - 配件訂單",
        tag: "強依賴"
      },
      wws: {
        name: "WWS - 索賠單",
        tag: "無接口/人工"
      },
      cap: {
        name: "C@@P - 新車線索",
        tag: ""
      },
      voucher: {
        name: "Voucher - 優惠券",
        tag: "營銷"
      },
      manual: {
        name: "Manual Files - 人工文件",
        tag: "通用"
      },
      downloadTemplate: "下載標準模板",
      todayCompleted: "今日已完成"
    },
    upload: {
      title: "上傳與預檢",
      dragText: "將文件拖到此處，或",
      clickUpload: "點擊上傳",
      supportFormat: "支持 .xlsx 格式，文件大小不超過 50MB",
      fileSizeError: "文件大小不能超過 50MB",
      fileFormatError: "僅支持 .xlsx 格式",
      headerMismatch: "表頭不匹配",
      headerMismatchDesc: "上傳文件的表頭與標準模板不一致，請下載標準模板後重新填寫",
      validating: "正在校驗...",
      validationComplete: "校驗完成",
      completedTitle: "數據上傳完成",
      completedDesc: "恭喜！您已成功完成今日數據上傳任務。",
      completedTime: "完成時間",
      completedDataSource: "數據源",
      completedRows: "上傳行數",
      todayCompleted: "今日任務已完成",
      completedFileName: "文件名",
      reupload: "重新上傳",
      taskListTitle: "{platform} 平台任務清單",
      reportName: "報表名稱",
      status: "狀態",
      lastUploadTime: "最後上傳時間"
    },
    reports: {
      poas_opp: "商機表",
      wws_activity: "活動列表",
      cap_vehicle: "車輛報告",
      cap_complaint: "投訴報告",
      cap_prosperity: "共行致遠",
      voucher_sales: "附加銷售報表",
      voucher_benefits: "會員優惠信息統計表",
      voucher_balance: "優惠券餘額報表 (明細)",
      manual_pc_marketing: "PC主動營銷跟進信息更新表",
      manual_client_base: "客戶基盤",
      manual_loss_15m: "首保15個月流失判定",
      manual_ins_new: "Monthly Insurance Report-New Car",
      manual_ins_used: "Monthly Insurance Report-Used Car",
      manual_ins_renewal: "Monthly Renewal Insurance",
      manual_jsp: "JSP PAW PSP",
      manual_pcn_interest: "PCN企微助手 興趣愛好",
      manual_sign: "活動報道簽名",
      manual_base_analysis: "基盤分析統計表"
    },
    notification: {
      title: "郵件通知規則",
      subtitle: "配置數據校驗失敗時的郵件提醒",
      deadlineTime: "截止時間",
      deadlineTimeDesc: "每日數據上傳的截止時間，超過此時間未上傳將發送提醒郵件",
      deadlineTimePlaceholder: "請選擇截止時間",
      emailRecipients: "郵件收件人",
      emailRecipientsDesc: "數據校驗失敗或超過截止時間未上傳時，將發送郵件通知以下收件人",
      emailRecipientsPlaceholder: "請輸入郵箱地址，多個郵箱用逗號分隔",
      emailTip: "系統將在數據校驗失敗或超過截止時間未上傳時，自動發送郵件通知收件人",
      save: "保存配置",
      reset: "重置",
      saveSuccess: "配置保存成功",
      resetSuccess: "配置已重置",
      stageT0Desc: "當日18:00前未上傳數據，系統將發送提醒郵件",
      stageT1Desc: "次日09:00前仍未上傳，系統將發送升級提醒郵件",
      stageT2Desc: "第三日09:00前仍未上傳，系統將發送緊急告警郵件",
      recipients: {
        dataTeamLeader: "數據團隊負責人",
        dataTeamLeaderAndBusiness: "數據團隊負責人、業務負責人",
        dataTeamBusinessManagement: "數據團隊、業務團隊、管理層",
        dataTeamLeaderOnly: "數據團隊負責人"
      }
    },
    validation: {
      title: "數據質量體檢報告",
      summary: "校驗結果概覽",
      totalRows: "共 {total} 行",
      successRows: "成功 {success} 行",
      errorRows: "失敗 {error} 行",
      totalRowsLabel: "共",
      successRowsLabel: "成功",
      errorRowsLabel: "失敗",
      rowsUnit: "行",
      errorDetails: "錯誤詳情",
      rowNumber: "行號",
      errorReason: "錯誤原因",
      cancel: "取消上傳",
      importValidOnly: "僅導入正確數據",
      submitAll: "全部提交",
      noErrors: "數據校驗通過，可以提交",
      cellError: "單元格錯誤",
      hoverToSeeReason: "鼠標懸停查看錯誤原因",
      preCheck: "預檢流水線",
      preCheckResult: "預檢結果",
      preCheckPassed: "預檢通過",
      preCheckFailed: "預檢失敗",
      orphanDataTitle: "孤立數據 無法關聯",
      cannotAssociate: "邏輯錯誤-無法關聯",
      cannotAssociateDesc: "VIN碼或客戶手機號無法匹配主數據庫（孤立數據）",
      downloadErrorReport: "下載失敗報告",
      importData: "入庫",
      preCheckInProgress: "正在預檢...",
      preCheckComplete: "預檢完成",
      errorRowHighlight: "錯誤行已標紅，鼠標懸停查看詳情",
      improveDataTip: "請完善以下錯誤維修記錄信息（如補充正確的VIN碼或客戶手機號），完善後再重新上傳進行導入",
      closeDialogWarning:
        "注意：關閉此彈窗後，預檢結果將消失，如需查看錯誤詳情，請先下載失敗報告。關閉後如需重新預檢，請再次上傳文件。"
    },
    columnMapping: {
      VIN: "VIN碼",
      Phone: "手機號",
      Customer_Name: "真實姓名",
      Model: "車型",
      Dealer_Code: "經銷商代碼",
      Sales_Consultant: "銷售顧問",
      Order_Date: "訂單日期",
      Delivery_Date: "交車日期",
      Amount: "訂單金額",
      Payment_Method: "付款方式",
      Order_No: "訂單號",
      Transaction_Date: "交易日期",
      Transaction_Type: "交易類型",
      Customer_Phone: "客戶手機號",
      Product_Name: "產品名稱",
      Service_Order_No: "維修單號",
      Service_Date: "維修日期",
      License_Plate: "車牌號",
      Service_Type: "維修類型",
      Service_Amount: "維修金額",
      Car_Model: "車型",
      Mileage: "里程數",
      Service_Consultant: "服務顧問"
    },
    auditLog: {
      title: "操作追溯日誌",
      uploadTime: "上傳時間",
      dataSource: "數據源",
      fileName: "文件名",
      operator: "操作人",
      validationResult: "校驗結果",
      uploadStatus: "上傳狀態",
      statusPassed: "通過",
      statusFailed: "失敗",
      statusPending: "待處理",
      uploadSuccess: "上傳成功",
      uploadFailed: "上傳失敗",
      uploadProcessing: "處理中",
      totalRows: "總行數",
      successRows: "成功行數",
      errorRows: "錯誤行數",
      fileNamePlaceholder: "請輸入文件名",
      operatorPlaceholder: "請輸入操作人"
    },
    rules: {
      dms: {
        requiredColumns: "必須包含列：VIN, Phone, Customer_Name",
        phoneFormat: "Phone 必須是 11 位數字",
        vinRequired: "VIN 不能為空",
        phoneRequired: "Phone 不能為空",
        customerNameRequired: "Customer_Name 不能為空"
      },
      poas: {
        requiredColumns: "必須包含列：Part_Number, Order_Date",
        partNumberRequired: "Part_Number 不能為空",
        orderDateRequired: "Order_Date 不能為空"
      },
      wws: {
        requiredColumns: "必須包含列：Claim_Number, Claim_Date",
        claimNumberRequired: "Claim_Number 不能為空",
        claimDateRequired: "Claim_Date 不能為空"
      },
      cap: {
        requiredColumns: "必須包含列：Lead_Name, Phone, Source",
        leadNameRequired: "Lead_Name 不能為空",
        phoneRequired: "Phone 不能為空",
        sourceRequired: "Source 不能為空"
      }
    },
    messages: {
      uploadSuccess: "上傳成功",
      uploadFailed: "上傳失敗",
      validationFailed: "數據校驗失敗",
      fileRequired: "請先選擇文件",
      noErrorsToShow: "無錯誤數據",
      importValidOnlySuccess: "已成功導入 {count} 條正確數據",
      submitAllSuccess: "已成功提交所有數據",
      confirmSubmit: "確定提交所有 {count} 條數據嗎？",
      submitFailed: "提交失敗，請重試"
    }
  }
};

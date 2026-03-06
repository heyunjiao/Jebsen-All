export default {
  welcome: {
    morning: "早上好",
    afternoon: "下午好",
    evening: "晚上好",
    startTour: "開始導覽",
    adminView: "管理員視圖",
    businessView: "業務視圖",
    adminMessage: "系統 360° 全景：所有數據管道同步正常。有 3 個治理任務待處理。",
    businessMessage: "您的每日銷售簡報：自上次登錄以來發現了 12 個新的高價值商機。",
    systemStatus: "當日數據採集情況",
    allSystemsOperational: "所有系統運行正常",
    customerLibraryStats: "客戶庫統計",
    governanceTasks: "我的任務",
    viewAll: "查看全部",
    recentSensitiveOperations: "最近操作",
    totalClients: "客戶總數",
    highIntent: "高意向",
    conversionRate: "轉化率",
    revenueEst: "預估營收",
    opportunityPipeline: "商機漏斗",
    pushToBDC: "推送到 BDC",
    myTasks: "我的任務",
    systemSource: "系統來源",
    governance: "治理",
    audit: "審計",
    metrics: "指標",
    opportunities: "商機",
    viewSwitched: "視圖已切換",
    nowViewingAsAdmin: "正在以管理員身份查看",
    nowViewingAsUser: "正在以業務用戶身份查看",
    pushingToBDC: "正在推送 {name} 到 BDC...",
    tour: {
      systemHealth: "系統健康",
      systemHealthDesc: "實時監控所有 7 個連接的數據源狀態。",
      governance: "數據治理",
      governanceDesc: "在此處理合併衝突和數據質量警報。",
      audit: "安全審計",
      auditDesc: "跟蹤所有敏感數據訪問和導出以符合合規性。",
      keyMetrics: "關鍵指標",
      keyMetricsDesc: "今日最重要的業務 KPI 一覽。",
      smartOpp: "智能商機",
      smartOppDesc: "AI 識別的業務機會。點擊'推送'同步到 BDC。"
    },
    data: {
      status: {
        online: "在線",
        synced: "已同步",
        delay: "延遲",
        active: "活躍",
        uploaded: "採集成功",
        pendingUpload: "待上傳",
        time: "時間"
      },
      desc: {
        dms: "每日導出 CSV",
        poas: "配件訂單",
        wws: "索賠單",
        cap: "新車線索",
        BDC外呼系统: "線索與交互",
        voucher: "會員優惠券"
      },
      governance: {
        mergeConflict: "合併衝突: 用戶 ID #88392",
        dataQuality: "數據質量: 手機號格式錯誤",
        missingField: "字段缺失: 來源標記"
      },
      audit: {
        exported: "導出 500 條記錄 (管理員)",
        backup: "系統備份完成",
        policyUpdate: "超級管理員更新了策略"
      },
      opportunity: {
        renewal: "新轉續商機",
        renewalDesc: "15 位客戶即將租賃到期",
        birthday: "生日關懷",
        birthdayDesc: "8 位客戶今天過生日",
        serviceDue: "保養提醒",
        serviceDueDesc: "24 位客戶需進行保養",
        lostLead: "流失線索召回",
        lostLeadDesc: "5 個非活躍線索表現出興趣"
      },
      task: {
        followUp: "跟進客戶 #{id}"
      },
      manual: "手動系統",
      upload: "上傳",
      columns: {
        task: "任務",
        priority: "優先級",
        time: "時間"
      },
      action: {
        fix: "處理"
      }
    },
    quickNavigation: "快捷導航",
    systemSummary: {
      normal: "所有數據採集正常",
      abnormal: "存在採集異常",
      incomplete: "有 {count} 個系統待採集"
    },
    impact: {
      title: "數據清洗成效",
      cleanedData: "清洗數據量",
      tagCoverage: "標籤覆蓋率提升"
    }
  }
};

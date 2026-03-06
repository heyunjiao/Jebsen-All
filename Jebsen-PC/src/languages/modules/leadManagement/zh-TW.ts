export default {
  leadManagement: {
    overview: {
      title: "數據概覽",
      refresh: "刷新",
      dateRange: "日期範圍",
      startDate: "開始日期",
      endDate: "結束日期",
      to: "至",
      leadType: "商機類型",
      selectLeadType: "請選擇商機類型",
      status: "狀態",
      selectStatus: "請選擇狀態",
      pushTarget: "推送目標",
      selectPushTarget: "請選擇推送目標",
      filterNote: "提示：以下數據僅按日期範圍篩選，不受商機類型、狀態、推送目標等條件影響",
      todayTotal: "今日生成總數",
      todayPushed: "今日已推送",
      pendingCount: "待處理數",
      processingCount: "處理中數",
      completedCount: "已完成數",
      successRate: "推送成功率",
      typeDistribution: "商機類型分佈",
      statusDistribution: "商機狀態分佈",
      typeTrend: "商機類型趨勢",
      statusTrend: "商機狀態趨勢",
      noData: "暫無數據",
      loadFailed: "加載統計數據失敗"
    },
    columns: {
      oneId: "OneID",
      customerName: "客戶姓名",
      leadType: "商機類型",
      ruleName: "觸發規則",
      priority: "優先級",
      status: "狀態",
      pushTarget: "推送目標",
      pushStatus: "推送狀態",
      assignedAdvisor: "推送至SA/SC",
      createdAt: "創建時間",
      operation: "操作"
    },
    buttons: {
      batchPush: "批量推送",
      reloadLeads: "重載商機",
      retryFailed: "重試失敗項",
      view: "詳情",
      push: "推送",
      reload: "重載",
      confirm: "確定",
      cancel: "取消"
    },
    placeholders: {
      oneId: "請輸入OneID",
      status: "請選擇狀態",
      pushTarget: "請選擇推送目標"
    },
    messages: {
      selectPush: "請選擇要推送的商機",
      selectReload: "請選擇要重載的商機",
      noFailed: "暫無推送失敗的商機",
      retryConfirm: "發現 {count} 條推送失敗的商機，是否批量重試？",
      retryTitle: "重試失敗項",
      reloadConfirmBatch: "確定要重載選中的商機嗎？",
      reloadConfirmSingle: "確定要重載該商機嗎？",
      reloadSuccess: "重載成功",
      reloadFailed: "重載失敗",
      operationFailed: "操作失敗",
      detailTitle: "商機詳情",
      payloadTitle: "數據負載",
      pushSuccess: "推送成功"
    },
    enums: {
      status: {
        pending: "待處理",
        pushed: "已推送",
        processing: "處理中",
        completed: "已完成",
        rejected: "已駁回",
        failed: "失敗"
      },
      pushStatus: {
        pending: "待推送",
        success: "成功",
        failed: "失敗"
      },
      leadType: {
        aftersales_cs: "售後滿意度回訪",
        newcar_cs: "新車滿意度回訪",
        bdc_campaign: "BDC Campaign",
        bdc_aftersales_recall: "BDC售後商機招攬",
        bdc_renewal: "BDC續保商機",
        cm_custom: "CM 自定義",
        pcn_aftersales_campaign: "PCN售後 Campaign",
        ttr_survey: "TTR調研",
        new_to_renew: "新轉續",
        renew_to_renew: "續轉續",
        in_repair_no_insurance: "在修不在保",
        dormant: "沉睡",
        pending_activation: "待激活",
        active: "活躍"
      }
    },
    tracking: {
      totalGenerated: "生成商機總數",
      totalPushed: "已推送的商機",
      convertedCount: "成交數量",
      orderCount: "訂單數量",
      totalOrderAmount: "訂單總金額",
      conversionRate: "成交率",
      avgOrderAmount: "平均訂單金額",
      pushTime: "推送時間",
      converted: "已成交",
      notConverted: "未成交",
      convertedTime: "成交時間",
      firstOrderTime: "首單時間",
      lastOrderTime: "末單時間",
      advisorName: "顧問姓名",
      filterByType: "按類型篩選",
      filterByTarget: "按推送目標篩選",
      filterByConverted: "按成交狀態篩選",
      all: "全部",
      allTab: "全部",
      detailTitle: "商機追蹤詳情",
      typeDistribution: "按類型統計",
      trendChart: "趨勢分析"
    },
    stats: {
      leadTotal: "商機總數",
      pendingCount: "待處理數",
      processingCount: "處理中數",
      completedCount: "已完成數",
      pushSuccessRate: "推送成功率"
    }
  }
};

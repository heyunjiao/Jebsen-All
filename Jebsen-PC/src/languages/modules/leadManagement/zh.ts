export default {
  leadManagement: {
    overview: {
      title: "数据概览",
      refresh: "刷新",
      dateRange: "日期范围",
      startDate: "开始日期",
      endDate: "结束日期",
      to: "至",
      leadType: "商机类型",
      selectLeadType: "请选择商机类型",
      status: "状态",
      selectStatus: "请选择状态",
      pushTarget: "推送目标",
      selectPushTarget: "请选择推送目标",
      filterNote: "提示：以下数据仅按日期范围筛选，不受商机类型、状态、推送目标等条件影响",
      todayTotal: "今日生成总数",
      todayPushed: "今日已推送",
      pendingCount: "待处理数",
      processingCount: "处理中数",
      completedCount: "已完成数",
      successRate: "推送成功率",
      typeDistribution: "商机类型分布",
      statusDistribution: "商机状态分布",
      typeTrend: "商机类型趋势",
      statusTrend: "商机状态趋势",
      noData: "暂无数据",
      loadFailed: "加载统计数据失败"
    },
    columns: {
      oneId: "OneID",
      customerName: "真实姓名",
      leadType: "商机类型",
      ruleName: "触发规则",
      priority: "优先级",
      status: "状态",
      pushTarget: "推送目标",
      pushStatus: "推送状态",
      assignedAdvisor: "推送至SA/SC",
      createdAt: "创建时间",
      operation: "操作"
    },
    buttons: {
      batchPush: "批量推送",
      reloadLeads: "重载商机",
      retryFailed: "重试失败项",
      view: "详情",
      push: "推送",
      reload: "重载",
      confirm: "确定",
      cancel: "取消"
    },
    placeholders: {
      oneId: "请输入OneID",
      status: "请选择状态",
      pushTarget: "请选择推送目标"
    },
    messages: {
      selectPush: "请选择要推送的商机",
      selectReload: "请选择要重载的商机",
      noFailed: "暂无推送失败的商机",
      retryConfirm: "发现 {count} 条推送失败的商机，是否批量重试？",
      retryTitle: "重试失败项",
      reloadConfirmBatch: "确定要重载选中的商机吗？",
      reloadConfirmSingle: "确定要重载该商机吗？",
      reloadSuccess: "重载成功",
      reloadFailed: "重载失败",
      operationFailed: "操作失败",
      detailTitle: "商机详情",
      payloadTitle: "数据负载",
      pushSuccess: "推送成功"
    },
    enums: {
      status: {
        pending: "待处理",
        pushed: "已推送",
        processing: "处理中",
        completed: "已完成",
        rejected: "已驳回",
        failed: "失败"
      },
      pushStatus: {
        pending: "待推送",
        success: "成功",
        failed: "失败"
      },
      leadType: {
        aftersales_cs: "售后满意度回访",
        newcar_cs: "新车满意度回访",
        bdc_campaign: "BDC Campaign",
        bdc_aftersales_recall: "BDC售后商机招揽",
        bdc_renewal: "BDC续保商机",
        cm_custom: "CM 自定义",
        pcn_aftersales_campaign: "PCN售后 Campaign",
        ttr_survey: "TTR调研",
        new_to_renew: "新转续",
        renew_to_renew: "续转续",
        in_repair_no_insurance: "在修不在保",
        dormant: "沉睡",
        pending_activation: "待激活",
        active: "活跃"
      }
    },
    tracking: {
      totalGenerated: "生成商机总数",
      totalPushed: "已推送的商机",
      convertedCount: "成交数量",
      orderCount: "订单数量",
      totalOrderAmount: "订单总金额",
      conversionRate: "成交率",
      avgOrderAmount: "平均订单金额",
      pushTime: "推送时间",
      converted: "已成交",
      notConverted: "战败",
      lostReason: "战败原因",
      convertedTime: "成交时间",
      firstOrderTime: "首单时间",
      lastOrderTime: "末单时间",
      advisorName: "顾问姓名",
      filterByType: "按类型筛选",
      filterByTarget: "按推送目标筛选",
      filterByConverted: "按成交状态筛选",
      all: "全部",
      allTab: "全部",
      detailTitle: "商机追踪详情",
      typeDistribution: "按类型统计",
      trendChart: "趋势分析"
    },
    stats: {
      leadTotal: "商机总数",
      pendingCount: "待处理数",
      processingCount: "处理中数",
      completedCount: "已完成数",
      pushSuccessRate: "推送成功率"
    }
  }
};

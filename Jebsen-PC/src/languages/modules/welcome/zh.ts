export default {
  welcome: {
    morning: "早上好",
    afternoon: "下午好",
    evening: "晚上好",
    startTour: "开始导览",
    adminView: "管理员视图",
    businessView: "业务视图",
    adminMessage: "系统 360° 全景：所有数据管道同步正常。有 3 个治理任务待处理。",
    businessMessage: "您的每日销售简报：自上次登录以来发现了 12 个新的高价值商机。",
    systemStatus: "当日数据采集情况",
    allSystemsOperational: "所有系统运行正常",
    customerLibraryStats: "客户库统计",
    governanceTasks: "我的任务",
    viewAll: "查看全部",
    recentSensitiveOperations: "最近操作",
    totalClients: "客户总数",
    highIntent: "高意向",
    conversionRate: "转化率",
    revenueEst: "预估营收",
    opportunityPipeline: "商机漏斗",
    pushToBDC: "推送到 BDC",
    myTasks: "我的任务",
    systemSource: "系统来源",
    governance: "治理",
    audit: "审计",
    metrics: "指标",
    opportunities: "商机",
    viewSwitched: "视图已切换",
    nowViewingAsAdmin: "正在以管理员身份查看",
    nowViewingAsUser: "正在以业务客户身份查看",
    pushingToBDC: "正在推送 {name} 到 BDC...",
    tour: {
      systemHealth: "系统健康",
      systemHealthDesc: "实时监控所有 7 个连接的数据源状态。",
      governance: "数据治理",
      governanceDesc: "在此处理合并冲突和数据质量警报。",
      audit: "安全审计",
      auditDesc: "跟踪所有敏感数据访问和导出以符合合规性。",
      keyMetrics: "关键指标",
      keyMetricsDesc: "今日最重要的业务 KPI 一览。",
      smartOpp: "智能商机",
      smartOppDesc: "AI 识别的业务机会。点击'推送'同步到 BDC。"
    },
    data: {
      status: {
        online: "在线",
        synced: "昨日本批同步完成",
        delay: "延迟",
        active: "活跃",
        uploaded: "采集成功",
        pendingUpload: "待上传",
        time: "时间"
      },
      desc: {
        dms: "每日导出 CSV",
        poas: "配件订单",
        wws: "索赔单",
        cap: "新车线索",
        BDC外呼系统: "线索与交互",
        voucher: "会员优惠券"
      },
      manual: "手工表",
      auto: "直连数据库",
      manualGroupTitle: "手工表",
      autoGroupTitle: "直连数据库",
      upload: "上传",
      governance: {
        mergeConflict: "合并冲突: 客户 ID #88392",
        dataQuality: "数据质量: 手机号格式错误",
        missingField: "字段缺失: 来源标记"
      },
      audit: {
        exported: "导出 500 条记录 (管理员)",
        backup: "系统备份完成",
        policyUpdate: "超级管理员更新了策略"
      },
      opportunity: {
        renewal: "新转续商机",
        renewalDesc: "15 位客户即将租赁到期",
        birthday: "生日关怀",
        birthdayDesc: "8 位客户今天过生日",
        serviceDue: "保养提醒",
        serviceDueDesc: "24 位客户需进行保养",
        lostLead: "流失线索召回",
        lostLeadDesc: "5 个非活跃线索表现出兴趣"
      },
      task: {
        followUp: "跟进客户 #{id}"
      },
      columns: {
        task: "任务",
        priority: "优先级",
        time: "时间"
      },
      action: {
        fix: "处理"
      }
    },
    quickNavigation: "快捷导航",
    systemSummary: {
      normal: "所有数据采集正常",
      abnormal: "存在采集异常",
      incomplete: "有 {count} 个系统待采集"
    },
    impact: {
      title: "数据清洗成效",
      cleanedData: "清洗数据量",
      tagCoverage: "标签覆盖率提升"
    }
  }
};

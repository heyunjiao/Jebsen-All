export default {
  errorCorrection: {
    pendingConflicts: "待处理冲突",
    autoMerge: "自动合并",
    autoMergeSuccessRate: "自动合并成功率",
    simulateWeCom: "模拟 WeCom 销售视角",
    duplicateProfileQueue: "疑似重复客户队列",
    exitDemo: "退出演示",
    weComSidebar: "企业微信侧边栏 (Sales View)",
    customerProfile: "客户画像",
    fullView: "360全貌",
    interactionTimeline: "互动动态",
    opportunities: "商机",
    totalConsumption: "累计消费",
    visitFrequency: "进店频次",
    myVehicles: "我的车辆",
    certifiedOwner: "成交车主（真实下单客户）",
    currentMileage: "当前里程",
    outOfWarranty: "过保",
    servicePreference: "服务偏好",
    afternoonContact: "下午联系",
    wechatContact: "微信沟通",
    needShuttle: "需要代步车",
    storeRepair: "到店维修",
    changeTire: "更换轮胎",
    wechatCommunication: "微信沟通",
    inquireMaintenance: "询问保养套餐",
    regularMaintenance: "常规保养",
    highIntent: "高意向",
    airConditioningCleaning: "空调清洗",
    justNow: "刚刚",
    tabs: {
      pending: "待处理",
      processed: "已处理"
    },
    // 统计面板
    stats: {
      pendingConflicts: "待处理冲突",
      dataQualityIssues: "数据质量问题",
      syncFailures: "同步失败",
      totalProcessed: "平台数据总处理",
      totalVolume: "数据总量",
      successCount: "成功处理",
      mergeNeeded: "需合并处理",
      autoMerged: "程序自动合并",
      tagTotal: "标签总数",
      tagCoverage: "标签覆盖人群"
    },
    // 筛选栏
    filter: {
      errorType: "异常类型",
      severity: "严重等级",
      sourceSystem: "来源系统",
      status: "状态"
    },
    // 异常类型
    errorType: {
      all: "全部",
      identityConflict: "身份冲突",
      dataQuality: "数据质量",
      syncFailure: "同步失败",
      h5Feedback: "H5反馈"
    },
    // 严重等级
    severity: {
      high: "高",
      medium: "中",
      low: "低"
    },
    // 状态
    status: {
      pending: "待处理",
      processed: "已处理"
    },
    // 批量操作
    batchIgnore: "批量忽略",
    batchIgnoreConfirm: "确认忽略选中的 {count} 条异常？",
    messages: {
      common: {
        correctionTitle: "数据修正"
      },
      ignoreConfirmTitle: "确认忽略",
      ignoreConfirm: "确认忽略任务 {taskNo}？",
      ignoreCompleted: "已忽略",
      batchIgnoreCompleted: "已忽略 {count} 条异常",
      submitForApproval: "已提交，等待处理"
    },
    common: {
      correctionTitle: "数据修正"
    },
    // 快速编辑弹窗
    quickEdit: {
      title: "数据修正",
      viewTitle: "数据修正",
      alertTitle: "格式校验失败",
      alertDesc: "字段 【{field}】 不符合规范，请修正后重新提交。",
      originalData: "原始数据",
      errorFields: "报错字段",
      correction: "修正信息",
      enterCorrectValue: "请输入正确的值",
      currentValue: "当前值",
      markAsInvalid: "标记为无效数据（将进入忽略名单）",
      saveAndReprocess: "保存",
      pleaseEnterCorrection: "请填写修正值或标记为无效数据",
      saveSuccess: "修正已保存",
      processInfo: "处理信息",
      processTime: "处理时间",
      createTime: "创建时间",
      processResult: "处理结果",
      trustedSource: "信任源",
      trustedSystem: "信任系统",
      suggestedFix: "修复建议"
    },
    // 同步重试弹窗
    syncRetry: {
      title: "同步失败重试",
      errorInfo: "错误信息",
      targetSystem: "目标系统",
      system: "系统",
      endpoint: "接口地址",
      requestPayload: "请求体",
      retryResult: "重试结果",
      retryNow: "立即重试",
      retrying: "重试中...",
      retrySuccess: "重试成功",
      retryFailed: "重试失败",
      successMessage: "数据已成功推送至 {system}",
      failedMessage: "重试失败，请稍后再试或联系技术支持"
    },
    // 表格操作
    handle: "处理",
    retry: "重试",
    view: "查看",
    ignore: "忽略",
    // SLA
    sla: {
      expired: "已超时"
    },
    // 表格列标签
    table: {
      taskNo: "任务编号",
      oneId: "OneID",
      customerName: "真实姓名",
      errorType: "异常类型",
      status: "状态",
      severity: "严重程度",
      slaCountdown: "SLA倒计时",
      mainIssue: "主要问题",
      sourceSystem: "来源系统",
      handler: "处理人",
      operation: "操作"
    },
    // 移动端演示相关
    mobile: {
      goldMember: "黄金会员",
      churnWarning: "流失预警",
      repairAtStore: "到店维修",
      changeTire: "更换轮胎",
      wechatChat: "微信沟通",
      askMaintenance: "询问保养套餐",
      routineMaintenance: "常规保养",
      pushCoupon: "一键推送优惠券",
      insuranceReminder: "保险续保提醒",
      expireSoon: "车险将于 30 天后到期。",
      followQuote: "跟进报价",
      phone: "电话",
      wechat: "微信",
      createTicket: "建工单",
      addTag: "添加标签",
      shareCard: "分享名片",
      feedback: "投诉/反馈",
      cancel: "取消",
      newTicket: "新建服务工单",
      ticketType: "工单类型",
      repair: "维修",
      remark: "备注",
      submit: "提交",
      ticketCreated: "工单已创建",
      systemDetectSummer: "系统检测到夏季临近，且客户近一年未做空调管路清洗。",
      daysAgo: "{count}天前",
      consumption: "消费",
      satisfaction: "满意度",
      duration: "时长",
      times: "次",
      // 数据冲突相关
      dataConflict: "数据冲突",
      conflictField: "冲突字段",
      conflictSource: "数据来源",
      conflictInfo: "冲突信息",
      conflictDetail: "冲突详情",
      sourceSystem: "来源系统",
      conflictValue: "冲突值",
      currentValue: "当前值",
      recommendedValue: "推荐值",
      resolveConflict: "处理冲突",
      selectTrustedSource: "选择信任来源",
      conflictResolved: "冲突已处理",
      // 手机号相关
      phoneNumber: "手机号码",
      phoneConflict: "手机号冲突",
      phoneConflictDesc: "检测到多个来源的手机号不一致",
      editPhone: "编辑手机号",
      addPhone: "添加手机号",
      phoneList: "手机号列表",
      phoneSource: "来源",
      phoneStatus: "状态",
      phoneVerified: "已验证",
      phoneUnverified: "未验证",
      phoneInvalid: "无效",
      phonePrimary: "主号码",
      setAsPrimary: "设为主号码",
      deletePhone: "删除",
      phoneFormatError: "手机号格式不正确",
      phoneRequired: "请输入手机号",
      phoneDuplicate: "该手机号已存在",
      phoneValidation: "请输入11位有效手机号",
      phoneAddSuccess: "手机号添加成功",
      phoneUpdateSuccess: "手机号更新成功",
      phoneDeleteSuccess: "手机号删除成功",
      phoneSetPrimarySuccess: "已设为主号码",
      confirmDeletePhone: "确认删除该手机号？",
      // 标签管理相关
      tagManagement: "标签管理",
      myTags: "我的标签",
      addCustomTag: "添加自定义标签",
      tagName: "标签名称",
      tagNamePlaceholder: "请输入标签名称",
      tagColor: "标签颜色",
      tagCategory: "标签分类",
      tagDescription: "标签描述",
      tagDescriptionPlaceholder: "请输入标签描述（可选）",
      saveTag: "保存标签",
      editTag: "编辑标签",
      deleteTag: "删除标签",
      confirmDeleteTag: "确认删除该标签？",
      tagAddSuccess: "标签添加成功",
      tagUpdateSuccess: "标签更新成功",
      tagDeleteSuccess: "标签删除成功",
      tagNameRequired: "请输入标签名称",
      tagNameMaxLength: "标签名称不能超过20个字符",
      // 通用
      edit: "编辑",
      save: "保存",
      delete: "删除",

      confirm: "确认",
      close: "关闭",
      viewDetail: "查看详情",
      noConflicts: "暂无数据冲突",
      conflictReadonlyTip: "提示：除手机号外，其他数据冲突仅支持查看，无法在此处理",
      viewOnly: "仅查看"
    },
    // 冲突解决工作台 (MergeWorkbenchDialog)
    mergeWorkbench: {
      title: "数据修正",
      taskNo: "任务编号",
      conflictAlert: "冲突提示：系统检测到【{field}】不一致。请确认最终保留值。",
      // 标签页
      tabs: {
        comparison: "核心对比矩阵",
        lineage: "身份血缘溯源",
        evidence: "交互证据链",
        reference: "客户信息参考"
      },
      // 表单
      correctionReason: "更正理由",
      correctionReasonPlaceholder: "请填写更正理由，说明为什么选择这些值...",
      rejectReason: "驳回意见（如驳回）",
      rejectReasonPlaceholder: "如驳回，请填写驳回意见...",
      // 按钮
      saveDraft: "暂存",
      splitPerson: "非同一人，拆分",
      submitReview: "提交审核",
      close: "关闭",
      reject: "驳回",
      confirmMerge: "确认合并",
      isSamePerson: "是同一个人 (合并)",
      notSamePerson: "不是同一个人 (保持多条)",
      ignoreWithPrompt: "忽略",
      // 状态
      status: {
        pending: "待处理",
        draft: "草稿",
        review: "待审核",
        resolved: "已解决",
        rejected: "已驳回",
        unknown: "未知"
      },
      // 消息
      messages: {
        draftSaved: "草稿已保存",
        saveFailed: "保存失败",
        pleaseEnterReason: "请填写更正理由",
        submitting: "正在提交...",
        submitSuccess: "任务已提交。",
        submitSuccessWithSync: "任务已提交。合并后将有 {count} 个号码同步至 BDC 系统（T+1 生效）",
        submitSuccessWaitApproval: "任务已提交",
        submitFailed: "提交失败",
        mergeConfirmWithSync:
          "确认合并后将更新系统内的黄金记录，合并后将有 {count} 个号码同步至 BDC 系统（T+1 生效）。是否继续？",
        mergeConfirm: "确认合并后将更新系统内的黄金记录，是否继续？",
        mergeConfirmTitle: "确认合并",
        merging: "正在执行数据合并与 OneID 重算...",
        mergeSuccess: "合并成功",
        mergeSuccessWithSync: "客户 {name} 更新完成，已下发至各源系统。{count} 个号码将在 T+1 同步至 BDC 系统。",
        mergeSuccessNoSync: "客户 {name} 更新完成，已下发至各源系统",
        pleaseEnterRejectReason: "请填写驳回意见",
        rejectConfirm: "确认驳回该任务？",
        rejectConfirmTitle: "确认驳回",
        rejected: "已驳回，任务将退回给处理人",
        splitPrompt: "请确认拆分理由（将加入冲突检测白名单，防止再次误报）：",
        splitConfirmTitle: "确认非同一人",
        submitSplit: "提交拆分",
        splitSuccess: "已拆分客户。"
      },
      // 源系统
      sourceSystems: {
        wechat: "企微",
        website: "官网"
      }
    },
    // H5 提交的数据纠错反馈处理 (FeedbackResolutionDrawer)
    feedbackResolution: {
      title: "数据修正",
      taskNo: "任务编号",
      tabs: {
        resolution: "人工反馈",
        lineage: "身份血缘溯源"
      },
      // SLA 倒计时
      sla: {
        remaining: "剩余 {time}",
        expired: "已超时",
        hours: "{hours}小时",
        hoursMinutes: "{hours}小时 {minutes}分钟"
      },
      // 左侧：黄金记录
      goldenRecord: {
        title: "被纠错客户档案",
        name: "姓名",
        phone: "手机号",
        jobTitle: "职位",
        company: "公司",
        tags: "标签",
        lockTooltip: "将标记为人工修正",
        locked: "已锁定（人工修正）"
      },
      // 右侧：反馈与核实
      feedback: {
        title: "反馈与核实",
        rawInput: {
          title: "原始反馈",
          submittedBy: "提交人",
          submittedAt: "提交时间"
        },
        correctionDetail: {
          title: "H5 纠错明细",
          field: "纠错字段",
          currentValue: "当前值",
          correctValue: "纠错值",
          note: "备注"
        },
        smartSuggestion: {
          title: "智能辅助",
          extractedPhone: "疑似电话",
          extractedName: "疑似姓名",
          clickToFill: "点击自动回填"
        },
        verification: {
          title: "核实记录",
          placeholder: "请填写核实情况（如：已查询 DMS 核实无误）"
        }
      },
      // 底部操作栏
      actions: {
        reject: "驳回",
        confirm: "确认修正",
        cancel: "取消",
        save: "保存",
        ignore: "忽略"
      },
      // 驳回对话框
      rejectDialog: {
        title: "驳回反馈",
        reason: "驳回理由",
        reasonPlaceholder: "请填写驳回理由（必填）",
        reasonRequired: "请填写驳回理由",
        confirm: "确认驳回",
        cancel: "取消"
      },
      // 消息提示
      messages: {
        confirmTitle: "确认修正",
        confirmMessage: "确认提交修正？修正后将更新系统内的黄金记录。",
        rejectSuccess: "已驳回反馈",
        confirmSuccess: "修正已保存",
        pleaseEnterVerification: "请填写核实记录",
        fieldLocked: "字段已锁定，将标记为人工修正"
      }
    },
    // 客户信息参考面板 (CustomerReferencePanel)
    customerReference: {
      categoryTags: "标签分类",
      // 卡片标题
      customerInfo: "客户基本信息",
      vehicleInfo: "车辆信息",
      consumptionStats: "消费统计",
      loyaltyValue: "忠诚度与价值",
      opportunityInfo: "商机信息",
      servicePreference: "服务偏好",
      remarks: "备注信息",
      // 客户信息字段
      customerName: "真实姓名",
      phone: "手机号码",
      jobTitle: "职位",
      company: "公司",
      gender: "性别",
      ageGroup: "年龄段",
      familyStatus: "家庭状态",
      address: "地址",
      tags: "标签",
      // 车辆信息字段
      vin: "VIN码",
      plate: "车牌号",
      brandModel: "品牌车型",
      purchaseDate: "购买日期",
      currentMileage: "当前里程",
      warrantyStatus: "保修状态",
      inWarranty: "在保",
      outOfWarranty: "过保",
      // 消费统计字段
      totalSpend: "累计消费",
      yearlySpend: "年度消费",
      avgSpend: "平均消费",
      orderCount: "订单频次",
      visit90d: "近90天到店",
      lastVisit: "最近到店",
      times: "次",
      none: "无",
      // 忠诚度与价值字段
      loyaltyLevel: "忠诚度等级",
      opportunityLevel: "商机等级",
      customerLifecycle: "客户生命周期",
      customerValue: "客户价值",
      // 商机信息字段
      opportunityType: "商机类型",
      opportunityPriority: "优先级",
      opportunityStatus: "商机状态",
      ruleName: "触发规则",
      pushTarget: "推送目标",
      pushStatus: "推送状态",
      priorityLow: "低",
      priorityMedium: "中",
      priorityHigh: "高",
      statusPending: "待推送",
      statusPushed: "已推送",
      statusProcessing: "处理中",
      statusCompleted: "已完成",
      pushTargetBdc: "BDC系统",
      pushTargetWechat: "微信系统",
      pushTargetCrm: "CRM系统",
      pushStatusPending: "待推送",
      pushStatusSuccess: "推送成功",
      pushStatusFailed: "推送失败",
      opportunityCount: "{count} 个商机"
    },
    // 异常类型全景定义 (Exception Taxonomy)
    taxonomy: {
      title: "异常类型全景定义",
      description: "在清洗过程中，必须捕获以下 5 大类异常，并在界面上用不同颜色/图标区分",
      example: "场景举例",
      actionsLabel: "处理策略",
      // A. 有效性异常 (Validity)
      validity: {
        name: "有效性异常",
        description: "数据格式、值域、枚举值不符合规范",
        subTypes: {
          formatError: {
            name: "格式错误",
            description: "数据格式不符合规范",
            example: "手机号含横杠、邮箱无@、身份证位数不对"
          },
          valueRangeError: {
            name: "值域越界",
            description: "数值超出合理范围",
            example: "车龄 200 年、生日是未来时间、价格为负数"
          },
          enumMismatch: {
            name: "枚举非法",
            description: "枚举值与目标系统要求不匹配",
            example: '性别由源系统传来 "M/F"，目标系统要求 "0/1"'
          }
        }
      },
      // B. 唯一性异常 (Uniqueness)
      uniqueness: {
        name: "唯一性异常",
        description: "数据重复或主键冲突",
        subTypes: {
          suspectedDuplicate: {
            name: "疑似重复",
            description: "多条记录高度相似，但置信度不足",
            example: "姓名+手机号高度相似，OneID 算法置信度为 80%（不敢自动合并）"
          },
          primaryKeyConflict: {
            name: "主键冲突",
            description: "相同主键存在多条不同记录",
            example: "源系统推了两条 ID 一样但内容不同的数据"
          }
        }
      },
      // C. 完整性异常 (Completeness)
      completeness: {
        name: "完整性异常",
        description: "关键字段缺失或数据孤立",
        subTypes: {
          criticalMissing: {
            name: "关键缺失",
            description: "必填字段或关键信息缺失",
            example: "有客户名但无任何联系方式（僵尸数据）"
          },
          orphanData: {
            name: "孤儿数据",
            description: "数据缺少必要的关联关系",
            example: '有"订单记录"但找不到对应的"客户ID"'
          }
        }
      },
      // D. 关联性异常 (Consistency)
      consistency: {
        name: "关联性异常",
        description: "数据逻辑不一致或状态冲突",
        subTypes: {
          logicalConflict: {
            name: "逻辑互斥",
            description: "不同字段之间存在逻辑矛盾",
            example: '身份证显示是女性，性别字段却是"男"'
          },
          statusConflict: {
            name: "状态冲突",
            description: "不同系统对同一实体的状态描述不一致",
            example: 'DMS 说"已交车"，CRM 说"未成交"'
          }
        }
      },
      // E. 合规性异常 (Compliance)
      compliance: {
        name: "合规性异常",
        description: "数据不符合合规要求或授权缺失",
        subTypes: {
          authorizationMissing: {
            name: "授权缺失",
            description: "缺少必要的授权或协议确认",
            example: '数据进来了，但没有勾选"隐私协议"字段'
          }
        }
      },
      // 处理策略 (Actions)
      actions: {
        clean: "清洗",
        edit: "编辑",
        correct: "修正",
        empty: "置空",
        map: "映射",
        merge: "合并",
        override: "覆盖",
        discard: "丢弃",
        supplement: "补录",
        archive: "归档",
        associate: "关联",
        trustChoice: "信任选择",
        trustSource: "信任源",
        freeze: "冻结"
      }
    }
  }
};

export default {
  collection: {
    title: "数据催收管理",
    config: {
      title: "数据催收配置",
      subtitle: "配置数据上传提醒和通知规则",
      platforms: {
        manualUpload: "手动上传平台",
        selectEmployee: "请选择员工",
        selectEmployees: "请选择员工（可多选）",
        selectTime: "选择时间",
        stageNamePlaceholder: "阶段名称",
        multipleEmployeesTip: "最后一个阶段可选择多个员工，系统将发送给所有选中的员工"
      },
      recipients: {
        title: "收件人配置",
        scheduleConfig: {
          title: "催收时间节点配置",
          desc: "配置不同时间节点的催收规则和收件人邮箱。业务人员需在前一晚18:00前上传，否则按以下规则发送催收通知。",
          stageT0: "T+0 阶段",
          stageT0Desc: "当天18:00前未上传，发送给操作人（唯一邮箱）",
          stageT0DescPrefix: "当天",
          stageT0DescSuffix: "前未上传，发送给操作人（唯一邮箱）",
          stageT1: "T+1 阶段",
          stageT1Desc: "第二天9:00发现未上传，发送给操作人（唯一邮箱），告知missing，要求补传",
          stageT1DescPrefix: "第二天",
          stageT1DescSuffix: "发现未上传，发送给操作人（唯一邮箱），告知missing，要求补传",
          stageT2: "T+2 阶段",
          stageT2Desc: "后一天仍未上传，发送给C360项目组数据专员（可多选）",
          stageT2DescPrefix: "后一天",
          stageT2DescSuffix: "仍未上传，发送给C360项目组数据专员（可多选）",
          stageT3DescPrefix: "后二天",
          stageLabel: "催收阶段",
          timeLabel: "时间点",
          recipientLabel: "收件人邮箱",
          recipientPlaceholder: "请输入邮箱地址",
          recipientPlaceholderMultiple: "请输入邮箱地址，多个邮箱用逗号分隔",
          emailRequired: "请输入收件人邮箱",
          emailFormat: "请输入有效的邮箱地址",
          emailFormatMultiple: "邮箱格式不正确，多个邮箱请用逗号分隔"
        },
        hardcodedCC: {
          title: "兜底抄送",
          desc: "指定一个固定邮箱地址接收所有告警。这确保即使员工离职也能保持连续性。",
          fallbackEmail: "兜底邮箱",
          placeholder: "例如：data_team@company.com"
        },
        save: "保存配置",
        reset: "重置",
        saveSuccess: "配置保存成功",
        resetSuccess: "配置已重置",
        emailRequired: "请输入邮箱地址",
        emailFormat: "请输入有效的邮箱地址",
        scheduleRequired: "请至少配置一个催收时间节点",
        preview: {
          title: "配置预览",
          notSet: "未设置",
          notConfigured: "未配置"
        }
      },
      globalRules: {
        title: "全局监控规则配置",
        desc: "配置自动数据源监控、数据质量检测以及系统性能与扩容等系统级邮件通知规则。",
        enabled: "启用",
        disabled: "停用",
        status: "状态",
        type: "类型",
        ruleName: "规则名称",
        viewDetails: "查看详情",
        threshold: "预警阈值",
        thresholdTip: "当资源使用率达到此阈值时触发告警",
        extraRecipients: "额外收件人",
        extraRecipientsPlaceholder: "可选：额外抄送邮箱",
        detailColumn: "规则说明",
        groups: {
          autoSource: "源系统更新停滞时的自动告警规则",
          dataQuality: "数据质量致命错误退回的告警规则",
          systemCapacity: "系统资源使用率达到阈值时的告警规则"
        },
        rules: {
          auto_source_stopped: {
            title: "自动数据源监控：源系统更新停滞",
            desc: "当每日定时任务检测到某数据源未按约定时间更新时，向该数据源责任人及其上级发送提醒邮件，可在此配置额外抄送邮箱。"
          },
          data_quality_fatal: {
            title: "数据质量检测：致命错误退回",
            desc: "当数据处理流水线发现系统无法自动纠正的致命错误并退回时，向数据上传客户及数据质量责任人发送邮件，可在此配置额外抄送邮箱。"
          },
          system_capacity_threshold: {
            title: "系统资源使用率超过预设阈值（50%）",
            desc: "当监控系统检测到关键资源使用率达到 50% 时，向 Jebsen 侧负责人及相关技术负责人发送邮件，可在此配置额外抄送邮箱。"
          }
        }
      }
    },
    monitor: {
      title: "数据催收监控",
      refresh: "刷新列表",
      employeeName: "数据负责人",
      email: "邮箱",
      dataSource: "数据源",
      uploadStatus: "上传状态",
      deadline: "截止时间",
      overdueDays: "逾期天数",
      status: "员工状态",
      action: "操作",
      nudge: "催一下",
      statusActive: "在职",
      statusResigned: "离职",
      uploadStatusPending: "待上传",
      uploadStatusOverdue: "已逾期",
      uploadStatusCompleted: "已完成",
      nudgeDialog: {
        title: "发送数据催收通知",
        resignedAlert: {
          title: "数据负责人已离职",
          desc: "该数据负责人已离职。请明确指定新的收件人邮箱，用于临时顶替数据上传。"
        },
        recipientEmail: "收件人邮箱",
        recipientEmailPlaceholder: "请输入收件人邮箱",
        message: "消息内容",
        messagePlaceholder: "例如：请尽快上传T+1数据，截止时间为今天18:00",
        cancel: "取消",
        send: "发送通知",
        emailRequired: "请输入收件人邮箱",
        emailFormat: "请输入有效的邮箱地址",
        sendSuccess: "数据催收通知已发送至 {email}"
      }
    },
    rules: {
      title: "邮件通知与催收规则总览",
      subtitle: "统一查看各类监控维度下的邮件触发时机、接收对象与来源依据",
      enabled: "已启用",
      disabled: "未启用",
      viewConfig: "查看配置",
      stats: {
        totalRules: "规则总数",
        manualUploadRules: "手动上传时效规则",
        autoSourceRules: "自动数据源监控规则",
        dataQualityRules: "数据质量检测规则",
        systemCapacityRules: "系统性能与扩容规则"
      },
      columns: {
        monitorType: "监控维度",
        scenario: "触发场景",
        platform: "所属平台 / 系统",
        stage: "阶段",
        triggerTiming: "出现时机 (Trigger Timing)",
        recipients: "接收对象",
        sourceBasis: "来源依据",
        enabled: "是否启用"
      },
      filters: {
        monitorTypePlaceholder: "请选择监控维度"
      },
      monitorType: {
        manualUpload: "数据上传时效（Manual）",
        autoSource: "自动数据源监控",
        dataQuality: "数据质量检测",
        systemCapacity: "系统性能 / 扩容"
      },
      scenario: {
        manualUploadDelay: "数据上传超时 / 未按时上传",
        autoSourceStopped: "自动数据源未按预期更新",
        dataQualityFatal: "致命错误退回，系统无法自动纠正",
        systemCapacity: "系统资源使用率超过预设阈值"
      },
      platform: {
        autoPipeline: "自动数据管道",
        dataQualityWorkbench: "数据质量工作台",
        c360Infrastructure: "C360 基础设施 / 应用集群"
      },
      trigger: {
        manualUpload: "在阶段 {stage}，计划时间 {time} 前仍未完成上传时触发",
        autoSourceStopped: "每日定时任务检测到某数据源在约定时间前仍未更新时触发",
        dataQualityFatal: "当数据质量校验出现致命错误，系统无法自动纠正且需要业务确认时触发",
        systemCapacity: "当监控系统检测到关键资源使用率达到或超过 50% 阈值时触发"
      },
      recipients: {
        toBeConfigured: "待配置收件人",
        autoSource: "相关责任人及其上级（按数据源负责人配置）",
        dataQuality: "数据上传客户及数据质量责任人",
        systemCapacity: "Jebsen 侧负责人与相关技术负责人"
      },
      sourceBasis: {
        manualUpload: "《数据上传时效要求》—— 手动上传类报表 T+0/T+1/T+2 催收规则",
        autoSource: "《自动数据源监控策略》—— 源系统更新停滞处理规则",
        dataQuality: "《数据质量管理规范》—— 致命错误退回处理流程",
        systemCapacity: "《系统容量与扩容规划》—— 资源阈值 50% 告警规则"
      }
    }
  }
};

export default {
  ruleConfig: {
    columns: {
      batchNo: "批次号",
      name: "分发名称",
      description: "分发描述",
      triggerType: "触发类型",
      leadType: "商机类型",
      pushCount: "推送人数",
      priority: "优先级",
      pushTarget: "推送目标",
      enabled: "启用状态",
      creator: "创建人",
      createdAt: "创建时间",
      createMethod: "创建方式",
      operation: "操作"
    },
    buttons: {
      add: "新增分发查询",
      addLead: "新增商机",
      edit: "编辑",
      delete: "删除",
      cancel: "取消",
      confirm: "确定",
      submit: "确定",
      iKnow: "我知道了",
      confirmSubmit: "确认提交",
      configureSchedule: "配置定时表达式",
      openCronGenerator: "打开表达式生成器"
    },
    placeholders: {
      name: "请输入分发名称",
      description: "请输入分发描述",
      selectTrigger: "请选择触发类型",
      selectLeadType: "请选择商机类型",
      selectPriority: "请选择优先级",
      selectTarget: "请选择推送目标",
      selectStatus: "请选择状态",
      selectSegment: "请选择分群",
      selectPushRole: "请选择推送角色",
      selectEventType: "请选择事件类型",
      enterSchedule: "请输入Cron表达式，如：0 9 * * * (每天9点)",
      leadTitle: "自动填入，如：维保召回商机",
      selectAssign: "请选择默认分配方式",
      scheduleExpression: "请配置定时表达式"
    },
    enums: {
      trigger: {
        segment: "分群触发",
        event: "事件触发",
        schedule: "定时触发"
      },
      priority: {
        high: "高",
        medium: "中",
        low: "低"
      },
      leadType: {
        system: "系统商机",
        aftersales_cs: "售后满意度回访",
        newcar_cs: "新车满意度回访",
        bdc_campaign: "BDC Campaign",
        cm_custom: "CM 自定义",
        pcn_aftersales_campaign: "PCN售后 Campaign",
        ttr_survey: "TTR调研",
        new_to_renew: "新转续",
        renew_to_renew: "续转续",
        in_repair_no_insurance: "在修不在保",
        psp_expiry: "PSP到期",
        maintenance_churn: "保养潜在流失",
        no_visit_365d: "365天未进店",
        regular_maintenance_365d: "定保客户365天未保养",
        periodic_maintenance: "定期保养",
        first_insurance_2y: "首保2年",
        first_maintenance: "首次保养",
        newcar_365d_no_maintenance: "新车365天未保养",
        newcar_warranty_expiry: "新车保修到期",
        extended_warranty_expiry: "延保到期",
        newcar_delivery_90d_revisit: "新车交付90天回访"
      },
      pushTarget: {
        BDC外呼系统: "BDC外呼系统"
      },
      pushRole: {
        SA: "SA",
        SC: "SC",
        other: "其他"
      },
      status: {
        enable: "启用",
        disable: "禁用"
      },
      createMethod: {
        manual_upload: "手工上传",
        system_generated: "平台生成"
      },
      assign: {
        byStore: "按客户归属保时捷中心分配",
        byAdvisor: "按客户专属顾问分配",
        publicPool: "进入公海池",
        manual: "手动分配"
      }
    },
    form: {
      selectSegment: "选择分群",
      overlayTags: "叠加标签",
      eventType: "事件类型",
      schedule: "定时表达式",
      action: "执行动作",
      leadTitle: "商机标题",
      defaultAssign: "默认分配",
      deduplicationStrategy: "查重策略",
      enableDeduplication: "开启查重",
      deduplicationWindow: "查重时间窗口",
      days: "天",
      name: "分发名称",
      description: "分发描述",
      triggerType: "触发类型",
      leadType: "商机类型",
      priority: "优先级",
      pushTarget: "推送目标",
      pushPlatform: "推送平台",
      pushRole: "推送角色",
      enabled: "启用状态",
      validity: "有效期",
      validityDays: "有效期"
    },
    tips: {
      overlayTags: "可选择多个标签进行叠加筛选，满足所有标签条件的客户才会生成商机",
      leadTitle: "生成的商机标题，如果不填写则使用商机类型作为标题",
      deduplication: "开启后，如果该 OneID 在指定天数内已有同类型商机，则不生成新商机",
      deduplicationWindow: "在指定天数内如果已有同类型商机，则不生成新商机",
      schedule: "配置定时任务执行时间，例如：每周一、每天9点等。支持 Cron 表达式格式。",
      validityDays: "有效期上限 30 天"
    },
    messages: {
      deleteConfirm: "确定要删除该分发吗？",
      deleteSuccess: "删除成功",
      operationFailed: "操作失败",
      submitSuccess: "提交成功",
      submittedToApproval: "已提交审批",
      approvalMessage: "请求已提交至<b>审批中心</b>。<br>审批通过后，分发预计在 5-10 分钟内生效。",
      confirmTitle: "提示",
      confirmDisable: "确定要禁用该分发吗？",
      confirmEnable: "确定要启用该分发吗？",
      auditNotice: "<br>此操作将提交至<b>审计中心</b>，预计 5-10 分钟后生效。"
    }
  }
};

export default {
  ruleConfig: {
    columns: {
      name: "分發名稱",
      description: "分發描述",
      triggerType: "觸發類型",
      leadType: "商機類型",
      priority: "優先級",
      pushTarget: "推送目標",
      enabled: "啟用狀態",
      creator: "創建人",
      createdAt: "創建時間",
      operation: "操作"
    },
    buttons: {
      add: "新增分發配置",
      edit: "編輯",
      delete: "刪除",
      cancel: "取消",
      confirm: "確定",
      submit: "確定",
      iKnow: "我知道了",
      confirmSubmit: "確認提交",
      configureSchedule: "配置定時表達式",
      openCronGenerator: "打開表達式生成器"
    },
    placeholders: {
      name: "請輸入分發名稱",
      description: "請輸入分發描述",
      selectTrigger: "請選擇觸發類型",
      selectLeadType: "請選擇商機類型",
      selectPriority: "請選擇優先級",
      selectTarget: "請選擇推送目標",
      selectStatus: "請選擇狀態",
      selectSegment: "請選擇分群",
      selectEventType: "請選擇事件類型",
      enterSchedule: "請輸入Cron表達式，如：0 9 * * * (每天9點)",
      leadTitle: "自動填入，如：維保召回商機",
      selectAssign: "請選擇默認分配方式",
      scheduleExpression: "請配置定時表達式"
    },
    enums: {
      trigger: {
        segment: "分群觸發",
        event: "事件觸發",
        schedule: "定時觸發"
      },
      priority: {
        high: "高",
        medium: "中",
        low: "低"
      },
      leadType: {
        aftersales_cs: "售後滿意度回訪",
        newcar_cs: "新車滿意度回訪",
        bdc_campaign: "BDC Campaign",
        bdc_aftersales_recall: "BDC售後商機招攬",
        bdc_renewal: "BDC續保商機",
        cm_custom: "CM 自定義",
        pcn_aftersales_campaign: "PCN售後 Campaign",
        ttr_survey: "TTR調研"
      },
      pushTarget: {
        BDC外呼系统: "BDC外呼系統"
      },
      status: {
        enable: "啟用",
        disable: "禁用"
      },
      assign: {
        byStore: "按客戶歸屬保時捷中心分配",
        byAdvisor: "按客戶專屬顧問分配",
        publicPool: "進入公海池",
        manual: "手動分配"
      }
    },
    form: {
      selectSegment: "選擇分群",
      overlayTags: "疊加標籤",
      eventType: "事件類型",
      schedule: "定時表達式",
      action: "執行動作",
      leadTitle: "商機標題",
      defaultAssign: "默認分配",
      deduplicationStrategy: "查重策略",
      enableDeduplication: "開啟查重",
      deduplicationWindow: "查重時間窗口",
      days: "天",
      name: "分發名稱",
      description: "分發描述",
      triggerType: "觸發類型",
      leadType: "商機類型",
      priority: "優先級",
      pushTarget: "推送目標",
      enabled: "啟用狀態",
      validity: "有效期",
      validityDays: "有效期（天）"
    },
    tips: {
      overlayTags: "可選擇多個標籤進行疊加篩選，滿足所有標籤條件的客戶才會生成商機",
      leadTitle: "生成的商機標題，如果不填寫則使用商機類型作為標題",
      deduplication: "開啟後，如果該 OneID 在指定天數內已有同類型商機，則不生成新商機",
      deduplicationWindow: "在指定天數內如果已有同類型商機，則不生成新商機",
      schedule: "配置定時任務執行時間，例如：每週一、每天9點等。支持 Cron 表達式格式。",
      validityDays: "有效期上限 30 天"
    },
    messages: {
      deleteConfirm: "確定要刪除該分發嗎？",
      deleteSuccess: "刪除成功",
      operationFailed: "操作失敗",
      submitSuccess: "提交成功",
      submittedToApproval: "已提交審批",
      approvalMessage: "請求已提交至<b>審批中心</b>。<br>審批通過後，分發預計在 5-10 分鐘內生效。",
      confirmTitle: "提示",
      confirmDisable: "確定要禁用該分發嗎？",
      confirmEnable: "確定要啟用該分發嗎？",
      auditNotice: "<br>此操作將提交至<b>審計中心</b>，預計 5-10 分鐘後生效。"
    }
  }
};

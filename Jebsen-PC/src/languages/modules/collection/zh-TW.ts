export default {
  collection: {
    title: "數據催收管理",
    config: {
      title: "數據催收配置",
      subtitle: "配置數據上傳提醒和通知規則",
      platforms: {
        manualUpload: "手動上傳平台",
        selectEmployee: "請選擇員工",
        selectEmployees: "請選擇員工（可多選）",
        selectTime: "選擇時間",
        stageNamePlaceholder: "階段名稱",
        multipleEmployeesTip: "最後一個階段可選擇多個員工，系統將發送給所有選中的員工"
      },
      recipients: {
        title: "收件人配置",
        scheduleConfig: {
          title: "催收時間節點配置",
          desc: "配置不同時間節點的催收規則和收件人郵箱。業務人員需在前一晚18:00前上傳，否則按以下規則發送催收通知。",
          stageT0: "T+0 階段",
          stageT0Desc: "當天18:00前未上傳，發送給操作人（唯一郵箱）",
          stageT0DescPrefix: "當天",
          stageT0DescSuffix: "前未上傳，發送給操作人（唯一郵箱）",
          stageT1: "T+1 階段",
          stageT1Desc: "第二天9:00發現未上傳，發送給操作人（唯一郵箱），告知missing，要求補傳",
          stageT1DescPrefix: "第二天",
          stageT1DescSuffix: "發現未上傳，發送給操作人（唯一郵箱），告知missing，要求補傳",
          stageT2: "T+2 階段",
          stageT2Desc: "後一天仍未上傳，發送給C360項目組數據專員（可多選）",
          stageT2DescPrefix: "後一天",
          stageT2DescSuffix: "仍未上傳，發送給C360項目組數據專員（可多選）",
          stageT3DescPrefix: "後二天",
          stageLabel: "催收階段",
          timeLabel: "時間點",
          recipientLabel: "收件人郵箱",
          recipientPlaceholder: "請輸入郵箱地址",
          recipientPlaceholderMultiple: "請輸入郵箱地址，多個郵箱用逗號分隔",
          emailRequired: "請輸入收件人郵箱",
          emailFormat: "請輸入有效的郵箱地址",
          emailFormatMultiple: "郵箱格式不正確，多個郵箱請用逗號分隔"
        },
        hardcodedCC: {
          title: "兜底抄送",
          desc: "指定一個固定郵箱地址接收所有告警。這確保即使員工離職也能保持連續性。",
          fallbackEmail: "兜底郵箱",
          placeholder: "例如：data_team@company.com"
        },
        save: "保存配置",
        reset: "重置",
        saveSuccess: "配置保存成功",
        resetSuccess: "配置已重置",
        emailRequired: "請輸入郵箱地址",
        emailFormat: "請輸入有效的郵箱地址",
        scheduleRequired: "請至少配置一個催收時間節點",
        preview: {
          title: "配置預覽",
          notSet: "未設置",
          notConfigured: "未配置"
        }
      },
      globalRules: {
        title: "全局監控規則配置",
        desc: "配置自動數據源監控、數據質量檢測以及系統性能與擴容等系統級郵件通知規則。",
        enabled: "啟用",
        disabled: "停用",
        status: "狀態",
        type: "類型",
        ruleName: "規則名稱",
        viewDetails: "查看詳情",
        threshold: "預警閾值",
        thresholdTip: "當資源使用率達到此閾值時觸發告警",
        extraRecipients: "額外收件人",
        extraRecipientsPlaceholder: "可選：額外抄送郵箱，多個郵箱請用逗號分隔",
        detailColumn: "規則說明",
        groups: {
          autoSource: "源系統更新停滯時的自動告警規則",
          dataQuality: "數據質量致命錯誤退回的告警規則",
          systemCapacity: "系統資源使用率達到閾值時的告警規則"
        },
        rules: {
          auto_source_stopped: {
            title: "自動數據源監控：源系統更新停滯",
            desc: "當每日定時任務檢測到某數據源未按約定時間更新時，向該數據源責任人及其上級發送提醒郵件，可在此配置額外抄送郵箱。"
          },
          data_quality_fatal: {
            title: "數據質量檢測：致命錯誤退回",
            desc: "當數據處理流水線發現系統無法自動糾正的致命錯誤並退回時，向數據上傳用戶及數據質量責任人發送郵件，可在此配置額外抄送郵箱。"
          },
          system_capacity_threshold: {
            title: "系統性能 / 擴容：資源預警",
            desc: "當監控系統檢測到關鍵資源使用率達到預警閾值時，向 Jebsen 側負責人及相關技術負責人發送郵件，可在此配置閾值和額外抄送郵箱。"
          }
        }
      }
    },
    monitor: {
      title: "數據催收監控",
      refresh: "刷新列表",
      employeeName: "數據負責人",
      email: "郵箱",
      dataSource: "數據源",
      uploadStatus: "上傳狀態",
      deadline: "截止時間",
      overdueDays: "逾期天數",
      status: "員工狀態",
      action: "操作",
      nudge: "催一下",
      statusActive: "在職",
      statusResigned: "離職",
      uploadStatusPending: "待上傳",
      uploadStatusOverdue: "已逾期",
      uploadStatusCompleted: "已完成",
      nudgeDialog: {
        title: "發送數據催收通知",
        resignedAlert: {
          title: "數據負責人已離職",
          desc: "該數據負責人已離職。請明確指定新的收件人郵箱，用於臨時頂替數據上傳。"
        },
        recipientEmail: "收件人郵箱",
        recipientEmailPlaceholder: "請輸入收件人郵箱",
        message: "消息內容",
        messagePlaceholder: "例如：請盡快上傳T+1數據，截止時間為今天18:00",
        cancel: "取消",
        send: "發送通知",
        emailRequired: "請輸入收件人郵箱",
        emailFormat: "請輸入有效的郵箱地址",
        sendSuccess: "數據催收通知已發送至 {email}"
      }
    },
    rules: {
      title: "郵件通知與催收規則總覽",
      subtitle: "統一查看各類監控維度下的郵件觸發時機、接收對象與來源依據",
      enabled: "已啟用",
      disabled: "未啟用",
      viewConfig: "查看配置",
      stats: {
        totalRules: "規則總數",
        manualUploadRules: "手動上傳時效規則",
        autoSourceRules: "自動數據源監控規則",
        dataQualityRules: "數據質量檢測規則",
        systemCapacityRules: "系統性能與擴容規則"
      },
      columns: {
        monitorType: "監控維度",
        scenario: "觸發場景",
        platform: "所屬平台 / 系統",
        stage: "階段",
        triggerTiming: "出現時機 (Trigger Timing)",
        recipients: "接收對象",
        sourceBasis: "來源依據",
        enabled: "是否啟用"
      },
      filters: {
        monitorTypePlaceholder: "請選擇監控維度"
      },
      monitorType: {
        manualUpload: "數據上傳時效（Manual）",
        autoSource: "自動數據源監控",
        dataQuality: "數據質量檢測",
        systemCapacity: "系統性能 / 擴容"
      },
      scenario: {
        manualUploadDelay: "數據上傳超時 / 未按時上傳",
        autoSourceStopped: "自動數據源未按預期更新",
        dataQualityFatal: "致命錯誤退回，系統無法自動糾正",
        systemCapacity: "系統資源使用率超過預設閾值"
      },
      platform: {
        autoPipeline: "自動數據管道",
        dataQualityWorkbench: "數據質量工作台",
        c360Infrastructure: "C360 基礎設施 / 應用集群"
      },
      trigger: {
        manualUpload: "在階段 {stage}，計劃時間 {time} 前仍未完成上傳時觸發",
        autoSourceStopped: "每日定時任務檢測到某數據源在約定時間前仍未更新時觸發",
        dataQualityFatal: "當數據質量校驗出現致命錯誤，系統無法自動糾正且需要業務確認時觸發",
        systemCapacity: "當監控系統檢測到關鍵資源使用率達到或超過 50% 閾值時觸發"
      },
      recipients: {
        toBeConfigured: "待配置收件人",
        autoSource: "相關責任人及其上級（按數據源負責人配置）",
        dataQuality: "數據上傳用戶及數據質量責任人",
        systemCapacity: "Jebsen 側負責人與相關技術負責人"
      },
      sourceBasis: {
        manualUpload: "《數據上傳時效要求》—— 手動上傳類報表 T+0/T+1/T+2 催收規則",
        autoSource: "《自動數據源監控策略》—— 源系統更新停滯處理規則",
        dataQuality: "《數據質量管理規範》—— 致命錯誤退回處理流程",
        systemCapacity: "《系統容量與擴容規劃》—— 資源閾值 50% 告警規則"
      }
    }
  }
};

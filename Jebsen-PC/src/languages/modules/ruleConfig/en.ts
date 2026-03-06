export default {
  ruleConfig: {
    columns: {
      name: "Distribution Name",
      description: "Description",
      triggerType: "Trigger Type",
      leadType: "Lead Type",
      priority: "Priority",
      pushTarget: "Push Target",
      enabled: "Status",
      creator: "Creator",
      createdAt: "Created At",
      operation: "Action"
    },
    buttons: {
      add: "Add Distribution Config",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Confirm",
      submit: "Submit",
      iKnow: "Got it",
      confirmSubmit: "Confirm Submit",
      configureSchedule: "Configure Schedule",
      openCronGenerator: "Open Cron Generator"
    },
    placeholders: {
      name: "Please enter distribution name",
      description: "Please enter distribution description",
      selectTrigger: "Select trigger type",
      selectLeadType: "Select lead type",
      selectPriority: "Select priority",
      selectTarget: "Select push target",
      selectStatus: "Select status",
      selectSegment: "Select segment",
      selectEventType: "Select event type",
      enterSchedule: "Enter Cron expression, e.g., 0 9 * * * (9 AM daily)",
      leadTitle: "Auto-filled, e.g., Maintenance Recall Lead",
      selectAssign: "Select default assignment",
      scheduleExpression: "Please configure schedule expression"
    },
    enums: {
      trigger: {
        segment: "Segment Trigger",
        event: "Event Trigger",
        schedule: "Schedule Trigger"
      },
      priority: {
        high: "High",
        medium: "Medium",
        low: "Low"
      },
      leadType: {
        aftersales_cs: "After-sales Satisfaction Follow-up",
        newcar_cs: "New Car Satisfaction Follow-up",
        bdc_campaign: "BDC Campaign",
        bdc_aftersales_recall: "BDC After-sales Opportunity Recruitment",
        bdc_renewal: "BDC Renewal Opportunity",
        cm_custom: "CM Custom",
        pcn_aftersales_campaign: "PCN After-sales Campaign",
        ttr_survey: "TTR Research"
      },
      pushTarget: {
        BDC外呼系统: "BDC System",
        wechat: "WeCom",
        crm: "CRM System"
      },
      status: {
        enable: "Enabled",
        disable: "Disabled"
      },
      assign: {
        byStore: "Assign by Store",
        byAdvisor: "Assign by Advisor",
        publicPool: "Public Pool",
        manual: "Manual Assignment"
      }
    },
    form: {
      selectSegment: "Select Segment",
      overlayTags: "Overlay Tags",
      eventType: "Event Type",
      schedule: "Schedule",
      action: "Action",
      leadTitle: "Lead Title",
      defaultAssign: "Default Assignment",
      deduplicationStrategy: "Deduplication",
      enableDeduplication: "Enable Dedup",
      deduplicationWindow: "Dedup Window",
      days: "Days",
      name: "Distribution Name",
      description: "Description",
      triggerType: "Trigger Type",
      leadType: "Lead Type",
      priority: "Priority",
      pushTarget: "Push Target",
      enabled: "Status",
      validity: "Validity",
      validityDays: "Validity (days)"
    },
    tips: {
      overlayTags:
        "Multiple tags can be selected for overlay filtering. Leads are generated only for customers matching all tags.",
      leadTitle: "Lead title generated. If kept empty, Lead Type will be used.",
      deduplication:
        "If enabled, no new lead will be generated if a lead of the same type exists for this OneID within the specified days.",
      deduplicationWindow: "No new lead generated if same type exists within days.",
      schedule: "Configure scheduled task execution time, e.g., every Monday, 9 AM daily, etc. Supports Cron expression format.",
      validityDays: "Validity is capped at 30 days"
    },
    messages: {
      deleteConfirm: "Are you sure you want to delete this distribution?",
      deleteSuccess: "Delete Successful",
      operationFailed: "Operation Failed",
      submitSuccess: "Submit Successful",
      submittedToApproval: "Submitted to Approval",
      approvalMessage:
        "Request submitted to <b>Approval Center</b>.<br>Once approved, distribution expected to take effect in 5-10 minutes.",
      confirmTitle: "Notice",
      confirmDisable: "Are you sure you want to disable this distribution?",
      confirmEnable: "Are you sure you want to enable this distribution?",
      auditNotice: "<br>This action will be submitted to the <b>Audit Center</b> and take effect in 5-10 minutes."
    }
  }
};

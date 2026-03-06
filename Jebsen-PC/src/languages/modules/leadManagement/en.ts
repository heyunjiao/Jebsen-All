export default {
  leadManagement: {
    overview: {
      title: "Data Overview",
      refresh: "Refresh",
      dateRange: "Date Range",
      startDate: "Start Date",
      endDate: "End Date",
      to: "to",
      leadType: "Lead Type",
      selectLeadType: "Please select lead type",
      status: "Status",
      selectStatus: "Please select status",
      pushTarget: "Push Target",
      selectPushTarget: "Please select push target",
      filterNote:
        "Note: The following data is filtered only by date range and is not affected by lead type, status, push target, etc.",
      todayTotal: "Today Total",
      todayPushed: "Today Pushed",
      pendingCount: "Pending Count",
      processingCount: "Processing Count",
      completedCount: "Completed Count",
      successRate: "Push Success Rate",
      typeDistribution: "Lead Type Distribution",
      statusDistribution: "Lead Status Distribution",
      typeTrend: "Lead Type Trend",
      statusTrend: "Lead Status Trend",
      noData: "No Data",
      loadFailed: "Failed to load statistics"
    },
    columns: {
      oneId: "OneID",
      customerName: "Customer Name",
      leadType: "Lead Type",
      ruleName: "Trigger Rule",
      priority: "Priority",
      status: "Status",
      pushTarget: "Push Target",
      pushStatus: "Push Status",
      assignedAdvisor: "Assigned SA/SC",
      createdAt: "Created At",
      operation: "Action"
    },
    buttons: {
      batchPush: "Batch Push",
      reloadLeads: "Reload Leads",
      retryFailed: "Retry Failed",
      view: "Details",
      push: "Push",
      reload: "Reload",
      confirm: "Confirm",
      cancel: "Cancel"
    },
    placeholders: {
      oneId: "Please enter OneID",
      status: "Please select status",
      pushTarget: "Please select push target"
    },
    messages: {
      selectPush: "Please select leads to push",
      selectReload: "Please select leads to reload",
      noFailed: "No failed leads found",
      retryConfirm: "Found {count} failed leads. Batch retry?",
      retryTitle: "Retry Failed",
      reloadConfirmBatch: "Are you sure you want to reload selected leads?",
      reloadConfirmSingle: "Are you sure you want to reload this lead?",
      reloadSuccess: "Reload successful",
      reloadFailed: "Reload failed",
      operationFailed: "Operation failed",
      detailTitle: "Lead Details",
      payloadTitle: "Data Payload",
      pushSuccess: "Push successful"
    },
    enums: {
      status: {
        pending: "Pending",
        pushed: "Pushed",
        processing: "Processing",
        completed: "Completed",
        rejected: "Rejected",
        failed: "Failed"
      },
      pushStatus: {
        pending: "Pending",
        success: "Success",
        failed: "Failed"
      },
      leadType: {
        aftersales_cs: "After-sales Satisfaction Follow-up",
        newcar_cs: "New Car Satisfaction Follow-up",
        bdc_campaign: "BDC Campaign",
        bdc_aftersales_recall: "BDC After-sales Opportunity Recruitment",
        bdc_renewal: "BDC Renewal Opportunity",
        cm_custom: "CM Custom",
        pcn_aftersales_campaign: "PCN After-sales Campaign",
        ttr_survey: "TTR Research",
        new_to_renew: "New to Renew",
        renew_to_renew: "Renew to Renew",
        in_repair_no_insurance: "In Repair No Insurance",
        dormant: "Dormant",
        pending_activation: "Pending Activation",
        active: "Active"
      }
    },
    tracking: {
      totalGenerated: "Total Generated",
      totalPushed: "Pushed Leads",
      convertedCount: "Converted Count",
      orderCount: "Order Count",
      totalOrderAmount: "Total Order Amount",
      conversionRate: "Conversion Rate",
      avgOrderAmount: "Avg Order Amount",
      pushTime: "Push Time",
      converted: "Converted",
      notConverted: "Lost",
      lostReason: "Lost Reason",
      convertedTime: "Converted Time",
      firstOrderTime: "First Order Time",
      lastOrderTime: "Last Order Time",
      advisorName: "Advisor Name",
      filterByType: "Filter by Type",
      filterByTarget: "Filter by Target",
      filterByConverted: "Filter by Status",
      all: "All",
      allTab: "All",
      detailTitle: "Tracking Details",
      typeDistribution: "Type Statistics",
      trendChart: "Trend Analysis"
    },
    stats: {
      leadTotal: "Total Leads",
      pendingCount: "Pending Count",
      processingCount: "Processing Count",
      completedCount: "Completed Count",
      pushSuccessRate: "Push Success Rate"
    }
  }
};

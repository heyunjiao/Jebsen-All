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
      pushDate: "Push Date",
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
        pushed: "Pushed",
        completed: "Converted",
        followed: "Followed",
        pending: "Followed",
        processing: "Followed",
        rejected: "Followed",
        failed: "Followed"
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
        cm_custom: "General Opportunity",
        pcn_aftersales_campaign: "PCN Recall Campaign",
        ttr_survey: "TTR Research",
        new_to_renew: "New to Renew",
        renew_to_renew: "Renew to Renew",
        in_repair_no_insurance: "In Repair No Insurance",
        psp_expiry: "PSP Expiry",
        maintenance_churn: "Maintenance Churn Risk",
        no_visit_365d: "Vehicle not visited for 365 days",
        regular_maintenance_365d: "Regular Maintenance Customer No Service for 365 Days",
        periodic_maintenance: "Periodic Maintenance",
        first_insurance_2y: "First Insurance 2Y",
        first_maintenance: "First Maintenance",
        newcar_365d_no_maintenance: "New Car No Service for 365 Days",
        newcar_warranty_expiry: "New Car Warranty Expiry",
        extended_warranty_expiry: "Extended Warranty Expiry",
        newcar_delivery_90d_revisit: "90-day New Car Delivery Follow-up"
      }
    },
    leadTypeSource: {
      templateUpload: "Template upload",
      c360Auto: "C360 auto-generated"
    },
    tracking: {
      totalGenerated: "Total Generated",
      totalPushed: "Pushed Leads",
      convertedCount: "Converted Persons",
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
      pushedCount: "Pushed",
      completedCount: "Converted",
      followedCount: "Followed",
      pushSuccessRate: "Push Success Rate"
    }
  }
};

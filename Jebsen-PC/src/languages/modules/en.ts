export default {
  home: {
    welcome: "Welcome"
  },
  tabs: {
    refresh: "Refresh",
    maximize: "Maximize",
    closeCurrent: "Close current",
    closeLeft: "Close Left",
    closeRight: "Close Right",
    closeOther: "Close other",
    closeAll: "Close All"
  },
  header: {
    componentSize: "Component size",
    language: "Language",
    theme: "theme",
    layoutConfig: "Layout config",
    primary: "primary",
    darkMode: "Dark Mode",
    greyMode: "Grey mode",
    weakMode: "Weak mode",
    fullScreen: "Full Screen",
    exitFullScreen: "Exit Full Screen",
    personalData: "Personal Data",
    changePassword: "Change Password",
    logout: "Logout"
  },
  customer: {
    customerList: "Customer List",
    userId: "User ID",
    name: "Name",
    gender: {
      label: "Gender",
      male: "Male",
      female: "Female",
      other: "Other"
    },
    ageGroup: "Age Group",
    familyStatus: "Family Status",
    address: "Address",
    phone: "Phone",
    contactPreference: "Contact Preference",
    lastVisitTime: "Last Visit Time",
    visitCount90Days: "Visits in 90 Days",
    annualOrderFrequency: "Annual Order Frequency",
    avgConsumption: "Average Consumption",
    projectPreference: "Project Preference",
    hasComplaintLastYear: "Has Complaint Last Year",
    annualConsumption: "Annual Consumption",
    loyaltyLevel: "Loyalty Level",
    opportunityLevel: "Opportunity Level",
    vinInfo: "VIN Info",
    licensePlate: "License Plate",
    carSeriesModel: "Car Series + Model",
    currentMileage: "Current Mileage",
    serviceHabit: "Service Habit",
    addCustomer: "Add Customer",
    stats: {
      total: "Total Data",
      newToday: "New Today",
      contactable: "Contactable Rate",
      verified: "Transaction Owners (Real Orders)",
      growth: "vs Yesterday",
      mergedCount: "Merged Count",
      updatedCount: "Updated Count",
      incremental: "Incremental Data"
    },
    placeholder: {
      userId: "Please enter User ID",
      name: "Please enter name",
      gender: "Please select gender",
      ageGroup: "Please enter age group",
      familyStatus: "Please enter family status",
      address: "Please enter address",
      phone: "Please enter phone",
      contactPreference: "Please enter contact preference",
      lastVisitTimeStart: "Start Time",
      lastVisitTimeEnd: "End Time",
      visitCount90Days: "Please enter visits in 90 days",
      annualOrderFrequency: "Please enter annual order frequency",
      avgConsumption: "Please enter average consumption",
      projectPreference: "Please enter project preference",
      hasComplaintLastYear: "Please select if has complaint",
      annualConsumption: "Please enter annual consumption",
      loyaltyLevel: "Please enter loyalty level",
      opportunityLevel: "Please enter opportunity level",
      vinInfo: "Please enter VIN info",
      licensePlate: "Please enter license plate",
      carSeriesModel: "Please enter car series model",
      currentMileage: "Please enter current mileage",
      serviceHabit: "Please enter service habit"
    }
  },
  common: {
    yes: "Yes",
    no: "No",
    operation: "Operation",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
    expand: "Expand",
    collapse: "Collapse",
    total: "Total",
    rows: "rows"
  },
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
      add: "Add Distribution",
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
        new_to_renew: "New to Renew",
        renew_to_renew: "Renew to Renew",
        in_repair_no_insurance: "In Repair No Insurance",
        dormant: "Dormant",
        pending_activation: "Pending Activation",
        active: "Active",
        diamond: "Diamond",
        gold: "Gold",
        silver: "Silver",
        bdc_campaign: "BDC Campaign",
        bdc_aftersales_churn_15m: "BDC Aftersales Churn - 15M",
        bdc_aftersales_recall: "BDC Aftersales Lead Recall",
        bdc_renewal: "BDC Renewal Lead",
        cm_custom: "General Opportunity",
        pcn_aftersales_campaign: "PCN Recall Campaign",
        ttr_survey: "TTR Survey",
        segment_template_validation: "Segment Template Validation",
        aftersales_cs: "Aftersales CSAT Callback",
        newcar_cs: "New Car CSAT Callback"
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
      confirmTitle: "Notice",
      confirmDisable: "Are you sure you want to disable this distribution?",
      confirmEnable: "Are you sure you want to enable this distribution?"
    }
  },

  pagination: {
    total: "Total {total} items"
  },
  welcome: {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    startTour: "Start Onboarding Tour",
    adminView: "Admin View",
    businessView: "Business View",
    adminMessage: "System 360° overview: All data pipelines are synchronized. 3 governance tasks pending.",
    businessMessage: "Your daily sales brief: 12 new high-value opportunities detected since your last login.",
    systemStatus: "Today's Data Collection Status",
    allSystemsOperational: "All Systems Operational",
    customerLibraryStats: "Customer Library Statistics",
    governanceTasks: "My Tasks",
    viewAll: "View All",
    recentSensitiveOperations: "Recent Operations",
    totalClients: "Total Clients",
    highIntent: "High Intent",
    conversionRate: "Conversion Rate",
    revenueEst: "Revenue Est.",
    opportunityPipeline: "Opportunity Pipeline",
    pushToBDC: "Push to BDC",
    myTasks: "My Tasks",
    systemSource: "System Sources",
    governance: "Governance",
    audit: "Audit",
    metrics: "Metrics",
    opportunities: "Opportunities",
    viewSwitched: "View Switched",
    nowViewingAsAdmin: "Now viewing as Administrator",
    nowViewingAsUser: "Now viewing as Business User",
    pushingToBDC: "Pushing {name} to BDC...",
    tour: {
      systemHealth: "System Health",
      systemHealthDesc: "Monitor the real-time status of all 7 connected data sources.",
      governance: "Data Governance",
      governanceDesc: "Handle merge conflicts and data quality alerts here.",
      audit: "Security Audit",
      auditDesc: "Track all sensitive data access and exports for compliance.",
      keyMetrics: "Key Metrics",
      keyMetricsDesc: "At-a-glance view of your most important business KPIs today.",
      smartOpp: "Smart Opportunities",
      smartOppDesc: "AI-detected business chances. Click 'Push' to sync to BDC."
    },
    data: {
      status: {
        online: "Online",
        synced: "Synced",
        delay: "Last synced 2h ago",
        active: "Active",
        uploaded: "Uploaded",
        pendingUpload: "Pending Upload",
        time: "Time"
      },
      desc: {
        dms: "Daily Export CSV",
        poas: "Parts Order",
        wws: "Claim Form",
        cap: "New Car Lead",
        BDC外呼系统: "Lead & Interaction",
        voucher: "Member Coupon"
      },
      governance: {
        mergeConflict: "Merge Conflict: User ID #88392",
        dataQuality: "Data Quality: Phone format error",
        missingField: "Missing Field: Source tagging"
      },
      audit: {
        exported: "Exported 500 records (Admin)",
        backup: "System Backup Completed",
        policyUpdate: "Policy Updated by SuperAdmin"
      },
      opportunity: {
        renewal: "New Renewal Opportunities",
        renewalDesc: "15 clients approaching lease end",
        birthday: "Birthday Greetings",
        birthdayDesc: "8 clients have birthdays today",
        serviceDue: "Service Due",
        serviceDueDesc: "24 clients due for maintenance",
        lostLead: "Lost Lead Reactivation",
        lostLeadDesc: "5 inactive leads showed interest"
      },
      task: {
        followUp: "Follow up with Client #{id}"
      },
      manual: "Manual System",
      upload: "Upload",
      columns: {
        task: "Task",
        priority: "Priority",
        time: "Time"
      },
      action: {
        fix: "Fix"
      }
    },
    quickNavigation: "Quick Navigation",
    systemSummary: {
      normal: "All Data Collection Normal",
      abnormal: "Collection Abnormalities Exist",
      incomplete: "{count} System(s) Pending"
    },
    impact: {
      title: "Data Governance Impact",
      cleanedData: "Cleaned Data Volume",
      tagCoverage: "Tag Coverage Boost"
    }
  },
  dashboard: {
    dataMonitor: {
      title: "Source Data Collection Dashboard",
      subtitle: "Data Governance Monitor",
      pipelineStatus: "T+1 Status",
      slaDeadline: "SLA Deadline",
      slaEstimate: "Est. Completion",
      refresh: "Refresh",
      refreshSuccess: "Refresh Success",
      pipelineTitle: "Batch Pipeline Result",
      pipelineResultDesc: "T+1 previous night result",
      pipelineStart: "Start Time",
      processing: "Processing",
      remaining: "Est. Remaining",
      qualityTitle: "Ingestion & Quality",
      cleanRate: "Clean Rate",
      intercepted: "Intercepted",
      identityTitle: "OneID Governance",
      conflictPending: "Pending Conflicts",
      newCustomers: "New Customers",
      manualMerges: "Manual Merges",
      governanceRecords: "Recent Governance Records",
      businessTitle: "Business Value",
      apiStatus: "API Status",
      apiLogs: "Downstream Push Logs",
      storageWarning: "Storage Usage Warning",
      export: "Export",
      exportData: "Export Data",
      exportSuccess: "Export Success",
      timeRange: "Time Range",
      today: "Today",
      yesterday: "Yesterday",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      custom: "Custom",
      viewDetails: "View Details",
      viewConflicts: "View Conflicts",
      totalRecords: "Total Records",
      successRate: "Success Rate",
      errorRate: "Error Rate",
      avgProcessingTime: "Avg Processing Time",
      dataVolume: "Data Volume",
      systemHealth: "System Health",
      allSystemsNormal: "All Systems Normal",
      systemAlert: "System Alert",
      noData: "No Data",
      loading: "Loading...",
      lastUpdate: "Last Update",
      autoRefresh: "Auto Refresh",
      pauseAutoRefresh: "Pause Auto Refresh",
      resumeAutoRefresh: "Resume Auto Refresh",
      dataSource: "Data Source",
      targetSystem: "Target System",
      operationType: "Operation Type",
      status: "Status",
      time: "Time",
      viewMore: "View More",
      collapse: "Collapse",
      filter: "Filter",
      reset: "Reset",
      search: "Search",
      selectAll: "Select All",
      clearAll: "Clear All",
      confirm: "Confirm",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      add: "Add",
      submit: "Submit",
      back: "Back",
      next: "Next",
      previous: "Previous",
      finish: "Finish",
      close: "Close",
      open: "Open",
      expand: "Expand",

      refreshData: "Refresh Data",
      downloadReport: "Download Report",
      viewReport: "View Report",
      settings: "Settings",
      help: "Help",
      about: "About",
      logout: "Logout",
      profile: "Profile",
      changePassword: "Change Password",
      notifications: "Notifications",
      messages: "Messages",
      tasks: "Tasks",
      calendar: "Calendar",
      contacts: "Contacts",
      files: "Files",
      searchPlaceholder: "Search...",
      filterPlaceholder: "Filter...",
      selectPlaceholder: "Please select...",
      inputPlaceholder: "Please enter...",
      noResults: "No Results",
      loadingData: "Loading data...",
      loadFailed: "Load Failed",
      retry: "Retry",
      error: "Error",
      warning: "Warning",
      info: "Info",
      success: "Success",
      failed: "Failed",
      pending: "Pending",

      completed: "Completed",
      cancelled: "Cancelled",
      unknown: "Unknown",
      steps: {
        ingestion: "Ingestion",
        cleaning: "Cleaning",
        identify: "Identify",
        tagging: "Tagging",
        dispatch: "Dispatch"
      },
      qualityDescription: "Data quality monitoring",
      conflictDescription: "Identity conflicts pending resolution",
      pipelineDescription: "Current pipeline step",
      slaDescription: "SLA compliance tracking",
      leadTypes: "Lead Types",
      to: "to",
      startDate: "Start Date",
      endDate: "End Date"
    }
  },
  login: {
    slogan: "Driving Data · Future Mobility",
    subtitle:
      "Customer 360 CDP provides secure, real-time, and intelligent identity authentication services. Connecting global business, empowering digital transformation.",
    feature1: "Enterprise Security",
    feature2: "Real-time Sync",
    feature3: "Global Compliance",
    title: "Account Login",
    help: "Help",
    privacy: "Privacy Policy",
    support: "Contact Support",
    tabs: {
      sso: "Enterprise SSO",
      local: "Admin Login"
    },
    sso: {
      title: "Sign in with your enterprise identity",
      subtitle: "Secure · Convenient · Unified Identity",
      button: "Sign in with Enterprise ID (SSO)",
      loading: "Redirecting...",
      info: "Account will be created automatically on first login"
    },
    form: {
      usernamePlaceholder: "Admin Username",
      passwordPlaceholder: "Admin Password",
      agreement: {
        prefix: "I have read and agree to ",
        terms: "Privacy Policy",
        and: " and ",
        policy: "Data Use Policy"
      },
      validation: {
        username: "Please enter username",
        password: "Please enter password",
        agreement: "Please agree to the Privacy Policy and Terms first"
      }
    },
    buttons: {
      reset: "Reset",
      login: "Login"
    },
    messages: {
      success: "Welcome to Jebsen",
      failed: "SSO Login Failed",
      limited: "Access Restricted",
      limitedDesc: "Access blocked by security system. Contact IT support.",
      ssoNeedConfig: "SSO requires OAuth 2.0 configuration",
      regionSwitched: "Switched to {region} region protocols"
    },
    region: {
      cn: "Mainland China",
      hk: "Hong Kong SAR",
      mo: "Macau SAR"
    },
    status: {
      operational: "System Operational"
    }
  },
  errorCorrection: {
    pendingConflicts: "Pending Conflicts",
    autoMerge: "Auto Merge",
    autoMergeSuccessRate: "Auto Merge Success Rate",
    simulateWeCom: "Simulate WeCom Sales View",
    duplicateProfileQueue: "Duplicate Profile Queue",
    exitDemo: "Exit Demo",
    weComSidebar: "WeCom Sidebar (Sales View)",
    customerProfile: "Customer Profile",
    fullView: "360 View",
    interactionTimeline: "Interaction Timeline",
    opportunities: "Opportunities",
    totalConsumption: "Total Consumption",
    visitFrequency: "Visit Frequency",
    myVehicles: "My Vehicles",
    certifiedOwner: "Transaction Owner (Real Orders)",
    currentMileage: "Current Mileage",
    outOfWarranty: "Out of Warranty",
    servicePreference: "Service Preference",
    afternoonContact: "Afternoon Contact",
    wechatContact: "WeChat Contact",
    needShuttle: "Need Shuttle",
    storeRepair: "Store Repair",
    changeTire: "Change Tire",
    wechatCommunication: "WeChat Communication",
    inquireMaintenance: "Inquire Maintenance Package",
    regularMaintenance: "Regular Maintenance",
    highIntent: "High Intent",
    airConditioningCleaning: "Air Conditioning Cleaning",
    justNow: "Just Now",
    tabs: {
      pending: "Pending",
      processed: "Processed"
    },
    // Stats Panel
    stats: {
      pendingConflicts: "Pending Conflicts",
      dataQualityIssues: "Data Quality Issues",
      syncFailures: "Sync Failures"
    },
    // Filter Bar
    filter: {
      errorType: "Error Type",
      severity: "Severity",
      sourceSystem: "Source System",
      status: "Status"
    },
    // Error Types
    errorType: {
      all: "All",
      identityConflict: "Identity Conflict",
      dataQuality: "Data Quality",
      syncFailure: "Sync Failure",
      h5Feedback: "H5 Feedback"
    },
    // Severity Levels
    severity: {
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    // Status
    status: {
      pending: "Pending",
      processed: "Processed"
    },
    // Batch Operations
    batchIgnore: "Batch Ignore",
    batchIgnoreConfirm: "Confirm to ignore {count} selected exception(s)?",
    messages: {
      ignoreConfirmTitle: "Confirm Ignore",
      ignoreConfirm: "Confirm to ignore task {taskNo}?",
      ignoreCompleted: "Ignored",
      batchIgnoreCompleted: "{count} exception(s) ignored",
      submitForApproval: "Submitted for approval"
    },
    // Quick Edit Dialog
    quickEdit: {
      title: "Data Correction",
      viewTitle: "Exception Processing Details",
      alertTitle: "Format Validation Failed",
      alertDesc: "Field [{field}] does not meet the specification. Please correct and resubmit.",
      originalData: "Original Data",
      errorFields: "Error Fields",
      correction: "Correction",
      enterCorrectValue: "Please enter the correct value",
      currentValue: "Current Value",
      markAsInvalid: "Mark as Invalid Data (will be added to ignore list)",
      saveAndReprocess: "Submit for Approval",
      pleaseEnterCorrection: "Please enter correction or mark as invalid",
      saveSuccess: "Correction submitted for approval",
      processInfo: "Processing Information",
      processTime: "Process Time",
      createTime: "Create Time",
      processResult: "Processing Result",
      trustedSource: "Trusted Source",
      trustedSystem: "Trusted System",
      suggestedFix: "Suggested Fix"
    },
    // Sync Retry Dialog
    syncRetry: {
      title: "Sync Failure Retry",
      errorInfo: "Error Info",
      targetSystem: "Target System",
      system: "System",
      endpoint: "Endpoint",
      requestPayload: "Request Payload",
      retryResult: "Retry Result",
      retryNow: "Retry Now",
      retrying: "Retrying...",
      retrySuccess: "Retry Successful",
      retryFailed: "Retry Failed",
      successMessage: "Data successfully pushed to {system}",
      failedMessage: "Retry failed, please try again later or contact support"
    },
    // Table Actions
    handle: "Handle",
    retry: "Retry",
    view: "View",
    ignore: "Ignore",
    // SLA
    sla: {
      expired: "Expired"
    },
    // Table column labels
    table: {
      taskNo: "Task No",
      oneId: "OneID",
      customerName: "Customer Name",
      errorType: "Error Type",
      status: "Status",
      severity: "Severity",
      slaCountdown: "SLA Countdown",
      mainIssue: "Main Issue",
      sourceSystem: "Source System",
      handler: "Handler",
      operation: "Operation"
    },
    // Mobile demo related
    mobile: {
      goldMember: "Gold Member",
      churnWarning: "Churn Warning",
      repairAtStore: "Store Repair",
      changeTire: "Change Tire",
      wechatChat: "WeChat Chat",
      askMaintenance: "Ask Maintenance Package",
      routineMaintenance: "Routine Maintenance",
      pushCoupon: "Push Coupon",
      insuranceReminder: "Car insurance expires in 30 days.",
      expireSoon: "Car insurance expires in 30 days.",
      followQuote: "Follow Up Quote",
      phone: "Phone",
      wechat: "WeChat",
      createTicket: "Create Ticket",
      addTag: "Add Tag",
      shareCard: "Share Card",
      feedback: "Complaint/Feedback",
      cancel: "Cancel",
      newTicket: "New Service Ticket",
      ticketType: "Ticket Type",
      repair: "Repair",
      remark: "Remark",
      submit: "Submit",
      ticketCreated: "Ticket Created",
      systemDetectSummer: "System detected summer approaching and customer hasn't had AC cleaning in nearly a year.",
      daysAgo: "{count} days ago",
      consumption: "Consumption",
      satisfaction: "Satisfaction",
      duration: "Duration",
      durationSeconds: "{seconds}s",
      durationMinutesSeconds: "{minutes}m {seconds}s",
      times: "times",
      // Data conflict related
      dataConflict: "Data Conflict",
      conflictField: "Conflict Field",
      conflictSource: "Data Source",
      conflictInfo: "Conflict Information",
      conflictDetail: "Conflict Details",
      sourceSystem: "Source System",
      conflictValue: "Conflict Value",
      currentValue: "Current Value",
      recommendedValue: "Recommended Value",
      resolveConflict: "Resolve Conflict",
      selectTrustedSource: "Select Trusted Source",
      conflictResolved: "Conflict Resolved",
      // Phone number related
      phoneNumber: "Phone Number",
      phoneConflict: "Phone Number Conflict",
      phoneConflictDesc: "Detected inconsistent phone numbers from multiple sources",
      editPhone: "Edit Phone Number",
      addPhone: "Add Phone Number",
      phoneList: "Phone Number List",
      phoneSource: "Source",
      phoneStatus: "Status",
      phoneVerified: "Verified",
      phoneUnverified: "Unverified",
      phoneInvalid: "Invalid",
      phonePrimary: "Primary",
      setAsPrimary: "Set as Primary",
      deletePhone: "Delete",
      phoneFormatError: "Invalid phone number format",
      phoneRequired: "Please enter phone number",
      phoneDuplicate: "Phone number already exists",
      phoneValidation: "Please enter a valid 11-digit phone number",
      phoneAddSuccess: "Phone number added successfully",
      phoneUpdateSuccess: "Phone number updated successfully",
      phoneDeleteSuccess: "Phone number deleted successfully",
      phoneSetPrimarySuccess: "Set as primary number",
      confirmDeletePhone: "Confirm delete this phone number?",
      // Tag management related
      tagManagement: "Tag Management",
      myTags: "My Tags",
      addCustomTag: "Add Custom Tag",
      tagName: "Tag Name",
      tagNamePlaceholder: "Please enter tag name",
      tagColor: "Tag Color",
      tagCategory: "Tag Category",
      tagDescription: "Tag Description",
      tagDescriptionPlaceholder: "Please enter tag description (optional)",
      saveTag: "Save Tag",
      editTag: "Edit Tag",
      deleteTag: "Delete Tag",
      confirmDeleteTag: "Confirm delete this tag?",
      tagAddSuccess: "Tag added successfully",
      tagUpdateSuccess: "Tag updated successfully",
      tagDeleteSuccess: "Tag deleted successfully",
      tagNameRequired: "Please enter tag name",
      tagNameMaxLength: "Tag name cannot exceed 20 characters",
      // Common
      edit: "Edit",
      save: "Save",
      delete: "Delete",

      confirm: "Confirm",
      close: "Close",
      viewDetail: "View Details",
      noConflicts: "No Data Conflicts",
      conflictReadonlyTip: "Note: Except phone numbers, other data conflicts are view-only and cannot be resolved here",
      viewOnly: "View Only"
    },
    // Merge Workbench Dialog
    mergeWorkbench: {
      title: "Conflict Resolution Workbench",
      taskNo: "Task No",
      conflictAlert: "Conflict Alert: System detected inconsistency in [{field}]. Please confirm the final value to keep.",
      // Tabs
      tabs: {
        comparison: "Core Comparison Matrix",
        lineage: "Identity Lineage Trace",
        evidence: "Interaction Evidence Chain",
        reference: "Customer Reference Info"
      },
      // Form
      correctionReason: "Correction Reason",
      correctionReasonPlaceholder: "Please enter correction reason, explain why you chose these values...",
      rejectReason: "Rejection Reason (if rejecting)",
      rejectReasonPlaceholder: "If rejecting, please enter rejection reason...",
      // Buttons
      saveDraft: "Save Draft",
      splitPerson: "Not Same Person, Split",
      submitReview: "Submit for Review",
      close: "Close",
      reject: "Reject",
      confirmMerge: "Confirm Merge",
      // Status
      status: {
        pending: "Pending",
        draft: "Draft",
        review: "Under Review",
        resolved: "Resolved",
        rejected: "Rejected",
        unknown: "Unknown"
      },
      // Messages
      messages: {
        draftSaved: "Draft saved",
        saveFailed: "Save failed",
        pleaseEnterReason: "Please enter correction reason",
        submitting: "Submitting for review...",
        submitSuccess: "Task submitted for review.",
        submitSuccessWithSync:
          "Task submitted for review. After merge, {count} phone number(s) will sync to BDC system (T+1 effective)",
        submitSuccessWaitApproval: "Task submitted for review, waiting for manager approval",
        submitFailed: "Submit failed",
        mergeConfirmWithSync:
          "After merge, golden record will be updated. {count} phone number(s) will sync to BDC system (T+1 effective). Continue?",
        mergeConfirm: "After merge, golden record will be updated. Continue?",
        mergeConfirmTitle: "Confirm Merge",
        merging: "Executing data merge and OneID recalculation...",
        mergeSuccess: "Merge Successful",
        mergeSuccessWithSync:
          "Profile {name} updated and distributed to all source systems. {count} phone number(s) will sync to BDC system on T+1.",
        mergeSuccessNoSync: "Profile {name} updated and distributed to all source systems",
        pleaseEnterRejectReason: "Please enter rejection reason",
        rejectConfirm: "Confirm reject this task?",
        rejectConfirmTitle: "Confirm Rejection",
        rejected: "Rejected, task returned to handler",
        splitPrompt: "Please confirm split reason (will be added to conflict detection whitelist to prevent false positives):",
        splitConfirmTitle: "Confirm Not Same Person",
        submitSplit: "Submit Split",
        splitSuccess: "Profile split completed."
      },
      // Source Systems
      sourceSystems: {
        wechat: "WeCom",
        website: "Website"
      }
    },
    // Customer Reference Panel
    customerReference: {
      categoryTags: "Category Tags",
      // Card titles
      customerInfo: "Customer Basic Info",
      vehicleInfo: "Vehicle Info",
      consumptionStats: "Consumption Statistics",
      loyaltyValue: "Loyalty & Value",
      servicePreference: "Service Preferences",
      remarks: "Remarks",
      // Customer info fields
      customerName: "Customer Name",
      phone: "Phone Number",
      gender: "Gender",
      ageGroup: "Age Group",
      familyStatus: "Family Status",
      address: "Address",
      tags: "Tags",
      // Vehicle info fields
      vin: "VIN",
      plate: "License Plate",
      brandModel: "Brand & Model",
      purchaseDate: "Purchase Date",
      currentMileage: "Current Mileage",
      warrantyStatus: "Warranty Status",
      inWarranty: "Under Warranty",
      outOfWarranty: "Out of Warranty",
      // Consumption stats fields
      totalSpend: "Total Spend",
      yearlySpend: "Yearly Spend",
      avgSpend: "Average Spend",
      orderCount: "Order Frequency",
      visit90d: "Visits (90 days)",
      lastVisit: "Last Visit",
      times: "times",
      none: "None",
      // Loyalty & value fields
      loyaltyLevel: "Loyalty Level",
      opportunityLevel: "Opportunity Level",
      customerLifecycle: "Customer Lifecycle",
      customerValue: "Customer Value",
      // Opportunity Info fields
      opportunityType: "Opportunity Type",
      opportunityPriority: "Priority",
      opportunityStatus: "Opportunity Status",
      ruleName: "Trigger Rule",
      pushTarget: "Push Target",
      pushStatus: "Push Status",
      priorityLow: "Low",
      priorityMedium: "Medium",
      priorityHigh: "High",
      statusPending: "Pending",
      statusPushed: "Pushed",
      statusProcessing: "Processing",
      statusCompleted: "Completed",
      pushTargetBdc: "BDC System",
      pushTargetWechat: "WeChat System",
      pushTargetCrm: "CRM System",
      pushStatusPending: "Pending",
      pushStatusSuccess: "Success",
      pushStatusFailed: "Failed",
      opportunityCount: "{count} Opportunities"
    },
    // Exception Taxonomy
    taxonomy: {
      title: "Exception Taxonomy",
      description:
        "During data cleaning, the following 5 major exception categories must be captured and distinguished by different colors/icons in the UI",
      example: "Example Scenario",
      actionsLabel: "Processing Strategy",
      // A. Validity Exceptions
      validity: {
        name: "Validity Exception",
        description: "Data format, value range, or enum values do not meet specifications",
        subTypes: {
          formatError: {
            name: "Format Error",
            description: "Data format does not meet specifications",
            example: "Phone number contains dashes, email missing @, ID card has wrong number of digits"
          },
          valueRangeError: {
            name: "Value Range Error",
            description: "Value exceeds reasonable range",
            example: "Car age 200 years, birthday is in the future, price is negative"
          },
          enumMismatch: {
            name: "Enum Mismatch",
            description: "Enum value does not match target system requirements",
            example: 'Gender from source system is "M/F", target system requires "0/1"'
          }
        }
      },
      // B. Uniqueness Exceptions
      uniqueness: {
        name: "Uniqueness Exception",
        description: "Data duplication or primary key conflicts",
        subTypes: {
          suspectedDuplicate: {
            name: "Suspected Duplicate",
            description: "Multiple records are highly similar but confidence is insufficient",
            example: "Name + phone number highly similar, OneID algorithm confidence is 80% (dare not auto-merge)"
          },
          primaryKeyConflict: {
            name: "Primary Key Conflict",
            description: "Same primary key exists in multiple different records",
            example: "Source system pushed two records with same ID but different content"
          }
        }
      },
      // C. Completeness Exceptions
      completeness: {
        name: "Completeness Exception",
        description: "Critical fields missing or data isolation",
        subTypes: {
          criticalMissing: {
            name: "Critical Missing",
            description: "Required fields or critical information missing",
            example: "Has customer name but no contact information (zombie data)"
          },
          orphanData: {
            name: "Orphan Data",
            description: "Data lacks necessary relationships",
            example: 'Has "order record" but cannot find corresponding "customer ID"'
          }
        }
      },
      // D. Consistency Exceptions
      consistency: {
        name: "Consistency Exception",
        description: "Data logic inconsistency or status conflicts",
        subTypes: {
          logicalConflict: {
            name: "Logical Conflict",
            description: "Logical contradiction between different fields",
            example: 'ID card shows female, but gender field is "male"'
          },
          statusConflict: {
            name: "Status Conflict",
            description: "Different systems have inconsistent status descriptions for the same entity",
            example: 'DMS says "delivered", CRM says "not closed"'
          }
        }
      },
      // E. Compliance Exceptions
      compliance: {
        name: "Compliance Exception",
        description: "Data does not meet compliance requirements or authorization is missing",
        subTypes: {
          authorizationMissing: {
            name: "Authorization Missing",
            description: "Missing necessary authorization or agreement confirmation",
            example: 'Data came in, but "privacy agreement" field is not checked'
          }
        }
      },
      // Actions
      actions: {
        clean: "Clean",
        edit: "Edit",
        correct: "Correct",
        empty: "Empty",
        map: "Map",
        merge: "Merge",
        override: "Override",
        discard: "Discard",
        supplement: "Supplement",
        archive: "Archive",
        associate: "Associate",
        trustChoice: "Trust Choice",
        trustSource: "Trust Source",
        freeze: "Freeze"
      }
    },
    // H5 Submitted Data Correction Feedback Resolution (FeedbackResolutionDrawer)
    feedbackResolution: {
      title: "Data Correction Feedback Resolution",
      taskNo: "Task No.",
      // SLA Countdown
      sla: {
        remaining: "Remaining {time}",
        expired: "Expired",
        hours: "{hours}h",
        hoursMinutes: "{hours}h {minutes}m"
      },
      // Left: Golden Record
      goldenRecord: {
        title: "Current System Record",
        name: "Name",
        phone: "Phone",
        jobTitle: "Job Title",
        company: "Company",
        tags: "Tags",
        lockTooltip: "Will be marked as manually corrected",
        locked: "Locked (Manually Corrected)"
      },
      // Right: Feedback & Verification
      feedback: {
        title: "Feedback & Verification",
        rawInput: {
          title: "Raw Feedback",
          submittedBy: "Submitted By",
          submittedAt: "Submitted At"
        },
        smartSuggestion: {
          title: "Smart Suggestion",
          extractedPhone: "Suspected Phone",
          extractedName: "Suspected Name",
          clickToFill: "Click to auto-fill"
        },
        verification: {
          title: "Verification Record",
          placeholder: "Please enter verification details (e.g., Verified with DMS, confirmed correct)"
        }
      },
      // Bottom Action Bar
      actions: {
        reject: "Reject",
        confirm: "Confirm Correction",
        cancel: "Cancel"
      },
      // Reject Dialog
      rejectDialog: {
        title: "Reject Feedback",
        reason: "Reject Reason",
        reasonPlaceholder: "Please enter reject reason (required)",
        reasonRequired: "Please enter reject reason",
        confirm: "Confirm Reject",
        cancel: "Cancel"
      },
      // Messages
      messages: {
        confirmTitle: "Confirm Correction",
        confirmMessage: "Confirm to submit correction? This will update the golden record in the system.",
        rejectSuccess: "Feedback rejected",
        confirmSuccess: "Correction submitted, awaiting review",
        pleaseEnterVerification: "Please enter verification record",
        fieldLocked: "Field locked, will be marked as manually corrected"
      }
    }
  },

  tagManage: {
    addTag: "Add Tag",
    edit: "Edit",
    delete: "Delete",
    viewDetail: "View Detail",
    tagName: "Tag Name",
    enterTagName: "Please enter tag name",
    category: "Tag Category",
    selectCategory: "Please select tag category",
    tagType: "Tag Type",
    autoRule: "Auto Rule",
    manual: "Manual",
    status: "Status",
    coverageCount: "Coverage Count",
    publish: "Publish",
    disable: "Disable",
    abandon: "Abandon",
    detail: "Detail",
    stats: {
      active: "Active",
      auto: "Auto Tags",
      manual: "Manual Tags",
      tagTotal: "Total Tags",
      tagCoverage: "Coverage",
      coveragePercent: "Coverage Rate"
    }
  },
  segmentManage: {
    createSegment: "Create Segment",
    edit: "Edit",
    preview: "Preview",
    pushOpportunity: "Push Opportunity",
    export: "Export",
    segmentName: "Segment Name",
    enterSegmentName: "Please enter segment name",
    category: "Category",
    selectCategory: "Please select category",
    description: "Description",
    enterDescription: "Please enter description",
    status: "Status",
    disable: "Disable",
    ruleConfig: "Distribution Configuration",
    coverageEstimate: "Coverage Estimate",
    estimatedCount: "Estimated Count",
    estimatedRate: "Estimated Rate",
    saveAndCalculate: "Calculate After Save",
    pushAfterCalculate: "Push Opportunity After Calculate",
    cancel: "Cancel",
    save: "Save",
    segmentPreview: "Segment Preview",
    memberCount: "Member Count",
    draft: "Draft",
    calculating: "Calculating",
    active: "Active",
    failed: "Failed",
    disabled: "Disabled",
    selectStatus: "Select Status",
    snapshotCount: "Snapshot Count",
    lastExportTime: "Last Export Time",
    creator: "Creator",
    createTime: "Create Time",
    oneId: "OneID",
    name: "Name",
    gender: "Gender",
    tags: "Tags",
    editSegment: "Edit Segment",
    confirmExport: "Confirm export segment '{name}' members?",
    exportTaskSubmitted: "Export task submitted",
    confirmPush: "Confirm push segment '{name}' as opportunity?",
    pushSubmitted: "Push submitted",
    enterRuleConfig: "Please configure distribution first",
    estimateComplete: "Estimate complete",
    saveSuccess: "Save success",
    selectSegmentFirst: "Please select segment first",
    enterSegmentNameRequired: "Segment name cannot be empty",
    ruleConfigRequired: "Please configure segment distribution",
    stats: {
      segmentTotal: "Segment Total",
      totalMembers: "Total Members",
      activeSegments: "Active Segments",
      draftSegments: "Draft Segments",
      pushedToOpportunity: "Pushed to Opportunity"
    }
  },

  auth: {
    menuPermission: "Menu Permission",
    buttonPermission: "Button Permission",
    loginOtherAccount: "Login Other Account",
    currentUserButtonPermission: "Current user button permissions:",
    useHooks: "Use Hooks to bind permissions",
    useDirective: "Use v-auth directive to bind single permission",
    useDirectiveMultiple: "Use v-auth directive to bind multiple permissions",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    import: "Import Data",
    export: "Export Data"
  },
  system: {
    add: "Add",
    modify: "Modify",
    delete: "Delete",
    export: "Export",
    roleName: "Role Name",
    enterRoleName: "Please enter role name",
    permissionChar: "Permission Char",
    enterPermissionChar: "Please enter permission char",
    roleSort: "Role Sort",
    status: "Status",
    menuPermission: "Menu Permission",
    expandCollapse: "Expand/Collapse",
    selectAll: "Select All/None",
    parentChildLink: "Parent-Child Link",
    remark: "Remark",
    confirm: "Confirm",
    cancel: "Cancel",
    dataPermission: "Data Permission",
    assignUser: "Assign User",
    permissionScope: "Permission Scope",
    dataScope: "Data Permission",
    normal: "Normal",
    disabled: "Disabled",
    allDataPermission: "All Data Permission",
    customDataPermission: "Custom Data Permission",
    deptDataPermission: "Dept Data Permission",
    deptAndBelowDataPermission: "Dept and Below Data Permission",
    onlySelfDataPermission: "Only Self Data Permission",
    roleId: "Role ID",
    displayOrder: "Display Order",
    createTime: "Create Time",
    startDate: "Start Date",
    endDate: "End Date",
    enable: "Enable",
    disable: "Disable",
    addRole: "Add Role",
    modifyRole: "Modify Role",
    assignDataPermission: "Assign Data Permission",
    noticeTitle: "Notice Title",
    enterNoticeTitle: "Please enter notice title",
    noticeType: "Notice Type",
    selectNoticeType: "Please select notice type",
    notice: "Notice",
    announcement: "Announcement",
    content: "Content",

    closed: "Closed",
    addNotice: "Add Notice",
    modifyNotice: "Modify Notice",
    parentMenu: "Parent Menu",
    selectParentMenu: "Select parent menu",
    menuType: "Menu Type",
    directory: "Directory",
    menu: "Menu",
    button: "Button",
    // Permission Management Module
    roleManagement: {
      basicInfo: "Basic Information",
      functionalPermission: "Functional Permissions",
      dataScopeTab: "Data Scope",
      fieldMaskingTab: "Field Masking",
      roleName: "Role Name",
      roleDescription: "Role Description",
      roleLevel: "Role Level",
      enterRoleName: "Please enter role name",
      enterRoleDescription: "Please enter role description",
      selectRoleLevel: "Please select role level",
      roleLevelOptions: {
        admin: "Administrator",
        manager: "Manager",
        employee: "Employee",
        dataSpecialist: "Data Specialist"
      },
      // Functional Permissions
      functional: {
        menuTree: "Menu Tree",
        pageAccess: "Page Access",
        operationButtons: "Operation Buttons/Functions",
        selectAll: "Select All",
        add: "Add",
        export: "Export",
        import: "Import",
        viewDetail: "View Details",
        edit: "Edit",
        delete: "Delete",
        mergeOneId: "Merge OneID",
        modifyTagRule: "Modify Tag Rule",
        batchOperation: "Batch Operation",
        tip: "Tip: Checking a parent menu will automatically check all child menus, unchecking a parent menu will automatically uncheck all child menus",
        loading: "Loading, please wait",
        execute: "Execute",
        pause: "Pause",
        resolve: "Resolve",
        ignore: "Ignore",
        publish: "Publish",
        disable: "Disable",
        push: "Push",
        enable: "Enable",
        preview: "Preview",
        pushOpportunity: "Push Opportunity",
        download: "Download",
        assignPermission: "Assign Permission",
        approve: "Approve",
        reject: "Reject",
        batchIgnore: "Batch Ignore",
        resetPassword: "Reset Password"
      },
      // Data Scope
      dataScope: {
        title: "Data Visibility Scope",
        allData: "All Data",
        allDataDesc: "Group administrators can view all data",
        deptAndBelow: "Department and Sub-departments",
        deptAndBelowDesc: "Regional managers can view department and sub-department data",
        deptOnly: "Department Only",
        deptOnlyDesc: "Store managers can view department data only",
        selfOnly: "Self Only",
        selfOnlyDesc: "Sales/Consultants can view own data only",
        custom: "Custom Settings",
        customDesc: "Select specific dealer nodes",
        selectDealer: "Select Dealer Nodes",
        selectedNodes: "Selected Nodes"
      },
      // Field Masking
      fieldMasking: {
        title: "Field Masking & Column Permissions",
        businessObject: "Business Object",
        fieldList: "Field List",
        fieldName: "Field Name",
        visibility: "Visibility",
        maskingRule: "Masking Rule",
        decryptPermission: "Decrypt Permission",
        display: "Display",
        hide: "Hide",
        plaintext: "Plaintext",
        mask: "Mask",
        encrypt: "Encrypt",
        enable: "Enable",
        disable: "Disable",
        businessObjects: {
          customerProfile: "Customer Profile",
          vehicleInfo: "Vehicle Information",
          opportunityRecord: "Opportunity Record",
          transactionHistory: "Transaction History",
          userAccount: "User Account",
          operLog: "Operation Log",
          loginLog: "Login Log",
          approvalRecord: "Approval Record",
          errorCorrection: "Error Correction"
        },
        sensitiveFields: {
          phone: "Phone Number",
          idCard: "ID Card",
          vin: "VIN Code",
          email: "Email",
          address: "Address",
          bankCard: "Bank Card Number"
        },
        batchSetting: "Batch Setting",
        selectStatus: "Select Status",
        apply: "Apply",
        reset: "Reset",
        saveConfig: "Save Configuration"
      },
      save: "Save",
      reset: "Reset",
      cancel: "Cancel"
    }
  },
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
        new_to_renew: "New to Renew",
        renew_to_renew: "Renew to Renew",
        in_repair_no_insurance: "In Repair No Insurance",
        dormant: "Dormant",
        pending_activation: "Pending Activation",
        active: "Active",
        diamond: "Diamond",
        gold: "Gold",
        silver: "Silver"
      }
    },
    tracking: {
      totalPushed: "Total Pushed",
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
  },
  monitor: {
    add: "Add",
    modify: "Modify",
    delete: "Delete",
    export: "Export",
    log: "Log",
    jobGroup: "Job Group",
    status: "Status",
    jobName: "Job Name",
    enterJobName: "Please enter job name",
    selectJobGroup: "Please select job group",
    invokeMethod: "Invoke Method",
    beanExample: "Bean example: ryTask.ryParams('ry')",
    classExample: "Class example: com.ruoyi.quartz.task.RyTask.ryParams('ry')",
    paramNote: "Parameter note: supports string, boolean, long, float, int",
    invokeTarget: "Invoke Target",
    enterInvokeTarget: "Please enter invoke target string",
    cronExpression: "Cron Expression",
    enterCronExpression: "Please enter cron expression",
    generateExpression: "Generate Expression",
    executeStrategy: "Execute Strategy",
    executeImmediately: "Execute Immediately",
    executeOnce: "Execute Once",
    abandonExecute: "Abandon Execute",
    concurrent: "Concurrent",
    allow: "Allow",
    forbid: "Forbid",
    cronGenerator: "Cron Expression Generator",
    jobDetail: "Job Detail",
    jobId: "Job ID:",
    jobGroupLabel: "Job Group:",
    createTimeLabel: "Create Time:",
    nextExecuteTime: "Next Execute Time:",
    invokeTargetMethod: "Invoke Target Method:",
    jobStatus: "Job Status:",
    normal: "Normal",
    pause: "Pause",
    concurrentLabel: "Concurrent:",
    executeStrategyLabel: "Execute Strategy:",
    defaultStrategy: "Default Strategy",
    close: "Close",
    executeOnceConfirm: "Execute Once",
    jobDetailLabel: "Job Detail",
    scheduleLog: "Schedule Log",
    addTask: "Add Task",
    modifyTask: "Modify Task",
    attribute: "Attribute",
    value: "Value",
    cores: "Cores",
    userUsage: "User Usage",
    systemUsage: "System Usage",
    currentIdleRate: "Current Idle Rate",
    memory: "Memory",
    totalMemory: "Total Memory",
    usedMemory: "Used Memory",
    freeMemory: "Free Memory",
    usageRate: "Usage Rate",
    serverInfo: "Server Info",
    serverName: "Server Name",
    operatingSystem: "Operating System",
    serverIp: "Server IP",
    systemArchitecture: "System Architecture",
    javaVmInfo: "Java VM Info",
    javaName: "Java Name",
    javaVersion: "Java Version",
    startTime: "Start Time",
    runTime: "Run Time",
    installPath: "Install Path",
    projectPath: "Project Path",
    runParams: "Run Params",
    diskStatus: "Disk Status",
    drivePath: "Drive Path",
    fileSystem: "File System",
    driveType: "Drive Type",
    totalSize: "Total Size",
    availableSize: "Available Size",
    usedSize: "Used Size",
    usedPercentage: "Used Percentage",
    loadingServerData: "Loading server monitoring data, please wait!",
    operationType: "Operation Type",
    operationStatus: "Operation Status",
    operationDate: "Operation Date",
    costTime: "Cost Time",
    milliseconds: "milliseconds",
    detail: "Detail",
    operationLogDetail: "Operation Log Detail",
    operationModule: "Operation Module:",
    loginInfo: "Login Info:",
    requestUrl: "Request URL:",
    requestMethod: "Request Method:",
    operationMethod: "Operation Method:",
    requestParams: "Request Params:"
  },
  approval: {
    pendingApproval: "Pending Approval",
    processedHistory: "Processed History",
    infoAlert: "Only data requiring manual decisions are shown here. For automatically merged data, please go to",
    auditLog: "Audit Log",
    view: " to view.",
    manualSubmit: "Manual Submit",
    containsManualCorrection: "Contains Manual Correction",
    places: " places",
    processing: "Processing",
    approved: "Approved",
    rejected: "Rejected",
    tabs: {
      pending: "Pending Approval",
      history: "Processed History"
    },
    alert: {
      prefix: "Only items requiring manual decisions are shown here. For auto-merged items, please visit",
      link: "Audit Logs",
      suffix: "to view."
    },
    mergeInto: "Merge into",
    actions: {
      approve: "Approve",
      reject: "Reject",
      detail: "Details",
      viewDetail: "View Details",
      viewSnapshot: "View Snapshot",
      cancel: "Cancel",
      approveMerge: "Approve Merge",
      close: "Close",
      review: "Review"
    },
    status: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected"
    },
    drawer: {
      title: "Merge Request Review #{id}",
      manualCorrection: "Manual Corrections",
      confidenceNeedReview: "Confidence: {confidence}% (Review required)",
      submitter: "Submitter",
      submitTime: "Submit Time",
      confidenceLabel: "Match Confidence",
      confidenceThreshold: "Exemption Threshold: {threshold}%",
      onlyShowChanged: "Only show changes",
      manualAlert: "Note: The operator manually modified some fields. Please review the highlighted areas.",
      confidenceAlert:
        "Algorithm confidence is {confidence}%, below the {threshold}% auto-approval threshold. Manual review is required to avoid incorrect merges.",
      fieldName: "Field",
      beforeMerge: "Before Merge (Source)",
      afterMerge: "After Merge (Proposed)",
      noChangedFields: "No changed fields",
      manualTag: "Manual"
    },
    triggerSource: {
      ruleEngine: "Rule Engine",
      manual: "Manual Submission",
      systemAlert: "System Alert"
    },
    risk: {
      confidenceLow: "Low confidence ({confidence}%)",
      confidenceVeryLow: "Very low confidence ({confidence}%)",
      manualCorrection: "Manual Correction",
      reasonLow: "Phone matches but name is fuzzy",
      reasonVeryLow: "Low match confidence, manual review required",
      autoRuleMatch: "Auto Rule Match",
      confidenceLabel: "Confidence: {confidence}%",
      defaultManualReason: "Name and ID mismatch, manually corrected"
    },
    table: {
      reqId: "Request ID",
      mergeTarget: "Merge Target (Incoming -> Master)",
      mergeTargetSimple: "Merge Target",
      triggerSource: "Trigger Source",
      riskAlert: "Risk Alert (Why review?)",
      submitTime: "Submit Time",
      operation: "Operation",
      result: "Result",
      originalReqId: "Original Request ID",
      mergeContent: "Merge Content",
      approver: "Approver",
      processTime: "Process Time",
      approvalComment: "Approval Comment",
      status: "Status",
      operator: "Operator"
    },
    placeholder: {
      reqId: "Please enter request ID",
      mergeTarget: "Search merge target",
      submitTime: "Select submit time",
      status: "Select status",
      originalReqId: "Please enter original request ID",
      approver: "Please enter approver",
      processTime: "Select process time",
      operator: "Please enter operator",
      riskType: "Select risk type"
    },
    confirm: {
      quickApprove: "Approve this merge request?",
      quickApproveTitle: "Approval Confirmation",
      rejectPrompt: "Please enter the rejection reason:",
      rejectTitle: "Reject Operation",
      rejectPlaceholder: "e.g. Data quality is too poor; suggest deletion",
      finalApprove: "Confirm data is correct and approve merge? This will be written to the OneID golden record.",
      finalApproveTitle: "Final Confirmation",
      finalApproveButton: "Approve",
      rejectWithNotify: "Please enter the rejection reason to notify the operator:",
      rejectButton: "Reject",
      rejectNotifyPlaceholder: "e.g. Manually updated name does not match ID"
    },
    messages: {
      approved: "Approved",
      rejected: "Request rejected",
      approveFailed: "Approval failed",
      rejectFailed: "Rejection failed",
      defaultApproveComment: "Approve merge",
      defaultRejectComment: "Data quality too poor, suggest deletion",
      approveSuccessSync: "Approved. Sync task has been dispatched to DataWorks.",
      loadListFailed: "Failed to load approval list",
      loadDetailFailed: "Failed to load details",
      loadStatsFailed: "Failed to load statistics"
    },
    mock: {
      groups: {
        identity: "👤 Identity",
        preference: "📞 Preferences",
        value: "💰 Value & Transactions",
        vehicle: "🚗 Vehicle Assets"
      },
      fields: {
        userId: "User ID",
        name: "Name",
        gender: "Gender",
        ageRange: "Age Range",
        familyStatus: "Family Status",
        phone: "Phone Number",
        address: "Address",
        contactPreference: "Contact Preference",
        serviceHabit: "Service Habit",
        projectPreference: "Project Preference",
        lastVisitTime: "Last Visit Time",
        visit90Days: "Visits in 90 Days",
        annualOrderFrequency: "Annual Order Frequency",
        avgConsumption: "Average Consumption",
        annualConsumption: "Annual Consumption",
        loyaltyLevel: "Loyalty Level",
        complaintLastYear: "Complaints in Last Year",
        vin: "VIN",
        plate: "License Plate",
        carSeriesModel: "Series + Model",
        currentMileage: "Current Mileage"
      },
      values: {
        genderMale: "Male",
        familyUnknown: "Unknown",
        familyMarriedTwoKids: "Married (2 kids)",
        addressOld: "Chaoyang District, Beijing",
        addressNew: "Xierqi, Haidian District, Beijing",
        weekdays: "Weekdays",
        weekendAllDay: "Weekend all day",
        empty: "-",
        needShuttle: "Need shuttle",
        maintenance: "Routine maintenance",
        maintenanceAndDetail: "Routine maintenance, detailing",
        loyaltyBasic: "Basic",
        loyaltySilver: "Silver",
        no: "No",
        yes: "Yes",
        plate: "BJ-A****1",
        carSeriesOld: "BMW 3 Series",
        carSeriesNew: "BMW 325Li M Sport"
      }
    }
  },
  customerSegmentation: {
    // Page title
    pageTitle: "Customer Segmentation",
    pageSubtitle: "Segmentation Builder",
    title: "Intelligent Segmentation Builder",
    subtitle: "Customer Segmentation & Rule Builder",

    // Quick filters
    quickFilters: {
      title: "Quick Filters",
      keyword: "Keyword Search",
      keywordPlaceholder: "Enter name, phone, VIN...",
      tags: "Quick Tags",
      tagsPlaceholder: "Select tags",
      store: "Assigned Store",
      storePlaceholder: "Select store"
    },

    ruleBuilder: {
      title: "Visual Rule Engine",
      rootOperator: "Meet the following conditions",
      all: "All",
      any: "Any",
      addCondition: "Add Condition",
      addConditionGroup: "Add Condition Group",
      addNestedGroup: "Add Nested Group",
      clearAll: "Clear All Conditions",
      existingSegment: "Existing Segment",
      remove: "Remove",
      field: "Field",
      operator: "Operator",
      value: "Value",
      selectField: "Please select field",
      selectOperator: "Please select operator",
      enterValue: "Please enter value",
      and: "AND",
      or: "OR",
      not: "NOT"
    },

    estimatePanel: {
      title: "Real-time Estimate",
      totalCount: "Estimated Total",
      people: "people",
      changeFromLast: "Compared to last version",
      increase: "Increase",
      decrease: "Decrease",
      calculating: "Calculating...",
      noData: "No Data"
    },

    // Insight Panel
    insightPanel: {
      title: "Real-time Insights",
      totalBase: "Total Customer Base",
      estimatedHits: "Estimated Hits",
      hitRate: "Hit Rate",
      highCoverageWarning: "Coverage exceeds {rate}%, please confirm if rules are too broad",
      zeroCoverageWarning: "No customers matched by current rules, please check conditions",
      calculationTimeout: "Rules are too complex for real-time calculation, will be processed offline after submission",
      privacyNotice: "To protect customer privacy, preview data is automatically masked"
    },

    samplePreview: {
      title: "Sample Data Preview",
      noData: "No Data",
      loading: "Loading...",
      total: "Total {total} items",
      pageSize: "Items per page",
      items: "items"
    },

    // Action Bar
    actionBar: {
      reset: "Reset",
      export: "Export List",
      submit: "Save & Submit for Approval"
    },

    // Approval Modal
    approvalModal: {
      title: "Segment Creation Application",
      segmentName: "Segment Name",
      segmentNamePlaceholder: "e.g., 2026 Spring X5 Maintenance Campaign",
      priority: "Priority",
      priorityHigh: "High",
      priorityMedium: "Medium",
      priorityLow: "Low",
      businessReason: "Application Reason",
      businessReasonPlaceholder: "Please explain why you need to target this group (required)",
      ruleSnapshot: "Rule Snapshot",
      submitSuccess: "Submitted! Rule ID: #{id}, has entered the approval queue, expected to complete within 2 hours."
    },

    fields: {
      ageGroup: "Age Group",
      gender: "Gender",
      city: "City",
      familyStatus: "Family Status",
      contactValidity: "Contact Validity",
      modelLine: "Model Line",
      carAge: "Car Age",
      usage: "Usage Intensity",
      lastVisit: "Last Visit Time",
      visits90D: "Visits in 90 Days",
      annualSpend: "Annual Spend",
      segment: "Existing Customer Segment",
      systemTag: "System Tag",
      oppLevel: "Opportunity Level",
      loyalty: "Loyalty"
    },
    operators: {
      equals: "Equals",
      notEquals: "Not Equals",
      contains: "Contains",
      notContains: "Not Contains",
      belongsTo: "Belongs To",
      notBelongsTo: "Not Belongs To",
      between: "Between",
      greaterThan: "Greater Than",
      lessThan: "Less Than",
      before: "Before",
      after: "After",
      allMatch: "All Match"
    },
    form: {
      segmentName: "Segment Name",
      enterSegmentName: "Please enter segment name",
      description: "Description",
      enterDescription: "Please enter description (optional)",
      businessReason: "Business Reason",
      enterBusinessReason: "Please enter business reason (required)",
      validityPeriod: "Validity Period",
      selectValidityPeriod: "Please select validity period (optional)",
      submitForApproval: "Submit for Approval",
      saveDraft: "Save Draft",
      cancel: "Cancel"
    },
    status: {
      draft: "Draft",
      pending: "Pending",
      active: "Active",
      inactive: "Inactive"
    },
    actions: {
      export: "Export",
      pushToBDC: "Push to BDC",
      pushToWeCom: "Push to WeCom Marketing",
      viewHistory: "Version History",
      rollback: "Rollback"
    },
    messages: {
      submitSuccess: "Segment submitted for approval",
      saveDraftSuccess: "Draft saved",
      exportSuccess: "Export task submitted",
      pushSuccess: "Push task submitted",
      ruleRequired: "Please configure at least one filter condition",
      nameRequired: "Segment name is required",
      reasonRequired: "Business reason is required",
      exportConfirm: "Confirm export current segment data?",
      pushConfirm: "Confirm push segment to {target}?",
      rollbackConfirm: "Confirm rollback to version {version}?",
      calculating: "Calculating estimated count...",
      calculateSuccess: "Estimate completed",
      calculateFailed: "Estimate failed, please try again later"
    },
    validation: {
      coverageTooHigh: "Coverage is abnormally high (over 30%), please confirm to continue",
      coverageWarning: "Current coverage: {count} people ({rate}% of total base)"
    }
  },
  menuManage: {
    add: "Add Menu",
    edit: "Edit Menu",
    delete: "Delete",
    fold: "Collapse",
    expand: "Expand",
    cancel: "Cancel",
    confirm: "Confirm",
    table: {
      menuName: "Menu Name",
      icon: "Icon",
      order: "Order",
      permission: "Permission",
      componentPath: "Component Path",
      status: "Status",
      createTime: "Create Time",
      operation: "Operation"
    },
    status: {
      normal: "Normal",
      disable: "Disable",
      show: "Show",
      hide: "Hide"
    },
    type: {
      directory: "Directory",
      menu: "Menu",
      button: "Button"
    },
    bool: {
      yes: "Yes",
      no: "No",
      cache: "Cache",
      noCache: "No Cache"
    },
    input: {
      menuName: "Please input menu name",
      routeName: "Please input route name",
      icon: "Please input icon name",
      routerPath: "Please input router path",
      componentPath: "Please input component path",
      permission: "Please input permission identifier",
      routerParams: "Please input router params",
      selectParent: "Select parent menu"
    },
    label: {
      parentMenu: "Parent Menu",
      menuType: "Menu Type",
      menuIcon: "Menu Icon",
      order: "Order",
      menuName: "Menu Name",
      routeName: "Route Name",
      isFrame: "Is Link",
      routerPath: "Router Path",
      componentPath: "Component Path",
      permission: "Permission",
      routerParams: "Router Params",
      isCache: "Is Cache",
      visible: "Visible",
      menuStatus: "Menu Status"
    },
    tooltip: {
      routeName: "Defaults to the same as the route address if not filled",
      isFrame: "If yes is selected, the route address needs to start with `http(s)://`",
      routerPath: "Access route address, e.g. `user`",
      componentPath: "Access component path, e.g. `system/user/index`",
      permission: "Permission character defined in the controller",
      routerParams: 'Default passed parameters for route access, e.g. `{"id": 1}`',
      isCache: "If yes is selected, it will be cached by `keep-alive`",
      visible: "If hidden is selected, the route will not appear in the sidebar",
      status: "If disabled is selected, the route will not appear in the sidebar"
    },
    message: {
      menuNameRequired: "Menu name cannot be empty",
      orderRequired: "Menu order cannot be empty",
      pathRequired: "Router path cannot be empty",
      addSuccess: "Added successfully",
      updateSuccess: "Modified successfully",
      deleteSuccess: "Deleted successfully",
      deleteConfirm: 'Are you sure you want to delete the data item named "{name}"?',
      title: "Hint"
    }
  },
  collection: {
    title: "Data Collection Management",
    config: {
      title: "Data Collection Configuration",
      subtitle: "Configure data upload reminders and notification rules",
      platforms: {
        manualUpload: "Manual Upload Platforms",
        selectEmployee: "Please select employee",
        selectEmployees: "Please select employees (multiple)",
        selectTime: "Select time",
        stageNamePlaceholder: "Stage name",
        multipleEmployeesTip: "The last stage can select multiple employees, system will send to all selected employees"
      },
      recipients: {
        title: "Recipients Configuration",
        scheduleConfig: {
          title: "Collection Schedule Configuration",
          desc: "Configure collection rules and recipient emails for different time nodes. Business personnel must upload before 18:00 the previous night, otherwise collection notifications will be sent according to the following rules.",
          stageT0: "T+0 Stage",
          stageT0Desc: "If not uploaded before 18:00 on the same day, send to operator (unique email)",
          stageT0DescPrefix: "If not uploaded before ",
          stageT0DescSuffix: " on the same day, send to operator (unique email)",
          stageT1: "T+1 Stage",
          stageT1Desc:
            "If not uploaded found at 9:00 the next day, send to operator (unique email), notify missing, request supplement",
          stageT1DescPrefix: "If not uploaded found at ",
          stageT1DescSuffix: " the next day, send to operator (unique email), notify missing, request supplement",
          stageT2: "T+2 Stage",
          stageT2Desc: "If still not uploaded the day after, send to C360 project team data specialists (multiple selection)",
          stageT2DescPrefix: "If still not uploaded at ",
          stageT2DescSuffix: " the day after, send to C360 project team data specialists (multiple selection)",
          stageT3DescPrefix: "If still not uploaded at ",
          stageLabel: "Collection Stage",
          timeLabel: "Time Point",
          recipientLabel: "Recipient Email",
          recipientPlaceholder: "Enter email address",
          recipientPlaceholderMultiple: "Enter email addresses, separate multiple emails with commas",
          emailRequired: "Please enter recipient email",
          emailFormat: "Please enter a valid email address",
          emailFormatMultiple: "Invalid email format, separate multiple emails with commas"
        },
        hardcodedCC: {
          title: "Hard-coded CC (Fallback)",
          desc: "Specify a fixed email address to receive all alerts. This ensures continuity even if employees leave.",
          fallbackEmail: "Fallback Email",
          placeholder: "e.g. data_team@company.com"
        },
        save: "Save Configuration",
        reset: "Reset",
        saveSuccess: "Configuration saved successfully",
        resetSuccess: "Configuration reset",
        emailRequired: "Please enter email address",
        emailFormat: "Please enter a valid email address",
        scheduleRequired: "Please configure at least one collection schedule",
        preview: {
          title: "Configuration Preview",
          notSet: "Not Set",
          notConfigured: "Not Configured"
        }
      }
    },
    monitor: {
      title: "Data Collection Monitoring",
      refresh: "Refresh List",
      employeeName: "Data Responsible",
      email: "Email",
      dataSource: "Data Source",
      uploadStatus: "Upload Status",
      deadline: "Deadline",
      overdueDays: "Overdue Days",
      status: "Employee Status",
      action: "Action",
      nudge: "Nudge",
      statusActive: "Active",
      statusResigned: "Resigned",
      uploadStatusPending: "Pending",
      uploadStatusOverdue: "Overdue",
      uploadStatusCompleted: "Completed",
      nudgeDialog: {
        title: "Send Data Collection Notification",
        resignedAlert: {
          title: "Data Responsible Resigned",
          desc: "This data responsible has resigned. Please explicitly assign a new recipient email for temporary data upload replacement."
        },
        recipientEmail: "Recipient Email",
        recipientEmailPlaceholder: "Enter recipient email",
        message: "Message",
        messagePlaceholder: "e.g. Please upload T+1 data as soon as possible, deadline is 18:00 today",
        cancel: "Cancel",
        send: "Send Notification",
        emailRequired: "Please enter a recipient email",
        emailFormat: "Please enter a valid email address",
        sendSuccess: "Data collection notification sent to {email}"
      }
    }
  },
  dataQualityWorkbench: {
    title: "Data File Upload",
    subtitle: "Data Quality Gate Workbench",
    statusDashboard: {
      title: "Today's Data Upload Overview",
      pendingUpload: "Pending Upload",
      validated: "Validated",
      intercepted: "Intercepted Errors",
      dataTimeliness: "Data Timeliness",
      overdue: "Overdue",
      normal: "Normal",
      delayed: "Delayed",
      rows: "rows"
    },
    dataSource: {
      title: "Select Data Source",
      dms: {
        name: "DMS - Daily Sales Ledger",
        tag: "Strong Dependency"
      },
      poas: {
        name: "POAS - Parts Order",
        tag: "Strong Dependency"
      },
      wws: {
        name: "WWS - Claim Form",
        tag: "No API/Manual"
      },
      cap: {
        name: "C@@P - New Car Lead",
        tag: ""
      },
      voucher: {
        name: "Voucher - Coupon",
        tag: "Marketing"
      },
      manual: {
        name: "Manual Files - Manual Files",
        tag: "General"
      },
      downloadTemplate: "Download Standard Template",
      todayCompleted: "Completed Today"
    },
    upload: {
      title: "Upload & Pre-validation",
      dragText: "Drag file here, or",
      clickUpload: "click to upload",
      supportFormat: "Support .xlsx format, file size not exceeding 50MB",
      fileSizeError: "File size cannot exceed 50MB",
      fileFormatError: "Only .xlsx format is supported",
      headerMismatch: "Header Mismatch",
      headerMismatchDesc:
        "The header of the uploaded file does not match the standard template. Please download the standard template and fill it again",
      validating: "Validating...",
      validationComplete: "Validation Complete",
      completedTitle: "Data Upload Completed",
      completedDesc: "Congratulations! You have successfully completed today's data upload task.",
      completedTime: "Completion Time",
      completedDataSource: "Data Source",
      completedRows: "Uploaded Rows",
      todayCompleted: "Today's Task Completed",
      completedFileName: "File Name",
      reupload: "Re-upload",
      taskListTitle: "{platform} Platform Task List",
      reportName: "Report Name",
      status: "Status",
      lastUploadTime: "Last Upload Time"
    },
    reports: {
      poas_opp: "Opportunity Table",
      wws_activity: "Activity List",
      cap_vehicle: "Vehicle Report",
      cap_complaint: "Complaint Report",
      cap_prosperity: "Prosperity Together",
      voucher_sales: "Additional Sales Report",
      voucher_benefits: "Member Benefits Statistics",
      voucher_balance: "Coupon Balance Report (Details)",
      manual_pc_marketing: "PC Active Marketing Follow-up Update",
      manual_client_base: "Client Base",
      manual_loss_15m: "First Service 15-Month Loss Determination",
      manual_ins_new: "Monthly Insurance Report-New Car",
      manual_ins_used: "Monthly Insurance Report-Used Car",
      manual_ins_renewal: "Monthly Renewal Insurance",
      manual_jsp: "JSP PAW PSP",
      manual_pcn_interest: "PCN WeChat Assistant Interests",
      manual_sign: "Event Report Signature",
      manual_base_analysis: "Base Analysis Statistics"
    },
    notification: {
      title: "Email Notification Rules",
      subtitle: "Configure email reminders for data validation failures",
      deadlineTime: "Deadline",
      deadlineTimeDesc: "Daily data upload deadline. Reminder emails will be sent if data is not uploaded before this time",
      deadlineTimePlaceholder: "Please select deadline",
      emailRecipients: "Email Recipients",
      emailRecipientsDesc:
        "Email notifications will be sent to the following recipients when data validation fails or upload deadline is missed",
      emailRecipientsPlaceholder: "Please enter email addresses, separated by commas",
      emailTip:
        "The system will automatically send email notifications to recipients when data validation fails or upload deadline is missed",
      save: "Save Configuration",
      reset: "Reset",
      saveSuccess: "Configuration saved successfully",
      resetSuccess: "Configuration reset",
      stageT0Desc: "If data is not uploaded before 18:00 on the same day, the system will send a reminder email",
      stageT1Desc: "If data is still not uploaded before 09:00 the next day, the system will send an escalation reminder email",
      stageT2Desc: "If data is still not uploaded before 09:00 on the third day, the system will send an urgent alert email",
      recipients: {
        dataTeamLeader: "Data Team Leader",
        dataTeamLeaderAndBusiness: "Data Team Leader, Business Leader",
        dataTeamBusinessManagement: "Data Team, Business Team, Management",
        dataTeamLeaderOnly: "Data Team Leader"
      }
    },
    validation: {
      title: "Data Quality Report",
      summary: "Validation Summary",
      totalRows: "Total {total} rows",
      successRows: "Success {success} rows",
      errorRows: "Failed {error} rows",
      errorDetails: "Error Details",
      rowNumber: "Row Number",
      errorReason: "Error Reason",
      cancel: "Cancel Upload",
      importValidOnly: "Import Valid Data Only",
      submitAll: "Submit All",
      noErrors: "Data validation passed, ready to submit",
      cellError: "Cell Error",
      hoverToSeeReason: "Hover to see error reason"
    },
    auditLog: {
      title: "Operation Audit Log",
      uploadTime: "Upload Time",
      dataSource: "Data Source",
      fileName: "File Name",
      operator: "Operator",
      validationResult: "Validation Result",
      uploadStatus: "Upload Status",
      statusPassed: "Passed",
      statusFailed: "Failed",
      statusPending: "Pending",
      uploadSuccess: "Upload Success",
      uploadFailed: "Upload Failed",
      uploadProcessing: "Processing"
    },
    rules: {
      dms: {
        requiredColumns: "Must include columns: VIN, Phone, Customer_Name",
        phoneFormat: "Phone must be 11 digits",
        vinRequired: "VIN cannot be empty",
        phoneRequired: "Phone cannot be empty",
        customerNameRequired: "Customer_Name cannot be empty"
      },
      poas: {
        requiredColumns: "Must include columns: Part_Number, Order_Date",
        partNumberRequired: "Part_Number cannot be empty",
        orderDateRequired: "Order_Date cannot be empty"
      },
      wws: {
        requiredColumns: "Must include columns: Claim_Number, Claim_Date",
        claimNumberRequired: "Claim_Number cannot be empty",
        claimDateRequired: "Claim_Date cannot be empty"
      },
      cap: {
        requiredColumns: "Must include columns: Lead_Name, Phone, Source",
        leadNameRequired: "Lead_Name cannot be empty",
        phoneRequired: "Phone cannot be empty",
        sourceRequired: "Source cannot be empty"
      }
    },
    messages: {
      uploadSuccess: "Upload Success",
      uploadFailed: "Upload Failed",
      validationFailed: "Data Validation Failed",
      fileRequired: "Please select a file first",
      noErrorsToShow: "No error data",
      importValidOnlySuccess: "Successfully imported {count} valid records",
      submitAllSuccess: "Successfully submitted all data",
      confirmSubmit: "Are you sure you want to submit all {count} data records?",
      submitFailed: "Submission failed, please try again"
    },
    auditLogStats: {
      totalRows: "Total Rows",
      successRows: "Success Rows",
      errorRows: "Error Rows",
      fileNamePlaceholder: "Please enter file name",
      operatorPlaceholder: "Please enter operator"
    }
  }
};

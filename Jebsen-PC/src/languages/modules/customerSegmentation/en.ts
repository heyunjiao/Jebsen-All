export default {
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
      modelLines: "Model Lines (Multiple)",
      carAge: "Car Age",
      usage: "Usage Intensity",
      lastVisit: "Last Visit Time",
      visits90D: "Visits in 90 Days",
      annualSpend: "Annual Spend",
      segment: "Existing Customer Segment",
      systemTag: "System Tag",
      oppLevel: "Opportunity Level",
      loyalty: "Loyalty",
      totalCarPrice: "Total Car Price",
      totalOptionPrice: "Total Option Price",
      afterSalesSelfPayAmount: "After-sales Self-pay Amount",
      customerValueTier: "Customer Value Tier",
      completedOrderCount: "Completed Order Count",
      visitsIn2Years: "Visits in 2 Years",
      selfPayAmountIn2Years: "Self-pay Amount in 2 Years",
      lastServiceOrderDate: "Last Service Order Date",
      lastPurchaseDeliveryDate: "Last Purchase Delivery Date",
      accidentRepairCountIn1Year: "Accident Repairs in Last Year",
      lastServiceAdvisor: "Last Service Advisor",
      bdcComplaintTags: "BDC Complaint Tags"
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
  }
};

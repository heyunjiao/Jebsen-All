export default {
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
  }
};

export default {
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
      phonePrimary: "Preferred",
      setAsPrimary: "Set as preferred",
      deletePhone: "Delete",
      phoneFormatError: "Invalid phone number format",
      phoneRequired: "Please enter phone number",
      phoneDuplicate: "Phone number already exists",
      phoneValidation: "Please enter a valid 11-digit phone number",
      phoneAddSuccess: "Phone number added successfully",
      phoneUpdateSuccess: "Phone number updated successfully",
      phoneDeleteSuccess: "Phone number deleted successfully",
      phoneSetPrimarySuccess: "Set as preferred number",
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
      tabs: {
        resolution: "Feedback Resolution",
        lineage: "Identity Lineage Trace"
      },
      // SLA Countdown
      sla: {
        remaining: "Remaining {time}",
        expired: "Expired",
        hours: "{hours}h",
        hoursMinutes: "{hours}h {minutes}m"
      },
      // Left: Golden Record
      goldenRecord: {
        title: "Customer Record (Under Correction)",
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
        correctionDetail: {
          title: "H5 Correction Detail",
          field: "Field",
          currentValue: "Current Value",
          correctValue: "Correct Value",
          note: "Note"
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
  }
};

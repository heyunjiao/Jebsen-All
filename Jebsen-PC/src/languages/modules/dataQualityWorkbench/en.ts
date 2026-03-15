export default {
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
      uploadCycle: "Upload Cycle",
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
      voucher_member_benefit_stats: "Member Benefits Statistics",
      voucher_member_addon_sales: "Member Additional Sales Report",
      voucher_balance_detail: "Coupon Balance Report (Details)",
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
      totalRowsLabel: "Total",
      successRowsLabel: "Success",
      errorRowsLabel: "Failed",
      rowsUnit: "rows",
      errorDetails: "Error Details",
      rowNumber: "Row Number",
      errorReason: "Error Reason",
      cancel: "Cancel Upload",
      importValidOnly: "Import Valid Data Only",
      submitAll: "Submit All",
      noErrors: "Data validation passed, ready to submit",
      cellError: "Cell Error",
      hoverToSeeReason: "Hover to see error reason",
      preCheck: "Pre-check Pipeline",
      preCheckResult: "Pre-check Result",
      preCheckPassed: "Pre-check Passed",
      preCheckFailed: "Pre-check Failed",
      orphanDataTitle: "Orphan Data - Cannot Associate",
      cannotAssociate: "Logic Error - Cannot Associate",
      cannotAssociateDesc: "VIN code or customer phone number cannot be matched in the main database (orphan data)",
      downloadErrorReport: "Download Error Report",
      importData: "Import Data",
      preCheckInProgress: "Pre-checking...",
      preCheckComplete: "Pre-check Complete",
      errorRowHighlight: "Error rows are highlighted in red, hover to see details",
      improveDataTip:
        "Please improve the following error service record information (such as adding correct VIN code or customer phone number), then re-upload for import",
      closeDialogWarning:
        "Note: After closing this dialog, the pre-check results will disappear. If you need to view error details, please download the error report first. If you need to re-check, please upload the file again."
    },
    columnMapping: {
      VIN: "VIN Code",
      Phone: "Phone Number",
      Customer_Name: "Customer Name",
      Model: "Car Model",
      Dealer_Code: "Dealer Code",
      Sales_Consultant: "Sales Consultant",
      Order_Date: "Order Date",
      Delivery_Date: "Delivery Date",
      Amount: "Order Amount",
      Payment_Method: "Payment Method",
      Order_No: "Order Number",
      Transaction_Date: "Transaction Date",
      Transaction_Type: "Transaction Type",
      Customer_Phone: "Customer Phone",
      Product_Name: "Product Name",
      Service_Order_No: "Service Order Number",
      Service_Date: "Service Date",
      License_Plate: "License Plate",
      Service_Type: "Service Type",
      Service_Amount: "Service Amount",
      Car_Model: "Car Model",
      Mileage: "Mileage",
      Service_Consultant: "Service Consultant"
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

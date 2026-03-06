export default {
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
      },
      globalRules: {
        title: "Global Monitoring Rules",
        desc: "Configure system-level email notifications for auto data source monitoring, data quality checks and system capacity alerts.",
        enabled: "Enabled",
        disabled: "Disabled",
        status: "Status",
        type: "Type",
        ruleName: "Rule Name",
        viewDetails: "View Details",
        threshold: "Alert Threshold",
        thresholdTip: "Alert will be triggered when resource usage reaches this threshold",
        extraRecipients: "Extra Recipients",
        extraRecipientsPlaceholder: "Optional: additional CC emails, separated by commas",
        detailColumn: "Rule Details",
        groups: {
          autoSource: "Alert rules when source systems stop updating as expected",
          dataQuality: "Alert rules when fatal data quality errors are returned",
          systemCapacity: "Alert rules when system resource usage reaches the threshold"
        },
        rules: {
          auto_source_stopped: {
            title: "Auto Data Source Monitoring: Source Updates Stopped",
            desc: "When the daily job detects a data source not refreshed by the agreed time, an email will be sent to the data source owner and their manager. You can configure additional CC emails here."
          },
          data_quality_fatal: {
            title: "Data Quality Check: Fatal Errors Returned",
            desc: "When the processing pipeline encounters fatal errors that cannot be auto-corrected and are returned, an email will be sent to the uploader and data quality owner. You can configure additional CC emails here."
          },
          system_capacity_threshold: {
            title: "System Capacity / Scaling: Resource Threshold Alert",
            desc: "When monitoring detects key resource usage reaching the alert threshold, an email will be sent to Jebsen owners and related technical owners. You can configure the threshold and additional CC emails here."
          }
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
    },
    rules: {
      title: "Email Notification & Collection Rules Overview",
      subtitle: "View trigger timings, recipients and source basis across all monitoring dimensions",
      enabled: "Enabled",
      disabled: "Disabled",
      viewConfig: "View Configuration",
      stats: {
        totalRules: "Total Rules",
        manualUploadRules: "Manual Upload Timeliness Rules",
        autoSourceRules: "Auto Data Source Monitoring Rules",
        dataQualityRules: "Data Quality Check Rules",
        systemCapacityRules: "System Capacity & Scaling Rules"
      },
      columns: {
        monitorType: "Monitoring Dimension",
        scenario: "Trigger Scenario",
        platform: "Platform / System",
        stage: "Stage",
        triggerTiming: "Trigger Timing",
        recipients: "Recipients",
        sourceBasis: "Source Basis",
        enabled: "Enabled"
      },
      filters: {
        monitorTypePlaceholder: "Select monitoring dimension"
      },
      monitorType: {
        manualUpload: "Data Upload Timeliness (Manual)",
        autoSource: "Auto Data Source Monitoring",
        dataQuality: "Data Quality Checks",
        systemCapacity: "System Capacity / Scaling"
      },
      scenario: {
        manualUploadDelay: "Manual data upload timeout / not uploaded on time",
        autoSourceStopped: "Auto data source not refreshed as expected",
        dataQualityFatal: "Fatal data quality errors that cannot be auto-corrected",
        systemCapacity: "System resource usage exceeds configured threshold"
      },
      platform: {
        autoPipeline: "Auto Data Pipeline",
        dataQualityWorkbench: "Data Quality Workbench",
        c360Infrastructure: "C360 Infrastructure / Application Cluster"
      },
      trigger: {
        manualUpload: "Triggered when upload is still not completed at planned time {time} of stage {stage}",
        autoSourceStopped: "Triggered when daily job detects a data source not refreshed before agreed time",
        dataQualityFatal: "Triggered when fatal data quality errors occur and require business confirmation",
        systemCapacity: "Triggered when monitoring detects key resource usage reaching or exceeding 50% threshold"
      },
      recipients: {
        toBeConfigured: "Recipients to be configured",
        autoSource: "Responsible owners and their managers (per data source)",
        dataQuality: "Data uploader and data quality owner",
        systemCapacity: "Jebsen owners and related technical owners"
      },
      sourceBasis: {
        manualUpload: "“Data Upload Timeliness Requirements” — manual upload reports T+0/T+1/T+2 collection rules",
        autoSource: "“Auto Data Source Monitoring Strategy” — handling rules for source update suspension",
        dataQuality: "“Data Quality Management Specification” — process for fatal error handling",
        systemCapacity: "“System Capacity & Scaling Plan” — 50% resource threshold alert rules"
      }
    }
  }
};

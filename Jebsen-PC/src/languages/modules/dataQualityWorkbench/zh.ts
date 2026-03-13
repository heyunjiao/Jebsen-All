export default {
  dataQualityWorkbench: {
    title: "数据文件上传",
    subtitle: "左侧选择报表类型，右侧上传并校验数据",
    statusDashboard: {
      title: "今日数据上传概览",
      pendingUpload: "今日待传",
      validated: "校验通过",
      intercepted: "拦截错误",
      dataTimeliness: "数据时效",
      overdue: "逾期",
      normal: "正常",
      delayed: "延迟",
      rows: "行"
    },
    dataSource: {
      title: "选择上传任务",
      subtitle: "左侧选择具体上传任务，右侧完成文件上传与质量校验",
      dms: {
        name: "DMS",
        tag: "强依赖"
      },
      poas: {
        name: "POAS",
        tag: "强依赖"
      },
      wws: {
        name: "WWS",
        tag: "无接口/人工"
      },
      cap: {
        name: "C@P",
        tag: ""
      },
      voucher: {
        name: "Voucher",
        tag: "营销"
      },
      manual: {
        name: "Manual Files",
        tag: "通用"
      },
      downloadTemplate: "下载标准模板",
      todayCompleted: "今日已完成"
    },
    upload: {
      title: "上传与预检",
      dragText: "将文件拖到此处，或",
      clickUpload: "点击上传",
      supportFormat: "支持 .xlsx 格式，文件大小不超过 50MB",
      fileSizeError: "文件大小不能超过 50MB",
      fileFormatError: "仅支持 .xlsx 格式",
      headerMismatch: "表头不匹配",
      headerMismatchDesc: "上传文件的表头与标准模板不一致，请下载标准模板后重新填写",
      validating: "正在校验...",
      validationComplete: "校验完成",
      completedTitle: "数据上传完成",
      completedDesc: "恭喜！您已成功完成今日数据上传任务。",
      completedTime: "完成时间",
      completedDataSource: "数据源",
      completedRows: "上传行数",
      todayCompleted: "今日任务已完成",
      completedFileName: "文件名",
      reupload: "重新上传",
      taskListTitle: "{platform} 平台任务清单",
      reportName: "报表名称",
      status: "状态",
      lastUploadTime: "最后上传时间"
    },
    reports: {
      poas_opp: "商机表",
      wws_activity: "活动列表",
      cap_vehicle: "车辆报告",
      voucher_member_addon_sales: "会员附加销售报表",
      voucher_balance_detail: "优惠券余额报表明细",
      voucher_first_owner_info: "首任车主信息",
      manual_ins_renewal_sales: "续保销售记录",
      manual_ins_new_sales: "新保销售记录",
      manual_client_base_table: "客户基盘表",
      manual_replace_approval: "推荐置换再购审批记录",
      manual_offline_marketing_segment: "线下营销/社群活动分群",
      manual_generic_opportunity: "自定义通用商机"
    },
    notification: {
      title: "邮件通知规则",
      subtitle: "配置数据校验失败时的邮件提醒",
      deadlineTime: "截止时间",
      deadlineTimeDesc: "每日数据上传的截止时间，超过此时间未上传将发送提醒邮件",
      deadlineTimePlaceholder: "请选择截止时间",
      emailRecipients: "邮件收件人",
      emailRecipientsDesc: "数据校验失败或超过截止时间未上传时，将发送邮件通知以下收件人",
      emailRecipientsPlaceholder: "请输入邮箱地址，多个邮箱用逗号分隔",
      emailTip: "系统将在数据校验失败或超过截止时间未上传时，自动发送邮件通知收件人",
      save: "保存配置",
      reset: "重置",
      saveSuccess: "配置保存成功",
      resetSuccess: "配置已重置",
      tip: "系统将在指定时间自动发送邮件通知，提醒相关人员处理数据上传任务",
      stageT0Desc: "当日18:00前未上传数据，系统将发送提醒邮件",
      stageT1Desc: "次日09:00前仍未上传，系统将发送升级提醒邮件",
      stageT2Desc: "第三日09:00前仍未上传，系统将发送紧急告警邮件",
      recipients: {
        dataTeamLeader: "数据团队负责人",
        dataTeamLeaderAndBusiness: "数据团队负责人、业务负责人",
        dataTeamBusinessManagement: "数据团队、业务团队、管理层",
        dataTeamLeaderOnly: "数据团队负责人"
      }
    },
    validation: {
      title: "数据质量体检报告",
      summary: "校验结果概览",
      totalRows: "共 {total} 行",
      successRows: "成功 {success} 行",
      errorRows: "失败 {error} 行",
      totalRowsLabel: "共",
      successRowsLabel: "成功",
      errorRowsLabel: "失败",
      rowsUnit: "行",
      errorDetails: "错误详情",
      rowNumber: "行号",
      errorReason: "错误原因",
      cancel: "取消上传",
      importValidOnly: "仅导入正确数据",
      submitAll: "全部提交",
      noErrors: "数据校验通过，可以提交",
      cellError: "单元格错误",
      hoverToSeeReason: "鼠标悬停查看错误原因",
      preCheck: "预检流水线",
      preCheckResult: "预检结果",
      preCheckPassed: "预检通过",
      preCheckFailed: "预检失败",
      orphanDataTitle: "孤立数据 无法关联",
      cannotAssociate: "逻辑错误-无法关联",
      cannotAssociateDesc: "VIN码或客户手机号无法匹配主数据库（孤立数据）",
      downloadErrorReport: "下载失败报告",
      importData: "入库",
      preCheckInProgress: "正在预检...",
      preCheckComplete: "预检完成",
      errorRowHighlight: "错误行已标红，鼠标悬浮查看详情",
      improveDataTip: "请完善以下错误维修记录信息（如补充正确的VIN码或客户手机号），完善后再重新上传进行导入",
      closeDialogWarning:
        "注意：关闭此弹窗后，预检结果将消失，如需查看错误详情，请先下载失败报告。关闭后如需重新预检，请再次上传文件。"
    },
    auditLog: {
      title: "操作追溯日志",
      uploadTime: "上传时间",
      dataSource: "数据源",
      fileName: "文件名",
      operator: "操作人",
      validationResult: "校验结果",
      uploadStatus: "上传状态",
      statusPassed: "通过",
      statusFailed: "失败",
      statusPending: "待处理",
      uploadSuccess: "上传成功",
      uploadFailed: "上传失败",
      uploadProcessing: "处理中",
      totalRows: "总行数",
      successRows: "成功行数",
      errorRows: "错误行数",
      fileNamePlaceholder: "请输入文件名",
      operatorPlaceholder: "请输入操作人"
    },
    columnMapping: {
      VIN: "VIN码",
      Phone: "手机号",
      Customer_Name: "客户姓名",
      Model: "车型",
      Dealer_Code: "经销商代码",
      Sales_Consultant: "销售顾问",
      Order_Date: "订单日期",
      Delivery_Date: "交车日期",
      Amount: "订单金额",
      Payment_Method: "付款方式",
      Order_No: "订单号",
      Transaction_Date: "交易日期",
      Transaction_Type: "交易类型",
      Customer_Phone: "客户手机号",
      Product_Name: "产品名称",
      Service_Order_No: "维修单号",
      Service_Date: "维修日期",
      License_Plate: "车牌号",
      Service_Type: "维修类型",
      Service_Amount: "维修金额",
      Car_Model: "车型",
      Mileage: "里程数",
      Service_Consultant: "服务顾问"
    },
    rules: {
      dms: {
        requiredColumns: "必须包含列：VIN, Phone, Customer_Name",
        phoneFormat: "Phone 必须是 11 位数字",
        vinRequired: "VIN 不能为空",
        phoneRequired: "Phone 不能为空",
        customerNameRequired: "Customer_Name 不能为空"
      },
      poas: {
        requiredColumns: "必须包含列：Part_Number, Order_Date",
        partNumberRequired: "Part_Number 不能为空",
        orderDateRequired: "Order_Date 不能为空"
      },
      wws: {
        requiredColumns: "必须包含列：Claim_Number, Claim_Date",
        claimNumberRequired: "Claim_Number 不能为空",
        claimDateRequired: "Claim_Date 不能为空"
      },
      cap: {
        requiredColumns: "必须包含列：Lead_Name, Phone, Source",
        leadNameRequired: "Lead_Name 不能为空",
        phoneRequired: "Phone 不能为空",
        sourceRequired: "Source 不能为空"
      }
    },
    messages: {
      uploadSuccess: "上传成功",
      uploadFailed: "上传失败",
      validationFailed: "数据校验失败",
      fileRequired: "请先选择文件",
      noErrorsToShow: "无错误数据",
      importValidOnlySuccess: "已成功导入 {count} 条正确数据",
      submitAllSuccess: "已成功提交所有数据",
      confirmSubmit: "确定提交所有 {count} 条数据吗？",
      submitFailed: "提交失败，请重试"
    }
  }
};

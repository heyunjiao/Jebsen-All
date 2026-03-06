export default {
  operation: {
    storeAnalysis: "门店经营分析",
    storeName: "门店名称",
    customerGrowth: "客户增长",
    netGrowthRate: "净增长客户率",
    newSalesLocal: "本店销售新增客户",
    newAfterSalesNonLocal: "售后非本店新增客户",
    lostCustomers: "流失客户数",
    retentionPenetration: "留存与渗透",
    salesFirstMaintenanceRate: "销售客户首保率",
    salesFirstReturnRate: "销售客户首次回厂率",
    afterSalesRegularMaintenanceRate: "售后客户定期保养率",
    afterSalesRetentionRate: "售后客户保持率",
    stickyProductPenetrationRate: "粘性产品渗透率",
    newInsurancePenetrationRate: "新保渗透率",
    renewalInsurancePenetrationRate: "续保渗透率",
    underRepairNotInsuredPenetrationRate: "在修不在保渗透率",
    renewalRateDistribution: "续保率+三项类型分布",
    year: "年份",
    month: "月份",
    placeholder: {
      year: "请选择年份",
      month: "请选择月份",
      store: "请选择门店"
    },
    tips: {
      netGrowthRate: "(本月新增客户总数 - 本月流失客户数) ÷ 上月末总客户数",
      newSalesLocal: "“本店新增客户数”（新车交车）C360中按照每月新增客户数的口径",
      newAfterSalesNonLocal: "“非本店新增客户数”（其他店客户到店维修 / 保养）",
      lostCustomers: "12个月未回厂数",
      salesFirstMaintenanceRate: "首保定义：客户在捷成买车后12个月内回厂做的第一次保养。公式：首保客户数 ÷ 同期新车销售数 × 100%",
      salesFirstReturnRate: "新车销售后12个月内首次回厂（含保养、维修）的客户占比",
      afterSalesRegularMaintenanceRate: "12个月内按厂家建议周期完成定期保养的客户占比。公式：达标客户数 ÷ 活跃客户数 × 100%",
      afterSalesRetentionRate: "公式：12个月内回厂量 ÷ 过去13-24个月回厂客户",
      stickyProductPenetrationRate: "购买至少一款粘性产品的售后客户占比。公式：粘性产品客户数 ÷ 售后客户总数 × 100%",
      newInsurancePenetrationRate: "新保单客户数 ÷ 新车交付数 × 100%",
      renewalInsurancePenetrationRate: "续保订单数 ÷ 活跃售后客户总数 × 100%",
      underRepairNotInsuredPenetrationRate: "在修不在保客户数 ÷ 售后进厂总客户数 × 100%",
      renewalRateDistribution: "续保数 ÷ 活跃售后客户总数"
    }
  }
};

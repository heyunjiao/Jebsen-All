import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/components/Loading/fullScreen";
import { LOGIN_URL } from "@/config";
import { ElMessage } from "element-plus";
import { ResultData } from "@/api/interface";
import { ResultEnum } from "@/enums/httpEnum";
import { checkStatus } from "./helper/checkStatus";
import { AxiosCanceler } from "./helper/axiosCancel";
import { useUserStore } from "@/stores/modules/user";
import router from "@/routers";
import authMenuList from "@/assets/json/authMenuList.json";
import monitorMockData from "@/assets/json/monitorMockData.json";
import toolMockData from "@/assets/json/toolMockData.json";
import systemMockData from "@/assets/json/systemMockData.json";

import segmentMockData from "@/assets/json/segmentMockData.json";
import tagManageMockData from "@/assets/json/tagManageMockData.json";
import leadManagementMockData from "@/assets/json/leadManagementMockData.json";
import customerSegmentationMockData from "@/assets/json/customerSegmentationMockData.json";
import collectionMockData from "@/assets/json/collectionMockData.json";
import dataQualityWorkbenchMockData from "@/assets/json/dataQualityWorkbenchMockData.json";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
  cancel?: boolean;
}

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: import.meta.env.VITE_API_URL as string,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: true
};

const axiosCanceler = new AxiosCanceler();

/**
 * @description 获取 Monitor 模块的 mock 数据
 */
function getMonitorMockData(url: string, method: string, params: any) {
  // Job 相关接口
  if (url.includes("/monitor/job/list")) {
    return monitorMockData.job.list;
  }
  if (url.includes("/monitor/job/") && method === "get" && !url.includes("/changeStatus") && !url.includes("/run")) {
    const jobId = url.split("/").pop();
    return {
      ...monitorMockData.job.detail,
      data: {
        ...monitorMockData.job.detail.data,
        jobId: jobId ? parseInt(jobId) : 1
      }
    };
  }
  if (url.includes("/monitor/job") && method === "post") {
    return monitorMockData.job.add;
  }
  if (url.includes("/monitor/job") && method === "put" && !url.includes("/changeStatus") && !url.includes("/run")) {
    return monitorMockData.job.update;
  }
  if (url.includes("/monitor/job/") && method === "delete") {
    return monitorMockData.job.delete;
  }
  if (url.includes("/monitor/job/changeStatus")) {
    return monitorMockData.job.changeStatus;
  }
  if (url.includes("/monitor/job/run")) {
    return monitorMockData.job.run;
  }

  // JobLog 相关接口
  if (url.includes("/monitor/jobLog/list")) {
    return monitorMockData.jobLog.list;
  }
  if (url.includes("/monitor/jobLog/") && method === "delete" && !url.includes("/clean")) {
    return monitorMockData.jobLog.delete;
  }
  if (url.includes("/monitor/jobLog/clean")) {
    return monitorMockData.jobLog.clean;
  }

  // Cache 相关接口
  if (
    url.includes("/monitor/cache") &&
    method === "get" &&
    !url.includes("/getNames") &&
    !url.includes("/getKeys") &&
    !url.includes("/getValue")
  ) {
    return monitorMockData.cache.info;
  }
  if (url.includes("/monitor/cache/getNames")) {
    return monitorMockData.cache.names;
  }
  if (url.includes("/monitor/cache/getKeys/")) {
    const cacheName = url.split("/getKeys/")[1];
    return monitorMockData.cache.keys;
  }
  if (url.includes("/monitor/cache/getValue/")) {
    return monitorMockData.cache.value;
  }
  if (url.includes("/monitor/cache/clearCacheName/")) {
    return monitorMockData.cache.clearName;
  }
  if (url.includes("/monitor/cache/clearCacheKey/")) {
    return monitorMockData.cache.clearKey;
  }
  if (url.includes("/monitor/cache/clearCacheAll")) {
    return monitorMockData.cache.clearAll;
  }

  // Logininfor 相关接口
  if (url.includes("/monitor/logininfor/list")) {
    return monitorMockData.logininfor.list;
  }
  if (url.includes("/monitor/logininfor/") && method === "delete" && !url.includes("/unlock") && !url.includes("/clean")) {
    return monitorMockData.logininfor.delete;
  }
  if (url.includes("/monitor/logininfor/unlock/")) {
    return monitorMockData.logininfor.unlock;
  }
  if (url.includes("/monitor/logininfor/clean")) {
    return monitorMockData.logininfor.clean;
  }

  // Online 相关接口
  if (url.includes("/monitor/online/list")) {
    return monitorMockData.online.list;
  }
  if (url.includes("/monitor/online/") && method === "delete") {
    return monitorMockData.online.forceLogout;
  }

  // Operlog 相关接口
  if (url.includes("/monitor/operlog/list")) {
    return monitorMockData.operlog.list;
  }
  if (url.includes("/monitor/operlog/") && method === "delete" && !url.includes("/clean")) {
    return monitorMockData.operlog.delete;
  }
  if (url.includes("/monitor/operlog/clean")) {
    return monitorMockData.operlog.clean;
  }

  // Server 相关接口
  if (url.includes("/monitor/server")) {
    return monitorMockData.server.info;
  }

  // DataMonitor 数据监控看板相关接口
  if (url.includes("/monitor/dataMonitor/pipeline/status")) {
    return monitorMockData.dataMonitor.pipelineStatus;
  }
  if (url.includes("/monitor/dataMonitor/quality")) {
    return monitorMockData.dataMonitor.dataQuality;
  }
  if (url.includes("/monitor/dataMonitor/identity")) {
    return monitorMockData.dataMonitor.identityGovernance;
  }
  if (url.includes("/monitor/dataMonitor/business")) {
    return monitorMockData.dataMonitor.businessValue;
  }
  if (url.includes("/monitor/dataMonitor/apiLogs")) {
    return {
      code: "200",
      msg: "操作成功",
      data: monitorMockData.dataMonitor.businessValue.data.apiLogs
    };
  }
  if (url.includes("/monitor/dataMonitor/systemHealth")) {
    return monitorMockData.dataMonitor.systemHealth;
  }
  if (url.includes("/monitor/dataMonitor/refresh")) {
    return monitorMockData.dataMonitor.refresh;
  }

  // 默认返回空数据
  return { code: "200", msg: "操作成功", data: null };
}

/**
 * @description 获取 System 模块的 mock 数据
 */
function getSystemMockData(url: string, method: string, params: any) {
  // 参数配置相关接口
  if (url.includes("/config/list")) {
    return systemMockData.config.list;
  }
  if (
    url.includes("/config/") &&
    method === "get" &&
    !url.includes("/configKey") &&
    !url.includes("/refreshCache") &&
    !url.includes("/list")
  ) {
    const parts = url.split("/config/");
    const configId = parts[parts.length - 1];
    const detailData = JSON.parse(JSON.stringify(systemMockData.config.detail));
    if (detailData.data) {
      detailData.data.configId = configId ? parseInt(configId) : 1;
    }
    return detailData;
  }
  if (url.includes("/config/configKey/")) {
    return {
      code: 200,
      msg: "操作成功",
      data: "skin-blue"
    };
  }
  if (url.includes("/config") && method === "post" && !url.includes("/list")) {
    return systemMockData.config.add;
  }
  if (url.includes("/config") && method === "put" && !url.includes("/list")) {
    return systemMockData.config.update;
  }
  if (url.includes("/config/") && method === "delete" && !url.includes("/refreshCache") && !url.includes("/list")) {
    return systemMockData.config.delete;
  }
  if (url.includes("/config/refreshCache")) {
    return systemMockData.config.refreshCache;
  }

  // 通知公告相关接口
  if (url.includes("/notice/list")) {
    return systemMockData.notice.list;
  }
  if (url.includes("/notice/") && method === "get" && !url.includes("/list")) {
    const parts = url.split("/notice/");
    const noticeId = parts[parts.length - 1];
    const detailData = JSON.parse(JSON.stringify(systemMockData.notice.detail));
    if (detailData.data) {
      detailData.data.noticeId = noticeId ? parseInt(noticeId) : 1;
    }
    return detailData;
  }
  if (url.includes("/notice") && method === "post" && !url.includes("/list")) {
    return systemMockData.notice.add;
  }
  if (url.includes("/notice") && method === "put" && !url.includes("/list")) {
    return systemMockData.notice.update;
  }
  if (url.includes("/notice/") && method === "delete" && !url.includes("/list")) {
    return systemMockData.notice.delete;
  }

  // 操作日志相关接口
  if (url.includes("/operlog/list")) {
    return systemMockData.operlog.list;
  }
  if (url.includes("/operlog/") && method === "delete" && !url.includes("/clean") && !url.includes("/list")) {
    return systemMockData.operlog.delete;
  }
  if (url.includes("/operlog/clean")) {
    return systemMockData.operlog.clean;
  }

  // 登录日志相关接口
  if (url.includes("/logininfor/list")) {
    return systemMockData.logininfor.list;
  }
  if (
    url.includes("/logininfor/") &&
    method === "delete" &&
    !url.includes("/unlock") &&
    !url.includes("/clean") &&
    !url.includes("/list")
  ) {
    return systemMockData.logininfor.delete;
  }
  if (url.includes("/logininfor/unlock/")) {
    return systemMockData.logininfor.unlock;
  }
  if (url.includes("/logininfor/clean")) {
    return systemMockData.logininfor.clean;
  }

  // 字典类型相关接口
  if (url.includes("/system/dict/type/optionselect")) {
    return {
      code: 200,
      msg: "操作成功",
      data: [
        { dictId: 1, dictName: "客户性别", dictType: "sys_user_sex" },
        { dictId: 2, dictName: "菜单状态", dictType: "sys_show_hide" },
        { dictId: 3, dictName: "系统开关", dictType: "sys_normal_disable" }
      ]
    };
  }

  // 菜单相关接口
  if (url.includes("/system/menu/list")) {
    return {
      code: 200,
      msg: "操作成功",
      rows: [
        { menuId: 1, menuName: "系统管理", parentId: 0, orderNum: 1 },
        { menuId: 2, menuName: "客户管理", parentId: 1, orderNum: 1 },
        { menuId: 3, menuName: "角色管理", parentId: 1, orderNum: 2 }
      ],
      total: 3
    };
  }
  if (url.includes("/system/menu/treeselect")) {
    return {
      code: 200,
      msg: "操作成功",
      data: [
        {
          menuId: 1,
          menuName: "系统管理",
          parentId: 0,
          children: [
            { menuId: 2, menuName: "客户管理", parentId: 1 },
            { menuId: 3, menuName: "角色管理", parentId: 1 }
          ]
        }
      ]
    };
  }

  // 如果没有匹配到任何接口，返回 null 表示不拦截
  return null;
}

/**
 * @description 获取 Tool 模块的 mock 数据
 */
function getToolMockData(url: string, method: string, params: any) {
  // Gen 代码生成相关接口
  if (url.includes("/tool/gen/list")) {
    return toolMockData.gen.list;
  }
  if (url.includes("/tool/gen/db/list")) {
    return toolMockData.gen.dbList;
  }
  if (url.includes("/tool/gen/preview/")) {
    const tableId = url.split("/preview/")[1];
    return toolMockData.gen.preview;
  }
  if (
    url.includes("/tool/gen/") &&
    method === "get" &&
    !url.includes("/list") &&
    !url.includes("/preview") &&
    !url.includes("/genCode") &&
    !url.includes("/synchDb") &&
    !url.includes("/db/")
  ) {
    const tableId = url.split("/tool/gen/")[1];
    const detailData = JSON.parse(JSON.stringify(toolMockData.gen.detail));
    if (detailData.data && detailData.data.info) {
      detailData.data.info.tableId = tableId ? parseInt(tableId) : 1;
    }
    return detailData;
  }
  if (url.includes("/tool/gen/importTable")) {
    return toolMockData.gen.import;
  }
  if (url.includes("/tool/gen/createTable")) {
    return toolMockData.gen.create;
  }
  if (url.includes("/tool/gen") && method === "put") {
    return toolMockData.gen.update;
  }
  if (url.includes("/tool/gen/") && method === "delete") {
    return toolMockData.gen.delete;
  }
  if (url.includes("/tool/gen/genCode/")) {
    return toolMockData.gen.genCode;
  }
  if (url.includes("/tool/gen/synchDb/")) {
    return toolMockData.gen.synchDb;
  }

  // 默认返回空数据
  return { code: "200", msg: "操作成功", data: null };
}





/**
 * @description 获取 Segment 模块的 mock 数据
 */
function getSegmentMockData(url: string, method: string, params: any) {
  // 分群列表
  if (url.includes("/segment/list")) {
    const listData = JSON.parse(JSON.stringify(segmentMockData.list));
    const { pageNum = 1, pageSize = 10, name, status } = params || {};
    let filtered = listData.data.list;
    if (name) filtered = filtered.filter((i: any) => i.name.includes(name));
    if (status) filtered = filtered.filter((i: any) => i.status === status);
    const total = filtered.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    listData.data.list = filtered.slice(start, end);
    listData.data.total = total;
    return listData;
  }

  // 详情
  if (url.includes("/segment/detail/") && method === "get") {
    const detail = JSON.parse(JSON.stringify(segmentMockData.detail));
    return detail;
  }

  // 新增
  if (url.includes("/segment/add") && method === "post") {
    return segmentMockData.add;
  }

  // 编辑
  if (url.includes("/segment/edit") && method === "put") {
    return segmentMockData.edit;
  }

  // 估算
  if (url.includes("/segment/estimate") && method === "post") {
    return segmentMockData.estimate;
  }

  // 快照
  if (url.includes("/segment/") && url.includes("/snapshot") && method === "post") {
    return segmentMockData.snapshot;
  }

  // 导出
  if (url.includes("/segment/") && url.includes("/export") && method === "post") {
    return segmentMockData.export;
  }

  // 推送
  if (url.includes("/segment/") && url.includes("/push") && method === "post") {
    return segmentMockData.push;
  }

  return { code: "200", msg: "操作成功", data: null };
}

/**
 * @description 获取 TagManage 模块的 mock 数据
 */
function getTagManageMockData(url: string, method: string, params: any) {
  // 标签列表接口
  if (url.includes("/tag/list")) {
    let listData = JSON.parse(JSON.stringify(tagManageMockData.list));
    const { pageNum = 1, pageSize = 10, tagName, category, tagType, status } = params || {};

    // 前端筛选
    let filteredList = [...listData.data.list];
    if (tagName) {
      filteredList = filteredList.filter((item: any) => item.tagName.includes(tagName));
    }
    if (category) {
      filteredList = filteredList.filter((item: any) => item.category === category);
    }
    if (tagType) {
      filteredList = filteredList.filter((item: any) => item.tagType === tagType);
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => item.status === status);
    }

    // 分页
    const total = filteredList.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = filteredList.slice(start, end);

    listData.data.list = paginatedList;
    listData.data.total = total;

    return listData;
  }

  // 标签详情接口
  if (
    url.includes("/tag/") &&
    method === "get" &&
    !url.includes("/list") &&
    !url.includes("/simulate") &&
    !url.includes("/rollback") &&
    !url.includes("/publish") &&
    !url.includes("/disable") &&
    !url.includes("/abandon")
  ) {
    const tagId = url.split("/tag/")[1];
    const detailData = JSON.parse(JSON.stringify(tagManageMockData.detail));
    if (detailData.data) {
      detailData.data.tagId = tagId || "TAG-001";
    }
    return detailData;
  }

  // 新增标签接口
  if (url.includes("/tag/add") && method === "post") {
    return tagManageMockData.add;
  }

  // 编辑标签接口
  if (url.includes("/tag/edit") && method === "put") {
    return tagManageMockData.update;
  }

  // 删除标签接口
  if (url.includes("/tag/delete") && method === "delete") {
    return tagManageMockData.delete;
  }

  // 发布标签接口
  if (url.includes("/tag/publish") && method === "post") {
    return tagManageMockData.publish;
  }

  // 停用标签接口
  if (url.includes("/tag/disable") && method === "post") {
    return tagManageMockData.disable;
  }

  // 废弃标签接口
  if (url.includes("/tag/abandon") && method === "post") {
    return tagManageMockData.abandon;
  }

  // 模拟验证接口
  if (url.includes("/tag/simulate") && method === "post") {
    return tagManageMockData.simulate;
  }

  // 默认返回空数据
  return { code: "200", msg: "操作成功", data: null };
}

/**
 * @description 获取 LeadManagement 模块的 mock 数据
 */
function getLeadMockData(url: string, method: string, params: any) {
  // 商机列表接口
  if (url.includes("/lead/list")) {
    let listData = JSON.parse(JSON.stringify(leadManagementMockData.leadList));
    const {
      pageNum = 1,
      pageSize = 10,
      oneId,
      leadType,
      status,
      pushTarget,
      pushStatus,
      category,
      startDate,
      endDate
    } = params || {};

    // 前端筛选
    let filteredList = [...listData.data.list];
    if (oneId) {
      filteredList = filteredList.filter((item: any) => item.oneId && item.oneId.includes(oneId));
    }
    if (leadType) {
      filteredList = filteredList.filter((item: any) => item.leadType === leadType);
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => item.status === status);
    }
    if (pushTarget) {
      filteredList = filteredList.filter((item: any) => item.pushTarget === pushTarget);
    }
    if (pushStatus) {
      filteredList = filteredList.filter((item: any) => item.pushStatus === pushStatus);
    }
    if (category) {
      // 根据分类筛选（价值分层或生命周期）
      // 这里可以根据实际业务逻辑进行筛选
      // 暂时先不过滤，因为 mock 数据中没有 category 字段
    }
    if (startDate) {
      filteredList = filteredList.filter((item: any) => item.createdAt >= startDate);
    }
    if (endDate) {
      filteredList = filteredList.filter((item: any) => item.createdAt <= endDate);
    }

    // 分页
    const total = filteredList.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = filteredList.slice(start, end);

    listData.data.list = paginatedList;
    listData.data.total = total;

    return listData;
  }

  // 商机详情接口
  if (url.includes("/lead/detail/") && method === "get") {
    const leadId = url.split("/lead/detail/")[1];
    const listData = leadManagementMockData.leadList.data.list;
    const detail = listData.find((item: any) => item.id === leadId);
    if (detail) {
      return {
        code: 200,
        msg: "操作成功",
        data: detail
      };
    }
    return {
      code: 200,
      msg: "操作成功",
      data: listData[0]
    };
  }

  // 创建商机接口
  if (url.includes("/lead/create") && method === "post") {
    return leadManagementMockData.add;
  }

  // 批量推送接口
  if (url.includes("/lead/push") && method === "post") {
    return leadManagementMockData.push;
  }

  // 重载商机接口
  if (url.includes("/lead/reload/") && method === "post") {
    return leadManagementMockData.reload;
  }

  // 看板统计接口
  if (url.includes("/lead/dashboard/stats") && method === "get") {
    return leadManagementMockData.dashboard;
  }

  // 规则列表接口
  if (url.includes("/lead/rule/list")) {
    let listData = JSON.parse(JSON.stringify(leadManagementMockData.ruleList));
    const { pageNum = 1, pageSize = 10, enabled } = params || {};

    // 前端筛选
    let filteredList = [...listData.data.list];
    if (enabled !== undefined) {
      filteredList = filteredList.filter((item: any) => item.enabled === enabled);
    }

    // 分页
    const total = filteredList.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = filteredList.slice(start, end);

    listData.data.list = paginatedList;
    listData.data.total = total;

    return listData;
  }

  // 规则详情接口
  if (url.includes("/lead/rule/detail/") && method === "get") {
    const ruleId = url.split("/lead/rule/detail/")[1];
    const listData = leadManagementMockData.ruleList.data.list;
    const detail = listData.find((item: any) => item.id === ruleId);
    if (detail) {
      return {
        code: 200,
        msg: "操作成功",
        data: detail
      };
    }
    return {
      code: 200,
      msg: "操作成功",
      data: listData[0]
    };
  }

  // 保存规则接口
  if ((url.includes("/lead/rule/add") || url.includes("/lead/rule/edit")) && (method === "post" || method === "put")) {
    return params?.id ? leadManagementMockData.update : leadManagementMockData.add;
  }

  // 启用/禁用规则接口
  if (url.includes("/lead/rule/toggle/") && method === "put") {
    return leadManagementMockData.toggle;
  }

  // 删除规则接口
  if (url.includes("/lead/rule/delete/") && method === "delete") {
    return leadManagementMockData.delete;
  }

  // 审计日志列表接口
  if (url.includes("/lead/audit/list")) {
    let listData = JSON.parse(JSON.stringify(leadManagementMockData.auditList));
    const { pageNum = 1, pageSize = 10, leadId, oneId, operation, targetSystem, operator, startDate, endDate } = params || {};

    // 前端筛选
    let filteredList = [...listData.data.list];
    if (leadId) {
      filteredList = filteredList.filter((item: any) => item.leadId && item.leadId.includes(leadId));
    }
    if (oneId) {
      filteredList = filteredList.filter((item: any) => item.oneId && item.oneId.includes(oneId));
    }
    if (operation) {
      filteredList = filteredList.filter((item: any) => item.operation === operation);
    }
    if (targetSystem) {
      filteredList = filteredList.filter((item: any) => item.targetSystem === targetSystem);
    }
    if (operator) {
      filteredList = filteredList.filter((item: any) => item.operator && item.operator.includes(operator));
    }
    if (startDate) {
      filteredList = filteredList.filter((item: any) => item.operateTime >= startDate);
    }
    if (endDate) {
      filteredList = filteredList.filter((item: any) => item.operateTime <= endDate);
    }

    // 分页
    const total = filteredList.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = filteredList.slice(start, end);

    listData.data.list = paginatedList;
    listData.data.total = total;

    return listData;
  }

  // 审计日志详情接口
  if (url.includes("/lead/audit/detail/") && method === "get") {
    const auditId = url.split("/lead/audit/detail/")[1];
    const listData = leadManagementMockData.auditList.data.list;
    const detail = listData.find((item: any) => item.id === auditId);
    if (detail) {
      return {
        code: 200,
        msg: "操作成功",
        data: detail
      };
    }
    return {
      code: 200,
      msg: "操作成功",
      data: listData[0]
    };
  }

  return { code: "200", msg: "操作成功", data: null };
}

/**
 * @description 获取 CustomerSegmentation 模块的 mock 数据
 */
function getCustomerSegmentationMockData(url: string, method: string, params: any) {
  // 获取字段选项列表
  if (url.includes("/customer-segmentation/fields") && method === "get") {
    return customerSegmentationMockData.fieldOptions;
  }

  // 预估人数
  if (url.includes("/customer-segmentation/estimate") && method === "post") {
    return customerSegmentationMockData.estimate;
  }

  // 获取样本数据
  if (url.includes("/customer-segmentation/sample") && method === "post") {
    const { pageNum = 1, pageSize = 10 } = params || {};
    const sampleData = JSON.parse(JSON.stringify(customerSegmentationMockData.sample));
    // 模拟分页
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    sampleData.data.list = sampleData.data.list.slice(start, end);
    sampleData.data.pageNum = pageNum;
    sampleData.data.pageSize = pageSize;
    return sampleData;
  }

  // 保存草稿
  if (url.includes("/customer-segmentation/draft") && method === "post") {
    return customerSegmentationMockData.draft;
  }

  // 提交审核
  if (url.includes("/customer-segmentation/submit") && method === "post") {
    return customerSegmentationMockData.submit;
  }

  // 分群列表
  if (url.includes("/customer-segmentation/list") && method === "post") {
    return {
      code: 200,
      msg: "操作成功",
      data: {
        list: [],
        total: 0,
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10
      }
    };
  }

  // 分群详情
  if (url.includes("/customer-segmentation/detail/") && method === "get") {
    return {
      code: 200,
      msg: "操作成功",
      data: {
        id: url.split("/detail/")[1],
        name: "示例分群",
        description: "示例描述",
        businessReason: "示例业务理由",
        status: "draft",
        rulePayload: null,
        estimatedCount: 0,
        version: "V1.0",
        creator: "Admin",
        createdAt: new Date().toISOString()
      }
    };
  }

  // 导出
  if (url.includes("/customer-segmentation/") && url.includes("/export") && method === "post") {
    return {
      code: 200,
      msg: "操作成功",
      data: null
    };
  }

  // 推送到 BDC
  if (url.includes("/customer-segmentation/") && url.includes("/push/BDC外呼系统") && method === "post") {
    return {
      code: 200,
      msg: "操作成功",
      data: null
    };
  }

  // 推送到企微
  if (url.includes("/customer-segmentation/") && url.includes("/push/wecom") && method === "post") {
    return {
      code: 200,
      msg: "操作成功",
      data: null
    };
  }

  // 版本历史
  if (url.includes("/customer-segmentation/") && url.includes("/versions") && method === "get") {
    return {
      code: 200,
      msg: "操作成功",
      data: []
    };
  }

  return { code: "200", msg: "操作成功", data: null };
}

/**
 * @description 合并规则 mock 数据（OneID 合并阈值配置）
 */
const mergeRuleMockData = {
  list: [
    {
      id: "1",
      ruleName: "姓名+手机号完全一致",
      desc: "当姓名与手机号完全匹配时自动合并",
      threshold: 98,
      savedThreshold: 98,
      enabled: true,
      lastUpdate: "2024-01-15 10:30:00",
      operator: "Admin"
    },
    {
      id: "2",
      ruleName: "手机号+身份证一致",
      desc: "当手机号与身份证号一致时自动合并",
      threshold: 95,
      savedThreshold: 95,
      enabled: true,
      lastUpdate: "2024-01-14 14:20:00",
      operator: "Admin"
    },
    {
      id: "3",
      ruleName: "VIN码+手机号一致",
      desc: "当 VIN 码与手机号一致时自动合并",
      threshold: 92,
      savedThreshold: 92,
      enabled: true,
      lastUpdate: "2024-01-13 09:15:00",
      operator: "Operator"
    },
    {
      id: "4",
      ruleName: "姓名模糊+手机号一致",
      desc: "姓名模糊匹配且手机号一致（需人工复核）",
      threshold: 85,
      savedThreshold: 85,
      enabled: false,
      lastUpdate: "2024-01-12 16:45:00",
      operator: "Operator"
    }
  ]
};

function getMergeRuleMockData(url: string, method: string, params: any) {
  // 规则列表
  if (url.includes("/merge/rule/list") && method === "post") {
    return {
      code: 200,
      msg: "操作成功",
      data: {
        list: JSON.parse(JSON.stringify(mergeRuleMockData.list)),
        total: mergeRuleMockData.list.length
      }
    };
  }

  // 保存阈值
  if (url.includes("/merge/rule/saveThreshold/") && method === "put") {
    const ruleId = url.split("/saveThreshold/")[1]?.replace(/\?.*$/, "") || "";
    const rule = mergeRuleMockData.list.find(r => r.id === ruleId);
    if (rule) {
      rule.threshold = params?.threshold ?? rule.threshold;
      rule.savedThreshold = rule.threshold;
      rule.lastUpdate = new Date().toISOString().slice(0, 16).replace("T", " ");
      rule.operator = "当前用户";
    }
    return { code: 200, msg: "操作成功" };
  }

  // 启用/停用
  if (url.includes("/merge/rule/toggle/") && method === "put") {
    const ruleId = url.split("/toggle/")[1]?.replace(/\?.*$/, "") || "";
    const rule = mergeRuleMockData.list.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = params?.enabled ?? !rule.enabled;
      rule.lastUpdate = new Date().toISOString().slice(0, 16).replace("T", " ");
      rule.operator = "当前用户";
    }
    return { code: 200, msg: "操作成功" };
  }

  return { code: 200, msg: "操作成功", data: null };
}

/**
 * @description 获取 Collection 模块的 mock 数据
 */
function getCollectionMockData(url: string, method: string, params: any) {
  // 获取配置接口
  if (url.includes("/collection/config") && method === "get") {
    return collectionMockData.config;
  }

  // 保存配置接口
  if (url.includes("/collection/config") && (method === "post" || method === "put")) {
    return {
      code: 200,
      msg: "操作成功",
      data: {
        id: 1,
        schedules: params.schedules || [
          {
            stage: "T+0",
            time: "18:00",
            recipientType: "owner",
            recipientEmail: params.schedules?.[0]?.recipientEmail || "",
            description: "当天18:00前未上传，发送给操作人（唯一邮箱）"
          },
          {
            stage: "T+1",
            time: "9:00",
            recipientType: "owner",
            recipientEmail: params.schedules?.[1]?.recipientEmail || "",
            description: "第二天9:00发现未上传，发送给操作人（唯一邮箱），告知missing，要求补传"
          },
          {
            stage: "T+2",
            time: "9:00",
            recipientType: "dept_head",
            recipientEmail: params.schedules?.[2]?.recipientEmail || "",
            description: "后一天9:00仍未上传，发送给C360项目组数据专员（多个邮箱，用逗号分隔）"
          }
        ],
        ccEmail: params.ccEmail || "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: new Date().toISOString()
      }
    };
  }

  // 监控列表接口
  if (url.includes("/collection/monitor/list")) {
    let listData = JSON.parse(JSON.stringify(collectionMockData.monitorList));
    const { pageNum = 1, pageSize = 10, employeeName, email, status, dataSource, uploadStatus } = params || {};

    // 前端筛选
    let filteredList = [...listData.data.list];
    if (employeeName) {
      filteredList = filteredList.filter((item: any) => item.employeeName.includes(employeeName));
    }
    if (email) {
      filteredList = filteredList.filter((item: any) => item.email.includes(email));
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => item.status === status);
    }
    if (dataSource) {
      filteredList = filteredList.filter((item: any) => item.dataSource === dataSource);
    }
    if (uploadStatus) {
      filteredList = filteredList.filter((item: any) => item.uploadStatus === uploadStatus);
    }

    // 分页
    const total = filteredList.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = filteredList.slice(start, end);

    listData.data.list = paginatedList;
    listData.data.total = total;

    return listData;
  }

  // 发送催收通知接口
  if (url.includes("/collection/nudge") && method === "post") {
    return collectionMockData.nudgeSuccess;
  }

  // 获取员工列表接口
  if (url.includes("/collection/employees") && method === "get") {
    return collectionMockData.employeeList;
  }

  return { code: "200", msg: "操作成功", data: null };
}

/**
 * @description 获取数据质量工作台模块的 mock 数据
 */
function getDataQualityWorkbenchMockData(url: string, method: string, params: any) {
  // 上传文件并校验接口
  if (url.includes("/dataQuality/upload") && method === "post") {
    // 模拟错误场景（用于测试错误弹窗）
    // 可以根据需要切换不同的错误场景

    // 场景1: 返回有错误数据（推荐用于测试错误弹窗）
    return dataQualityWorkbenchMockData.uploadWithErrors;

    // 场景2: 表头不匹配错误（取消注释以测试）
    // return dataQualityWorkbenchMockData.uploadHeaderMismatch;

    // 场景3: 文件为空错误（取消注释以测试）
    // return dataQualityWorkbenchMockData.uploadFileEmpty;

    // 场景4: 校验成功（取消注释以测试成功场景）
    // return dataQualityWorkbenchMockData.uploadSuccess;
  }

  // 下载模板接口
  if (url.includes("/dataQuality/template/") && method === "get") {
    // 返回一个模拟的blob
    return new Blob(["模板内容"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }

  // 导入正确数据接口
  if (url.includes("/dataQuality/import/valid") && method === "post") {
    return { code: 200, msg: "已成功导入正确数据", data: null };
  }

  // 提交所有数据接口
  if (url.includes("/dataQuality/submit/all") && method === "post") {
    return { code: 200, msg: "已成功提交所有数据", data: null };
  }

  // 获取操作追溯日志接口
  if (url.includes("/dataQuality/audit/log") && method === "get") {
    return dataQualityWorkbenchMockData.auditLog;
  }

  return { code: "200", msg: "操作成功", data: null };
}

class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const requestUrl = config.url || "";

        // System 模块 mock 数据处理（需要放在最前面）
        // 先检查是否是我们要 mock 的接口
        if (
          requestUrl.includes("/system/config") ||
          requestUrl.includes("/system/notice") ||
          requestUrl.includes("/monitor/operlog") ||
          requestUrl.includes("/monitor/logininfor")
        ) {
          const mockData = getSystemMockData(requestUrl, config.method || "get", config.params || {});
          // 如果返回了有效的 mock 数据，则拦截请求
          if (mockData !== null && mockData !== undefined && mockData.code !== undefined) {
            return Promise.reject({ isMock: true, mockData, config });
          }
          // 如果没有匹配到，继续正常请求流程（不拦截）
        }

        // Monitor 模块 mock 数据处理 - 在请求拦截器中拦截，直接返回 mock 数据
        // 注意：需要排除 operlog 和 logininfor，因为它们已经在上面处理了
        if (requestUrl.includes("/monitor/") && !requestUrl.includes("/operlog") && !requestUrl.includes("/logininfor")) {
          const mockData = getMonitorMockData(requestUrl, config.method || "get", config.params || {});
          // 创建一个模拟的响应对象
          const mockResponse = {
            data: mockData,
            status: 200,
            statusText: "OK",
            headers: {},
            config: config
          };
          // 抛出特殊错误，在响应拦截器中捕获并返回 mock 数据
          return Promise.reject({ isMock: true, mockData, config });
        }

        // Tool 模块 mock 数据处理 - 在请求拦截器中拦截，直接返回 mock 数据
        if (requestUrl.includes("/tool/")) {
          const mockData = getToolMockData(requestUrl, config.method || "get", config.params || {});
          // 抛出特殊错误，在响应拦截器中捕获并返回 mock 数据
          return Promise.reject({ isMock: true, mockData, config });
        }





        // Segment 模块 mock 数据处理
        if (requestUrl.includes("/segment/")) {
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getSegmentMockData(requestUrl, config.method || "get", requestParams);
          return Promise.reject({ isMock: true, mockData, config });
        }

        // TagManage 模块 mock 数据处理 - 在请求拦截器中拦截，直接返回 mock 数据
        if (requestUrl.includes("/tag/")) {
          // get请求的params在config.params中，post请求的params在config.data中
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getTagManageMockData(requestUrl, config.method || "get", requestParams);
          // 抛出特殊错误，在响应拦截器中捕获并返回 mock 数据
          return Promise.reject({ isMock: true, mockData, config });
        }

        // LeadManagement 模块 mock 数据处理 - 在请求拦截器中拦截，直接返回 mock 数据
        if (requestUrl.includes("/lead/")) {
          // get请求的params在config.params中，post请求的params在config.data中
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getLeadMockData(requestUrl, config.method || "get", requestParams);
          // 抛出特殊错误，在响应拦截器中捕获并返回 mock 数据
          return Promise.reject({ isMock: true, mockData, config });
        }

        // CustomerSegmentation 模块 mock 数据处理
        if (requestUrl.includes("/customer-segmentation/")) {
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getCustomerSegmentationMockData(requestUrl, config.method || "get", requestParams);
          return Promise.reject({ isMock: true, mockData, config });
        }

        // Collection 模块 mock 数据处理
        if (requestUrl.includes("/collection/")) {
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getCollectionMockData(requestUrl, config.method || "get", requestParams);
          return Promise.reject({ isMock: true, mockData, config });
        }

        // DataQualityWorkbench 模块 mock 数据处理
        if (requestUrl.includes("/dataQuality/")) {
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getDataQualityWorkbenchMockData(requestUrl, config.method || "get", requestParams);
          return Promise.reject({ isMock: true, mockData, config });
        }

        // Merge 合并规则模块 mock 数据处理
        if (requestUrl.includes("/merge/")) {
          const requestParams = (config.method || "get").toLowerCase() === "get" ? config.params || {} : config.data || {};
          const mockData = getMergeRuleMockData(requestUrl, config.method || "get", requestParams);
          return Promise.reject({ isMock: true, mockData, config });
        }

        const userStore = useUserStore();
        // 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
        config.cancel ??= true;
        config.cancel && axiosCanceler.addPending(config);
        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        config.loading ??= true;
        config.loading && showFullScreenLoading();
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("x-access-token", userStore.token);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data, config } = response;

        const userStore = useUserStore();
        axiosCanceler.removePending(config);
        config.loading && tryHideFullScreenLoading();

        // 如果是菜单列表接口，使用本地 JSON 数据替换
        // 匹配 /geeker/menu/list 或 /menu/list
        const requestUrl = config.url || "";
        if (requestUrl.includes("/menu/list")) {
          return authMenuList;
        }

        // 登录失效
        if (data.code == ResultEnum.OVERDUE) {
          userStore.setToken("");
          router.replace(LOGIN_URL);
          ElMessage.error(data.msg);
          return Promise.reject(data);
        }
        // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          ElMessage.error(data.msg);
          return Promise.reject(data);
        }
        // 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
        return data;
      },
      async (error: AxiosError & { isMock?: boolean; mockData?: any; config?: CustomAxiosRequestConfig }) => {
        // 如果是 mock 数据，直接返回
        if (error.isMock && error.mockData) {
          const config = error.config as CustomAxiosRequestConfig;
          axiosCanceler.removePending(config);
          config.loading && tryHideFullScreenLoading();
          // 响应拦截器在成功的情况下会直接返回 data（第 419 行）
          // useTable 期望解构 { data }，所以返回的应该是 { data: mockData }
          // 但是响应拦截器在成功的情况下会直接返回 data，所以这里直接返回 mockData
          // 这样 useTable 收到的就是 mockData，然后解构 { data } 会得到 undefined
          // 所以我们需要确保 mockData 的格式是正确的，或者修改响应拦截器
          // 实际上，响应拦截器在成功的情况下会直接返回 data，所以这里直接返回 mockData
          // 这意味着 useTable 收到的就是 mockData，然后解构 { data } 会得到 undefined
          // 所以我们需要确保 mockData 的格式是正确的，或者修改响应拦截器
          // 但是，实际上响应拦截器在成功的情况下会直接返回 data，所以这里直接返回 mockData
          // 这意味着 useTable 收到的就是 mockData，然后解构 { data } 会得到 undefined
          // 所以我们需要确保 mockData 的格式是正确的，或者修改响应拦截器
          return error.mockData;
        }

        const { response } = error;
        tryHideFullScreenLoading();
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf("timeout") !== -1) ElMessage.error("请求超时！请您稍后重试");
        if (error.message.indexOf("Network Error") !== -1) ElMessage.error("网络错误！请您稍后重试");
        // 根据服务器响应的错误状态码，做不同的处理
        if (response) checkStatus(response.status);
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object });
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: "blob" });
  }
}

export default new RequestHttp(config);

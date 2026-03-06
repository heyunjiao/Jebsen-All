import { createI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";

// 导入所有模块的翻译文件


import authZh from "./modules/auth/zh";
import authZhTW from "./modules/auth/zh-TW";
import authEn from "./modules/auth/en";

import collectionZh from "./modules/collection/zh";
import collectionZhTW from "./modules/collection/zh-TW";
import collectionEn from "./modules/collection/en";

import commonZh from "./modules/common/zh";
import commonZhTW from "./modules/common/zh-TW";
import commonEn from "./modules/common/en";

import customerZh from "./modules/customer/zh";
import customerZhTW from "./modules/customer/zh-TW";
import customerEn from "./modules/customer/en";

import customerSegmentationZh from "./modules/customerSegmentation/zh";
import customerSegmentationZhTW from "./modules/customerSegmentation/zh-TW";
import customerSegmentationEn from "./modules/customerSegmentation/en";

import dashboardZh from "./modules/dashboard/zh";
import dashboardZhTW from "./modules/dashboard/zh-TW";
import dashboardEn from "./modules/dashboard/en";

import dataQualityWorkbenchZh from "./modules/dataQualityWorkbench/zh";
import dataQualityWorkbenchZhTW from "./modules/dataQualityWorkbench/zh-TW";
import dataQualityWorkbenchEn from "./modules/dataQualityWorkbench/en";

import errorCorrectionZh from "./modules/errorCorrection/zh";
import errorCorrectionZhTW from "./modules/errorCorrection/zh-TW";
import errorCorrectionEn from "./modules/errorCorrection/en";

import headerZh from "./modules/header/zh";
import headerZhTW from "./modules/header/zh-TW";
import headerEn from "./modules/header/en";

import homeZh from "./modules/home/zh";
import homeZhTW from "./modules/home/zh-TW";
import homeEn from "./modules/home/en";

import layoutZh from "./modules/layout/zh";
import layoutZhTW from "./modules/layout/zh-TW";
import layoutEn from "./modules/layout/en";

import leadManagementZh from "./modules/leadManagement/zh";
import leadManagementZhTW from "./modules/leadManagement/zh-TW";
import leadManagementEn from "./modules/leadManagement/en";

import loginZh from "./modules/login/zh";
import loginZhTW from "./modules/login/zh-TW";
import loginEn from "./modules/login/en";

import operationZh from "./modules/operation/zh";
import operationZhTW from "./modules/operation/zh-TW";
import operationEn from "./modules/operation/en";

import menuManageZh from "./modules/menuManage/zh";
import menuManageZhTW from "./modules/menuManage/zh-TW";
import menuManageEn from "./modules/menuManage/en";

import monitorZh from "./modules/monitor/zh";
import monitorZhTW from "./modules/monitor/zh-TW";
import monitorEn from "./modules/monitor/en";

import paginationZh from "./modules/pagination/zh";
import paginationZhTW from "./modules/pagination/zh-TW";
import paginationEn from "./modules/pagination/en";

import ruleConfigZh from "./modules/ruleConfig/zh";
import ruleConfigZhTW from "./modules/ruleConfig/zh-TW";
import ruleConfigEn from "./modules/ruleConfig/en";

import segmentManageZh from "./modules/segmentManage/zh";
import segmentManageZhTW from "./modules/segmentManage/zh-TW";
import segmentManageEn from "./modules/segmentManage/en";

import systemZh from "./modules/system/zh";
import systemZhTW from "./modules/system/zh-TW";
import systemEn from "./modules/system/en";

import tabsZh from "./modules/tabs/zh";
import tabsZhTW from "./modules/tabs/zh-TW";
import tabsEn from "./modules/tabs/en";

import tagManageZh from "./modules/tagManage/zh";
import tagManageZhTW from "./modules/tagManage/zh-TW";
import tagManageEn from "./modules/tagManage/en";

import welcomeZh from "./modules/welcome/zh";
import welcomeZhTW from "./modules/welcome/zh-TW";
import welcomeEn from "./modules/welcome/en";

// 合并所有模块的翻译
const mergeMessages = (...modules: any[]) => {
  return modules.reduce((acc, module) => {
    return { ...acc, ...module };
  }, {});
};

// 构建多语言消息对象
const messages = {
  zh: mergeMessages(
    authZh,
    collectionZh,
    commonZh,
    customerZh,
    customerSegmentationZh,
    dashboardZh,
    dataQualityWorkbenchZh,
    errorCorrectionZh,
    headerZh,
    homeZh,
    layoutZh,
    leadManagementZh,
    loginZh,
    menuManageZh,
    monitorZh,
    paginationZh,
    ruleConfigZh,
    segmentManageZh,
    systemZh,
    tabsZh,
    tagManageZh,
    welcomeZh,
    operationZh
  ),
  "zh-TW": mergeMessages(
    authZhTW,
    collectionZhTW,
    commonZhTW,
    customerZhTW,
    customerSegmentationZhTW,
    dashboardZhTW,
    dataQualityWorkbenchZhTW,
    errorCorrectionZhTW,
    headerZhTW,
    homeZhTW,
    layoutZhTW,
    leadManagementZhTW,
    loginZhTW,
    menuManageZhTW,
    monitorZhTW,
    paginationZhTW,
    ruleConfigZhTW,
    segmentManageZhTW,
    systemZhTW,
    tabsZhTW,
    tagManageZhTW,
    welcomeZhTW,
    operationZhTW
  ),
  en: mergeMessages(
    authEn,
    collectionEn,
    commonEn,
    customerEn,
    customerSegmentationEn,
    dashboardEn,
    dataQualityWorkbenchEn,
    errorCorrectionEn,
    headerEn,
    homeEn,
    layoutEn,
    leadManagementEn,
    loginEn,
    menuManageEn,
    monitorEn,
    paginationEn,
    ruleConfigEn,
    segmentManageEn,
    systemEn,
    tabsEn,
    tagManageEn,
    welcomeEn,
    operationEn
  )
};

const i18n = createI18n({
  // Use Composition API, Set to false
  allowComposition: true,
  legacy: false,
  locale: getBrowserLang(),
  messages
});

export default i18n;

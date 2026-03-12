import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (静态路由)
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: HOME_URL
  },
  {
    path: LOGIN_URL,
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录"
    }
  },
  {
    path: "/layout",
    name: "layout",
    component: () => import("@/layouts/index.vue"),
    // component: () => import("@/layouts/indexAsync.vue"),
    redirect: HOME_URL,
    children: [
      {
        path: "/home/index",
        name: "home",
        component: () => import("@/views/welcome/index.vue"),
        meta: {
          title: "源数据采集",
          isKeepAlive: true,
          isAffix: true
        }
      },
      {
        path: "/errorCorrection",
        name: "errorCorrection",
        component: () => import("@/views/errorCorrection/index.vue"),
        meta: {
          title: "异常中心",
          isKeepAlive: true
        }
      },
      {
        path: "/segmentManage",
        name: "segmentManage",
        component: () => import("@/views/segmentManage/index.vue"),
        meta: {
          title: "分群管理",
          isKeepAlive: true
        }
      },
      {
        path: "/customerSegmentation",
        name: "customerSegmentation",
        component: () => import("@/views/customerSegmentation/index.vue"),
        meta: {
          title: "客户筛选与分群",
          isKeepAlive: true
        }
      },
      {
        path: "/tagManage",
        name: "tagManage",
        component: () => import("@/views/tagManage/index.vue"),
        meta: {
          title: "标签管理",
          isKeepAlive: true
        }
      },
      {
        path: "/dashboard/dataMonitor",
        name: "dataMonitor",
        component: () => import("@/views/dashboard/dataMonitor/index.vue"),
        meta: {
          title: "源数据采集看板",
          isKeepAlive: true
        }
      },
      {
        path: "/collection/config",
        name: "collectionConfig",
        component: () => import("@/views/collection/config/index.vue"),
        meta: {
          title: "催收配置",
          isKeepAlive: true
        }
      },
      {
        path: "/collection/monitor",
        name: "collectionMonitor",
        component: () => import("@/views/collection/monitor/index.vue"),
        meta: {
          title: "催收监控",
          isKeepAlive: true
        }
      },
      {
        path: "/system/dict-data/index/:dictId",
        name: "dictData",
        component: () => import("@/views/system/dictManage/data.vue"),
        meta: {
          title: "字典数据",
          isHide: true
        }
      }
    ]
  }
];

/**
 * errorRouter (错误页面路由)
 */
export const errorRouter = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/components/ErrorMessage/403.vue"),
    meta: {
      title: "403页面"
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/components/ErrorMessage/404.vue"),
    meta: {
      title: "404页面"
    }
  },
  {
    path: "/500",
    name: "500",
    component: () => import("@/components/ErrorMessage/500.vue"),
    meta: {
      title: "500页面"
    }
  },
  // Resolve refresh page, route warnings
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/ErrorMessage/404.vue")
  }
];

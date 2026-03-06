import router from "@/routers/index";
import { LOGIN_URL } from "@/config";
import { RouteRecordRaw } from "vue-router";
import { ElNotification } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";

// 引入 views 文件夹下所有 vue 文件
const modules = import.meta.glob("@/views/**/*.vue");

/**
 * @description 初始化动态路由
 */
export const initDynamicRouter = async () => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  try {
    // 1.获取菜单列表 && 按钮权限列表
    await authStore.getAuthMenuList();
    await authStore.getAuthButtonList();

    // 2.判断当前客户有没有菜单权限
    if (!authStore.authMenuListGet.length) {
      ElNotification({
        title: "无权限访问",
        message: "当前账号无任何菜单权限，请联系系统管理员！",
        type: "warning",
        duration: 3000
      });
      userStore.setToken("");
      router.replace(LOGIN_URL);
      return Promise.reject("No permission");
    }

    // 3.添加动态路由
    authStore.flatMenuListGet.forEach(item => {
      // 跳过无效的路由项
      if (!item || !item.path) {
        console.warn(`路由项无效，已跳过`);
        return;
      }

      // 检查路由是否已存在（静态路由中已定义的路由，如 home）
      const existingRoute = router.getRoutes().find(route => route.path === item.path && route.name === item.name);
      if (existingRoute) {
        // 如果路由已存在，跳过添加（静态路由优先级更高）
        console.log(`路由 ${item.path} 已在静态路由中定义，跳过动态添加`);
        return;
      }

      item.children && delete item.children;

      // 处理 component 属性
      if (item.component && typeof item.component == "string") {
        // import.meta.glob 返回的键格式是 @/views/...，所以使用别名路径
        const componentPath = "@/views" + item.component + ".vue";
        const componentModule = modules[componentPath];
        if (componentModule) {
          item.component = componentModule;
        } else {
          // 如果别名路径找不到，尝试绝对路径（兼容旧代码）
          const absolutePath = "/src/views" + item.component + ".vue";
          const absoluteModule = modules[absolutePath];
          if (absoluteModule) {
            item.component = absoluteModule;
          } else {
            console.warn(`路由组件未找到: ${componentPath} 或 ${absolutePath}，路由: ${item.path}`);
            // 如果组件不存在，跳过该路由
            return;
          }
        }
      }

      // 确保 component 存在或者是函数（动态导入）
      if (!item.component || item.component === null) {
        console.warn(`路由缺少 component 属性，路由: ${item.path}`);
        return;
      }

      // 确保 meta 存在
      if (!item.meta) {
        console.warn(`路由缺少 meta 属性，路由: ${item.path}`);
        return;
      }

      if (item.meta.isFull) {
        router.addRoute(item as unknown as RouteRecordRaw);
      } else {
        router.addRoute("layout", item as unknown as RouteRecordRaw);
      }
    });
  } catch (error) {
    // 当按钮 || 菜单请求出错时，重定向到登陆页
    userStore.setToken("");
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
};

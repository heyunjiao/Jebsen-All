/* Menu - 与 src/assets/json/authMenuList.json 结构一致 */
declare namespace Menu {
  /** 单条菜单项：路由 + 菜单信息 + 组件路径 */
  interface MenuOptions {
    /** 路由路径 */
    path: string;
    /** 路由名称（唯一，用于 keepAlive、权限等） */
    name: string;
    /** 组件路径（相对 views 的路径，如 /welcome/index） */
    component?: string | (() => Promise<unknown>);
    /** 重定向路径（有 children 时通常配置） */
    redirect?: string;
    /** 菜单展示与行为配置 */
    meta: MetaProps;
    /** 子菜单（多级递归） */
    children?: MenuOptions[];
  }
  /** 菜单元信息（侧栏标题、图标、是否缓存等） */
  interface MetaProps {
    /** 菜单图标（Element Plus 图标名） */
    icon: string;
    /** 菜单标题（侧栏展示） */
    title: string;
    /** 外链地址，空字符串表示非外链（authMenuList.json 中必有） */
    isLink?: string;
    /** 是否在侧栏隐藏 */
    isHide: boolean;
    /** 是否全屏显示 */
    isFull: boolean;
    /** 是否固定在标签页 */
    isAffix: boolean;
    /** 是否缓存页面 */
    isKeepAlive: boolean;
    /** 详情页高亮父菜单 path（可选） */
    activeMenu?: string;
  }
  /** 角色菜单树接口返回结构（与 authMenuList.json 根结构一致） */
  interface AuthMenuListResponse {
    code: number;
    data: MenuOptions[];
    msg: string;
  }
}

/* FileType - 避免与 DOM File 类型冲突 */
declare namespace FileType {
  type ImageMimeType =
    | "image/apng"
    | "image/bmp"
    | "image/gif"
    | "image/jpeg"
    | "image/pjpeg"
    | "image/png"
    | "image/svg+xml"
    | "image/tiff"
    | "image/webp"
    | "image/x-icon";

  type ExcelMimeType = "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

/* Vite */
declare type Recordable<T = any> = Record<string, T>;

declare interface ViteEnv {
  VITE_USER_NODE_ENV: "development" | "production" | "test";
  VITE_GLOB_APP_TITLE: string;
  VITE_PORT: number;
  VITE_OPEN: boolean;
  VITE_REPORT: boolean;
  VITE_ROUTER_MODE: "hash" | "history";
  VITE_BUILD_COMPRESS: "gzip" | "brotli" | "gzip,brotli" | "none";
  VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean;
  VITE_DROP_CONSOLE: boolean;
  VITE_PWA: boolean;
  VITE_DEVTOOLS: boolean;
  VITE_PUBLIC_PATH: string;
  VITE_API_URL: string;
  VITE_PROXY: [string, string][];
  VITE_CODEINSPECTOR: boolean;
}

interface ImportMetaEnv extends ViteEnv {
  __: unknown;
}

/* __APP_INFO__ */
declare const __APP_INFO__: {
  pkg: {
    name: string;
    version: string;
    dependencies: Recordable<string>;
    devDependencies: Recordable<string>;
  };
  lastBuildTime: string;
};

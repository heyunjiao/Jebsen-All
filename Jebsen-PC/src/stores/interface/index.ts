export type LayoutType = "vertical" | "classic" | "transverse" | "columns";

export type AssemblySizeType = "large" | "default" | "small";

export type LanguageType = "zh" | "zh-TW" | "en" | null;

/* GlobalState */
export interface GlobalState {
  layout: LayoutType;
  assemblySize: AssemblySizeType;
  language: LanguageType;
  maximize: boolean;
  primary: string;
  isDark: boolean;
  isGrey: boolean;
  isWeak: boolean;
  asideInverted: boolean;
  headerInverted: boolean;
  isCollapse: boolean;
  accordion: boolean;
  watermark: boolean;
  breadcrumb: boolean;
  breadcrumbIcon: boolean;
  tabs: boolean;
  tabsIcon: boolean;
  footer: boolean;
}

/** 门店信息（支持后续多品牌扩展：可增加 brandId/brandName） */
export interface StoreInfo {
  storeId: string;
  storeName: string;
  brandId?: string;
  brandName?: string;
}

/* UserState */
export interface UserState {
  token: string;
  userInfo: {
    name: string;
    role?: "admin" | "user"; // admin：管理员可选全部门店/单店；user：门店人员仅本店
    /** 当前用户所属门店（门店人员必填；管理员可为空，表示可看全部门店） */
    storeId?: string;
    storeName?: string;
    /** 管理员可见门店列表（后端按权限下发）；门店人员仅一条；后续多品牌可在此按品牌分组 */
    storeList?: StoreInfo[];
  };
}

/* tabsMenuProps */
export interface TabsMenuProps {
  icon: string;
  title: string;
  path: string;
  name: string;
  close: boolean;
  isKeepAlive: boolean;
}

/* TabsState */
export interface TabsState {
  tabsMenuList: TabsMenuProps[];
}

/* AuthState */
export interface AuthState {
  routeName: string;
  authButtonList: {
    [key: string]: string[];
  };
  authMenuList: Menu.MenuOptions[];
}

/* KeepAliveState */
export interface KeepAliveState {
  keepAliveName: string[];
}

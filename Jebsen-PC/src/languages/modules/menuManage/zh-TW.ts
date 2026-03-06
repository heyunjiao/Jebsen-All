export default {
  menuManage: {
    add: "新增菜單",
    edit: "修改菜單",
    delete: "刪除",
    fold: "折疊",
    expand: "展開",
    cancel: "取消",
    confirm: "確定",
    table: {
      menuName: "菜單名稱",
      icon: "圖示",
      order: "排序",
      permission: "權限標識",
      componentPath: "組件路徑",
      status: "狀態",
      createTime: "建立時間",
      operation: "操作"
    },
    status: {
      normal: "正常",
      disable: "停用",
      show: "顯示",
      hide: "隱藏"
    },
    type: {
      directory: "目錄",
      menu: "菜單",
      button: "按鈕"
    },
    bool: {
      yes: "是",
      no: "否",
      cache: "快取",
      noCache: "不快取"
    },
    input: {
      menuName: "請輸入菜單名稱",
      routeName: "請輸入路由名稱",
      icon: "請輸入圖示名稱",
      routerPath: "請輸入路由位址",
      componentPath: "請輸入組件路徑",
      permission: "請輸入權限標識",
      routerParams: "請輸入路由參數",
      selectParent: "選擇上級菜單"
    },
    label: {
      parentMenu: "上級菜單",
      menuType: "菜單類型",
      menuIcon: "菜單圖示",
      order: "顯示排序",
      menuName: "菜單名稱",
      routeName: "路由名稱",
      isFrame: "是否外鏈",
      routerPath: "路由位址",
      componentPath: "組件路徑",
      permission: "權限字符",
      routerParams: "路由參數",
      isCache: "是否快取",
      visible: "顯示狀態",
      menuStatus: "菜單狀態"
    },
    tooltip: {
      routeName: "默認不填則和路由位址相同",
      isFrame: "選擇是外鏈則路由位址需要以`http(s)://`開頭",
      routerPath: "訪問的路由位址，如：`user`",
      componentPath: "訪問的組件路徑，如：`system/user/index`",
      permission: "控制器中定義的權限字符",
      routerParams: '訪問路由的默認傳遞參數，如：`{"id": 1}`',
      isCache: "選擇是則會被`keep-alive`快取",
      visible: "選擇隱藏則路由將不會出現在側邊欄",
      status: "選擇停用則路由將不會出現在側邊欄"
    },
    message: {
      menuNameRequired: "菜單名稱不能為空",
      orderRequired: "菜單順序不能為空",
      pathRequired: "路由位址不能為空",
      addSuccess: "新增成功",
      updateSuccess: "修改成功",
      deleteSuccess: "刪除成功",
      deleteConfirm: "是否確認刪除名稱為“{name}”的數據項？",
      title: "提示"
    }
  }
};

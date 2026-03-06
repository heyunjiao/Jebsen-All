export default {
  menuManage: {
    add: "新增菜单",
    edit: "修改菜单",
    delete: "删除",
    fold: "折叠",
    expand: "展开",
    cancel: "取消",
    confirm: "确定",
    table: {
      menuName: "菜单名称",
      icon: "图标",
      order: "排序",
      permission: "权限标识",
      componentPath: "组件路径",
      status: "状态",
      createTime: "创建时间",
      operation: "操作"
    },
    status: {
      normal: "正常",
      disable: "停用",
      show: "显示",
      hide: "隐藏"
    },
    type: {
      directory: "目录",
      menu: "菜单",
      button: "按钮"
    },
    bool: {
      yes: "是",
      no: "否",
      cache: "缓存",
      noCache: "不缓存"
    },
    input: {
      menuName: "请输入菜单名称",
      routeName: "请输入路由名称",
      icon: "请输入图标名称",
      routerPath: "请输入路由地址",
      componentPath: "请输入组件路径",
      permission: "请输入权限标识",
      routerParams: "请输入路由参数",
      selectParent: "选择上级菜单"
    },
    label: {
      parentMenu: "上级菜单",
      menuType: "菜单类型",
      menuIcon: "菜单图标",
      order: "显示排序",
      menuName: "菜单名称",
      routeName: "路由名称",
      isFrame: "是否外链",
      routerPath: "路由地址",
      componentPath: "组件路径",
      permission: "权限字符",
      routerParams: "路由参数",
      isCache: "是否缓存",
      visible: "显示状态",
      menuStatus: "菜单状态"
    },
    tooltip: {
      routeName: "默认不填则和路由地址相同",
      isFrame: "选择是外链则路由地址需要以`http(s)://`开头",
      routerPath: "访问的路由地址，如：`user`",
      componentPath: "访问的组件路径，如：`system/user/index`",
      permission: "控制器中定义的权限字符",
      routerParams: '访问路由的默认传递参数，如：`{"id": 1}`',
      isCache: "选择是则会被`keep-alive`缓存",
      visible: "选择隐藏则路由将不会出现在侧边栏",
      status: "选择停用则路由将不会出现在侧边栏"
    },
    message: {
      menuNameRequired: "菜单名称不能为空",
      orderRequired: "菜单顺序不能为空",
      pathRequired: "路由地址不能为空",
      addSuccess: "新增成功",
      updateSuccess: "修改成功",
      deleteSuccess: "删除成功",
      deleteConfirm: "是否确认删除名称为“{name}”的数据项？",
      title: "提示"
    }
  }
};

export default {
  menuManage: {
    add: "Add Menu",
    edit: "Edit Menu",
    delete: "Delete",
    fold: "Collapse",
    expand: "Expand",
    cancel: "Cancel",
    confirm: "Confirm",
    table: {
      menuName: "Menu Name",
      icon: "Icon",
      order: "Order",
      permission: "Permission",
      componentPath: "Component Path",
      status: "Status",
      createTime: "Create Time",
      operation: "Operation"
    },
    status: {
      normal: "Normal",
      disable: "Disable",
      show: "Show",
      hide: "Hide"
    },
    type: {
      directory: "Directory",
      menu: "Menu",
      button: "Button"
    },
    bool: {
      yes: "Yes",
      no: "No",
      cache: "Cache",
      noCache: "No Cache"
    },
    input: {
      menuName: "Please input menu name",
      routeName: "Please input route name",
      icon: "Please input icon name",
      routerPath: "Please input router path",
      componentPath: "Please input component path",
      permission: "Please input permission identifier",
      routerParams: "Please input router params",
      selectParent: "Select parent menu"
    },
    label: {
      parentMenu: "Parent Menu",
      menuType: "Menu Type",
      menuIcon: "Menu Icon",
      order: "Order",
      menuName: "Menu Name",
      routeName: "Route Name",
      isFrame: "Is Link",
      routerPath: "Router Path",
      componentPath: "Component Path",
      permission: "Permission",
      routerParams: "Router Params",
      isCache: "Is Cache",
      visible: "Visible",
      menuStatus: "Menu Status"
    },
    tooltip: {
      routeName: "Defaults to the same as the route address if not filled",
      isFrame: "If yes is selected, the route address needs to start with `http(s)://`",
      routerPath: "Access route address, e.g. `user`",
      componentPath: "Access component path, e.g. `system/user/index`",
      permission: "Permission character defined in the controller",
      routerParams: 'Default passed parameters for route access, e.g. `{"id": 1}`',
      isCache: "If yes is selected, it will be cached by `keep-alive`",
      visible: "If hidden is selected, the route will not appear in the sidebar",
      status: "If disabled is selected, the route will not appear in the sidebar"
    },
    message: {
      menuNameRequired: "Menu name cannot be empty",
      orderRequired: "Menu order cannot be empty",
      pathRequired: "Router path cannot be empty",
      addSuccess: "Added successfully",
      updateSuccess: "Modified successfully",
      deleteSuccess: "Deleted successfully",
      deleteConfirm: 'Are you sure you want to delete the data item named "{name}"?',
      title: "Hint"
    }
  }
};

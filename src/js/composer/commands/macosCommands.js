import { newVarInputVal } from "js/composer/varInputValManager";

const windowOutputStructure = {
  name: { label: "应用名称", suggestName: "appName" },
  displayedName: {
    label: "应用显示名称",
    suggestName: "appDisplayName",
  },
  path: { label: "应用路径", suggestName: "appPath" },
  version: { label: "应用版本", suggestName: "appVersion" },
  pid: { label: "应用进程ID", suggestName: "appPid" },
  backgroundOnly: {
    label: "是否后台运行",
    suggestName: "appBackgroundOnly",
  },
  visible: { label: "是否可见", suggestName: "appVisible" },
  frontmost: { label: "是否前台运行", suggestName: "appFrontmost" },
  window: {
    label: "窗口信息",
    name: { label: "窗口名称", suggestName: "windowName" },
    title: { label: "窗口标题", suggestName: "windowTitle" },
    index: { label: "窗口索引", suggestName: "windowIndex" },
    position: {
      label: "窗口位置",
      placeholder: "数组，分别为 x 坐标，y 坐标",
      suggestName: "windowPosition",
    },
    size: {
      label: "窗口大小",
      placeholder: "数组，分别为 宽度，高度",
      suggestName: "windowSize",
    },
    minimized: {
      label: "是否最小化",
      suggestName: "windowMinimized",
    },
    fullscreen: {
      label: "是否全屏",
      suggestName: "windowFullscreen",
    },
  },
};

export const macosCommands = {
  label: "Mac自动化",
  icon: "laptop_mac",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.macos.app.getFrontmost",
      label: "应用及窗口控制",
      icon: "apps",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.macos.app.getFrontmost",
          label: "获取前台应用",
          icon: "front_hand",
          outputs: {
            label: "前台应用信息",
            suggestName: "frontmostApp",
            structure: windowOutputStructure,
          },
        },
        {
          value: "quickcomposer.macos.app.getRunningApps",
          label: "获取活动应用",
          icon: "list",
          outputs: {
            label: "活动应用列表",
            suggestName: "runningApps",
          },
        },
        {
          value: "quickcomposer.macos.app.launch",
          label: "启动应用",
          icon: "launch",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.quit",
          label: "退出应用",
          icon: "close",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.hide",
          label: "隐藏应用",
          icon: "visibility_off",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.show",
          label: "显示应用",
          icon: "visibility",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.minimize",
          label: "最小化窗口",
          icon: "minimize",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.maximize",
          label: "最大化窗口",
          icon: "maximize",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.getWindows",
          label: "获取窗口信息",
          icon: "window",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
          outputs: {
            label: "窗口信息",
            suggestName: "windows",
            structure: [windowOutputStructure],
          },
        },
        {
          value: "quickcomposer.macos.app.getScriptDictionary",
          label: "获取应用脚本字典",
          icon: "code",
          config: [
            {
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称，如 Finder",
            },
          ],
          outputs: {
            label: "应用脚本字典",
            suggestName: "appScriptDictionary",
            structure: {
              commands: {
                label: "命令列表",
                suggestName: "appCommands",
                placeholder: "数组",
              },
              properties: {
                label: "属性列表",
                suggestName: "appProperties",
                placeholder: "数组",
              },
              summary: {
                label: "概要信息",
                totalCommands: {
                  label: "命令总数",
                  suggestName: "appTotalCommands",
                },
                totalProperties: {
                  label: "属性总数",
                  suggestName: "appTotalProperties",
                },
                hasScriptingSupport: {
                  label: "是否支持脚本",
                  suggestName: "appHasScriptingSupport",
                },
              },
            },
          },
        },
      ],
    },
    {
      value: "quickcomposer.macos.system.setVolume",
      label: "系统管理",
      icon: "settings",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.macos.system.setVolume",
          label: "系统音量",
          icon: "volume_up",
          config: [
            {
              label: "音量",
              component: "NumberInput",
              icon: "volume_up",
              min: 0,
              max: 100,
              step: 10,
              defaultValue: 50,
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.lockScreen",
          label: "锁定屏幕",
          icon: "lock",
        },
        {
          value: "quickcomposer.macos.system.sleep",
          label: "进入睡眠",
          icon: "bedtime",
        },
        {
          value: "quickcomposer.macos.system.setDockPosition",
          label: "设置Dock位置",
          icon: "dock",
          config: [
            {
              label: "位置",
              component: "ButtonGroup",
              defaultValue: "bottom",
              width: 12,
              options: [
                {
                  label: "底部",
                  value: "bottom",
                },
                {
                  label: "左侧",
                  value: "left",
                },
                {
                  label: "右侧",
                  value: "right",
                },
              ],
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.setDockSize",
          label: "设置Dock大小",
          icon: "dock",
          config: [
            {
              label: "大小",
              component: "NumberInput",
              icon: "dock",
              min: 16,
              max: 128,
              defaultValue: 48,
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.toggleDockAutohide",
          label: "Dock自动隐藏",
          icon: "dock",
          config: [
            {
              label: "启用",
              component: "CheckButton",
              defaultValue: false,
              icon: "dock",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.toggleMenuBarAutohide",
          label: "菜单栏自动隐藏",
          icon: "menu",
          config: [
            {
              label: "启用",
              component: "CheckButton",
              defaultValue: false,
              icon: "menu",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.toggleDarkMode",
          label: "深色模式",
          icon: "dark_mode",
          config: [
            {
              label: "启用",
              component: "CheckButton",
              defaultValue: true,
              icon: "dark_mode",
              width: 12,
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.macos.finder.getSelection",
      label: "访达管理",
      icon: "folder",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.macos.finder.getSelection",
          label: "获取选中项",
          icon: "select_all",
          outputs: {
            label: "选中项",
            suggestName: "selectedItems",
            structure: [
              {
                name: { label: "名称", suggestName: "firstItemName" },
                path: { label: "路径", suggestName: "firstItemPath" },
                kind: { label: "类型", suggestName: "firstItemKind" },
                size: { label: "大小", suggestName: "firstItemSize" },
                created: {
                  label: "创建时间",
                  suggestName: "firstItemCreatedTime",
                },
                modified: {
                  label: "修改时间",
                  suggestName: "firstItemModifiedTime",
                },
              },
            ],
          },
        },
        {
          value: "quickcomposer.macos.finder.getCurrentFolder",
          label: "获取打开的文件夹信息",
          icon: "folder_open",
          outputs: {
            label: "打开的文件夹信息",
            suggestName: "currentFolder",
            structure: {
              name: { label: "名称", suggestName: "currentFolderName" },
              path: { label: "路径", suggestName: "currentFolderPath" },
              kind: { label: "类型", suggestName: "currentFolderKind" },
              created: {
                label: "创建时间",
                suggestName: "currentFolderCreatedTime",
              },
              modified: {
                label: "修改时间",
                suggestName: "currentFolderModifiedTime",
              },
            },
          },
        },
        {
          value: "quickcomposer.macos.finder.setShowHiddenFiles",
          label: "显示隐藏文件",
          icon: "visibility",
          config: [
            {
              label: "显示",
              component: "CheckButton",
              width: 12,
              defaultValue: false,
            },
          ],
        },
        {
          value: "quickcomposer.macos.finder.getWindows",
          label: "获取窗口列表",
          icon: "window",
          outputs: {
            label: "窗口列表",
            suggestName: "finderWindows",
            structure: [
              {
                name: { label: "名称", suggestName: "firstFinderWindowName" },
                index: { label: "索引", suggestName: "firstFinderWindowIndex" },
                bounds: {
                  label: "边界",
                  suggestName: "firstFinderWindowBounds",
                },
                target: { label: "路径", suggestName: "firstFinderWindowPath" },
              },
            ],
          },
        },
        {
          value: "quickcomposer.macos.finder.activateWindow",
          label: "激活窗口",
          icon: "open_in_new",
          config: [
            {
              label: "窗口索引",
              component: "VariableInput",
              icon: "window",
              disableToggleType: true,
              defaultValue: newVarInputVal("var", "1"),
              width: 12,
            },
          ],
        },
      ],
    },
  ],
};

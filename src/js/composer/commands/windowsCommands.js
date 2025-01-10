import { newVarInputVal } from "js/composer/varInputValManager";

export const windowsCommands = {
  label: "Windows工具",
  icon: "window",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.windows.window.setTopMost",
      label: "窗口控制",
      desc: "Windows窗口操作",
      icon: "window",
      config: [
        {
          key: "method",
          label: "查找方式",
          component: "q-select",
          icon: "search",
          width: 3,
          options: [
            { label: "标题", value: "title" },
            { label: "句柄", value: "handle" },
            { label: "活动窗口", value: "active" },
          ],
          defaultValue: "title",
        },
        {
          key: "value",
          label: "窗口标题/句柄",
          component: "VariableInput",
          icon: "title",
          width: 9,
          placeholder: "标题支持模糊匹配，选择活动窗口无需输入",
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.windows.window.setTopMost",
          label: "窗口置顶",
          icon: "vertical_align_top",
          config: [
            {
              key: "isTopMost",
              component: "ButtonGroup",
              icon: "push_pin",
              width: 12,
              options: [
                { label: "置顶", value: true },
                { label: "取消置顶", value: false },
              ],
              defaultValue: true,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setOpacity",
          label: "窗口透明度",
          icon: "opacity",
          config: [
            {
              key: "opacity",
              label: "透明度",
              component: "NumberInput",
              icon: "opacity",
              width: 12,
              min: 0,
              max: 100,
              defaultValue: 80,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setWindowRect",
          label: "窗口位置大小",
          icon: "aspect_ratio",
          config: [
            {
              key: "x",
              label: "X坐标",
              component: "NumberInput",
              icon: "arrow_right",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "y",
              label: "Y坐标",
              component: "NumberInput",
              icon: "arrow_drop_down",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "width",
              label: "宽度",
              component: "NumberInput",
              icon: "swap_horiz",
              width: 6,
              min: 0,
              defaultValue: 800,
            },
            {
              key: "height",
              label: "高度",
              component: "NumberInput",
              icon: "height",
              width: 6,
              min: 0,
              defaultValue: 600,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setWindowState",
          label: "窗口状态",
          icon: "open_in_full",
          config: [
            {
              key: "state",
              component: "ButtonGroup",
              icon: "aspect_ratio",
              width: 12,
              options: [
                { label: "最大化", value: "maximize" },
                { label: "最小化", value: "minimize" },
                { label: "还原", value: "normal" },
              ],
              defaultValue: "maximize",
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setVisible",
          label: "窗口可见性",
          icon: "visibility",
          config: [
            {
              key: "visible",
              component: "ButtonGroup",
              icon: "visibility",
              width: 12,
              options: [
                { label: "显示", value: true },
                { label: "隐藏", value: false },
              ],
              defaultValue: true,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.closeWindow",
          label: "关闭窗口",
          icon: "close",
        },
        {
          value: "quickcomposer.windows.window.setFocus",
          label: "聚焦窗口",
          icon: "front_hand",
        },
        {
          value: "quickcomposer.windows.window.setBorder",
          label: "窗口边框",
          icon: "border_style",
          config: [
            {
              key: "hasBorder",
              component: "ButtonGroup",
              icon: "border_style",
              width: 12,
              options: [
                { label: "显示边框", value: true },
                { label: "隐藏边框", value: false },
              ],
              defaultValue: true,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setClickThrough",
          label: "点击穿透",
          icon: "touch_app",
          config: [
            {
              key: "isTransparent",
              component: "ButtonGroup",
              icon: "touch_app",
              width: 12,
              options: [
                { label: "开启穿透", value: true },
                { label: "关闭穿透", value: false },
              ],
              defaultValue: false,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.getWindowInfo",
          label: "窗口信息",
          icon: "info",
          outputVariable: "windowInfo",
          saveOutput: true,
        },
      ],
      isAsync: true,
    },
  ],
};

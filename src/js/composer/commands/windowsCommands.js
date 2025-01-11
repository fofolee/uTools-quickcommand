export const windowsCommands = {
  label: "Windows专区",
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
    {
      value: "quickcomposer.windows.message.sendMouseClick",
      label: "发送消息",
      icon: "send",
      isAsync: true,
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
          value: "quickcomposer.windows.message.sendMouseClick",
          label: "鼠标点击",
          icon: "mouse",
          config: [
            {
              key: "type",
              defaultValue: "click",
              hidden: true,
            },
            {
              key: "button",
              label: "按键",
              component: "q-select",
              icon: "mouse",
              width: 4,
              options: [
                { label: "左键", value: "left" },
                { label: "右键", value: "right" },
                { label: "中键", value: "middle" },
              ],
              defaultValue: "left",
            },
            {
              key: "x",
              label: "X坐标",
              component: "NumberInput",
              icon: "arrow_right",
              width: 4,
              defaultValue: 0,
            },
            {
              key: "y",
              label: "Y坐标",
              component: "NumberInput",
              icon: "arrow_drop_down",
              width: 4,
              defaultValue: 0,
            },
          ],
        },
        {
          value: "quickcomposer.windows.message.sendKeyPress",
          label: "键盘按键",
          icon: "keyboard",
          config: [
            {
              key: "type",
              defaultValue: "key",
              hidden: true,
            },
            {
              key: "keyCode",
              label: "按键码",
              component: "NumberInput",
              icon: "keyboard",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "ctrl",
              label: "Ctrl",
              component: "Switch",
              width: 3,
              defaultValue: false,
            },
            {
              key: "alt",
              label: "Alt",
              component: "Switch",
              width: 3,
              defaultValue: false,
            },
            {
              key: "shift",
              label: "Shift",
              component: "Switch",
              width: 3,
              defaultValue: false,
            },
            {
              key: "hold",
              label: "按住",
              component: "Switch",
              width: 3,
              defaultValue: false,
            },
          ],
        },
        {
          value: "quickcomposer.windows.message.sendText",
          label: "文本输入",
          icon: "text_fields",
          config: [
            {
              key: "type",
              defaultValue: "text",
              hidden: true,
            },
            {
              key: "text",
              label: "文本内容",
              component: "VariableInput",
              icon: "text_fields",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.windows.message.sendCommand",
          label: "窗口命令",
          icon: "window",
          config: [
            {
              key: "type",
              defaultValue: "custom",
              hidden: true,
            },
            {
              key: "message",
              label: "命令",
              component: "q-select",
              icon: "code",
              width: 12,
              options: [
                { label: "关闭窗口", value: "0x0010" }, // WM_CLOSE
                { label: "销毁窗口", value: "0x0002" }, // WM_DESTROY
                { label: "激活窗口", value: "0x0006" }, // WM_ACTIVATE
                { label: "显示窗口", value: "0x0018" }, // WM_SHOWWINDOW
                { label: "重绘窗口", value: "0x000F" }, // WM_PAINT
                { label: "窗口尺寸", value: "0x0005" }, // WM_SIZE
                { label: "窗口位置", value: "0x0003" }, // WM_MOVE
              ],
              defaultValue: "0x0010",
            },
            {
              key: "wParam",
              label: "参数1",
              component: "NumberInput",
              icon: "input",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "lParam",
              label: "参数2",
              component: "NumberInput",
              icon: "input",
              width: 6,
              defaultValue: 0,
            },
          ],
        },
        {
          value: "quickcomposer.windows.message.sendCustom",
          label: "自定义消息",
          icon: "settings",
          config: [
            {
              key: "type",
              defaultValue: "custom",
              hidden: true,
            },
            {
              key: "message",
              label: "消息ID",
              component: "NumberInput",
              icon: "tag",
              width: 12,
              defaultValue: 0,
            },
            {
              key: "wParam",
              label: "wParam",
              component: "NumberInput",
              icon: "input",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "lParam",
              label: "lParam",
              component: "NumberInput",
              icon: "input",
              width: 6,
              defaultValue: 0,
            },
          ],
        },
      ],
    },
  ],
};

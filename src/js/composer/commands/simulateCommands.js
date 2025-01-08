export const simulateCommands = {
  label: "模拟操作",
  icon: "ads_click",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.simulate.keyboardTap",
      label: "模拟按键",
      config: [],
      component: "KeyEditor",
    },
    {
      value: "quickcomposer.simulate.keySequence",
      label: "按键序列",
      description: "按顺序执行多个按键操作",
      component: "KeySequenceEditor",
    },
    {
      value: "quickcommand.simulateCopy",
      label: "模拟复制粘贴",
      config: [],
      functionSelector: [
        {
          value: "quickcommand.simulateCopy",
          label: "复制",
          icon: "content_copy",
        },
        {
          value: "quickcommand.simulatePaste",
          label: "粘贴",
          icon: "content_paste",
        },
      ],
    },
    {
      value: "quickcomposer.simulate.sendText",
      label: "发送文本",
      config: [
        {
          key: "text",
          label: "要发送的文本内容",
          type: "varInput",
          icon: "send",
          width: 9,
        },
        {
          label: "发送方式",
          type: "select",
          defaultValue: false,
          icon: "keyboard",
          options: [
            { label: "模拟输入", value: false },
            { label: "模拟粘贴", value: true },
          ],
          width: 3,
        },
      ],
    },
    {
      value: "utools.simulateMouseClick",
      label: "鼠标点击",
      config: [
        {
          label: "X坐标（留空则原地点击）",
          icon: "drag_handle",
          type: "numInput",
          width: 6,
        },
        {
          label: "Y坐标（留空则原地点击）",
          icon: "drag_handle",
          type: "numInput",
          width: 6,
        },
      ],
      functionSelector: [
        {
          label: "单击",
          value: "utools.simulateMouseClick",
          icon: "mouse",
        },
        {
          label: "右击",
          value: "utools.simulateMouseRightClick",
          icon: "mouse",
        },
        {
          label: "双击",
          value: "utools.simulateMouseDoubleClick",
          icon: "mouse",
        },
      ],
    },
    {
      value: "utools.simulateMouseMove",
      label: "鼠标位置",
      functionSelector: [
        {
          label: "移动到坐标",
          value: "utools.simulateMouseMove",
          icon: "mouse",
          config: [
            {
              label: "X坐标",
              icon: "drag_handle",
              defaultValue: 0,
              type: "numInput",
              width: 6,
            },
            {
              label: "Y坐标",
              icon: "drag_handle",
              defaultValue: 0,
              type: "numInput",
              width: 6,
            },
          ],
        },
        {
          label: "获取坐标",
          value: "utools.getCursorScreenPoint",
          icon: "mouse",
        },
      ],
    },
    {
      value: "quickcomposer.simulate.findImage",
      label: "屏幕找图",
      component: "ImageSearchEditor",
      config: [],
      isAsync: true,
    },
  ],
};

import { newVarInputVal } from "js/composer/varInputValManager";

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
      component: "KeySequenceEditor",
    },
    {
      value: "quickcommand.simulateCopy",
      label: "模拟复制粘贴",
      config: [],
      subCommands: [
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
      value: "utools.hideMainWindowTypeString",
      label: "发送文本",
      config: [
        {
          label: "要发送的文本内容",
          component: "VariableInput",
          icon: "send",
          width: 12,
        },
      ],
      subCommands: [
        {
          value: "utools.hideMainWindowTypeString",
          label: "模拟输入",
          icon: "keyboard",
        },
        {
          value: "utools.hideMainWindowPasteText",
          label: "模拟粘贴",
          icon: "content_paste",
        },
      ],
    },
    {
      value: "utools.hideMainWindowPasteFile",
      label: "模拟粘贴文件/图片",
      icon: "file_copy",
      subCommands: [
        {
          value: "utools.hideMainWindowPasteFile",
          label: "粘贴文件",
          icon: "file_copy",
          config: [
            {
              label: "文件路径",
              component: "VariableInput",
              icon: "description",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择文件",
                    properties: [
                      "openFile",
                      "multiSelections",
                      "showHiddenFiles",
                    ],
                  },
                },
              },
            },
          ],
        },
        {
          value: "utools.hideMainWindowPasteImage",
          label: "粘贴图片",
          icon: "image",
          config: [
            {
              label: "图片路径/base64",
              component: "VariableInput",
              icon: "image",
              width: 12,
              options: {
                dialog: {
                  title: "选择图片",
                  properties: ["openFile", "showHiddenFiles"],
                },
              },
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.simulate.mouseClick",
      label: "鼠标点击",
      config: [
        {
          component: "ButtonGroup",
          options: [
            {
              label: "单击",
              value: "Click",
            },
            {
              label: "右击",
              value: "RightClick",
            },
            {
              label: "双击",
              value: "DoubleClick",
            },
          ],
          defaultValue: "Click",
          width: 12,
        },
        {
          component: "OptionEditor",
          options: {
            x: {
              label: "X坐标",
              icon: "drag_handle",
              component: "NumberInput",
              min: 0,
              step: 10,
              width: 6,
              placeholder: "XY任意留空原地点击",
            },
            y: {
              label: "Y坐标",
              icon: "drag_handle",
              component: "NumberInput",
              min: 0,
              step: 10,
              width: 6,
              placeholder: "XY任意留空原地点击",
            },
            count: {
              label: "点击次数",
              component: "NumberInput",
              min: 1,
              step: 1,
              width: 6,
              defaultValue: 1,
            },
            interval: {
              label: "点击间隔（毫秒）",
              component: "NumberInput",
              min: 0,
              step: 100,
              width: 6,
            },
          },
          defaultValue: {
            count: 1,
          },
        },
      ],
    },
    {
      value: "utools.simulateMouseMove",
      label: "鼠标位置",
      subCommands: [
        {
          label: "移动到坐标",
          value: "utools.simulateMouseMove",
          icon: "mouse",
          config: [
            {
              label: "X坐标",
              icon: "drag_handle",
              defaultValue: 0,
              component: "NumberInput",
              min: 0,
              step: 10,
              width: 6,
            },
            {
              label: "Y坐标",
              icon: "drag_handle",
              defaultValue: 0,
              component: "NumberInput",
              min: 0,
              step: 10,
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
      asyncMode: "await",
    },
    {
      value: "quickcomposer.simulate.screenColorPick",
      label: "屏幕取色",
      icon: "colorize",
      asyncMode: "await",
    },
    {
      value: "quickcomposer.simulate.captureScreen",
      label: "屏幕截图",
      icon: "screenshot_monitor",
      asyncMode: "await",
      config: [
        {
          label: "截图范围",
          component: "ButtonGroup",
          options: [
            {
              label: "全屏截图",
              value: "fullscreen",
            },
            {
              label: "区域截图",
              value: "area",
            },
          ],
          defaultValue: "fullscreen",
          width: 12,
        },
      ],
      subCommands: [
        {
          label: "保存到dataUrl",
          value: "quickcomposer.simulate.captureScreen",
          icon: "link",
        },
        {
          label: "保存到文件",
          value: "quickcomposer.simulate.captureScreenToFile",
          icon: "file_copy",
          config: [
            {
              label: "截图保存路径",
              component: "VariableInput",
              defaultValue: newVarInputVal(
                "str",
                `${window.utools.getPath("desktop")}${
                  utools.isWindows() ? "\\" : "/"
                }quickcommand_screenshot.png`
              ),
              options: {
                dialog: {
                  type: "save",
                  options: {
                    title: "选择保存路径",
                    properties: ["openFile", "showHiddenFiles"],
                    filters: [
                      {
                        name: "PNG",
                        extensions: ["png"],
                      },
                    ],
                  },
                },
              },
              icon: "description",
              width: 12,
            },
          ],
        },
        {
          label: "复制到剪贴板",
          value: "quickcomposer.simulate.captureScreenToClipboard",
          icon: "content_copy",
        },
      ],
    },
  ],
};

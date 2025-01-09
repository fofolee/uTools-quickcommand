import { newVarInputVal } from "js/composer/varInputValManager";

const XY_DICT_EDITOR = {
  label: "坐标",
  type: "dictEditor",
  icon: "transform",
  isCollapse: false,
  width: 12,
  defaultValue: {
    x: newVarInputVal("var", "0"),
    y: newVarInputVal("var", "0"),
  },
  options: {
    fixedKeys: [
      { value: "x", label: "X坐标" },
      { value: "y", label: "Y坐标" },
    ],
    disableAdd: true,
  },
};

const RECT_DICT_EDITOR = {
  label: "区域",
  type: "dictEditor",
  icon: "transform",
  isCollapse: false,
  width: 12,
  defaultValue: {
    x: newVarInputVal("var", "0"),
    y: newVarInputVal("var", "0"),
    width: newVarInputVal("var", "100"),
    height: newVarInputVal("var", "100"),
  },
  options: {
    fixedKeys: [
      { value: "x", label: "X坐标" },
      { value: "y", label: "Y坐标" },
      { value: "width", label: "宽度" },
      { value: "height", label: "高度" },
    ],
    disableAdd: true,
  },
};

export const screenCommands = {
  label: "显示器",
  icon: "screenshot_monitor",
  commands: [
    {
      value: "utools.getPrimaryDisplay",
      label: "获取显示器信息",
      desc: "获取显示器信息",
      icon: "monitor",
      outputVariable: "display",
      saveOutput: true,
      subCommands: [
        {
          value: "utools.getPrimaryDisplay",
          label: "获取主显示器",
          icon: "monitor",
        },
        {
          value: "utools.getAllDisplays",
          label: "获取所有显示器",
          icon: "desktop_windows",
        },
        {
          value: "utools.getDisplayNearestPoint",
          label: "获取位置所在显示器",
          icon: "gps_fixed",
          config: [XY_DICT_EDITOR],
        },
        {
          value: "utools.getDisplayMatching",
          label: "获取矩形所在显示器",
          icon: "crop_square",
          config: [RECT_DICT_EDITOR],
        },
      ],
    },
    {
      value: "utools.screenToDipPoint",
      label: "物理/DIP坐标转换",
      desc: "屏幕物理坐标和 DIP 坐标转换",
      icon: "transform",
      outputVariable: "{x,y}",
      saveOutput: true,
      config: [XY_DICT_EDITOR],
      subCommands: [
        {
          value: "utools.screenToDipPoint",
          label: "物理坐标转DIP坐标",
          icon: "transform",
        },
        {
          value: "utools.dipToScreenPoint",
          label: "DIP坐标转物理坐标",
          icon: "transform",
        },
      ],
    },
    {
      value: "utools.screenToDipRect",
      label: "物理/DIP区域转换",
      desc: "屏幕物理区域和 DIP 区域转换",
      icon: "transform",
      outputVariable: "{x,y,width,height}",
      saveOutput: true,
      config: [RECT_DICT_EDITOR],
      subCommands: [
        {
          value: "utools.screenToDipRect",
          label: "物理区域转DIP区域",
          desc: "屏幕物理区域转 DIP 区域",
          icon: "transform",
        },
        {
          value: "utools.dipToScreenRect",
          label: "DIP区域转物理区域",
          desc: "DIP 区域转屏幕物理区域",
          icon: "transform",
        },
      ],
    },
  ],
};

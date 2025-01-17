const xy = {
  x: {
    label: "X坐标",
    component: "NumberInput",
    icon: "arrow_right",
    width: 6,
    min: 0,
    step: 10,
  },
  y: {
    label: "Y坐标",
    component: "NumberInput",
    icon: "arrow_down",
    width: 6,
    min: 0,
    step: 10,
  },
};

const XY_DICT_EDITOR = {
  label: "坐标",
  component: "OptionEditor",
  icon: "transform",
  isCollapse: false,
  width: 12,
  defaultValue: {
    x: 0,
    y: 0,
  },
  options: {
    ...xy,
  },
};

const RECT_DICT_EDITOR = {
  label: "区域",
  component: "DictEditor",
  icon: "transform",
  isCollapse: false,
  width: 12,
  defaultValue: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  },
  options: {
    ...xy,
    width: {
      label: "宽度",
      component: "NumberInput",
      icon: "swap_horiz",
      min: 0,
      step: 10,
      width: 6,
    },
    height: {
      label: "高度",
      component: "NumberInput",
      icon: "height",
      min: 0,
      step: 10,
      width: 6,
    },
  },
};

export const screenCommands = {
  label: "显示器",
  icon: "display_settings",
  commands: [
    {
      value: "utools.getPrimaryDisplay",
      label: "获取显示器信息",
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
      icon: "transform",
      outputVariable: "{x,y,width,height}",
      saveOutput: true,
      config: [RECT_DICT_EDITOR],
      subCommands: [
        {
          value: "utools.screenToDipRect",
          label: "物理区域转DIP区域",
          icon: "transform",
        },
        {
          value: "utools.dipToScreenRect",
          label: "DIP区域转物理区域",
          icon: "transform",
        },
      ],
    },
  ],
};

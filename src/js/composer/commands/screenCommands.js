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

const DISPLAY_INFO_STRUCTURE = {
  id: { label: "显示器ID", suggestName: "primaryDisplayId" },
  label: { label: "显示器标签", suggestName: "primaryDisplayLabel" },
  bounds: {
    label: "边界",
    x: { label: "X坐标", suggestName: "primaryDisplayBoundsX" },
    y: { label: "Y坐标", suggestName: "primaryDisplayBoundsY" },
    width: {
      label: "宽度",
      suggestName: "primaryDisplayBoundsWidth",
    },
    height: {
      label: "高度",
      suggestName: "primaryDisplayBoundsHeight",
    },
  },
  workArea: {
    label: "工作区",
    x: { label: "X坐标", suggestName: "primaryDisplayWorkAreaX" },
    y: { label: "Y坐标", suggestName: "primaryDisplayWorkAreaY" },
    width: {
      label: "宽度",
      suggestName: "primaryDisplayWorkAreaWidth",
    },
    height: {
      label: "高度",
      suggestName: "primaryDisplayWorkAreaHeight",
    },
  },
  accelerometerSupport: {
    label: "是否支持加速度计",
    suggestName: "primaryDisplayAccelerometerSupport",
  },
  monochrome: {
    label: "是否是黑白显示器",
    suggestName: "primaryDisplayMonochrome",
  },
  colorDepth: {
    label: "颜色深度",
    suggestName: "primaryDisplayColorDepth",
  },
  colorSpace: {
    label: "颜色空间",
    suggestName: "primaryDisplayColorSpace",
  },
  depthPerComponent: {
    label: "每组件深度",
    suggestName: "primaryDisplayDepthPerComponent",
  },
  size: {
    label: "尺寸",
    width: {
      label: "宽度",
      suggestName: "primaryDisplaySizeWidth",
    },
    height: {
      label: "高度",
      suggestName: "primaryDisplaySizeHeight",
    },
  },
  displayFrequency: {
    label: "显示频率",
    suggestName: "primaryDisplayDisplayFrequency",
  },
  workAreaSize: {
    label: "工作区尺寸",
    width: {
      label: "宽度",
      suggestName: "primaryDisplayWorkAreaSizeWidth",
    },
    height: {
      label: "高度",
      suggestName: "primaryDisplayWorkAreaSizeHeight",
    },
  },
  scaleFactor: {
    label: "缩放比例",
    suggestName: "primaryDisplayScaleFactor",
  },
  rotation: {
    label: "旋转角度",
    suggestName: "primaryDisplayRotation",
  },
  internal: {
    label: "是否是内置显示器",
    suggestName: "primaryDisplayInternal",
  },
  touchSupport: {
    label: "是否支持触摸",
    suggestName: "primaryDisplayTouchSupport",
  },
};

const XY_STRUCTURE = {
  x: { label: "X坐标", suggestName: "pointX" },
  y: { label: "Y坐标", suggestName: "pointY" },
};

const RECT_STRUCTURE = {
  x: { label: "X坐标", suggestName: "rectX" },
  y: { label: "Y坐标", suggestName: "rectY" },
  width: { label: "宽度", suggestName: "rectWidth" },
  height: { label: "高度", suggestName: "rectHeight" },
};

export const screenCommands = {
  label: "显示器",
  icon: "display_settings",
  commands: [
    {
      value: "utools.getPrimaryDisplay",
      label: "获取显示器信息",
      icon: "monitor",
      subCommands: [
        {
          value: "utools.getPrimaryDisplay",
          label: "获取主显示器",
          icon: "monitor",
          outputs: {
            label: "主显示器信息",
            suggestName: "primaryDisplayInfo",
            structure: DISPLAY_INFO_STRUCTURE,
          },
        },
        {
          value: "utools.getAllDisplays",
          label: "获取所有显示器",
          icon: "desktop_windows",
          outputs: {
            label: "所有显示器信息",
            suggestName: "allDisplaysInfo",
            structure: [DISPLAY_INFO_STRUCTURE],
          },
        },
        {
          value: "utools.getDisplayNearestPoint",
          label: "获取位置所在显示器",
          icon: "gps_fixed",
          config: [XY_DICT_EDITOR],
          outputs: {
            label: "显示器信息",
            suggestName: "nearestDisplayInfo",
            structure: DISPLAY_INFO_STRUCTURE,
          },
        },
        {
          value: "utools.getDisplayMatching",
          label: "获取矩形所在显示器",
          icon: "crop_square",
          config: [RECT_DICT_EDITOR],
          outputs: {
            label: "显示器信息",
            suggestName: "matchingDisplayInfo",
            structure: DISPLAY_INFO_STRUCTURE,
          },
        },
      ],
    },
    {
      value: "utools.screenToDipPoint",
      label: "物理/DIP坐标转换",
      icon: "transform",
      config: [XY_DICT_EDITOR],
      outputs: {
        label: "转换结果",
        suggestName: "convertedResult",
        structure: XY_STRUCTURE,
      },
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
      config: [RECT_DICT_EDITOR],
      outputs: {
        label: "转换结果",
        suggestName: "convertedResult",
        structure: RECT_STRUCTURE,
      },
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

import { newVarInputVal } from "js/composer/varInputValManager";

// 图片格式选项
const IMAGE_FORMATS = [
  { label: "JPEG", value: "jpeg" },
  { label: "PNG", value: "png" },
  { label: "WebP", value: "webp" },
];

// 水印位置选项
const WATERMARK_POSITIONS = [
  { label: "左上角", value: "topLeft" },
  { label: "右上角", value: "topRight" },
  { label: "左下角", value: "bottomLeft" },
  { label: "右下角", value: "bottomRight" },
  { label: "居中", value: "center" },
];

export const imageCommands = {
  label: "图片操作",
  icon: "image",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.image.analyze",
      label: "图片信息",
      desc: "分析图片基本信息",
      icon: "analytics",
      isAsync: true,
      config: [
        {
          key: "file",
          label: "图片文件",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
      ],
    },
    {
      value: "quickcomposer.image.resize",
      label: "调整大小",
      desc: "调整图片尺寸",
      icon: "aspect_ratio",
      isAsync: true,
      config: [
        {
          key: "inputFile",
          label: "输入文件",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
        {
          key: "outputFile",
          label: "输出文件",
          type: "varInput",
          icon: "save",
          width: 12,
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
              },
            },
          },
        },
        {
          key: "width",
          label: "宽度(像素)",
          type: "numInput",
          icon: "compare_arrows",
          width: 6,
          min: 1,
          step: 10,
          defaultValue: "",
        },
        {
          key: "height",
          label: "高度(像素)",
          type: "numInput",
          icon: "height",
          width: 6,
          min: 1,
          step: 10,
          defaultValue: "",
        },
        {
          key: "keepAspectRatio",
          label: "保持宽高比",
          type: "select",
          icon: "aspect_ratio",
          width: 6,
          defaultValue: "true",
          options: [
            { label: "是", value: "true" },
            { label: "否", value: "false" },
          ],
        },
        {
          key: "quality",
          label: "图片质量(0-1)",
          type: "numInput",
          icon: "high_quality",
          width: 6,
          max: 1,
          min: 0,
          step: 0.05,
          defaultValue: 0.92,
        },
      ],
    },
    {
      value: "quickcomposer.image.rotate",
      label: "旋转图片",
      desc: "旋转图片角度",
      icon: "rotate_right",
      isAsync: true,
      config: [
        {
          key: "inputFile",
          label: "输入文件",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
        {
          key: "outputFile",
          label: "输出文件",
          type: "varInput",
          icon: "save",
          width: 12,
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
              },
            },
          },
        },
        {
          key: "angle",
          label: "旋转角度",
          type: "numInput",
          icon: "rotate_right",
          width: 6,
          step: 90,
          defaultValue: 90,
        },
        {
          key: "quality",
          label: "图片质量(0-1)",
          type: "numInput",
          icon: "high_quality",
          width: 6,
          max: 1,
          min: 0,
          step: 0.05,
          defaultValue: 0.92,
        },
      ],
    },
    {
      value: "quickcomposer.image.crop",
      label: "裁剪图片",
      desc: "裁剪图片区域",
      icon: "crop",
      isAsync: true,
      config: [
        {
          key: "inputFile",
          label: "输入文件",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
        {
          key: "outputFile",
          label: "输出文件",
          type: "varInput",
          icon: "save",
          width: 12,
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
              },
            },
          },
        },
        {
          key: "x",
          label: "起始X坐标",
          type: "numInput",
          icon: "arrow_right",
          width: 6,
          min: 0,
          step: 10,
          defaultValue: 0,
        },
        {
          key: "y",
          label: "起始Y坐标",
          type: "numInput",
          icon: "arrow_downward",
          width: 6,
          min: 0,
          step: 10,
          defaultValue: 0,
        },
        {
          key: "width",
          label: "裁剪宽度",
          type: "numInput",
          icon: "compare_arrows",
          width: 6,
          min: 1,
          step: 10,
          defaultValue: "",
        },
        {
          key: "height",
          label: "裁剪高度",
          type: "numInput",
          icon: "height",
          width: 6,
          min: 1,
          step: 10,
          defaultValue: "",
        },
        {
          key: "quality",
          label: "图片质量(0-1)",
          type: "numInput",
          icon: "high_quality",
          width: 6,
          max: 1,
          min: 0,
          step: 0.05,
          defaultValue: 0.92,
        },
      ],
    },
    {
      value: "quickcomposer.image.watermark",
      label: "添加水印",
      desc: "添加文字水印",
      icon: "format_color_text",
      isAsync: true,
      config: [
        {
          key: "inputFile",
          label: "输入文件",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
        {
          key: "outputFile",
          label: "输出文件",
          type: "varInput",
          icon: "save",
          width: 12,
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
              },
            },
          },
        },
        {
          key: "text",
          label: "水印文字",
          type: "varInput",
          icon: "text_fields",
          width: 12,
          defaultValue: newVarInputVal("var", "水印文字"),
        },
        {
          key: "font",
          label: "字体设置",
          type: "varInput",
          icon: "font_download",
          width: 6,
          defaultValue: newVarInputVal("var", "24px Arial"),
        },
        {
          key: "color",
          label: "文字颜色",
          type: "varInput",
          icon: "format_color_text",
          width: 6,
          defaultValue: newVarInputVal("var", "rgba(255, 255, 255, 0.5)"),
        },
        {
          key: "position",
          label: "位置",
          type: "select",
          icon: "place",
          width: 6,
          defaultValue: "bottomRight",
          options: WATERMARK_POSITIONS,
        },
        {
          key: "margin",
          label: "边距",
          type: "numInput",
          icon: "space_bar",
          min: 0,
          step: 10,
          width: 6,
          defaultValue: 20,
        },
        {
          key: "opacity",
          label: "不透明度(0-1)",
          type: "numInput",
          icon: "opacity",
          max: 1,
          min: 0,
          step: 0.05,
          width: 6,
          defaultValue: 0.5,
        },
        {
          key: "quality",
          label: "图片质量(0-1)",
          type: "numInput",
          icon: "high_quality",
          max: 1,
          min: 0,
          step: 0.05,
          width: 6,
          defaultValue: 0.92,
        },
      ],
    },
    {
      value: "quickcomposer.image.convert",
      label: "格式转换",
      desc: "转换图片格式",
      icon: "transform",
      isAsync: true,
      config: [
        {
          key: "inputFile",
          label: "输入文件",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
        {
          key: "outputFile",
          label: "输出文件",
          type: "varInput",
          icon: "save",
          width: 12,
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["jpg", "jpeg", "png", "webp"],
                  },
                ],
              },
            },
          },
        },
        {
          key: "format",
          label: "输出格式",
          type: "select",
          icon: "transform",
          width: 6,
          defaultValue: "jpeg",
          options: IMAGE_FORMATS,
        },
        {
          key: "quality",
          label: "图片质量(0-1)",
          type: "numInput",
          icon: "high_quality",
          width: 6,
          max: 1,
          min: 0,
          step: 0.05,
          defaultValue: 0.92,
        },
      ],
    },
    {
      value: "quickcomposer.image.pngToIcon",
      label: "PNG转图标",
      desc: "将PNG图片转换为图标",
      icon: "transform",
      config: [
        {
          key: "inputFile",
          label: "PNG路径/Base64",
          type: "varInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["png"],
                  },
                ],
                properties: ["openFile", "multiSelections"],
              },
            },
          },
        },
        {
          key: "outputDir",
          label: "输出目录",
          type: "varInput",
          icon: "save",
          width: 9,
          defaultValue: newVarInputVal("str", window.utools.getPath("desktop")),
          options: {
            dialog: {
              type: "save",
              options: {
                title: "选择输出目录",
                defaultPath: ".",
                properties: ["openDirectory"],
              },
            },
          },
        },
        {
          key: "type",
          label: "输出格式",
          type: "select",
          icon: "transform",
          width: 3,
          defaultValue: "ico",
          options: ["ico", "icns"],
        },
      ],
    },
  ],
};

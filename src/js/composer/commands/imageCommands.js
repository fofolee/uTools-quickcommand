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
      icon: "analytics",
      asyncMode: "await",
      config: [
        {
          label: "图片文件",
          component: "VariableInput",
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
      outputs: {
        label: "图片信息",
        suggestName: "imageInfo",
        structure: {
          width: { label: "宽度", suggestName: "imageWidth" },
          height: { label: "高度", suggestName: "imageHeight" },
          aspectRatio: { label: "宽高比", suggestName: "imageAspectRatio" },
          resolution: { label: "分辨率", suggestName: "imageResolution" },
          type: { label: "类型", suggestName: "imageType" },
          format: { label: "格式", suggestName: "imageFormat" },
          size: { label: "大小", suggestName: "imageSize" },
          bytes: { label: "字节", suggestName: "imageBytes" },
          createTime: { label: "创建时间", suggestName: "imageCreateTime" },
          modifyTime: { label: "修改时间", suggestName: "imageModifyTime" },
          accessTime: { label: "访问时间", suggestName: "imageAccessTime" },
          path: { label: "路径", suggestName: "imagePath" },
          filename: { label: "文件名", suggestName: "imageFilename" },
          colorInfo: {
            label: "颜色信息",
            averageColor: {
              label: "平均RGBA",
              suggestName: "imageAverageRgba",
            },
            isTransparent: {
              label: "是否透明",
              suggestName: "imageIsTransparent",
            },
            hasAlphaChannel: {
              label: "是否包含Alpha通道",
              suggestName: "imageHasAlphaChannel",
            },
          },
          exif: { label: "EXIF", suggestName: "imageExif" },
          rawExif: { label: "原始EXIF", suggestName: "imageRawExif" },
          naturalWidth: { label: "自然宽度", suggestName: "imageNaturalWidth" },
          naturalHeight: {
            label: "自然高度",
            suggestName: "imageNaturalHeight",
          },
        },
      },
    },
    {
      value: "quickcomposer.image.resize",
      label: "调整大小",
      icon: "aspect_ratio",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
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
          label: "输出文件",
          component: "VariableInput",
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
          label: "宽度(像素)",
          component: "VariableInput",
          icon: "compare_arrows",
          width: 6,
          disableToggleType: true,
          defaultValue: newVarInputVal("var", "100"),
        },
        {
          label: "高度(像素)",
          component: "VariableInput",
          icon: "height",
          width: 6,
          disableToggleType: true,
          defaultValue: newVarInputVal("var", "100"),
        },
        {
          label: "保持宽高比",
          component: "QSelect",
          icon: "aspect_ratio",
          width: 6,
          defaultValue: "true",
          options: [
            { label: "是", value: "true" },
            { label: "否", value: "false" },
          ],
        },
        {
          label: "图片质量(0-1)",
          component: "NumberInput",
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
      icon: "rotate_right",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
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
          label: "输出文件",
          component: "VariableInput",
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
          label: "旋转角度",
          component: "NumberInput",
          icon: "rotate_right",
          width: 6,
          step: 90,
          defaultValue: 90,
        },
        {
          label: "图片质量(0-1)",
          component: "NumberInput",
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
      icon: "crop",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
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
          label: "输出文件",
          component: "VariableInput",
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
          label: "起始X坐标",
          component: "VariableInput",
          icon: "arrow_right",
          width: 6,
          disableToggleType: true,
          defaultValue: newVarInputVal("var", "0"),
        },
        {
          label: "起始Y坐标",
          component: "VariableInput",
          icon: "arrow_downward",
          width: 6,
          disableToggleType: true,
          defaultValue: newVarInputVal("var", "0"),
        },
        {
          label: "裁剪宽度",
          component: "VariableInput",
          icon: "compare_arrows",
          width: 6,
          disableToggleType: true,
          defaultValue: newVarInputVal("var"),
        },
        {
          label: "裁剪高度",
          component: "VariableInput",
          icon: "height",
          width: 6,
          disableToggleType: true,
          defaultValue: newVarInputVal("var"),
        },
        {
          label: "图片质量(0-1)",
          component: "NumberInput",
          icon: "high_quality",
          width: 12,
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
      icon: "format_color_text",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
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
          label: "输出文件",
          component: "VariableInput",
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
          label: "水印文字",
          component: "VariableInput",
          icon: "text_fields",
          width: 12,
          defaultValue: newVarInputVal("str", "水印文字"),
        },
        {
          label: "字体设置",
          component: "VariableInput",
          icon: "font_download",
          width: 6,
          defaultValue: newVarInputVal("str", "24px Arial"),
        },
        {
          label: "文字颜色",
          component: "VariableInput",
          icon: "format_color_text",
          width: 6,
          defaultValue: newVarInputVal("str", "rgba(255, 255, 255, 0.5)"),
        },
        {
          label: "位置",
          component: "QSelect",
          icon: "place",
          width: 6,
          defaultValue: "bottomRight",
          options: WATERMARK_POSITIONS,
        },
        {
          label: "边距",
          component: "NumberInput",
          icon: "space_bar",
          min: 0,
          step: 10,
          width: 6,
          defaultValue: 20,
        },
        {
          label: "不透明度(0-1)",
          component: "NumberInput",
          icon: "opacity",
          max: 1,
          min: 0,
          step: 0.05,
          width: 6,
          defaultValue: 0.5,
        },
        {
          label: "图片质量(0-1)",
          component: "NumberInput",
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
      icon: "transform",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
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
          label: "输出文件",
          component: "VariableInput",
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
          label: "输出格式",
          component: "QSelect",
          icon: "transform",
          width: 6,
          defaultValue: "jpeg",
          options: IMAGE_FORMATS,
        },
        {
          label: "图片质量(0-1)",
          component: "NumberInput",
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
      neverHasOutput: true,
      icon: "transform",
      config: [
        {
          label: "PNG路径/Base64",
          component: "VariableInput",
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
          label: "输出目录",
          component: "VariableInput",
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
          label: "输出格式",
          component: "QSelect",
          icon: "transform",
          width: 3,
          defaultValue: "ico",
          options: ["ico", "icns"],
        },
      ],
    },
  ],
};

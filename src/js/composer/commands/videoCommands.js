import { newVarInputVal } from "js/composer/varInputValManager";

const getDesktopPath = (fileName) => {
  return window.joinPath(utools.getPath("desktop"), fileName);
};

// 视频编码器选项
const VIDEO_ENCODERS = [
  { label: "H.264", value: "libx264" },
  { label: "H.265", value: "libx265" },
  { label: "VP8", value: "libvpx" },
  { label: "VP9", value: "libvpx-vp9" },
];

// 音频编码器选项
const AUDIO_ENCODERS = [
  { label: "AAC", value: "aac" },
  { label: "MP3", value: "libmp3lame" },
  { label: "Opus", value: "libopus" },
  { label: "Vorbis", value: "libvorbis" },
];

// 图片格式选项
const IMAGE_FORMATS = [
  { label: "JPG", value: "jpg" },
  { label: "PNG", value: "png" },
];

// 编码器预设选项
const ENCODER_PRESETS = [
  { label: "保持不变", value: "keep" },
  { label: "超快", value: "ultrafast" },
  { label: "非常快", value: "veryfast" },
  { label: "快速", value: "fast" },
  { label: "中等", value: "medium" },
  { label: "慢速", value: "slow" },
  { label: "非常慢", value: "veryslow" },
];

// 视频质量选项
const VIDEO_QUALITY = [
  { label: "保持不变", value: "keep" },
  { label: "高质量", value: "high" },
  { label: "中等质量", value: "medium" },
  { label: "低质量", value: "low" },
];

// 分辨率选项
const RESOLUTIONS = [
  { label: "保持不变", value: "keep" },
  { label: "4K(3840x2160)", value: "3840:2160" },
  { label: "2K(2560x1440)", value: "2560:1440" },
  { label: "1080P(1920x1080)", value: "1920:1080" },
  { label: "720P(1280x720)", value: "1280:720" },
  { label: "480P(854x480)", value: "854:480" },
];

// 视频格式选项
const VIDEO_FORMATS = [
  { label: "MP4 (通用格式)", value: "mp4" },
  { label: "WebM (网页视频)", value: "webm" },
  { label: "MKV (高清视频)", value: "mkv" },
  { label: "AVI (传统格式)", value: "avi" },
];

// 设备优化选项
const DEVICE_PRESETS = [
  { label: "通用", value: "general" },
  { label: "手机", value: "mobile" },
  { label: "平板", value: "tablet" },
  { label: "电视", value: "tv" },
];

// 码率控制模式
const BITRATE_MODES = [
  { label: "自动", value: "auto" },
  { label: "固定码率", value: "cbr" },
  { label: "可变码率", value: "vbr" },
];

// 声道选项
const AUDIO_CHANNELS = [
  { label: "保持原有", value: "keep" },
  { label: "单声道", value: "mono" },
  { label: "立体声", value: "stereo" },
  { label: "5.1环绕", value: "5.1" },
];

// 采样率选项
const SAMPLE_RATES = [
  { label: "保持原有", value: "keep" },
  { label: "44.1kHz", value: "44100" },
  { label: "48kHz", value: "48000" },
];

export const videoCommands = {
  label: "视频操作",
  icon: "video_library",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.video.convertFormat",
      label: "格式转换",
      icon: "transform",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: [
                      "mp4",
                      "avi",
                      "mkv",
                      "mov",
                      "wmv",
                      "flv",
                      "webm",
                    ],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "MP4视频",
                    extensions: ["mp4"],
                  },
                  {
                    name: "WebM视频",
                    extensions: ["webm"],
                  },
                  {
                    name: "MKV视频",
                    extensions: ["mkv"],
                  },
                  {
                    name: "AVI视频",
                    extensions: ["avi"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            format: {
              label: "目标格式",
              component: "QSelect",
              width: 3,
              options: VIDEO_FORMATS,
            },
            devicePreset: {
              label: "设备优化",
              component: "QSelect",
              width: 3,
              options: DEVICE_PRESETS,
            },
            resolution: {
              label: "分辨率",
              component: "QSelect",
              width: 3,
              options: RESOLUTIONS,
            },
            fps: {
              label: "帧率",
              component: "NumberInput",
              width: 3,
              min: 1,
              max: 60,
              placeholder: "保持原有",
            },
            quality: {
              label: "视频质量",
              component: "QSelect",
              width: 4,
              options: VIDEO_QUALITY,
            },
            preset: {
              label: "编码速度",
              component: "QSelect",
              width: 4,
              options: ENCODER_PRESETS,
            },
            crf: {
              label: "CRF(0-51)",
              component: "NumberInput",
              width: 4,
              min: 0,
              max: 51,
              placeholder: "自动",
            },
            bitrateMode: {
              label: "码率控制",
              component: "QSelect",
              width: 4,
              options: BITRATE_MODES,
            },
            videoBitrate: {
              label: "视频码率(Kbps)",
              component: "NumberInput",
              width: 4,
              min: 100,
              placeholder: "自动",
            },
            videoCodec: {
              label: "视频编码器",
              component: "QSelect",
              width: 4,
              options: [
                { label: "自动选择", value: "copy" },
                ...VIDEO_ENCODERS,
              ],
            },
            audioChannels: {
              label: "声道",
              component: "QSelect",
              width: 4,
              options: AUDIO_CHANNELS,
            },
            sampleRate: {
              label: "采样率",
              component: "QSelect",
              width: 4,
              options: SAMPLE_RATES,
            },
            audioBitrate: {
              label: "音频码率(Kbps)",
              component: "NumberInput",
              width: 4,
              min: 32,
              max: 320,
              placeholder: "自动",
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 12,
            },
          },
          defaultValue: {
            format: "mp4",
            devicePreset: "general",
            resolution: "keep",
            fps: null,
            quality: "keep",
            preset: "keep",
            crf: null,
            bitrateMode: "auto",
            videoBitrate: null,
            videoCodec: "copy",
            audioChannels: "keep",
            sampleRate: "keep",
            audioBitrate: null,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.compressVideo",
      label: "视频压缩",
      icon: "compress",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            encoder: {
              label: "视频编码器",
              component: "QSelect",
              width: 3,
              options: VIDEO_ENCODERS,
            },
            preset: {
              label: "压缩预设",
              component: "QSelect",
              width: 3,
              options: ENCODER_PRESETS,
            },
            crf: {
              label: "质量(0-51)",
              component: "NumberInput",
              width: 3,
              min: 0,
              max: 51,
            },
            resolution: {
              label: "分辨率",
              component: "QSelect",
              width: 3,
              options: RESOLUTIONS,
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 12,
            },
          },
          defaultValue: {
            encoder: "libx264",
            preset: "medium",
            crf: 23,
            resolution: "keep",
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.convertToGif",
      label: "视频转GIF",
      icon: "gif",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存GIF",
                filters: [
                  {
                    name: "GIF图片",
                    extensions: ["gif"],
                  },
                ],
                defaultPath: "output.gif",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.gif")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            fps: {
              label: "帧率",
              component: "NumberInput",
              icon: "speed",
              width: 4,
              min: 1,
              max: 60,
            },
            width: {
              label: "宽度",
              component: "NumberInput",
              icon: "width",
              width: 4,
              min: 1,
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 4,
            },
          },
          defaultValue: {
            fps: 15,
            width: 480,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.extractAudio",
      label: "提取音频",
      icon: "audio_file",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存音频",
                filters: [
                  {
                    name: "音频文件",
                    extensions: ["mp3", "aac", "wav", "m4a"],
                  },
                ],
                defaultPath: "output.mp3",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp3")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            quality: {
              label: "音频质量",
              component: "NumberInput",
              icon: "high_quality",
              width: 6,
              min: 0,
              max: 9,
              placeholder: "0-9，0为最高质量",
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 6,
            },
          },
          defaultValue: {
            quality: 0,
            overwrite: true,
          },
        },
      ],
    },
    // utools接口目前好像有问题，无法结束录制，暂时注释
    // {
    //   value: "quickcomposer.video.recordScreen",
    //   label: "录制屏幕",
    //   icon: "screen_record",
    //   asyncMode: "await",
    //   config: [
    //     {
    //       label: "输出文件",
    //       component: "VariableInput",
    //       icon: "save",
    //       width: 12,
    //       options: {
    //         dialog: {
    //           type: "save",
    //           options: {
    //             title: "保存录屏",
    //             filters: [
    //               {
    //                 name: "视频文件",
    //                 extensions: ["mp4"],
    //               },
    //             ],
    //             defaultPath: "output.mp4",
    //           },
    //         },
    //       },
    //       defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
    //     },
    //     {
    //       component: "OptionEditor",
    //       width: 12,
    //       options: {
    //         fps: {
    //           label: "帧率",
    //           component: "NumberInput",
    //           icon: "speed",
    //           width: 6,
    //           min: 1,
    //           max: 60,
    //         },
    //         overwrite: {
    //           label: "覆盖已存在目标文件",
    //           component: "CheckButton",
    //           width: 6,
    //         },
    //       },
    //       defaultValue: {
    //         fps: 30,
    //         overwrite: true,
    //       },
    //     },
    //   ],
    // },
    {
      value: "quickcomposer.video.cutVideo",
      label: "截取片段",
      icon: "content_cut",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            start: {
              label: "开始时间",
              component: "TimeInput",
              icon: "schedule",
              width: 4,
              placeholder: "00:00:00",
            },
            duration: {
              label: "持续时长",
              component: "TimeInput",
              icon: "timer",
              width: 4,
              placeholder: "00:00:00",
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 4,
            },
          },
          defaultValue: {
            start: "00:00:00",
            duration: "00:00:10",
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.rotateVideo",
      label: "旋转/翻转",
      icon: "rotate_90_degrees_ccw",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            rotate: {
              label: "旋转角度",
              component: "QSelect",
              width: 3,
              options: [
                { label: "不旋转", value: 0 },
                { label: "90度", value: 90 },
                { label: "180度", value: 180 },
                { label: "270度", value: 270 },
              ],
            },
            flipH: {
              label: "水平翻转",
              component: "CheckButton",
              width: 3,
            },
            flipV: {
              label: "垂直翻转",
              component: "CheckButton",
              width: 3,
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 3,
            },
          },
          defaultValue: {
            rotate: 0,
            flipH: false,
            flipV: false,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.addWatermark",
      label: "添加水印",
      icon: "branding_watermark",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
              },
            },
          },
        },
        {
          label: "水印图片",
          component: "VariableInput",
          icon: "image",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择水印图片",
                filters: [
                  {
                    name: "图片文件",
                    extensions: ["png", "jpg", "jpeg", "gif"],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            position: {
              label: "位置",
              component: "QSelect",
              width: 3,
              options: [
                { label: "左上", value: "topleft" },
                { label: "右上", value: "topright" },
                { label: "左下", value: "bottomleft" },
                { label: "右下", value: "bottomright" },
                { label: "居中", value: "center" },
              ],
            },
            padding: {
              label: "边距",
              component: "NumberInput",
              width: 3,
              min: 0,
            },
            scale: {
              label: "缩放比例",
              component: "NumberInput",
              width: 3,
              min: 0.1,
              max: 1,
              step: 0.1,
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 3,
            },
          },
          defaultValue: {
            position: "bottomright",
            padding: 10,
            scale: 0.1,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.mergeVideos",
      label: "合并视频",
      icon: "merge",
      description: "将多个视频文件合并为一个，分辨率会统一为第一个视频的分辨率",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          placeholder: "合并的视频顺序依据选择的视频顺序",
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                properties: ["openFile", "multiSelections"],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 12,
            },
          },
          defaultValue: {
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.changeSpeed",
      label: "视频调速",
      icon: "speed",
      description: "调整视频播放速度，调速区间0.25-4",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            speed: {
              label: "速度倍数",
              component: "NumberInput",
              width: 4,
              min: 0.25,
              max: 4,
              step: 0.25,
              placeholder: "0.25-4",
            },
            keepPitch: {
              label: "保持音调",
              component: "CheckButton",
              width: 4,
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 4,
            },
          },
          defaultValue: {
            speed: 1,
            keepPitch: true,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.resizeVideo",
      label: "调整分辨率",
      icon: "aspect_ratio",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            width: {
              label: "宽度",
              component: "NumberInput",
              width: 3,
              min: -1,
              placeholder: "保持比例填-1",
            },
            height: {
              label: "高度",
              component: "NumberInput",
              width: 3,
              min: -1,
              placeholder: "保持比例填-1",
            },
            keepAspectRatio: {
              label: "保持宽高比",
              component: "CheckButton",
              width: 3,
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 3,
            },
          },
          defaultValue: {
            width: -1,
            height: -1,
            keepAspectRatio: true,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.cropVideo",
      label: "裁剪画面",
      icon: "crop",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存视频",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
                defaultPath: "output.mp4",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("output.mp4")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            x: {
              label: "X坐标",
              component: "NumberInput",
              width: 3,
              min: 0,
              placeholder: "起始X坐标",
            },
            y: {
              label: "Y坐标",
              component: "NumberInput",
              width: 3,
              min: 0,
              placeholder: "起始Y坐标",
            },
            width: {
              label: "宽度",
              component: "NumberInput",
              width: 3,
              min: 1,
              placeholder: "裁剪宽度",
            },
            height: {
              label: "高度",
              component: "NumberInput",
              width: 3,
              min: 1,
              placeholder: "裁剪高度",
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 12,
            },
          },
          defaultValue: {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.extractFrames",
      label: "导出帧序列",
      icon: "burst_mode",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
              },
            },
          },
        },
        {
          label: "输出文件",
          component: "VariableInput",
          icon: "save",
          width: 12,
          description: "使用 %d 表示帧序号，例如: frame_%d.jpg",
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存图片序列",
                filters: [
                  {
                    name: "JPG图片",
                    extensions: ["jpg"],
                  },
                  {
                    name: "PNG图片",
                    extensions: ["png"],
                  },
                ],
                defaultPath: "frame_%d.jpg",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("frame_%d.jpg")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            fps: {
              label: "每秒帧数",
              component: "NumberInput",
              width: 3,
              min: 0.1,
              max: 60,
              step: 0.1,
            },
            format: {
              label: "图片格式",
              component: "QSelect",
              width: 3,
              options: IMAGE_FORMATS,
            },
            quality: {
              label: "图片质量",
              component: "NumberInput",
              width: 3,
              min: 1,
              max: 100,
              placeholder: "1-100",
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 3,
            },
          },
          defaultValue: {
            fps: 1,
            format: "jpg",
            quality: 90,
            overwrite: true,
          },
        },
      ],
    },
    {
      value: "quickcomposer.video.generateThumbnail",
      label: "生成缩略图",
      icon: "photo",
      asyncMode: "await",
      config: [
        {
          label: "输入文件",
          component: "VariableInput",
          icon: "video_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择视频文件",
                filters: [
                  {
                    name: "视频文件",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
                  },
                ],
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
                title: "保存缩略图",
                filters: [
                  {
                    name: "JPG图片",
                    extensions: ["jpg"],
                  },
                  {
                    name: "PNG图片",
                    extensions: ["png"],
                  },
                ],
                defaultPath: "thumbnail.jpg",
              },
            },
          },
          defaultValue: newVarInputVal("str", getDesktopPath("thumbnail.jpg")),
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            time: {
              label: "时间点(秒)",
              component: "NumberInput",
              width: 3,
              min: 0,
              step: 0.1,
            },
            width: {
              label: "宽度",
              component: "NumberInput",
              width: 3,
              min: 1,
            },
            format: {
              label: "图片格式",
              component: "QSelect",
              width: 3,
              options: IMAGE_FORMATS,
            },
            quality: {
              label: "图片质量",
              component: "NumberInput",
              width: 3,
              min: 1,
              max: 100,
              placeholder: "1-100",
            },
            overwrite: {
              label: "覆盖已存在目标文件",
              component: "CheckButton",
              width: 12,
            },
          },
          defaultValue: {
            time: 0,
            width: 320,
            format: "jpg",
            quality: 90,
            overwrite: true,
          },
        },
      ],
    },
  ],
};

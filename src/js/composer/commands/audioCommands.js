import { newVarInputVal } from "js/composer/varInputValManager";

// 系统音效选项
const SYSTEM_SOUNDS = [
  { label: "提示音", value: "beep" },
  { label: "错误音", value: "error" },
  { label: "警告音", value: "warning" },
  { label: "通知音", value: "notification" },
  { label: "完成音", value: "complete" },
  { label: "点击音", value: "click" },
];

// 语音朗读配置
const SPEECH_CONFIG = {
  label: "朗读配置",
  type: "dictEditor",
  icon: "settings",
  width: 12,
  defaultValue: {
    rate: newVarInputVal("var", "1"),
    pitch: newVarInputVal("var", "1"),
    volume: newVarInputVal("var", "1"),
    lang: newVarInputVal("str", "zh-CN"),
  },
  options: {
    fixedKeys: [
      { value: "rate", label: "语速(0.1-10)" },
      { value: "pitch", label: "音调(0-2)" },
      { value: "volume", label: "音量(0-1)" },
      { value: "lang", label: "语言" },
    ],
    disableAdd: true,
  },
};

export const audioCommands = {
  label: "音频操作",
  icon: "volume_up",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.audio.speech.speak",
      label: "文本朗读",
      desc: "系统语音朗读",
      icon: "record_voice_over",
      subCommands: [
        {
          value: "quickcomposer.audio.speech.speak",
          label: "朗读文本",
          icon: "record_voice_over",
          config: [
            {
              label: "朗读文本",
              type: "varInput",
              icon: "text_fields",
              width: 12,
            },
            SPEECH_CONFIG,
          ],
        },
        {
          value: "quickcomposer.audio.speech.stop",
          label: "停止朗读",
          icon: "voice_over_off",
        },
      ],
    },
    {
      value: "quickcomposer.audio.media.play",
      label: "音频播放",
      desc: "播放音频文件",
      icon: "music_note",
      subCommands: [
        {
          value: "quickcomposer.audio.media.play",
          label: "播放音频",
          icon: "play_circle",
          config: [
            {
              label: "音频文件路径",
              type: "varInput",
              icon: "audio_file",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择音频文件",
                    filters: [
                      {
                        name: "音频文件",
                        extensions: ["mp3", "wav", "ogg", "m4a", "aac"],
                      },
                    ],
                    properties: ["openFile", "showHiddenFiles"],
                  },
                },
              },
            },
            {
              label: "音量",
              type: "numInput",
              icon: "volume_up",
              width: 4,
              defaultValue: 1,
              min: 0,
              max: 1,
              step: 0.1,
            },
            {
              label: "循环播放",
              type: "switch",
              icon: "repeat",
              width: 4,
              defaultValue: false,
            },
            {
              label: "自动播放",
              type: "switch",
              icon: "play_circle",
              width: 4,
              defaultValue: true,
            },
          ],
        },
        {
          value: "quickcomposer.audio.media.stop",
          label: "停止播放",
          icon: "stop",
        },
      ],
    },
    {
      value: "quickcomposer.audio.record",
      label: "音频录制",
      desc: "录制系统音频",
      icon: "mic",
      config: [
        {
          label: "录制时长(ms)",
          type: "numInput",
          icon: "timer",
          width: 6,
          defaultValue: 5000,
          min: 1000,
          step: 1000,
        },
        {
          label: "保存路径",
          type: "varInput",
          icon: "save",
          width: 6,
          options: {
            dialog: {
              type: "save",
              options: {
                title: "保存录音",
                filters: [
                  {
                    name: "音频文件",
                    extensions: ["webm"],
                  },
                ],
              },
            },
          },
        },
      ],
    },
    {
      value: "quickcomposer.audio.media.beep",
      label: "系统音效",
      desc: "播放系统内置音效",
      icon: "notifications_active",
      config: [
        {
          label: "音效类型",
          type: "select",
          icon: "music_note",
          width: 6,
          options: SYSTEM_SOUNDS,
          defaultValue: "beep",
        },
        {
          label: "音量",
          type: "numInput",
          icon: "volume_up",
          width: 6,
          defaultValue: 1,
          min: 0,
          max: 1,
          step: 0.1,
        },
      ],
    },
    {
      value: "quickcomposer.audio.media.analyze",
      label: "音频信息",
      desc: "分析音频文件信息",
      icon: "analytics",
      isAsync: true,
      config: [
        {
          label: "音频文件",
          type: "varInput",
          icon: "audio_file",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                title: "选择音频文件",
                filters: [
                  {
                    name: "音频文件",
                    extensions: ["mp3", "wav", "ogg", "m4a", "aac"],
                  },
                ],
                properties: ["openFile", "showHiddenFiles"],
              },
            },
          },
        },
      ],
    },
  ],
};

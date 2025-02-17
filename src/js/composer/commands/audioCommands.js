// 系统音效选项
const SYSTEM_SOUNDS = [
  { label: "提示音", value: "beep" },
  { label: "错误音", value: "error" },
  { label: "警告音", value: "warning" },
  { label: "通知音", value: "notification" },
  { label: "完成音", value: "complete" },
  { label: "点击音", value: "click" },
];

const LANGUAGES = [
  { label: "中文", value: "zh-CN" },
  { label: "英文", value: "en-US" },
  { label: "日语", value: "ja-JP" },
  { label: "韩语", value: "ko-KR" },
  { label: "法语", value: "fr-FR" },
  { label: "德语", value: "de-DE" },
  { label: "西班牙语", value: "es-ES" },
];

// 语音朗读配置
const SPEECH_CONFIG = {
  label: "朗读配置",
  component: "OptionEditor",
  icon: "settings",
  width: 12,
  defaultValue: {
    rate: 0.5,
    pitch: 1,
    volume: 1,
    lang: "zh-CN",
  },
  options: {
    rate: {
      label: "语速(0.1-10)",
      component: "NumberInput",
      min: 0,
      max: 10,
      step: 0.1,
      width: 3,
    },
    pitch: {
      label: "音调(0-2)",
      component: "NumberInput",
      min: 0,
      max: 2,
      step: 0.1,
      width: 3,
    },
    volume: {
      label: "音量(0-1)",
      component: "NumberInput",
      min: 0,
      max: 1,
      step: 0.1,
      width: 3,
    },
    lang: {
      label: "语言",
      component: "QSelect",
      options: LANGUAGES,
      width: 3,
    },
  },
};

const MEDIA_PLAY_CONFIG = {
  label: "播放配置",
  component: "OptionEditor",
  icon: "settings",
  width: 12,
  defaultValue: {
    volume: 1,
    loop: false,
    autoPlay: true,
  },
  options: {
    volume: {
      label: "音量",
      component: "NumberInput",
      min: 0,
      max: 1,
      step: 0.1,
      width: 4,
    },
    loop: {
      label: "循环播放",
      component: "CheckButton",
      width: 4,
    },
    autoPlay: {
      label: "自动播放",
      component: "CheckButton",
      width: 4,
    },
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
      asyncMode: "await",
      icon: "record_voice_over",
      subCommands: [
        {
          value: "quickcomposer.audio.speech.speak",
          label: "朗读文本",
          icon: "record_voice_over",
          config: [
            {
              label: "朗读文本",
              component: "VariableInput",
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
      icon: "music_note",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.audio.media.play",
          label: "播放音频",
          icon: "play_circle",
          config: [
            {
              label: "音频文件路径",
              component: "VariableInput",
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
            MEDIA_PLAY_CONFIG,
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
      icon: "mic",
      asyncMode: "await",
      config: [
        {
          label: "录制时长(ms)",
          component: "NumberInput",
          icon: "timer",
          width: 6,
          defaultValue: 5000,
          min: 1000,
          step: 1000,
        },
        {
          label: "保存路径",
          component: "VariableInput",
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
      asyncMode: "await",
      icon: "notifications_active",
      config: [
        {
          label: "音效类型",
          component: "QSelect",
          icon: "music_note",
          width: 6,
          options: SYSTEM_SOUNDS,
          defaultValue: "beep",
        },
        {
          label: "音量",
          component: "NumberInput",
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
      icon: "analytics",
      asyncMode: "await",
      config: [
        {
          label: "音频文件",
          component: "VariableInput",
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
      outputs: {
        label: "音频信息",
        suggestName: "audioInfo",
        structure: {
          duration: { label: "时长", suggestName: "audioDuration" },
          channels: { label: "声道", suggestName: "audioChannels" },
          sampleRate: { label: "采样率", suggestName: "audioSampleRate" },
        },
      },
    },
  ],
};

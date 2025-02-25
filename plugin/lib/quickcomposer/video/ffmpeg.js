const checkFFmpeg = () => {
  if (!utools.runFFmpeg) {
    quickcommand.showSystemMessageBox("请先升级uTools到6.1.0及以上版本");
    return false;
  }
  return true;
};

/**
 * 运行FFmpeg命令并显示进度条
 * @param {string[]} args FFmpeg命令参数
 * @param {object} options 选项
 * @param {string} options.title 进度条标题
 * @param {string} options.text 进度条文本
 * @param {string} options.position 进度条位置
 * @param {function} options.onPause 暂停回调
 * @param {function} options.onResume 恢复回调
 * @param {boolean} options.isShowProcessBar 是否显示进度条
 * @returns {Promise} 返回Promise
 */
async function runFFmpeg(args, options = {}) {
  if (!checkFFmpeg()) return;

  const {
    text = "处理中...",
    position = "bottom-right",
    onPause,
    onResume,
    isShowProcessBar = true,
  } = options;

  let ffmpegRun;

  // 显示进度条
  const processBar = isShowProcessBar
    ? await quickcommand.showProcessBar({
        text,
        value: 0,
        position,
        onPause,
        onResume,
        onClose: () => {
          // 关闭时终止FFmpeg
          if (ffmpegRun) {
            try {
              ffmpegRun.quit();
            } catch (error) {
              console.log(error);
            }
          }
          ffmpegRun = null;
        },
      })
    : null;

  // 运行FFmpeg
  ffmpegRun = utools.runFFmpeg(args, (progress) => {
    // 更新进度条
    if (progress.percent !== undefined) {
      const intProgress = Math.round(progress.percent);
      if (processBar) {
        quickcommand.updateProcessBar(
          {
            value: intProgress,
            text: `${text} (${intProgress}%) - 速度: ${progress.speed}`,
          },
          processBar
        );
      }
    } else {
      // 如果没有进度百分比，显示已处理时间
      if (processBar) {
        quickcommand.updateProcessBar(
          {
            text: `${text} - 已处理: ${progress.time} - 速度: ${progress.speed}`,
          },
          processBar
        );
      }
    }
  });

  return new Promise((resolve, reject) => {
    ffmpegRun
      .then(() => {
        if (processBar) {
          quickcommand.updateProcessBar(
            {
              value: 100,
              text: "处理完成, 即将关闭进度条",
            },
            processBar
          );
          quickcommand.asyncSleep(500).then(() => {
            processBar.close();
          });
        }
        resolve();
      })
      .catch((error) => {
        if (processBar) {
          quickcommand.updateProcessBar(
            {
              text: `处理出错: ${error.message}`,
            },
            processBar
          );
        }
        reject(error);
      });
  });
}

/**
 * 压缩视频
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 压缩选项
 * @param {string} options.encoder 视频编码器
 * @param {string} options.preset 压缩预设
 * @param {number} options.crf 视频质量(0-51)
 * @param {string} options.resolution 分辨率(keep/3840:2160/2560:1440/1920:1080/1280:720/854:480)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function compressVideo(input, output, options = {}) {
  const {
    encoder = "libx264",
    preset = "medium",
    crf = 23,
    resolution = "keep",
    overwrite = false,
  } = options;

  const args = [];

  // 覆盖参数必须在最前面
  if (overwrite) {
    args.push("-y");
  }

  args.push("-i", input);

  // 如果需要调整分辨率
  if (resolution !== "keep") {
    const [width, height] = resolution.split(":");
    args.push(
      "-vf",
      `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`
    );
  }

  args.push(
    "-c:v",
    encoder,
    "-preset",
    preset,
    "-crf",
    crf.toString(),
    "-c:a",
    "copy",
    output
  );

  await runFFmpeg(args, {
    title: "视频压缩",
    text: "正在压缩视频...",
  });
}

/**
 * 视频转GIF
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 转换选项
 * @param {number} options.fps 帧率
 * @param {number} options.width 宽度
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function convertToGif(input, output, options = {}) {
  const { fps = 15, width = 480, overwrite = false } = options;

  const args = [];

  // 覆盖参数必须在最前面
  if (overwrite) {
    args.push("-y");
  }

  args.push(
    "-i",
    input,
    "-vf",
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
    "-loop",
    "0",
    output
  );

  await runFFmpeg(args, {
    title: "GIF转换",
    text: "正在转换为GIF...",
  });
}

/**
 * 提取音频
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 提取选项
 * @param {number} options.quality 音频质量(0-9)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function extractAudio(input, output, options = {}) {
  const { quality = 0, overwrite = false } = options;

  const args = [];

  // 覆盖参数必须在最前面
  if (overwrite) {
    args.push("-y");
  }

  args.push("-i", input, "-q:a", quality.toString(), "-map", "a", output);

  await runFFmpeg(args, {
    title: "音频提取",
    text: "正在提取音频...",
  });
}

/**
 * 录制屏幕
 * @param {string} output 输出文件路径
 * @param {object} options 录制选项
 * @param {number} options.fps 帧率
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 *
 * utools接口目前好像有问题，无法结束录制
 */
async function recordScreen(output, options = {}) {
  if (!checkFFmpeg()) return;

  const { fps = 30, overwrite = false } = options;

  const args = [];

  // 覆盖参数必须在最前面
  if (overwrite) {
    args.push("-y");
  }

  // 根据操作系统选择录屏命令
  if (process.platform === "win32") {
    args.push("-f", "gdigrab", "-framerate", fps.toString(), "-i", "desktop");
  } else if (process.platform === "darwin") {
    args.push(
      "-f",
      "avfoundation",
      "-framerate",
      fps.toString(),
      "-i",
      "default"
    );
  } else {
    args.push("-f", "x11grab", "-framerate", fps.toString(), "-i", ":0.0");
  }

  // 添加输出文件
  args.push(output);

  const ffmpegRun = utools.runFFmpeg(args);

  return new Promise((resolve, reject) => {
    ffmpegRun.catch((e) => {
      quickcommand.showSystemMessageBox("录制失败: " + e.message);
      reject(e);
    });

    quickcommand
      .showSystemWaitButton({
        text: "结束录制",
      })
      .then((confirm) => {
        console.log("结束录制", confirm, ffmpegRun.quit);
        if (confirm) {
          ffmpegRun.quit();
          resolve();
        } else {
          ffmpegRun.kill();
          reject(new Error("录制取消"));
        }
      });
  });
}

/**
 * 将时间字符串转换为秒数
 * @param {string} timeStr 时间字符串 (格式: HH:mm:ss)
 * @returns {number} 秒数
 */
function timeToSeconds(timeStr) {
  if (typeof timeStr === "number") return timeStr;

  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    // HH:mm:ss
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // mm:ss
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // ss
    return parts[0];
  }
  return 0;
}

/**
 * 截取视频片段
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 截取选项
 * @param {string|number} options.start 开始时间(HH:mm:ss 或秒数)
 * @param {string|number} options.duration 持续时长(HH:mm:ss 或秒数)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function cutVideo(input, output, options = {}) {
  const {
    start = "00:00:00",
    duration = "00:00:10",
    overwrite = false,
  } = options;

  const args = [];

  // 覆盖参数必须在最前面
  if (overwrite) {
    args.push("-y");
  }

  // 转换时间格式为秒数
  const startSeconds = timeToSeconds(start);
  const durationSeconds = timeToSeconds(duration);

  args.push(
    "-i",
    input,
    "-ss",
    startSeconds.toString(),
    "-t",
    durationSeconds.toString(),
    "-c",
    "copy",
    output
  );

  await runFFmpeg(args, {
    title: "视频剪切",
    text: "正在截取片段...",
  });
}

/**
 * 旋转/翻转视频
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {number} options.rotate 旋转角度(90/180/270)
 * @param {boolean} options.flipH 水平翻转
 * @param {boolean} options.flipV 垂直翻转
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function rotateVideo(input, output, options = {}) {
  const {
    rotate = 0,
    flipH = false,
    flipV = false,
    overwrite = false,
  } = options;

  const args = [];
  if (overwrite) args.push("-y");

  // 构建滤镜
  let filter = "";
  if (rotate) filter += `rotate=${(rotate * Math.PI) / 180}`;
  if (flipH) filter += (filter ? "," : "") + "hflip";
  if (flipV) filter += (filter ? "," : "") + "vflip";

  args.push("-i", input, "-vf", filter, "-c:a", "copy", output);

  await runFFmpeg(args, {
    title: "视频旋转/翻转",
    text: "正在处理视频...",
  });
}

/**
 * 添加水印
 * @param {string} input 输入文件路径
 * @param {string} watermark 水印图片路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {string} options.position 位置(topleft/topright/bottomleft/bottomright/center)
 * @param {number} options.padding 边距
 * @param {number} options.scale 缩放比例(0-1)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function addWatermark(input, watermark, output, options = {}) {
  const {
    position = "bottomright",
    padding = 10,
    scale = 0.1,
    overwrite = false,
  } = options;

  const args = [];
  if (overwrite) args.push("-y");

  // 计算水印位置
  let overlay;
  switch (position) {
    case "topleft":
      overlay = `${padding}:${padding}`;
      break;
    case "topright":
      overlay = `main_w-overlay_w-${padding}:${padding}`;
      break;
    case "bottomleft":
      overlay = `${padding}:main_h-overlay_h-${padding}`;
      break;
    case "center":
      overlay = "(main_w-overlay_w)/2:(main_h-overlay_h)/2";
      break;
    default: // bottomright
      overlay = `main_w-overlay_w-${padding}:main_h-overlay_h-${padding}`;
  }

  args.push(
    "-i",
    input,
    "-i",
    watermark,
    "-filter_complex",
    `[1:v]scale=iw*${scale}:-1[watermark];[0:v][watermark]overlay=${overlay}`,
    "-c:a",
    "copy",
    output
  );

  await runFFmpeg(args, {
    title: "添加水印",
    text: "正在添加水印...",
  });
}

/**
 * 合并视频
 * @param {string[]} inputs 输入文件路径数组
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function mergeVideos(inputs, output, options = {}) {
  if (!checkFFmpeg()) return;
  const { overwrite = false } = options;

  // 先获取第一个视频的分辨率
  let width, height;
  try {
    await new Promise((resolve, reject) => {
      utools.runFFmpeg(["-i", inputs[0]]).catch((error) => {
        // FFmpeg 在获取视频信息时会返回错误，但错误信息中包含视频信息
        const match = error.message.match(/(\d{2,5})x(\d{2,5})/);
        if (match) {
          width = match[1];
          height = match[2];
          resolve();
        } else {
          reject(new Error("无法获取视频分辨率"));
        }
      });
    });
  } catch (error) {
    throw new Error("获取视频分辨率失败: " + error.message);
  }

  const args = [];
  if (overwrite) args.push("-y");

  // 构建复杂的filter_complex命令
  let filterComplex = "";

  // 添加所有输入文件
  inputs.forEach((_, index) => {
    args.push("-i", inputs[index]);
    if (index === 0) {
      // 第一个视频不做处理
      filterComplex += `[0:v]setsar=1[v0];`;
      filterComplex += `[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a0];`;
    } else {
      // 其他视频缩放到第一个视频的分辨率
      filterComplex += `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${index}];`;
      filterComplex += `[${index}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${index}];`;
    }
  });

  // 添加concat
  filterComplex += `${inputs
    .map((_, i) => `[v${i}][a${i}]`)
    .join("")}concat=n=${inputs.length}:v=1:a=1[outv][outa]`;

  args.push(
    "-filter_complex",
    filterComplex,
    "-map",
    "[outv]",
    "-map",
    "[outa]",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    output
  );

  await runFFmpeg(args, {
    title: "合并视频",
    text: "正在合并视频...",
  });
}

/**
 * 视频调速
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {number} options.speed 速度倍数(0.25-4)
 * @param {boolean} options.keepPitch 是否保持音调
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function changeSpeed(input, output, options = {}) {
  const { speed = 1, keepPitch = true, overwrite = false } = options;

  const args = [];
  if (overwrite) args.push("-y");

  // 构建滤镜
  const tempo = 1 / speed;

  // 构建音频滤镜串
  let audioFilter;
  if (keepPitch) {
    if (speed <= 0.5) {
      // 0.25-0.5倍速
      audioFilter = `asetrate=44100*${speed},aresample=44100,atempo=2,atempo=${
        speed * 2
      }`;
    } else if (speed > 2) {
      // 2-4倍速
      audioFilter = `asetrate=44100*${speed},aresample=44100,atempo=0.5,atempo=${
        speed * 0.5
      }`;
    } else {
      // 0.5-2倍速
      audioFilter = `asetrate=44100*${speed},aresample=44100,atempo=${speed}`;
    }
  } else {
    // 不保持音调时直接调整速度
    if (speed <= 0.5) {
      audioFilter = `atempo=2,atempo=${speed * 2}`;
    } else if (speed > 2) {
      audioFilter = `atempo=0.5,atempo=${speed * 0.5}`;
    } else {
      audioFilter = `atempo=${speed}`;
    }
  }

  args.push(
    "-i",
    input,
    "-filter_complex",
    `[0:v]setpts=${tempo}*PTS[v];[0:a]${audioFilter}[a]`,
    "-map",
    "[v]",
    "-map",
    "[a]",
    output
  );

  await runFFmpeg(args, {
    title: "视频调速",
    text: "正在调整速度...",
  });
}

/**
 * 调整视频分辨率
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {number} options.width 宽度
 * @param {number} options.height 高度
 * @param {boolean} options.keepAspectRatio 保持宽高比
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function resizeVideo(input, output, options = {}) {
  const {
    width = -1,
    height = -1,
    keepAspectRatio = true,
    overwrite = false,
  } = options;

  const args = [];
  if (overwrite) args.push("-y");

  // 构建缩放滤镜
  const scale = keepAspectRatio
    ? `scale=${width}:${height}:force_original_aspect_ratio=decrease`
    : `scale=${width}:${height}`;

  args.push("-i", input, "-vf", scale, "-c:a", "copy", output);

  await runFFmpeg(args, {
    title: "调整分辨率",
    text: "正在调整视频分辨率...",
  });
}

/**
 * 视频格式转换
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {string} options.format 目标格式(mp4/webm/mkv/avi)
 * @param {string} options.devicePreset 设备优化(general/mobile/tablet/tv)
 * @param {string} options.resolution 分辨率(keep/3840:2160/2560:1440/1920:1080/1280:720/854:480)
 * @param {number} options.fps 帧率
 * @param {string} options.quality 视频质量(keep/high/medium/low)
 * @param {string} options.preset 编码速度(keep/ultrafast/veryfast/fast/medium/slow/veryslow)
 * @param {number} options.crf CRF值(0-51)
 * @param {string} options.bitrateMode 码率控制模式(auto/cbr/vbr)
 * @param {number} options.videoBitrate 视频码率(Kbps)
 * @param {string} options.videoCodec 视频编码器
 * @param {string} options.audioChannels 声道设置(keep/mono/stereo/5.1)
 * @param {string} options.sampleRate 采样率(keep/44100/48000)
 * @param {number} options.audioBitrate 音频码率(Kbps)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function convertFormat(input, output, options = {}) {
  const {
    format = "mp4",
    devicePreset = "general",
    resolution = "keep",
    fps = null,
    quality = "keep",
    preset = "keep",
    crf = null,
    bitrateMode = "auto",
    videoBitrate = null,
    videoCodec = "copy",
    audioChannels = "keep",
    sampleRate = "keep",
    audioBitrate = null,
    overwrite = false,
  } = options;

  const args = [];
  if (overwrite) args.push("-y");

  args.push("-i", input);

  // 根据设备预设设置参数
  let targetWidth, targetHeight, targetVideoBitrate, targetAudioBitrate;
  switch (devicePreset) {
    case "mobile":
      targetWidth = 1280;
      targetHeight = 720;
      targetVideoBitrate = 2000;
      targetAudioBitrate = 128;
      break;
    case "tablet":
      targetWidth = 1920;
      targetHeight = 1080;
      targetVideoBitrate = 4000;
      targetAudioBitrate = 192;
      break;
    case "tv":
      targetWidth = 3840;
      targetHeight = 2160;
      targetVideoBitrate = 8000;
      targetAudioBitrate = 320;
      break;
    default: // general
      targetWidth = null;
      targetHeight = null;
      targetVideoBitrate = null;
      targetAudioBitrate = null;
  }

  // 分辨率设置
  if (resolution !== "keep") {
    const [width, height] = resolution.split(":");
    targetWidth = parseInt(width);
    targetHeight = parseInt(height);
  }

  if (targetWidth && targetHeight) {
    args.push(
      "-vf",
      `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`
    );
  }

  // 帧率设置
  if (fps) {
    args.push("-r", fps.toString());
  }

  // 视频编码设置
  let vcodec = videoCodec;
  if (
    videoCodec === "copy" &&
    (devicePreset !== "general" || quality !== "keep")
  ) {
    // 如果选择了设备优化或质量设置，但编码器为copy，则根据格式选择合适的编码器
    switch (format) {
      case "webm":
        vcodec = "libvpx-vp9";
        break;
      case "mp4":
      case "mkv":
        vcodec = "libx264";
        break;
      case "avi":
        vcodec = "libx264";
        break;
    }
  }
  args.push("-c:v", vcodec);

  // 如果不是直接复制视频流，添加编码参数
  if (vcodec !== "copy") {
    // 质量设置
    if (quality !== "keep") {
      let targetCRF;
      switch (quality) {
        case "high":
          targetCRF = 18;
          break;
        case "medium":
          targetCRF = 23;
          break;
        case "low":
          targetCRF = 28;
          break;
      }
      args.push("-crf", targetCRF.toString());
    } else if (crf !== null) {
      args.push("-crf", crf.toString());
    }

    // 编码速度设置
    if (preset !== "keep") {
      args.push("-preset", preset);
    }

    // 码率控制
    if (bitrateMode !== "auto") {
      const vbitrate = videoBitrate || targetVideoBitrate || 4000;
      if (bitrateMode === "cbr") {
        args.push(
          "-b:v",
          `${vbitrate}k`,
          "-maxrate",
          `${vbitrate}k`,
          "-minrate",
          `${vbitrate}k`,
          "-bufsize",
          `${vbitrate * 2}k`
        );
      } else if (bitrateMode === "vbr") {
        args.push(
          "-b:v",
          `${vbitrate}k`,
          "-maxrate",
          `${vbitrate * 2}k`,
          "-bufsize",
          `${vbitrate * 4}k`
        );
      }
    }
  }

  // 音频设置
  if (audioChannels !== "keep") {
    let ac;
    switch (audioChannels) {
      case "mono":
        ac = 1;
        break;
      case "stereo":
        ac = 2;
        break;
      case "5.1":
        ac = 6;
        break;
    }
    args.push("-ac", ac.toString());
  }

  if (sampleRate !== "keep") {
    args.push("-ar", sampleRate.toString());
  }

  // 音频码率
  const abitrate = audioBitrate || targetAudioBitrate;
  if (abitrate) {
    args.push("-b:a", `${abitrate}k`);
  }

  // 为特定格式添加额外参数
  switch (format) {
    case "webm":
      if (vcodec !== "copy") {
        args.push("-deadline", "good", "-cpu-used", "2");
      }
      break;
    case "mp4":
      args.push("-movflags", "+faststart");
      break;
  }

  args.push(output);

  await runFFmpeg(args, {
    title: "格式转换",
    text: "正在转换格式...",
  });
}

/**
 * 视频裁剪(画面)
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {number} options.x 起始X坐标
 * @param {number} options.y 起始Y坐标
 * @param {number} options.width 裁剪宽度
 * @param {number} options.height 裁剪高度
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function cropVideo(input, output, options = {}) {
  const { x = 0, y = 0, width = 0, height = 0, overwrite = false } = options;

  const args = [];
  if (overwrite) args.push("-y");

  args.push(
    "-i",
    input,
    "-vf",
    `crop=${width}:${height}:${x}:${y}`,
    "-c:a",
    "copy",
    output
  );

  await runFFmpeg(args, {
    title: "视频裁剪",
    text: "正在裁剪视频...",
  });
}

/**
 * 导出图片序列
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径模式(例如: frame_%d.jpg)
 * @param {object} options 选项
 * @param {number} options.fps 每秒提取帧数
 * @param {string} options.format 图片格式(jpg/png)
 * @param {number} options.quality 图片质量(1-100)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function extractFrames(input, output, options = {}) {
  const { fps = 1, format = "jpg", quality = 100, overwrite = false } = options;

  const args = [];
  if (overwrite) args.push("-y");

  args.push("-i", input, "-vf", `fps=${fps}`, "-frame_pts", "1");

  // 根据格式设置参数
  if (format === "jpg") {
    args.push("-q:v", Math.round(((100 - quality) / 100) * 31).toString());
  } else if (format === "png") {
    args.push(
      "-compression_level",
      Math.round(((100 - quality) / 100) * 9).toString()
    );
  }

  args.push(output);

  await runFFmpeg(args, {
    title: "导出帧",
    text: "正在导出图片序列...",
  });
}

/**
 * 生成缩略图
 * @param {string} input 输入文件路径
 * @param {string} output 输出文件路径
 * @param {object} options 选项
 * @param {number} options.time 截取时间点(秒)
 * @param {number} options.width 缩略图宽度
 * @param {string} options.format 图片格式(jpg/png)
 * @param {number} options.quality 图片质量(1-100)
 * @param {boolean} options.overwrite 是否覆盖已存在的文件
 */
async function generateThumbnail(input, output, options = {}) {
  const {
    time = 0,
    width = 320,
    format = "jpg",
    quality = 90,
    overwrite = false,
  } = options;

  const args = [];
  if (overwrite) args.push("-y");

  args.push(
    "-ss",
    time.toString(),
    "-i",
    input,
    "-vframes",
    "1",
    "-vf",
    `scale=${width}:-1`
  );

  // 根据格式设置参数
  if (format === "jpg") {
    args.push("-q:v", Math.round(((100 - quality) / 100) * 31).toString());
  } else if (format === "png") {
    args.push(
      "-compression_level",
      Math.round(((100 - quality) / 100) * 9).toString()
    );
  }

  args.push(output);

  await runFFmpeg(args, {
    title: "生成缩略图",
    text: "正在生成缩略图...",
  });
}

module.exports = {
  runFFmpeg,
  compressVideo,
  convertToGif,
  extractAudio,
  recordScreen,
  cutVideo,
  rotateVideo,
  addWatermark,
  mergeVideos,
  changeSpeed,
  resizeVideo,
  convertFormat,
  cropVideo,
  extractFrames,
  generateThumbnail,
};

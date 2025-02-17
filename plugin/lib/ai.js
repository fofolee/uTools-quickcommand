const axios = require("axios");

// 支持的模型类型
const MODEL_TYPES = {
  OPENAI: "openai",
  OLLAMA: "ollama",
};

// 预设提示词
const PRESET_PROMPTS = {
  // 翻译
  translate: `请将以下内容翻译成地道的中文，要求：
1. 保持原文的专业性和准确性
2. 符合中文的表达习惯
3. 对于专业术语保留英文原文，并在括号中给出中文翻译
4. 保持原文的段落格式

原文：`,

  // 生成SHELL命令
  shell: `请根据以下描述生成一个 shell 命令，要求：
1. 命令应当简洁高效
2. 优先使用常见的命令行工具
3. 确保命令的安全性和可靠性
4. 对于复杂操作，添加注释说明
5. 如果需要多个命令，使用 && 连接或使用脚本格式
6. 直接输出命令，不要输出任何解释，不要使用markdown格式

需求描述：`,

  // 总结
  summarize: `请总结以下内容的要点，要求：
1. 提取最重要和最有价值的信息
2. 使用简洁的语言
3. 按重要性排序
4. 保持逻辑性和连贯性
5. 如果有专业术语，保留并解释

原文：`,
};

/**
 * AI对话功能
 * @param {Object} apiConfig - API配置参数
 * @param {string} apiConfig.modelType - 模型类型(openai/ollama)
 * @param {string} apiConfig.apiUrl - API地址
 * @param {string} apiConfig.apiToken - API令牌
 * @param {string} apiConfig.model - 模型名称
 * @param {Object} content - 对话内容参数
 * @param {string} content.prompt - 用户输入的提示词
 * @param {string} content.presetPrompt - 预设提示词类型
 * @returns {Promise<Object>} 对话响应
 */
async function chat(content, apiConfig) {
  try {
    const { modelType, apiUrl, apiToken, model } = apiConfig;
    const { prompt, presetPrompt } = content;

    // 验证必要参数
    if (!apiUrl || !prompt || !model) {
      throw new Error("API地址、模型名称和提示词不能为空");
    }

    // 构建完整提示词
    const fullPrompt = presetPrompt
      ? `${PRESET_PROMPTS[presetPrompt]}\n${prompt}`
      : prompt;

    // 准备请求配置
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    let requestData;
    let url = apiUrl;

    // 根据不同的模型类型构建请求数据
    if (modelType === MODEL_TYPES.OPENAI) {
      // OpenAI API
      config.headers["Authorization"] = `Bearer ${apiToken}`;
      requestData = {
        model: model,
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
      };
    } else if (modelType === MODEL_TYPES.OLLAMA) {
      // Ollama API
      // 如果用户没有指定完整的 API 路径，添加 /api/generate
      if (!url.endsWith("/api/generate")) {
        url = url.replace(/\/?$/, "/api/generate");
      }

      requestData = {
        model: model,
        prompt: fullPrompt,
        stream: false,
      };
    } else {
      throw new Error("不支持的模型类型");
    }

    const loadingBar = await quickcommand.showLoadingBar({
      text: "AI思考中...",
      onClose: () => {
        // 取消请求
        if (source) {
          source.cancel("操作已取消");
        }
      },
    });

    // 创建取消令牌
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    // 发送请求
    const response = await axios.post(url, requestData, {
      ...config,
      cancelToken: source.token,
    });

    loadingBar.close();

    // 解析不同模型的响应
    let result;
    if (modelType === MODEL_TYPES.OPENAI) {
      // OpenAI 响应格式
      if (!response.data.choices || !response.data.choices[0]) {
        throw new Error("OpenAI 响应格式错误");
      }
      result = response.data.choices[0].message.content;
    } else {
      // Ollama 响应格式
      if (!response.data.response) {
        throw new Error("Ollama 响应格式错误");
      }
      result = response.data.response;
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    // 如果是用户取消的请求，返回特定的错误信息
    if (axios.isCancel(error)) {
      return {
        success: false,
        error: "请求已取消",
        cancelled: true,
      };
    }
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

/**
 * 获取API支持的模型列表
 * @param {Object} apiConfig - API配置参数
 * @param {string} apiConfig.modelType - 模型类型(openai/ollama)
 * @param {string} apiConfig.apiUrl - API地址
 * @param {string} apiConfig.apiToken - API令牌
 * @returns {Promise<Object>} 模型列表响应
 */
async function getModels(apiConfig) {
  try {
    const { modelType, apiUrl, apiToken } = apiConfig;

    // 验证必要参数
    if (!apiUrl) {
      throw new Error("API地址不能为空");
    }

    // 准备请求配置
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    let url = apiUrl;

    // 根据不同的模型类型构建请求
    if (modelType === MODEL_TYPES.OPENAI) {
      // OpenAI API
      config.headers["Authorization"] = `Bearer ${apiToken}`;
      // OpenAI的模型列表接口是 /v1/models
      if (!url.endsWith("/models")) {
        url = "https://api.openai.com/v1/models";
      }
    } else if (modelType === MODEL_TYPES.OLLAMA) {
      // Ollama API
      // Ollama的模型列表接口是 /api/tags
      if (!url.endsWith("/api/tags")) {
        url = url.replace(/\/?$/, "/api/tags");
      }
    } else {
      throw new Error("不支持的模型类型");
    }

    // 发送请求
    const response = await axios.get(url, config);

    // 解析不同模型的响应
    let models;
    if (modelType === MODEL_TYPES.OPENAI) {
      // OpenAI 响应格式
      if (!response.data.data) {
        throw new Error("OpenAI 响应格式错误");
      }
      models = response.data.data.map((model) => model.id);
    } else {
      // Ollama 响应格式
      if (!response.data.models) {
        throw new Error("Ollama 响应格式错误");
      }
      models = response.data.models.map((model) => model.name);
    }

    return {
      success: true,
      result: models,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

module.exports = { chat, getModels };

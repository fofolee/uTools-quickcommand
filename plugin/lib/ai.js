const DOMPurify = require("dompurify");
const marked = require("marked");

window.aiResponseParser = (content) => {
  const markedContent = marked.parse(content.trim());
  const processedContent = markedContent
    .replace("<p><think>", "<think><p>")
    .replace("</think></p>", "</p></think>")
    .replace("<think>\n\n</think>", "");
  const purifiedContent = DOMPurify.sanitize(processedContent, {
    ADD_TAGS: ["think"],
  });
  return purifiedContent;
};

// 支持的模型类型
const API_TYPES = {
  OPENAI: "openai",
  OLLAMA: "ollama",
  UTOOLS: "utools",
};

// 角色提示词
const ROLE_PROMPTS = {
  // 翻译
  translate: `你是一名翻译专家，请将我给你的内容进行翻译，要求：
1. 无论给的内容长短，请直接翻译，不要进行任何解释
2. 提供中文时，翻译成地道的英文，符合英文的表达习惯
3. 提供英文时，翻译成地道的中文，符合中文的表达习惯
4. 保持原文的专业性和准确性
5. 保持原文的段落格式
6. 不要输出原文
7. 不要使用markdown格式，请直接输出翻译后的内容
`,

  // 生成SHELL命令
  shell: `你是一名shell命令专家，请根据我的描述生成 shell 命令，要求：
1. 命令应当简洁高效
2. 优先使用常见的命令行工具
3. 确保命令的安全性和可靠性
4. 对于复杂操作，添加注释说明
5. 如果需要多个命令，使用 && 连接或使用脚本格式
6. 直接输出命令，不要输出任何解释，不要使用markdown格式
`,

  // 总结
  summarize: `你是一名总结专家，请总结我给你的内容的要点，要求：
1. 提取最重要和最有价值的信息
2. 使用简洁的语言
3. 按重要性排序
4. 保持逻辑性和连贯性
5. 请将所有内容放在一个段落内
6. 不要输出原文
7. 不要使用markdown格式
`,

  // 润色
  polish: `你是一名文字润色专家，请对我给你的内容进行润色，要求：
1. 保持原文的核心意思不变
2. 使用更优美、专业的表达方式
3. 改善语言流畅度和可读性
4. 纠正语法错误和不恰当的表达
5. 保持原文的语言风格（中文/英文）
6. 保持原文的段落格式
7. 直接输出润色后的内容，不要解释修改原因
8. 不要使用markdown格式
`,

  // 扩写
  expand: `你是一名文字扩写专家，请对我给你的内容进行扩写，要求：
1. 在保持原意的基础上扩充内容
2. 添加相关的细节和例子
3. 使用生动的描述和丰富的表达
4. 确保扩写内容逻辑连贯
5. 适度扩写，避免过度冗长
6. 保持语言风格的一致性
7. 直接输出扩写后的内容，不要解释扩写原因
8. 不要使用markdown格式
`,
};

// API URL 处理
const API_ENDPOINTS = {
  [API_TYPES.OPENAI]: {
    chat: "/v1/chat/completions",
    models: "/v1/models",
  },
  [API_TYPES.OLLAMA]: {
    chat: "/api/chat",
    models: "/api/tags",
  },
};

// 构建API URL
function buildApiUrl(baseUrl, endpoint) {
  if (!baseUrl.endsWith(endpoint)) {
    return baseUrl.replace(/\/?$/, endpoint);
  }
  return baseUrl;
}

// 构建请求配置
function buildRequestConfig(apiConfig) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (apiConfig.apiType === API_TYPES.OPENAI && apiConfig.apiToken) {
    config.headers["Authorization"] = `Bearer ${apiConfig.apiToken}`;
  }

  return config;
}

// 构建请求数据
function buildRequestData(content, apiConfig) {
  const { model } = apiConfig;
  const { prompt, role, context = [] } = content;
  const rolePrompt = ROLE_PROMPTS[role] || role;

  const roleMessage = rolePrompt
    ? [
        {
          role: "system",
          content: rolePrompt,
        },
      ]
    : [];

  // 统一的消息格式处理
  const messages = [
    // 添加系统角色消息（如果有）
    ...roleMessage,
    // 添加上下文消息
    ...context.map((msg) => ({
      role: msg.role || "user",
      content: msg.content,
    })),
    // 添加当前用户消息
    {
      role: "user",
      content: prompt,
    },
  ];

  return {
    model,
    messages,
    stream: true,
  };
}

// 处理模型列表响应
function parseModelsResponse(response, apiType) {
  if (apiType === API_TYPES.OPENAI) {
    if (!response.data.data) {
      throw new Error("OpenAI 响应格式错误");
    }
    return response.data.data.map((model) => model.id);
  } else {
    if (!response.data.models) {
      throw new Error("Ollama 响应格式错误");
    }
    return response.data.models.map((model) => model.name);
  }
}

let reasoning_content_start = false;
function processContentWithReason(response, onStream) {
  if (response.reasoning_content) {
    if (!reasoning_content_start) {
      reasoning_content_start = true;
      onStream("<think>", false);
    }
    onStream(response.reasoning_content, false);
  }
  if (response.content) {
    if (reasoning_content_start) {
      reasoning_content_start = false;
      onStream("</think>", false);
    }
    onStream(response.content, false);
  }
}

// 处理 OpenAI 流式响应
async function handleOpenAIStreamResponse(line, onStream) {
  if (line.startsWith("data:")) {
    const jsonStr = line.replace(/^data:[ ]*/, "");
    if (jsonStr === "[DONE]") {
      onStream("", true);
      return;
    }
    const json = JSON.parse(jsonStr);
    const response = json.choices[0]?.delta;
    if (response) {
      processContentWithReason(response, onStream);
    }
  }
}

// 处理 Ollama 流式响应
async function handleOllamaStreamResponse(line, onStream) {
  const json = JSON.parse(line);
  if (json.done) {
    onStream("", true);
    return;
  }
  const response = json.message;
  if (response) {
    processContentWithReason(response, onStream);
  }
}

// 处理 uTools AI 流式响应
async function handleUToolsAIStreamResponse(response, onStream) {
  processContentWithReason(response, onStream);
}

// 处理流式响应
async function handleStreamResponse(response, apiConfig, onStream) {
  // 处理 uTools AI 响应
  if (apiConfig.apiType === API_TYPES.UTOOLS) {
    try {
      await handleUToolsAIStreamResponse(response, onStream);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // 处理其他 API 的流式响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            if (apiConfig.apiType === API_TYPES.OPENAI) {
              await handleOpenAIStreamResponse(line, onStream);
            } else {
              await handleOllamaStreamResponse(line, onStream);
            }
          } catch (e) {
            console.error("解析响应失败:", e);
          }
        }
      }
    }

    // 处理剩余的缓冲区
    if (buffer.trim()) {
      try {
        if (apiConfig.apiType === API_TYPES.OPENAI) {
          await handleOpenAIStreamResponse(buffer, onStream);
        } else {
          await handleOllamaStreamResponse(buffer, onStream);
        }
      } catch (e) {
        console.error("解析剩余响应失败:", e);
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        success: false,
        error: "请求已取消",
        cancelled: true,
      };
    }
    throw error;
  } finally {
    reader.releaseLock();
  }

  return { success: true };
}

/**
 * AI对话功能
 * @param {Object} content - 对话内容参数
 * @param {Object} apiConfig - API配置参数
 * @param {Object} options - 其他选项
 * @returns {Promise<Object>} 对话响应
 */
async function chat(content, apiConfig, options = {}) {
  try {
    const {
      showProcessBar = true,
      onStream = () => {},
      onFetch = () => {},
    } = options;

    // 验证必要参数
    if (apiConfig.apiType === API_TYPES.UTOOLS) {
      if (!content.prompt || !apiConfig.model) {
        throw new Error("模型名称和提示词不能为空");
      }
    } else {
      if (!apiConfig.apiUrl) {
        throw new Error("API地址不能为空");
      }
      if (!apiConfig.apiUrl || !content.prompt || !apiConfig.model) {
        throw new Error("API地址、模型名称和提示词不能为空");
      }
    }

    let controller;

    // 显示进度条
    const processBar = showProcessBar
      ? await quickcommand.showProcessBar({
          text: "AI思考中...",
          onClose: () => {
            if (typeof controller !== "undefined") {
              controller.abort();
            }
          },
        })
      : null;

    // 用于收集完整响应
    let fullResponse = "";

    // 包装 onStream 回调以收集完整响应并更新进度条
    const streamHandler = (chunk, isDone) => {
      if (!isDone) {
        fullResponse += chunk;
        // 更新进度条显示最新的响应内容
        if (processBar) {
          quickcommand.updateProcessBar(
            {
              text: window.aiResponseParser(fullResponse),
            },
            processBar
          );
        }
      }
      onStream(chunk, isDone);
    };

    // 处理 uTools AI 请求
    if (apiConfig.apiType === API_TYPES.UTOOLS) {
      try {
        const messages = buildRequestData(content, apiConfig).messages;
        controller = utools.ai(
          {
            model: apiConfig.model,
            messages: messages,
          },
          (chunk) => {
            handleUToolsAIStreamResponse(chunk, streamHandler);
          }
        );
        onFetch(controller);

        await controller;

        // 在流式响应完全结束后，发送一个空字符串表示结束
        streamHandler("", true);

        // 完成时更新进度条并关闭
        if (processBar) {
          quickcommand.updateProcessBar(
            {
              text: "AI响应完成",
              complete: true,
            },
            processBar
          );
        }

        return {
          success: true,
          result: fullResponse,
        };
      } catch (error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "请求已取消",
            cancelled: true,
          };
        }
        throw error;
      }
    }

    // 统一使用 fetch 处理其他 API 请求
    controller = new AbortController();

    onFetch(controller);

    const url = buildApiUrl(
      apiConfig.apiUrl,
      API_ENDPOINTS[apiConfig.apiType].chat
    );
    const config = buildRequestConfig(apiConfig);
    const requestData = buildRequestData(content, apiConfig);

    const response = await fetch(url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify(requestData),
      signal: controller.signal,
    });

    if (!response.ok) {
      processBar?.close();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await handleStreamResponse(
      response,
      apiConfig,
      streamHandler
    );

    // 如果请求被取消，返回取消状态
    if (!result.success) {
      processBar?.close();
      return result;
    }

    // 完成时更新进度条并关闭
    if (processBar) {
      quickcommand.updateProcessBar(
        {
          text: "AI响应完成",
          complete: true,
        },
        processBar
      );
    }

    // 返回完整的响应内容
    return {
      success: true,
      result: fullResponse,
    };
  } catch (error) {
    if (error.name === "AbortError") {
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
 * @returns {Promise<Object>} 模型列表响应
 */
async function getModels(apiConfig) {
  try {
    if (!apiConfig.apiUrl) {
      throw new Error("API地址不能为空");
    }

    const url = buildApiUrl(
      apiConfig.apiUrl,
      API_ENDPOINTS[apiConfig.apiType].models
    );
    const config = buildRequestConfig(apiConfig);

    const response = await fetch(url, {
      method: "GET",
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      result: parseModelsResponse({ data: responseData }, apiConfig.apiType),
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}
module.exports = { chat, getModels };

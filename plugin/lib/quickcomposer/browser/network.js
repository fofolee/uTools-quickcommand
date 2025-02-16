const { searchTarget } = require("./tabs");
const { getCurrentClientPort } = require("./client");
const CDP = require("chrome-remote-interface");

// 不从cdp.js导入initCDP，单独启用一个Fetch域的CDP
const initCDP = async (targetId) => {
  try {
    const port = await getCurrentClientPort();
    const client = await CDP({
      target: targetId,
      port,
    });

    const { Fetch } = client;
    await Promise.all([Fetch.enable()]);

    return { Fetch };
  } catch (err) {
    throw new Error(`连接到浏览器失败: ${err.message}`);
  }
};

const cleanupCDP = async (targetId) => {
  try {
    // 直接关闭传入的 client
    if (targetId?.client) {
      await targetId.client.close();
    }
  } catch (error) {
    console.log("关闭CDP连接失败:", error);
  }
};

// 使用正则替换内容
const replaceWithRegex = (content, pattern, replacement) => {
  try {
    const regex = new RegExp(pattern, "g");
    return content.replace(regex, replacement);
  } catch (error) {
    return content;
  }
};

// 存储活动的拦截连接
let activeInterceptions = new Map();

// 将对象格式的 headers 转换为数组格式
const convertHeaders = (headers) => {
  return Object.entries(headers).map(([name, value]) => ({
    name,
    value: String(value),
  }));
};

// 检查 URL 是否匹配规则
const isUrlMatch = (url, pattern) => {
  try {
    const regex = new RegExp(pattern);
    return regex.test(url);
  } catch (error) {
    return url.includes(pattern);
  }
};

// 修改请求
const setRequestInterception = async (tab, rules) => {
  // 先清除所有拦截规则
  await clearInterception();

  const target = await searchTarget(tab);
  const client = await initCDP(target.id);

  try {
    await client.Fetch.enable({
      patterns: [{ url: "*", requestStage: "Request" }],
    });

    client.Fetch.requestPaused(async ({ requestId, request }) => {
      try {
        let modified = null;

        for (const rule of rules) {
          if (isUrlMatch(request.url, rule.url)) {
            modified = {
              url: rule.redirectUrl || request.url,
              method: request.method,
              headers: { ...request.headers },
              postData: request.postData,
            };

            if (rule.headerKey && rule.headerValue) {
              modified.headers[rule.headerKey] = rule.headerValue;
            }

            if (rule.pattern && rule.replacement) {
              const url = new URL(modified.url);
              for (const [key, value] of url.searchParams.entries()) {
                const decodedValue = decodeURIComponent(value);
                const newValue = replaceWithRegex(
                  decodedValue,
                  rule.pattern,
                  rule.replacement
                );
                if (decodedValue !== newValue) {
                  url.searchParams.set(key, newValue);
                }
              }
              modified.url = url.toString();

              if (modified.postData) {
                modified.postData = replaceWithRegex(
                  modified.postData,
                  rule.pattern,
                  rule.replacement
                );
              }
            }
            break;
          }
        }

        if (modified) {
          await client.Fetch.continueRequest({
            requestId,
            url: modified.url,
            method: modified.method,
            headers: convertHeaders(modified.headers),
            postData: modified.postData,
          });
        } else {
          await client.Fetch.continueRequest({ requestId });
        }
      } catch (error) {
        await client.Fetch.continueRequest({ requestId });
      }
    });

    activeInterceptions.set("request", client);
    return {
      success: true,
      message: `设置请求拦截规则成功`,
      rules,
    };
  } catch (error) {
    await cleanupCDP(client);
    return {
      success: false,
      message: error.message,
    };
  }
};

// 修改响应
const setResponseInterception = async (tab, rules) => {
  // 先清除所有拦截规则
  await clearInterception();

  const target = await searchTarget(tab);
  const client = await initCDP(target.id);

  try {
    await client.Fetch.enable({
      patterns: [{ url: "*", requestStage: "Response" }],
    });

    client.Fetch.requestPaused(
      async ({ requestId, request, responseHeaders, responseStatusCode }) => {
        try {
          const contentType = responseHeaders.find(
            (h) => h.name.toLowerCase() === "content-type"
          )?.value;
          const isTextContent = contentType && contentType.includes("text");

          if (!isTextContent) {
            await client.Fetch.continueRequest({ requestId });
            return;
          }

          let shouldIntercept = false;
          let modifiedBody = null;
          let modifiedStatus = responseStatusCode;

          for (const rule of rules) {
            if (isUrlMatch(request.url, rule.url)) {
              shouldIntercept = true;

              if (rule.statusCode) {
                modifiedStatus = rule.statusCode;
              }

              if (rule.pattern) {
                try {
                  const response = await client.Fetch.getResponseBody({
                    requestId,
                  });
                  const originalBody = response.base64Encoded
                    ? Buffer.from(response.body, "base64").toString()
                    : response.body;

                  if (originalBody) {
                    modifiedBody = replaceWithRegex(
                      originalBody,
                      rule.pattern,
                      rule.replacement || ""
                    );
                  }
                } catch (error) {
                  shouldIntercept = false;
                }
              }
            }
          }

          if (shouldIntercept && modifiedBody !== null) {
            await client.Fetch.fulfillRequest({
              requestId,
              responseCode: modifiedStatus,
              responseHeaders,
              body: Buffer.from(modifiedBody).toString("base64"),
            });
          } else {
            await client.Fetch.continueRequest({ requestId });
          }
        } catch (error) {
          await client.Fetch.continueRequest({ requestId });
        }
      }
    );

    activeInterceptions.set("response", client);
    return {
      success: true,
      message: `设置响应拦截规则成功`,
      rules,
    };
  } catch (error) {
    await cleanupCDP(client);
    return {
      success: false,
      message: error.message,
    };
  }
};

// 清除所有拦截规则
const clearInterception = async () => {
  if (activeInterceptions.size === 0) {
    return {
      success: true,
      message: `还没有设置拦截规则`,
    };
  }
  for (const [type, client] of activeInterceptions.entries()) {
    try {
      await client.Fetch.disable();
      await cleanupCDP(client);
    } catch (error) {}
  }
  activeInterceptions.clear();
  return {
    success: true,
    message: `清除拦截规则成功`,
  };
};

module.exports = {
  setRequestInterception,
  setResponseInterception,
  clearInterception,
};

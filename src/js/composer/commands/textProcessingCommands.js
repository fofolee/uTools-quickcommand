export const textProcessingCommands = {
  label: "文本处理",
  icon: "code",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.textProcessing",
      label: "编解码",
      desc: "文本编解码",
      icon: "code",
      component: "FunctionSelector",
      componentProps: {
        inputLabel: "要编解码的文本",
        selectLabel: "编解码方式",
        options: [
          {
            label: "Base64编码",
            value: "quickcomposer.textProcessing.base64Encode",
          },
          {
            label: "Base64解码",
            value: "quickcomposer.textProcessing.base64Decode",
          },
          {
            label: "十六进制编码",
            value: "quickcomposer.textProcessing.hexEncode",
          },
          {
            label: "十六进制解码",
            value: "quickcomposer.textProcessing.hexDecode",
          },
          { label: "URL编码", value: "quickcomposer.textProcessing.urlEncode" },
          { label: "URL解码", value: "quickcomposer.textProcessing.urlDecode" },
          {
            label: "HTML编码",
            value: "quickcomposer.textProcessing.htmlEncode",
          },
          {
            label: "HTML解码",
            value: "quickcomposer.textProcessing.htmlDecode",
          },
        ],
      },
    },
    {
      value: "quickcomposer.textProcessing.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.textProcessing.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.textProcessing",
      label: "哈希计算",
      desc: "计算文本的哈希值",
      icon: "enhanced_encryption",
      component: "FunctionSelector",
      componentProps: {
        inputLabel: "要计算哈希的文本",
        selectLabel: "哈希算法",
        options: [
          { label: "MD5", value: "quickcomposer.textProcessing.md5Hash" },
          { label: "SHA1", value: "quickcomposer.textProcessing.sha1Hash" },
          { label: "SHA256", value: "quickcomposer.textProcessing.sha256Hash" },
          { label: "SHA512", value: "quickcomposer.textProcessing.sha512Hash" },
          { label: "SM3", value: "quickcomposer.textProcessing.sm3Hash" },
        ],
      },
    },
    {
      value: "quickcomposer.textProcessing.reverseString",
      label: "字符串反转",
      config: [
        {
          key: "text",
          label: "要反转的文本",
          type: "input",
          defaultValue: "",
          icon: "swap_horiz",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.replaceString",
      label: "字符串替换",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
          width: 4,
        },
        {
          key: "oldStr",
          label: "要替换的文本",
          type: "input",
          defaultValue: "",
          icon: "find_replace",
          width: 4,
        },
        {
          key: "newStr",
          label: "替换为",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
          width: 4,
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.substring",
      label: "字符串截取",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
          width: 6,
        },
        {
          key: "start",
          label: "起始位置",
          type: "input",
          inputType: "number",
          icon: "first_page",
          width: 3,
        },
        {
          key: "end",
          label: "结束位置",
          type: "input",
          inputType: "number",
          icon: "last_page",
          width: 3,
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.regexTransform",
      label: "正则提取/替换",
      component: "RegexEditor",
      componentProps: {
        inputLabel: "要处理的文本",
      },
    },
  ],
};

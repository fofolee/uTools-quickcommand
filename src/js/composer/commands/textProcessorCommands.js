export const textProcessorCommands = {
  label: "文本处理",
  icon: "code",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.textProcessor",
      label: "编解码",
      desc: "文本编解码",
      icon: "code",
      config: [
        {
          label: "要编解码的文本",
          icon: "text_fields",
          type: "varInput",
          width: 8,
        },
      ],
      functionSelector: {
        selectLabel: "编解码方式",
        options: [
          {
            label: "Base64编码",
            value: "quickcomposer.textProcessor.base64Encode",
          },
          {
            label: "Base64解码",
            value: "quickcomposer.textProcessor.base64Decode",
          },
          {
            label: "十六进制编码",
            value: "quickcomposer.textProcessor.hexEncode",
          },
          {
            label: "十六进制解码",
            value: "quickcomposer.textProcessor.hexDecode",
          },
          { label: "URL编码", value: "quickcomposer.textProcessor.urlEncode" },
          { label: "URL解码", value: "quickcomposer.textProcessor.urlDecode" },
          {
            label: "HTML编码",
            value: "quickcomposer.textProcessor.htmlEncode",
          },
          {
            label: "HTML解码",
            value: "quickcomposer.textProcessor.htmlDecode",
          },
        ],
        width: 3,
      },
    },
    {
      value: "quickcomposer.textProcessor.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.textProcessor.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.textProcessor",
      label: "哈希计算",
      desc: "计算文本的哈希值",
      icon: "enhanced_encryption",
      config: [
        {
          label: "要计算哈希的文本",
          icon: "text_fields",
          type: "varInput",
          width: 8,
        },
      ],
      functionSelector: {
        selectLabel: "哈希算法",
        options: [
          { label: "MD5", value: "quickcomposer.textProcessor.md5Hash" },
          { label: "SHA1", value: "quickcomposer.textProcessor.sha1Hash" },
          { label: "SHA256", value: "quickcomposer.textProcessor.sha256Hash" },
          { label: "SHA512", value: "quickcomposer.textProcessor.sha512Hash" },
          { label: "SM3", value: "quickcomposer.textProcessor.sm3Hash" },
        ],
      },
      width: 3,
    },
    {
      value: "quickcomposer.textProcessor.reverseString",
      label: "字符串反转",
      config: [
        {
          key: "text",
          label: "要反转的文本",
          type: "varInput",
          icon: "swap_horiz",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessor.replaceString",
      label: "字符串替换",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "varInput",
          icon: "text_fields",
          width: 4,
        },
        {
          key: "oldStr",
          label: "要替换的文本",
          type: "varInput",
          icon: "find_replace",
          width: 4,
        },
        {
          key: "newStr",
          label: "替换为",
          type: "varInput",
          icon: "text_fields",
          width: 4,
        },
      ],
    },
    {
      value: "quickcomposer.textProcessor.substring",
      label: "字符串截取",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "varInput",
          icon: "text_fields",
          width: 6,
        },
        {
          key: "start",
          label: "起始位置",
          type: "numInput",
          icon: "first_page",
          width: 3,
        },
        {
          key: "end",
          label: "结束位置",
          type: "numInput",
          icon: "last_page",
          width: 3,
        },
      ],
    },
    {
      value: "quickcomposer.textProcessor.regexTransform",
      label: "正则提取/替换",
      component: "RegexEditor",
      componentProps: {
        inputLabel: "要处理的文本",
      },
    },
  ],
};

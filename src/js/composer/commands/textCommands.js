export const textCommands = {
  label: "文本处理",
  icon: "code",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.text",
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
            value: "quickcomposer.text.base64Encode",
            icon: "title",
          },
          {
            label: "Base64解码",
            value: "quickcomposer.text.base64Decode",
            icon: "title",
          },
          {
            label: "十六进制编码",
            value: "quickcomposer.text.hexEncode",
            icon: "code",
          },
          {
            label: "十六进制解码",
            value: "quickcomposer.text.hexDecode",
            icon: "code",
          },
          {
            label: "URL编码",
            value: "quickcomposer.text.urlEncode",
            icon: "link",
          },
          {
            label: "URL解码",
            value: "quickcomposer.text.urlDecode",
            icon: "link",
          },
          {
            label: "HTML编码",
            value: "quickcomposer.text.htmlEncode",
            icon: "html",
          },
          {
            label: "HTML解码",
            value: "quickcomposer.text.htmlDecode",
            icon: "html",
          },
        ],
        width: 3,
      },
    },
    {
      value: "quickcomposer.text.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.text.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.text",
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
          {
            label: "MD5",
            value: "quickcomposer.text.md5Hash",
            icon: "functions",
          },
          {
            label: "SHA1",
            value: "quickcomposer.text.sha1Hash",
            icon: "functions",
          },
          {
            label: "SHA256",
            value: "quickcomposer.text.sha256Hash",
            icon: "functions",
          },
          {
            label: "SHA512",
            value: "quickcomposer.text.sha512Hash",
            icon: "functions",
          },
          {
            label: "SM3",
            value: "quickcomposer.text.sm3Hash",
            icon: "functions",
          },
        ],
      },
      width: 3,
    },
    {
      value: "quickcomposer.text.reverseString",
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
      value: "quickcomposer.text.replaceString",
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
      value: "quickcomposer.text.substring",
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
      value: "quickcomposer.text.regexTransform",
      label: "正则提取/替换",
      component: "RegexEditor",
      componentProps: {
        inputLabel: "要处理的文本",
      },
    },
  ],
};

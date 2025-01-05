export const dataCommands = {
  label: "数据处理",
  icon: "auto_graph",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.data",
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
            value: "quickcomposer.data.base64Encode",
            icon: "title",
          },
          {
            label: "Base64解码",
            value: "quickcomposer.data.base64Decode",
            icon: "title",
          },
          {
            label: "十六进制编码",
            value: "quickcomposer.data.hexEncode",
            icon: "code",
          },
          {
            label: "十六进制解码",
            value: "quickcomposer.data.hexDecode",
            icon: "code",
          },
          {
            label: "URL编码",
            value: "quickcomposer.data.urlEncode",
            icon: "link",
          },
          {
            label: "URL解码",
            value: "quickcomposer.data.urlDecode",
            icon: "link",
          },
          {
            label: "HTML编码",
            value: "quickcomposer.data.htmlEncode",
            icon: "html",
          },
          {
            label: "HTML解码",
            value: "quickcomposer.data.htmlDecode",
            icon: "html",
          },
        ],
        width: 3,
      },
    },
    {
      value: "quickcomposer.data.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.data.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.data",
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
            value: "quickcomposer.data.md5Hash",
            icon: "functions",
          },
          {
            label: "SHA1",
            value: "quickcomposer.data.sha1Hash",
            icon: "functions",
          },
          {
            label: "SHA256",
            value: "quickcomposer.data.sha256Hash",
            icon: "functions",
          },
          {
            label: "SHA512",
            value: "quickcomposer.data.sha512Hash",
            icon: "functions",
          },
          {
            label: "SM3",
            value: "quickcomposer.data.sm3Hash",
            icon: "functions",
          },
        ],
      },
      width: 3,
    },
    {
      value: "quickcomposer.data.reverseString",
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
      value: "quickcomposer.data.replaceString",
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
      value: "quickcomposer.data.substring",
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
      value: "quickcomposer.data.regexTransform",
      label: "正则提取/替换",
      component: "RegexEditor",
      componentProps: {
        inputLabel: "要处理的文本",
      },
    },
    {
      value: "quickcomposer.data.buffer",
      label: "Buffer操作",
      desc: "Buffer创建、转换和操作",
      component: "BufferEditor",
      icon: "memory",
    },
    {
      value: "quickcomposer.data.zlib",
      label: "数据压缩解压",
      desc: "使用 zlib 进行数据压缩和解压",
      component: "ZlibEditor",
      icon: "compress",
      isAsync: true,
    },
  ],
};

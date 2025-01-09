export const codingCommands = {
  label: "编码加密",
  icon: "lock",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.coding.base64Encode",
      label: "编解码",
      desc: "文本编解码",
      icon: "code",
      outputVariable: "processedText",
      saveOutput: true,
      config: [
        {
          label: "要编解码的文本",
          icon: "text_fields",
          type: "varInput",
        },
      ],
      subCommands: [
        {
          label: "Base64编码",
          value: "quickcomposer.coding.base64Encode",
          icon: "title",
        },
        {
          label: "Base64解码",
          value: "quickcomposer.coding.base64Decode",
          icon: "title",
        },
        {
          label: "十六进制编码",
          value: "quickcomposer.coding.hexEncode",
          icon: "code",
        },
        {
          label: "十六进制解码",
          value: "quickcomposer.coding.hexDecode",
          icon: "code",
        },
        {
          label: "URL编码",
          value: "quickcomposer.coding.urlEncode",
          icon: "link",
        },
        {
          label: "URL解码",
          value: "quickcomposer.coding.urlDecode",
          icon: "link",
        },
        {
          label: "HTML编码",
          value: "quickcomposer.coding.htmlEncode",
          icon: "html",
        },
        {
          label: "HTML解码",
          value: "quickcomposer.coding.htmlDecode",
          icon: "html",
        },
      ],
    },
    {
      value: "quickcomposer.coding.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
      outputVariable: "processedText",
      saveOutput: true,
    },
    {
      value: "quickcomposer.coding.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
      outputVariable: "processedText",
      saveOutput: true,
    },
    {
      value: "quickcomposer.coding.md5Hash",
      label: "哈希计算",
      desc: "计算文本的哈希值",
      icon: "enhanced_encryption",
      outputVariable: "hashValue",
      saveOutput: true,
      config: [
        {
          label: "要计算哈希的文本",
          icon: "text_fields",
          type: "varInput",
        },
      ],
      subCommands: [
        {
          label: "MD5",
          value: "quickcomposer.coding.md5Hash",
          icon: "functions",
        },
        {
          label: "SHA1",
          value: "quickcomposer.coding.sha1Hash",
          icon: "functions",
        },
        {
          label: "SHA256",
          value: "quickcomposer.coding.sha256Hash",
          icon: "functions",
        },
        {
          label: "SHA512",
          value: "quickcomposer.coding.sha512Hash",
          icon: "functions",
        },
        {
          label: "SM3",
          value: "quickcomposer.coding.sm3Hash",
          icon: "functions",
        },
      ],
    },
  ],
};

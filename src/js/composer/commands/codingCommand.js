export const codingCommands = {
  label: "编码加密",
  icon: "lock",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.coding.base64Encode",
      label: "编解码",
      icon: "code",
      config: [
        {
          label: "要编解码的文本",
          icon: "text_fields",
          component: "VariableInput",
        },
      ],
      subCommands: [
        {
          label: "Base64编码",
          value: "quickcomposer.coding.base64Encode",
          icon: "title",
          outputs: {
            label: "base64编码结果",
            suggestName: "base64Encoded",
            typeName: "字符串",
          },
        },
        {
          label: "Base64解码",
          value: "quickcomposer.coding.base64Decode",
          icon: "title",
          outputs: {
            label: "base64解码结果",
            suggestName: "base64Decoded",
            typeName: "字符串",
          },
        },
        {
          label: "十六进制编码",
          value: "quickcomposer.coding.hexEncode",
          icon: "code",
          outputs: {
            label: "十六进制编码结果",
            suggestName: "hexEncoded",
            typeName: "字符串",
          },
        },
        {
          label: "十六进制解码",
          value: "quickcomposer.coding.hexDecode",
          icon: "code",
          outputs: {
            label: "十六进制解码结果",
            suggestName: "hexDecoded",
            typeName: "字符串",
          },
        },
        {
          label: "URL编码",
          value: "quickcomposer.coding.urlEncode",
          icon: "link",
          outputs: {
            label: "URL编码结果",
            suggestName: "urlEncoded",
            typeName: "字符串",
          },
        },
        {
          label: "URL解码",
          value: "quickcomposer.coding.urlDecode",
          icon: "link",
          outputs: {
            label: "URL解码结果",
            suggestName: "urlDecoded",
            typeName: "字符串",
          },
        },
        {
          label: "HTML编码",
          value: "quickcomposer.coding.htmlEncode",
          icon: "html",
          outputs: {
            label: "HTML编码结果",
            suggestName: "htmlEncoded",
            typeName: "字符串",
          },
        },
        {
          label: "HTML解码",
          value: "quickcomposer.coding.htmlDecode",
          icon: "html",
          outputs: {
            label: "HTML解码结果",
            suggestName: "htmlDecoded",
            typeName: "字符串",
          },
        },
      ],
    },
    {
      value: "quickcomposer.coding.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
      outputs: {
        label: "加解密结果",
        suggestName: "symmetricCryptoResult",
        typeName: "字符串",
      },
    },
    {
      value: "quickcomposer.coding.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
      outputs: {
        label: "加解密结果",
        suggestName: "asymmetricCryptoResult",
        typeName: "字符串",
      },
    },
    {
      value: "quickcomposer.coding.md5Hash",
      label: "哈希计算",
      icon: "enhanced_encryption",
      config: [
        {
          label: "要计算哈希的文本",
          icon: "text_fields",
          component: "VariableInput",
        },
      ],
      subCommands: [
        {
          label: "MD5",
          value: "quickcomposer.coding.md5Hash",
          icon: "functions",
          outputs: {
            label: "MD5哈希结果",
            suggestName: "md5HashResult",
            typeName: "字符串",
          },
        },
        {
          label: "SHA1",
          value: "quickcomposer.coding.sha1Hash",
          icon: "functions",
          outputs: {
            label: "SHA1哈希结果",
            suggestName: "sha1HashResult",
            typeName: "字符串",
          },
        },
        {
          label: "SHA256",
          value: "quickcomposer.coding.sha256Hash",
          icon: "functions",
          outputs: {
            label: "SHA256哈希结果",
            suggestName: "sha256HashResult",
            typeName: "字符串",
          },
        },
        {
          label: "SHA512",
          value: "quickcomposer.coding.sha512Hash",
          icon: "functions",
          outputs: {
            label: "SHA512哈希结果",
            suggestName: "sha512HashResult",
            typeName: "字符串",
          },
        },
        {
          label: "SM3",
          value: "quickcomposer.coding.sm3Hash",
          icon: "functions",
          outputs: {
            label: "SM3哈希结果",
            suggestName: "sm3HashResult",
            typeName: "字符串",
          },
        },
      ],
    },
  ],
};

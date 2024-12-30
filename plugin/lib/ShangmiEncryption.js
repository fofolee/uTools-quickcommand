import { strToBytesArray, bytesArrayToStr, dataConv } from "@/script/Common.js";
import { processSecret } from "./SymmetricEncryption.js";
import SM from "sm-crypto";

export const SM4 = {
  name: "SM4",
  params: [
    {
      type: "text",
      name: "Key",
      value: ["", "Utf8"],
      options: ["Utf8", "Hex", "Base64"],
    },
    {
      type: "text",
      name: "IV",
      value: ["", "Utf8"],
      options: ["Utf8", "Hex", "Base64"],
      id: "IV",
    },
    {
      type: "list",
      options: ["ECB", "CBC"],
      value: "ECB",
      banList: {
        ECB: ["IV"],
      },
      id: "mode",
    },
    { type: "list", options: ["pkcs#7", "none"], value: "pkcs#7" },
    { type: "list", options: ["Base64", "Hex"], value: "Base64" },
  ],
  encrypt: (
    msg,
    key,
    iv = "",
    mode = "ECB",
    padding = "pkcs#7",
    outputCodec = "Base64",
    { inputCodec }
  ) => {
    let bytesArray = strToBytesArray(msg, inputCodec);
    return dataConv(
      SM.sm4.encrypt(bytesArray, processSecret(key, 16, "hex"), {
        mode: mode.toLowerCase(),
        iv: processSecret(iv, 16, "hex"),
        padding: padding,
      }),
      "Hex",
      outputCodec
    );
  },
  decrypt: (
    cipher,
    key,
    iv = "",
    mode = "ECB",
    padding = "pkcs#7",
    codec = "Base64"
  ) => {
    let bytesArray = SM.sm4.decrypt(
      dataConv(cipher, codec, "Hex"),
      processSecret(key, 16, "hex"),
      {
        mode: mode.toLowerCase(),
        iv: processSecret(iv, 16, "hex"),
        padding: padding,
        output: "array",
      }
    );
    return bytesArrayToStr(bytesArray);
  },
};

export const SM2 = {
  name: "SM2",
  params: [
    {
      type: "text",
      name: "公钥",
      value: ["", "Base64"],
      options: ["Hex", "Base64"],
      id: "publicKey",
    },
    {
      type: "text",
      name: "私钥",
      value: ["", "Base64"],
      options: ["Hex", "Base64"],
      id: "privateKey",
    },
    {
      type: "list",
      options: [
        { label: "C1C3C2", value: 1 },
        { label: "C1C2C3", value: 0 },
      ],
      value: 1,
    },
    {
      type: "list",
      options: ["Hex", "Base64"],
      value: "Base64",
    },
  ],
  actions: [
    {
      type: "action",
      name: "生成密钥",
      component: "GenerateKeypair",
    },
  ],
  encrypt: (
    msg,
    [pubKey = "", pubKeyCodec = "Base64"],
    // eslint-disable-next-line no-unused-vars
    [priKey = "", priKeyCodec = "Base64"],
    cipherMode = 1,
    outputCodec = "Base64",
    { inputCodec }
  ) => {
    if (!pubKey) throw "缺少公钥";
    pubKey = dataConv(pubKey, pubKeyCodec, "Hex");
    let cipher = SM.sm2.doEncrypt(
      strToBytesArray(msg, inputCodec),
      pubKey,
      cipherMode
    );
    if (!cipher) throw "加密失败";
    return dataConv(cipher, "Hex", outputCodec);
  },
  decrypt: (
    cipher,
    // eslint-disable-next-line no-unused-vars
    [pubKey = "", pubKeyCodec = "Base64"],
    [priKey = "", priKeyCodec = "Base64"],
    cipherMode = 1,
    codec = "Base64"
  ) => {
    if (!priKey) return "缺少私钥";
    priKey = dataConv(priKey, priKeyCodec, "Hex");
    cipher = dataConv(cipher, codec, "Hex");
    let msg = SM.sm2.doDecrypt(cipher, priKey, cipherMode, {
      output: "array",
    });
    if (!msg?.length) throw "解密失败";
    return bytesArrayToStr(msg);
  },
};

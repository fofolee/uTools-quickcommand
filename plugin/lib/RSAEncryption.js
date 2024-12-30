import NodeForge from "node-forge";
import { forgeBytesToStr, strToForgeBytes, dataConv } from "@/script/Common.js";

const RSAPadDict = {
  "PKCS#1": {
    getMaxSize: (keySize) => Math.floor((keySize - 1) / 8) - 11,
    coding: (chunks, secretKey, method) =>
      secretKey[method](chunks, "RSAES-PKCS1-V1_5"),
  },
  OAEP: {
    getMaxSize: (keySize) => Math.floor(keySize / 8) - 42,
    coding: (chunks, secretKey, method) =>
      secretKey[method](chunks, "RSA-OAEP"),
  },
  "OAEP/SHA-256": {
    getMaxSize: (keySize) => Math.floor(keySize / 8) - 66,
    coding: (chunks, secretKey, method) =>
      secretKey[method](chunks, "RSA-OAEP", {
        md: NodeForge.md.sha256.create(),
      }),
  },
  "OAEP/SHA-256/MGF1-SHA-1": {
    getMaxSize: (keySize) => Math.floor(keySize / 8) - 74,
    coding: (chunks, secretKey, method) =>
      secretKey[method](chunks, "RSA-OAEP", {
        md: NodeForge.md.sha256.create(),
        mgf1: {
          md: NodeForge.md.sha1.create(),
        },
      }),
  },
};

const forgeRSAEncrypt = (bytes, padding, publicKey, outputCodec) => {
  publicKey = NodeForge.pki.publicKeyFromPem(publicKey);
  let keySize = publicKey.n.bitLength();
  let chunks = "";
  let encrypted = "";
  let maxBlockSize = RSAPadDict[padding].getMaxSize(keySize);
  for (let i = 0; i < bytes.length / maxBlockSize; i++) {
    chunks = bytes.substring(i * maxBlockSize, (i + 1) * maxBlockSize);
    chunks = RSAPadDict[padding].coding(chunks, publicKey, "encrypt");
    encrypted += chunks;
  }
  return outputCodec === "Base64"
    ? NodeForge.util.encode64(encrypted)
    : NodeForge.util.bytesToHex(encrypted);
};

const forgeRSADecrypt = (cipher, padding, privateKey, inputCodec) => {
  let bytes =
    inputCodec === "Base64"
      ? NodeForge.util.decode64(cipher)
      : NodeForge.util.hexToBytes(cipher);
  privateKey = NodeForge.pki.privateKeyFromPem(privateKey);
  let keySize = privateKey.n.bitLength();
  let maxBlockSize = keySize / 8;
  let decrypted = "";
  let chunks = "";
  for (let i = 0; i < bytes.length / maxBlockSize; i++) {
    chunks = bytes.substring(i * maxBlockSize, (i + 1) * maxBlockSize);
    chunks = RSAPadDict[padding].coding(chunks, privateKey, "decrypt");
    decrypted += chunks;
  }
  return decrypted;
};

export const RSA = {
  name: "RSA",
  params: [
    {
      type: "list",
      options: ["PKCS#1", "OAEP", "OAEP/SHA-256", "OAEP/SHA-256/MGF1-SHA-1"],
      value: "PKCS#1",
    },
    {
      type: "text",
      name: "公钥",
      value: ["", "Pem"],
      options: ["Pem", "Hex", "Base64"],
      id: "publicKey",
    },
    {
      type: "text",
      name: "私钥",
      value: ["", "Pem"],
      options: ["Pem", "Hex", "Base64"],
      id: "privateKey",
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
    {
      type: "action",
      name: "CTF",
      component: "RsaCtf",
    },
  ],
  encrypt: (
    msg,
    padding = "PKCS#1",
    [pubKey = "", pubKeyCodec = "Pem"],
    // eslint-disable-next-line no-unused-vars
    [priKey = "", priKeyCodec = "Pem"],
    outputCodec = "Base64",
    { inputCodec }
  ) => {
    if (!pubKey) throw "缺少公钥";
    if (pubKeyCodec !== "Pem") {
      pubKey =
        "-----BEGIN PUBLIC KEY-----\n" +
        dataConv(pubKey, pubKeyCodec, "Base64") +
        "\n-----END PUBLIC KEY-----";
    }
    pubKey = pubKey.replace(/\\n/g, "\n");
    let bytes = strToForgeBytes(msg, inputCodec);
    let cipher = forgeRSAEncrypt(bytes, padding, pubKey, outputCodec);
    if (!cipher) throw "加密失败";
    return cipher;
  },
  decrypt: (
    cipher,
    padding = "PKCS#1",
    // eslint-disable-next-line no-unused-vars
    [pubKey = "", pubKeyCodec = "Pem"],
    [priKey = "", priKeyCodec = "Pem"],
    codec = "Base64"
  ) => {
    if (!priKey) return "缺少私钥";
    if (priKeyCodec !== "Pem") {
      priKey =
        "-----BEGIN PRIVATE KEY-----\n" +
        dataConv(priKey, priKeyCodec, "Base64") +
        "\n-----END PRIVATE KEY-----";
    }
    priKey = priKey.replace(/\\n/g, "\n");
    let msg = forgeRSADecrypt(cipher, padding, priKey, codec);
    if (!msg) throw "解密失败";
    return forgeBytesToStr(msg);
  },
};

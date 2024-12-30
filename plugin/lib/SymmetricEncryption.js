import CryptoJS from "crypto-js";
import NodeForge from "node-forge";
import {
  strToWordArray,
  forgeBytesToStr,
  wordArrayToStr,
  dataConv,
} from "@/script/Common.js";

let symmetricEncryptionParams = [
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
    // name 会改变元素样式，额外增加ID作为唯一标识
    id: "IV",
  },
  {
    type: "list",
    options: Object.keys(CryptoJS.mode),
    value: "ECB",
    // 根据banList禁用指定ID的元素，例如选中ECB时，禁用IV，ban和被ban的元素必须要有id
    banList: {
      ECB: ["IV"],
    },
    id: "mode",
  },
  {
    type: "list",
    options: [128, 192, 256],
    value: 128,
  },
  {
    type: "list",
    options: Object.keys(CryptoJS.pad),
    value: "Pkcs7",
    id: "padding",
  },
  { type: "list", options: ["Base64", "Hex"], value: "Base64" },
];

// AES添加GCM模式
let symmetricEncryptionParamsAes = JSON.parse(
  JSON.stringify(symmetricEncryptionParams)
);
symmetricEncryptionParamsAes[2].options.push("GCM");
symmetricEncryptionParamsAes[2].banList.GCM = ["padding"];

// secret 格式为 hex字符串，方便补位
const adjustSecLen = (hexSecret, len) => {
  return hexSecret.length >= len * 2
    ? hexSecret.slice(0, len * 2)
    : hexSecret + "00".repeat(len - hexSecret.length / 2);
};

export const processSecret = (secretWithCodec, len, to = "wordArray") => {
  let [secret, codec] = secretWithCodec;
  let hexSecret = dataConv(secret, codec, "Hex");
  let filledSecret = adjustSecLen(hexSecret, len);
  return to === "wordArray"
    ? CryptoJS.enc.Hex.parse(filledSecret)
    : filledSecret;
};

// key/iv bytes
const forgeAesGcmEncrypt = (msg, key, iv, outputCodec, inputCodec) => {
  var cipher = NodeForge.cipher.createCipher("AES-GCM", key);
  cipher.start({
    iv: iv,
  });
  cipher.update(NodeForge.util.createBuffer(msg, inputCodec));
  cipher.finish();
  var encrypted = cipher.output;
  return {
    enc: dataConv(encrypted.toHex(), "Hex", outputCodec),
    tag: dataConv(cipher.mode.tag.toHex(), "Hex", outputCodec),
  };
};

// key/iv bytes
const forgeAesGcmDecrypt = (cipher, key, iv, tag, inputCodec) => {
  cipher = NodeForge.util.createBuffer(
    NodeForge.util.hexToBytes(dataConv(cipher, inputCodec, "Hex"))
  );
  var decipher = NodeForge.cipher.createDecipher("AES-GCM", key);
  decipher.start({
    iv: iv,
    tag: NodeForge.util.hexToBytes(dataConv(tag, inputCodec, "Hex")),
  });
  decipher.update(cipher);
  var pass = decipher.finish();
  if (pass) {
    return decipher.output.getBytes();
  }
  return null;
};

export const AES = {
  name: "AES",
  params: symmetricEncryptionParamsAes,
  encrypt: (
    msg,
    key,
    iv = "",
    mode = "ECB",
    keySize = 128,
    padding = "Pkcs7",
    outputCodec = "Base64",
    { inputCodec }
  ) => {
    if (mode === "GCM") {
      key = NodeForge.util.hexToBytes(processSecret(key, keySize / 8, "hex"));
      iv = NodeForge.util.hexToBytes(processSecret(iv, 16, "hex"));
      let result = forgeAesGcmEncrypt(msg, key, iv, outputCodec, inputCodec);
      return JSON.stringify(result, null, 2);
    } else {
      let encrypted = CryptoJS.AES.encrypt(
        strToWordArray(msg, inputCodec),
        processSecret(key, keySize / 8, "wordArray"),
        {
          iv: processSecret(iv, 16, "wordArray"),
          mode: CryptoJS.mode[mode],
          padding: CryptoJS.pad[padding],
        }
      );
      return CryptoJS.enc[outputCodec].stringify(encrypted.ciphertext);
    }
  },
  decrypt: (
    cipher,
    key,
    iv = "",
    mode = "ECB",
    keySize = 128,
    padding = "Pkcs7",
    codec = "Base64"
  ) => {
    if (mode === "GCM") {
      let format = `密文格式应为 {"enc":"hex or base64","tag":"hex or base64"}`;
      try {
        var { enc, tag } = JSON.parse(cipher);
      } catch (_) {
        throw new Error(format);
      }
      if (!enc || !tag) {
        throw new Error(format);
      }
      key = NodeForge.util.hexToBytes(processSecret(key, keySize / 8, "hex"));
      iv = NodeForge.util.hexToBytes(processSecret(iv, 16, "hex"));
      let decrypted = forgeAesGcmDecrypt(enc, key, iv, tag, codec);
      return forgeBytesToStr(decrypted);
    } else {
      cipher = dataConv(cipher, codec, "Base64");
      const decrypt = CryptoJS.AES.decrypt(
        cipher,
        processSecret(key, keySize / 8, "wordArray"),
        {
          iv: processSecret(iv, 16, "wordArray"),
          mode: CryptoJS.mode[mode],
          padding: CryptoJS.pad[padding],
        }
      );
      return wordArrayToStr(decrypt);
    }
  },
};

export const DES = {
  name: "DES",
  params: symmetricEncryptionParams.filter((x, i) => i !== 3),
  encrypt: (
    msg,
    key,
    iv = "",
    mode = "ECB",
    padding = "Pkcs7",
    outputCodec = "Base64",
    { inputCodec }
  ) => {
    const encrypted = CryptoJS.DES.encrypt(
      strToWordArray(msg, inputCodec),
      processSecret(key, 8, "wordArray"),
      {
        iv: processSecret(iv, 8, "wordArray"),
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad[padding],
      }
    );
    return CryptoJS.enc[outputCodec].stringify(encrypted.ciphertext);
  },
  decrypt: (
    cipher,
    key,
    iv = "",
    mode = "ECB",
    padding = "Pkcs7",
    codec = "Base64"
  ) => {
    cipher = dataConv(cipher, codec, "Base64");
    const decrypt = CryptoJS.DES.decrypt(
      cipher,
      processSecret(key, 8, "wordArray"),
      {
        iv: processSecret(iv, 8, "wordArray"),
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad[padding],
      }
    );
    return wordArrayToStr(decrypt);
  },
};

export const TripleDES = {
  name: "TripleDES",
  params: symmetricEncryptionParams.filter((x, i) => i !== 3),
  encrypt: (
    msg,
    key,
    iv = "",
    mode = "ECB",
    padding = "Pkcs7",
    outputCodec = "Base64",
    { inputCodec }
  ) => {
    const encrypted = CryptoJS.TripleDES.encrypt(
      strToWordArray(msg, inputCodec),
      processSecret(key, 8, "wordArray"),
      {
        iv: processSecret(iv, 8, "wordArray"),
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad[padding],
      }
    );
    return CryptoJS.enc[outputCodec].stringify(encrypted.ciphertext);
  },
  decrypt: (
    cipher,
    key,
    iv = "",
    mode = "ECB",
    padding = "Pkcs7",
    codec = "Base64"
  ) => {
    cipher = dataConv(cipher, codec, "Base64");
    const decrypt = CryptoJS.TripleDES.decrypt(
      cipher,
      processSecret(key, 8, "wordArray"),
      {
        iv: processSecret(iv, 8, "wordArray"),
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad[padding],
      }
    );
    return wordArrayToStr(decrypt);
  },
};

export const rc4 = {
  name: "RC4",
  params: [{ type: "text", name: "Key", value: "" }],
  encrypt: (msg, key, { inputCodec }) =>
    CryptoJS.RC4.encrypt(strToWordArray(msg, inputCodec), key).toString(),
  decrypt: (cipher, key) => wordArrayToStr(CryptoJS.RC4.decrypt(cipher, key)),
};

export const rabbit = {
  name: "Rabbit",
  params: [{ type: "text", name: "Key", value: "" }],
  encrypt: (msg, key, { inputCodec }) =>
    CryptoJS.Rabbit.encrypt(strToWordArray(msg, inputCodec), key).toString(),
  decrypt: (cipher, key) =>
    wordArrayToStr(CryptoJS.Rabbit.decrypt(cipher, key)),
};

const sm2 = require("sm-crypto").sm2;
const sm4 = require("sm-crypto").sm4;
const CryptoJS = require("crypto-js");
const NodeForge = require("node-forge");
const { processSecret, dataConv } = require("./utils");

const crypto = {
  // 非对称加解密
  asymmetricCrypto: function (config) {
    const {
      text,
      algorithm,
      operation,
      format = "Base64",
      publicKey = { key: "", codec: "Pem" },
      privateKey = { key: "", codec: "Pem" },
      padding = "RSAES-PKCS1-V1_5",
      cipherMode = 1,
    } = config;

    if (algorithm === "SM2") {
      if (operation === "encrypt") {
        if (!publicKey.key) throw "缺少公钥";
        // 转换公钥格式
        const hexPubKey =
          publicKey.codec === "Hex"
            ? publicKey.key
            : dataConv(publicKey.key, publicKey.codec, "Hex");
        // 加密
        const cipher = sm2.doEncrypt(text, hexPubKey, cipherMode);
        // 转换输出格式
        return format === "Base64" ? dataConv(cipher, "Hex", "Base64") : cipher;
      } else {
        if (!privateKey.key) throw "缺少私钥";
        // 转换私钥格式
        const hexPriKey =
          privateKey.codec === "Hex"
            ? privateKey.key
            : dataConv(privateKey.key, privateKey.codec, "Hex");
        // 转换输入格式
        const hexCipher =
          format === "Base64" ? dataConv(text, "Base64", "Hex") : text;
        // 解密
        const msg = sm2.doDecrypt(hexCipher, hexPriKey, cipherMode, {
          output: "utf8",
        });
        if (!msg) throw "解密失败";
        return msg;
      }
    } else if (algorithm === "RSA") {
      if (operation === "encrypt") {
        if (!publicKey.key) throw "缺少公钥";
        // 转换公钥格式
        let formattedPubKey = publicKey.key;
        if (publicKey.codec !== "Pem") {
          formattedPubKey =
            "-----BEGIN RSA PUBLIC KEY-----\n" +
            dataConv(publicKey.key, publicKey.codec, "Base64") +
            "\n-----END RSA PUBLIC KEY-----";
        }
        formattedPubKey = formattedPubKey.replace(/\\n/g, "\n");

        // 创建 RSA 公钥对象
        const publicKeyObj = NodeForge.pki.publicKeyFromPem(formattedPubKey);
        // 将文本转换为二进制数据
        const binaryData = NodeForge.util.encodeUtf8(text);
        // 使用指定的填充方式加密
        const encrypted = publicKeyObj.encrypt(binaryData, padding);
        // 转换输出格式
        return format === "Base64"
          ? dataConv(encrypted, "binary", "Base64")
          : dataConv(encrypted, "binary", "Hex");
      } else {
        if (!privateKey.key) throw "缺少私钥";
        // 转换私钥格式
        let formattedPriKey = privateKey.key;
        if (privateKey.codec !== "Pem") {
          formattedPriKey =
            "-----BEGIN RSA PRIVATE KEY-----\n" +
            dataConv(privateKey.key, privateKey.codec, "Base64") +
            "\n-----END RSA PRIVATE KEY-----";
        }
        formattedPriKey = formattedPriKey.replace(/\\n/g, "\n");

        // 创建 RSA 私钥对象
        const privateKeyObj = NodeForge.pki.privateKeyFromPem(formattedPriKey);
        // 转换输入格式
        const binary =
          format === "Base64"
            ? dataConv(text, "Base64", "binary")
            : dataConv(text, "Hex", "binary");
        // 解密
        try {
          const decrypted = privateKeyObj.decrypt(binary, padding);
          // 将二进制数据转换回文本
          return NodeForge.util.decodeUtf8(decrypted);
        } catch (e) {
          console.error(e);
          throw "解密失败";
        }
      }
    }
    throw "不支持的算法";
  },

  // 对称加解密
  symmetricCrypto: function (config) {
    const {
      text,
      algorithm,
      mode = "CBC",
      padding = "Pkcs7",
      key = { value: "", codec: "Utf8" },
      keyLength = 128,
      operation = "encrypt",
      format = "Base64",
      iv = { value: "", codec: "Utf8" },
    } = config;

    // 处理密钥和IV
    const processedKey = processSecret(key.value, key.codec, keyLength / 8);
    const processedIV =
      mode === "ECB"
        ? undefined
        : processSecret(iv?.value || key.value, iv?.codec || key.codec, 16);

    // SM4 使用专门的库
    if (algorithm === "SM4") {
      const hexKey = processedKey.toString();
      // 处理输入文本格式
      let inputText = text;
      if (operation === "decrypt") {
        inputText =
          format === "Base64"
            ? CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Hex)
            : text;
      }

      if (mode === "CBC") {
        const hexIv = processedIV ? processedIV.toString() : "0".repeat(32);
        const result =
          operation === "encrypt"
            ? sm4.encrypt(inputText, hexKey, {
                mode: "cbc",
                iv: hexIv,
                padding: padding.toLowerCase(),
              })
            : sm4.decrypt(inputText, hexKey, {
                mode: "cbc",
                iv: hexIv,
                padding: padding.toLowerCase(),
              });
        // 处理输出格式
        return operation === "encrypt" && format === "Base64"
          ? CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(result))
          : result;
      }

      const result =
        operation === "encrypt"
          ? sm4.encrypt(inputText, hexKey, {
              padding: padding.toLowerCase(),
            })
          : sm4.decrypt(inputText, hexKey, {
              padding: padding.toLowerCase(),
            });
      // 处理输出格式
      return operation === "encrypt" && format === "Base64"
        ? CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(result))
        : result;
    }

    // 准备加密配置
    const cryptoConfig = {
      mode: CryptoJS.mode[mode],
      padding: CryptoJS.pad[padding],
    };

    // 添加 IV（如果需要）
    if (mode !== "ECB" && processedIV) {
      cryptoConfig.iv = processedIV;
    }

    // 加密/解密操作
    if (operation === "encrypt") {
      let encrypted;
      const inputText = CryptoJS.enc.Utf8.parse(text);

      switch (algorithm) {
        case "AES":
          if (mode === "GCM") {
            const cipher = NodeForge.cipher.createCipher(
              "AES-GCM",
              processedKey.toString()
            );
            cipher.start({
              iv: cryptoConfig.iv ? cryptoConfig.iv.toString() : "",
              tagLength: 128,
            });
            cipher.update(NodeForge.util.createBuffer(text, "utf8"));
            cipher.finish();
            return {
              enc: cipher.output.toHex(),
              tag: cipher.mode.tag.toHex(),
            };
          }
          encrypted = CryptoJS.AES.encrypt(
            inputText,
            processedKey,
            cryptoConfig
          );
          break;
        default:
          throw "不支持的算法";
      }
      return encrypted.ciphertext.toString(CryptoJS.enc[format]);
    } else {
      // 解密
      if (algorithm === "AES" && mode === "GCM") {
        try {
          const { enc, tag } = JSON.parse(text);
          const decipher = NodeForge.cipher.createDecipher(
            "AES-GCM",
            processedKey.toString()
          );
          decipher.start({
            iv: cryptoConfig.iv ? cryptoConfig.iv.toString() : "",
            tag: NodeForge.util.createBuffer(tag, "hex"),
          });
          decipher.update(NodeForge.util.createBuffer(enc, "hex"));
          const pass = decipher.finish();
          return pass ? decipher.output.toString() : null;
        } catch (e) {
          throw "解密失败";
        }
      }

      // 将输入转换为 CipherParams 格式
      const ciphertext = CryptoJS.enc[format].parse(text);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext,
      });

      let decrypted;
      switch (algorithm) {
        case "AES":
          decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            processedKey,
            cryptoConfig
          );
          break;
        default:
          throw "不支持的算法";
      }
      return CryptoJS.enc.Utf8.stringify(decrypted);
    }
  },
};

module.exports = crypto;

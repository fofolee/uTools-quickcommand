declare var quickcomposer: quickcomposerApi;

interface quickcomposerApi {
  data: {
    string: {
      /**
       * 反转字符串
       * @param text 要反转的文本
       */
      reverse(text: string): string;

      /**
       * 字符串替换
       * @param text 原始文本
       * @param searchValue 要替换的文本
       * @param replaceValue 替换为的文本
       */
      replace(text: string, searchValue: string, replaceValue: string): string;

      /**
       * 字符串截取
       * @param text 原始文本
       * @param start 起始位置
       * @param end 结束位置
       */
      substring(text: string, start: number, end?: number): string;

      /**
       * 去除空白
       * @param text 原始文本
       * @param mode 去除模式：both-两端，start-左侧，end-右侧
       */
      trim(text: string, mode?: "both" | "start" | "end"): string;

      /**
       * 大小写转换
       * @param text 原始文本
       * @param type 转换类型：upper-大写，lower-小写，capitalize-首字母大写，camel-驼峰，snake-蛇形，kebab-短横线，constant-常量
       */
      changeCase(
        text: string,
        type:
          | "upper"
          | "lower"
          | "capitalize"
          | "camel"
          | "snake"
          | "kebab"
          | "constant"
      ): string;

      /**
       * 字符串填充
       * @param text 原始文本
       * @param length 目标长度
       * @param padString 填充字符
       * @param position 填充位置：start-左侧，end-右侧，both-两端
       */
      pad(
        text: string,
        length: number,
        padString?: string,
        position?: "start" | "end" | "both"
      ): string;

      /**
       * 字符串分割
       * @param text 原始文本
       * @param separator 分隔符
       */
      split(text: string, separator?: string): string[];

      /**
       * 数组合并
       * @param array 字符串数组
       * @param separator 连接符
       */
      join(array: string[], separator?: string): string;

      /**
       * 字符串重复
       * @param text 要重复的文本
       * @param count 重复次数
       */
      repeat(text: string, count: number): string;

      /**
       * 提取字符
       * @param text 原始文本
       * @param type 提取类型：number-数字，letter-字母，chinese-中文，punctuation-标点符号，whitespace-空白字符
       */
      extract(
        text: string,
        type: "number" | "letter" | "chinese" | "punctuation" | "whitespace"
      ): string;

      /**
       * 字符统计
       * @param text 原始文本
       * @param type 统计类型：char-字符数，word-单词数，line-行数，number-数字数，letter-字母数，chinese-中文字数，whitespace-空白字符数
       */
      count(
        text: string,
        type:
          | "char"
          | "word"
          | "line"
          | "number"
          | "letter"
          | "chinese"
          | "whitespace"
      ): number;

      /**
       * 文本换行
       * @param text 原始文本
       * @param width 每行字符数
       */
      wrap(text: string, width: number): string;

      /**
       * 文本对齐
       * @param text 原始文本
       * @param align 对齐方式：left-左对齐，center-居中，right-右对齐，justify-两端对齐
       * @param width 总宽度
       */
      align(
        text: string,
        align: "left" | "center" | "right" | "justify",
        width: number
      ): string;
    };
    array: {
      /**
       * 数组过滤
       * @param array 原始数组
       * @param condition 过滤条件
       */
      filter<T>(array: T[], condition: string): T[];

      /**
       * 数组映射
       * @param array 原始数组
       * @param transform 转换函数
       */
      map<T, U>(array: T[], transform: string): U[];

      /**
       * 数组排序
       * @param array 原始数组
       * @param field 排序字段
       * @param order 排序方式：asc-升序，desc-降序
       */
      sort<T>(array: T[], field: keyof T, order?: "asc" | "desc"): T[];

      /**
       * 数组分组
       * @param array 原始数组
       * @param field 分组字段
       */
      group<T>(array: T[], field: keyof T): Record<string, T[]>;

      /**
       * 数组去重
       * @param array 原始数组
       * @param field 去重字段
       */
      unique<T>(array: T[], field?: keyof T): T[];

      /**
       * 查找元素
       * @param array 原始数组
       * @param condition 查找条件
       */
      find<T>(array: T[], condition: string): T | undefined;

      /**
       * 数组聚合
       * @param array 原始数组
       * @param operation 聚合操作：sum-求和，avg-平均值，max-最大值，min-最小值，count-计数
       * @param field 聚合字段
       */
      aggregate<T>(
        array: T[],
        operation: "sum" | "avg" | "max" | "min" | "count",
        field: keyof T
      ): number;

      /**
       * 数组切片
       * @param array 原始数组
       * @param start 起始位置
       * @param end 结束位置
       */
      slice<T>(array: T[], start?: number, end?: number): T[];

      /**
       * 数组扁平化
       * @param array 原始数组
       * @param depth 扁平化深度
       */
      flatten<T>(array: T[], depth?: number): T[];

      /**
       * 数组差集
       * @param array1 数组1
       * @param array2 数组2
       * @param field 比较字段
       */
      diff<T>(array1: T[], array2: T[], field?: keyof T): T[];

      /**
       * 数组交集
       * @param array1 数组1
       * @param array2 数组2
       * @param field 比较字段
       */
      intersect<T>(array1: T[], array2: T[], field?: keyof T): T[];

      /**
       * 数组并集
       * @param array1 数组1
       * @param array2 数组2
       * @param field 比较字段
       */
      union<T>(array1: T[], array2: T[], field?: keyof T): T[];

      /**
       * 数组分块
       * @param array 原始数组
       * @param size 块大小
       */
      chunk<T>(array: T[], size: number): T[][];

      /**
       * 数组随机排序
       * @param array 原始数组
       */
      shuffle<T>(array: T[]): T[];
    };
    buffer: {
      /**
       * 创建Buffer
       * @param data 数据
       * @param encoding 编码
       */
      from(data: string | number[] | Buffer, encoding?: BufferEncoding): Buffer;

      /**
       * 写入数据
       * @param buffer Buffer对象
       * @param string 要写入的字符串
       * @param offset 偏移量
       * @param length 长度
       * @param encoding 编码
       */
      write(
        buffer: Buffer,
        string: string,
        offset?: number,
        length?: number,
        encoding?: BufferEncoding
      ): number;

      /**
       * 填充数据
       * @param buffer Buffer对象
       * @param value 填充值
       * @param start 起始位置
       * @param end 结束位置
       * @param encoding 编码
       */
      fill(
        buffer: Buffer,
        value: string | number | Buffer,
        start?: number,
        end?: number,
        encoding?: BufferEncoding
      ): Buffer;

      /**
       * 复制数据
       * @param source 源Buffer
       * @param target 目标Buffer
       * @param targetStart 目标起始位置
       * @param sourceStart 源起始位置
       * @param sourceEnd 源结束位置
       */
      copy(
        source: Buffer,
        target: Buffer,
        targetStart?: number,
        sourceStart?: number,
        sourceEnd?: number
      ): number;

      /**
       * 比较数据
       * @param buffer1 Buffer1
       * @param buffer2 Buffer2
       */
      compare(buffer1: Buffer, buffer2: Buffer): number;

      /**
       * 连接Buffer
       * @param buffers Buffer数组
       * @param totalLength 总长度
       */
      concat(buffers: Buffer[], totalLength?: number): Buffer;

      /**
       * 切片数据
       * @param buffer Buffer对象
       * @param start 起始位置
       * @param end 结束位置
       */
      slice(buffer: Buffer, start?: number, end?: number): Buffer;

      /**
       * 交换字节序
       * @param buffer Buffer对象
       * @param size 字节大小：16位、32位、64位
       */
      swap(buffer: Buffer, size: 16 | 32 | 64): Buffer;
    };
    time: {
      /**
       * 时间格式化
       * @param time 时间
       * @param format 格式
       */
      format(time: string | number | Date, format: string): string;

      /**
       * 工作日计算
       * @param startDate 开始时间
       * @param days 工作日天数
       * @param includeWeekend 包含周末
       * @param holidays 节假日
       */
      workday(
        startDate: string | Date,
        days: number,
        includeWeekend?: boolean,
        holidays?: string[]
      ): string;

      /**
       * 时间范围判断
       * @param time 判断时间
       * @param start 开始时间
       * @param end 结束时间
       * @param inclusive 包含边界
       */
      between(
        time: string | Date,
        start: string | Date,
        end: string | Date,
        inclusive?: boolean
      ): boolean;
    };
    /**
     * HTML解析
     * @param html 要解析的HTML
     * @param selector CSS选择器
     * @param attribute 属性
     */
    htmlParser(
      html: string,
      selector: string,
      attribute?: string
    ): string | string[];
    zlib: {
      /**
       * 压缩数据
       * @param data 要压缩的数据
       */
      compressData(data: string | Buffer): Promise<Buffer>;

      /**
       * 解压数据
       * @param data 要解压的数据
       */
      decompressData(data: Buffer): Promise<Buffer>;

      /**
       * 同步压缩数据
       * @param data 要压缩的数据
       */
      compressDataSync(data: string | Buffer): Buffer;

      /**
       * 同步解压数据
       * @param data 要解压的数据
       */
      decompressDataSync(data: Buffer): Buffer;

      /**
       * zlib常量
       */
      constants: typeof import("zlib").constants;
    };
  };
  simulate: {
    /**
     * 模拟按键
     * @param keys 按键数组，第一个元素为主按键，其余为修饰键(control/alt/shift/command)
     * @param options 选项
     * @param options.repeatCount 重复次数
     * @param options.repeatInterval 重复间隔(毫秒)
     * @param options.keyDelay 按键后延迟(毫秒)
     */
    keyboardTap(
      keys: string[],
      options?: {
        repeatCount?: number;
        repeatInterval?: number;
        keyDelay?: number;
      }
    ): void;

    /**
     * 按键序列
     * @param sequence 按键序列数组，每个元素为一个按键数组
     * @param options 选项
     * @param options.interval 按键间隔(毫秒)
     */
    keySequence(
      sequence: string[][],
      options?: {
        interval?: number;
      }
    ): void;

    /**
     * 鼠标点击
     * @param mouseAction 点击类型：Click-单击，RightClick-右击，DoubleClick-双击
     * @param options 选项
     * @param options.x X坐标
     * @param options.y Y坐标
     * @param options.count 点击次数
     * @param options.interval 点击间隔(毫秒)
     */
    mouseClick(
      mouseAction?: "Click" | "RightClick" | "DoubleClick",
      options?: {
        x?: number;
        y?: number;
        count?: number;
        interval?: number;
      }
    ): void;

    /**
     * 屏幕找图
     * @param options 找图选项
     * @param options.image 图片路径或base64
     * @param options.region 查找区域 [x, y, width, height]
     * @param options.confidence 相似度 0-1
     * @param options.timeout 超时时间(毫秒)
     */
    findImage(options: {
      image: string;
      region?: [number, number, number, number];
      confidence?: number;
      timeout?: number;
    }): Promise<{ x: number; y: number } | null>;

    /**
     * 屏幕取色
     * @returns 返回颜色值，包含hex和rgb格式
     */
    screenColorPick(): Promise<{
      hex: string;
      rgb: { r: number; g: number; b: number };
    }>;

    /**
     * 屏幕截图
     * @param options 截图选项
     * @param options.type 截图类型：fullscreen-全屏，area-区域
     */
    captureScreen(options?: { type?: "fullscreen" | "area" }): Promise<string>;

    /**
     * 屏幕截图并保存到文件
     * @param filePath 保存路径
     * @param options 截图选项
     * @param options.type 截图类型：fullscreen-全屏，area-区域
     */
    captureScreenToFile(
      filePath: string,
      options?: {
        type?: "fullscreen" | "area";
      }
    ): Promise<void>;

    /**
     * 屏幕截图并复制到剪贴板
     * @param options 截图选项
     * @param options.type 截图类型：fullscreen-全屏，area-区域
     */
    captureScreenToClipboard(options?: {
      type?: "fullscreen" | "area";
    }): Promise<void>;
  };
  file: {
    /**
     * 文件操作
     * @param config 操作配置
     */
    operation(config: {
      /** 操作类型：read-读取，write-写入，list-列表，stat-状态，delete-删除，permission-权限，transfer-复制移动 */
      operation:
        | "read"
        | "write"
        | "list"
        | "stat"
        | "delete"
        | "permission"
        | "transfer";
      /** 文件路径 */
      filePath: string;
      /** 读取操作配置 */
      encoding?: BufferEncoding;
      readMode?: "all" | "start" | "line";
      start?: number;
      length?: number;
      /** 写入操作配置 */
      content?: string;
      flag?: "w" | "a";
      mode?: string | number;
      /** 列表操作配置 */
      recursive?: boolean;
      showHidden?: boolean;
      /** 权限操作配置 */
      operationType?: "chmod" | "chown";
      uid?: number;
      gid?: number;
      /** 复制移动操作配置 */
      transferOperation?: "copy" | "rename";
      newPath?: string;
      /** 删除操作配置 */
      force?: boolean;
      /** 状态操作配置 */
      followSymlinks?: boolean;
    }): Promise<any>;

    /**
     * 文件归档操作
     * @param operation 操作类型：compress-压缩，extract-解压
     * @param format 归档格式：zip, tar, gzip
     * @param source 源文件/文件夹路径
     * @param destination 目标路径
     */
    archive(
      operation: "compress" | "extract",
      format: "zip" | "tar" | "gzip",
      source: string | string[],
      destination: string
    ): Promise<void>;
  };
  system: {
    /**
     * 执行系统命令
     * @param command 要执行的命令
     * @param options 执行选项
     * @param options.autoEncoding 是否自动处理编码(Windows下使用GBK,其他使用UTF-8)
     * @param options.encoding 指定编码
     * @param options.windowsHide 是否隐藏命令窗口(仅Windows)
     * @param options.cwd 工作目录
     */
    exec(
      command: string,
      options?: {
        autoEncoding?: boolean;
        encoding?: BufferEncoding | "buffer";
        windowsHide?: boolean;
        cwd?: string;
      }
    ): Promise<string | Buffer>;

    /**
     * 操作系统相关功能
     */
    os: {
      /**
       * 获取系统架构
       */
      arch(): string;

      /**
       * 获取CPU信息
       * @param format 信息格式：full-完整信息，simple-仅型号和速度
       */
      cpus(format?: "full" | "simple"): {
        model: string;
        speed: number;
        times?: {
          user: number;
          nice: number;
          sys: number;
          idle: number;
          irq: number;
        };
      }[];

      /**
       * 获取内存信息
       * @param type 内存类型：totalmem-总内存，freemem-空闲内存
       */
      memory(type: "totalmem" | "freemem"): number;

      /**
       * 获取网络信息
       * @param type 网络信息类型：hostname-主机名，networkInterfaces-网络接口
       * @param includeInternal 是否包含内部接口
       */
      network(
        type: "hostname" | "networkInterfaces",
        includeInternal?: boolean
      ): string | Record<string, any>;

      /**
       * 获取平台信息
       * @param type 平台信息类型
       */
      platform(
        type:
          | "platform" // 操作系统名称
          | "type" // 操作系统类型
          | "release" // 操作系统版本
          | "arch" // 操作系统架构
          | "endianness" // CPU字节序
          | "tmpdir" // 系统临时目录
          | "homedir" // 主目录
          | "uptime" // 系统正常运行时间
          | "userInfo" // 用户信息
      ): string | number | Record<string, any>;
    };

    /**
     * 路径操作相关功能
     */
    path: {
      /**
       * 规范化路径
       * @param path 路径
       */
      normalize(path: string): string;

      /**
       * 解析路径
       * @param path 路径
       */
      parse(path: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
      };

      /**
       * 获取目录名
       * @param path 路径
       */
      dirname(path: string): string;

      /**
       * 获取文件名
       * @param path 路径
       * @param ext 要移除的扩展名
       */
      basename(path: string, ext?: string): string;

      /**
       * 获取扩展名
       * @param path 路径
       */
      extname(path: string): string;

      /**
       * 判断是否为绝对路径
       * @param path 路径
       */
      isAbsolute(path: string): boolean;

      /**
       * 连接路径
       * @param paths 路径片段
       */
      join(...paths: string[]): string;

      /**
       * 解析绝对路径
       * @param paths 路径片段
       */
      resolve(...paths: string[]): string;

      /**
       * 计算相对路径
       * @param from 起始路径
       * @param to 目标路径
       */
      relative(from: string, to: string): string;

      /**
       * 格式化路径
       * @param pathObject 路径对象
       */
      format(pathObject: {
        root?: string;
        dir?: string;
        base?: string;
        ext?: string;
        name?: string;
      }): string;
    };
  };
  network: {
    /**
     * URL操作相关功能
     */
    url: {
      /**
       * 解析URL
       * @param url 要解析的URL
       */
      parse(url: string): {
        protocol: string;
        auth: string;
        hostname: string;
        port: string;
        pathname: string;
        search: string;
        hash: string;
      };

      /**
       * 格式化URL
       * @param urlObject URL对象
       */
      format(urlObject: {
        protocol?: string;
        auth?: string;
        hostname?: string;
        port?: string;
        pathname?: string;
        search?: string;
        hash?: string;
      }): string;

      /**
       * 解析查询字符串
       * @param queryString 查询字符串
       */
      parseQuery(queryString: string): Record<string, string>;

      /**
       * 格式化查询字符串
       * @param params 参数对象
       */
      formatQuery(params: Record<string, string>): string;

      /**
       * 解析路径
       * @param path URL路径
       */
      parsePath(path: string): {
        pathname: string;
        search: string;
        hash: string;
      };

      /**
       * 解析主机名
       * @param host 主机名(可能包含端口)
       */
      parseHost(host: string): {
        hostname: string;
        port: string;
      };

      /**
       * 获取URL参数
       * @param url URL
       * @param param 参数名
       */
      getQueryParam(url: string, param: string): string | null;

      /**
       * 添加URL参数
       * @param url URL
       * @param param 参数名
       * @param value 参数值
       */
      addQueryParam(url: string, param: string, value: string): string;

      /**
       * 移除URL参数
       * @param url URL
       * @param param 参数名
       */
      removeQueryParam(url: string, param: string): string;

      /**
       * 检查是否为绝对URL
       * @param url URL
       */
      isAbsolute(url: string): boolean;

      /**
       * 解析URL组成部分
       * @param url URL
       */
      parseComponents(url: string): {
        protocol: string;
        username: string;
        password: string;
        hostname: string;
        port: string;
        pathname: string;
        search: string;
        hash: string;
      };
    };

    /**
     * DNS操作相关功能
     */
    dns: {
      /**
       * DNS查询
       * @param hostname 域名
       * @param options 查询选项
       * @param options.family IP版本：0-自动，4-IPv4，6-IPv6
       * @param options.all 是否返回所有地址
       */
      lookupHost(
        hostname: string,
        options?: {
          family?: 0 | 4 | 6;
          all?: boolean;
        }
      ): Promise<string | { address: string; family: number }[]>;

      /**
       * 解析所有记录
       * @param hostname 域名
       */
      resolveAll(hostname: string): Promise<{
        A?: string[];
        AAAA?: string[];
        MX?: { priority: number; exchange: string }[];
        TXT?: string[];
        SRV?: {
          priority: number;
          weight: number;
          port: number;
          target: string;
        }[];
        NS?: string[];
        CNAME?: string[];
      }>;

      /**
       * 解析IPv4地址
       * @param hostname 域名
       */
      resolveIpv4(hostname: string): Promise<string[]>;

      /**
       * 解析IPv6地址
       * @param hostname 域名
       */
      resolveIpv6(hostname: string): Promise<string[]>;

      /**
       * 解析MX记录
       * @param hostname 域名
       */
      resolveMxRecords(
        hostname: string
      ): Promise<{ priority: number; exchange: string }[]>;

      /**
       * 解析TXT记录
       * @param hostname 域名
       */
      resolveTxtRecords(hostname: string): Promise<string[]>;

      /**
       * 解析NS记录
       * @param hostname 域名
       */
      resolveNsRecords(hostname: string): Promise<string[]>;

      /**
       * 解析CNAME记录
       * @param hostname 域名
       */
      resolveCnameRecords(hostname: string): Promise<string[]>;

      /**
       * 反向解析
       * @param ip IP地址
       */
      reverseResolve(ip: string): Promise<string[]>;
    };
  };
  coding: {
    /**
     * Base64编码
     * @param text 要编码的文本
     */
    base64Encode(text: string): string;

    /**
     * Base64解码
     * @param text 要解码的文本
     */
    base64Decode(text: string): string;

    /**
     * 十六进制编码
     * @param text 要编码的文本
     */
    hexEncode(text: string): string;

    /**
     * 十六进制解码
     * @param text 要解码的文本
     */
    hexDecode(text: string): string;

    /**
     * URL编码
     * @param text 要编码的文本
     */
    urlEncode(text: string): string;

    /**
     * URL解码
     * @param text 要解码的文本
     */
    urlDecode(text: string): string;

    /**
     * HTML编码
     * @param text 要编码的文本
     */
    htmlEncode(text: string): string;

    /**
     * HTML解码
     * @param text 要解码的文本
     */
    htmlDecode(text: string): string;

    /**
     * 对称加密
     * @param config 加密配置
     * @param config.text 要加密的文本
     * @param config.algorithm 加密算法：AES, SM4
     * @param config.mode 操作模式：CBC, ECB, GCM (GCM仅AES支持)
     * @param config.padding AES填充方式：Pkcs7, NoPadding, Iso97971, AnsiX923, Iso10126, ZeroPadding
     *                      SM4填充方式：Pkcs#7, None
     * @param config.key 密钥配置
     * @param config.key.value 密钥值
     * @param config.key.codec 密钥编码：Utf8, Base64, Hex
     * @param config.keyLength 密钥长度：128, 192, 256 (仅AES支持192/256)
     * @param config.operation 操作类型：encrypt-加密，decrypt-解密
     * @param config.format 输出格式：Base64, Hex
     * @param config.iv IV配置(ECB模式不需要)
     * @param config.iv.value IV值
     * @param config.iv.codec IV编码：Utf8, Base64, Hex
     */
    symmetricCrypto(config: {
      text: string;
      algorithm: "AES" | "SM4";
      mode?: "CBC" | "ECB" | "GCM";
      padding?:
        | "Pkcs7"
        | "NoPadding"
        | "Iso97971"
        | "AnsiX923"
        | "Iso10126"
        | "ZeroPadding"
        | "Pkcs#7"
        | "None";
      key: {
        value: string;
        codec: "Utf8" | "Base64" | "Hex";
      };
      keyLength?: 128 | 192 | 256;
      operation?: "encrypt" | "decrypt";
      format?: "Base64" | "Hex";
      iv?: {
        value: string;
        codec: "Utf8" | "Base64" | "Hex";
      };
    }): string | { enc: string; tag: string }; // GCM模式返回包含tag的对象

    /**
     * 非对称加密
     * @param config 加密配置
     * @param config.text 要加密/解密的文本
     * @param config.algorithm 加密算法：SM2, RSA
     * @param config.operation 操作类型：encrypt-加密，decrypt-解密
     * @param config.format 输出格式：Base64, Hex
     * @param config.publicKey 公钥配置(加密时必需)
     * @param config.publicKey.key 公钥值
     * @param config.publicKey.codec 公钥编码：Pem, Hex (SM2仅支持Hex，RSA仅支持Pem)
     * @param config.privateKey 私钥配置(解密时必需)
     * @param config.privateKey.key 私钥值
     * @param config.privateKey.codec 私钥编码：Pem, Hex (SM2仅支持Hex，RSA仅支持Pem)
     * @param config.padding RSA填充方式：RSAES-PKCS1-V1_5 (仅RSA支持)
     * @param config.cipherMode SM2加密模式：0-C1C2C3, 1-C1C3C2 (仅SM2支持，默认1)
     */
    asymmetricCrypto(config: {
      text: string;
      algorithm: "SM2" | "RSA";
      operation: "encrypt" | "decrypt";
      format?: "Base64" | "Hex";
      publicKey?: {
        key: string;
        codec: "Pem" | "Hex";
      };
      privateKey?: {
        key: string;
        codec: "Pem" | "Hex";
      };
      padding?: "RSAES-PKCS1-V1_5";
      cipherMode?: 0 | 1;
    }): string;

    /**
     * MD5哈希
     * @param text 要计算哈希的文本
     */
    md5Hash(text: string): string;

    /**
     * SHA1哈希
     * @param text 要计算哈希的文本
     */
    sha1Hash(text: string): string;

    /**
     * SHA256哈希
     * @param text 要计算哈希的文本
     */
    sha256Hash(text: string): string;

    /**
     * SHA512哈希
     * @param text 要计算哈希的文本
     */
    sha512Hash(text: string): string;

    /**
     * SM3哈希
     * @param text 要计算哈希的文本
     */
    sm3Hash(text: string): string;
  };
  math: {
    /**
     * 基础运算功能
     */
    basic: {
      /**
       * 计算表达式
       * @param expression 算术表达式
       */
      evaluate(expression: string): number;

      /**
       * 计算阶乘
       * @param n 非负整数
       */
      factorial(n: number): number;

      /**
       * 计算绝对值
       * @param x 数字
       */
      abs(x: number): number;

      /**
       * 向上取整
       * @param x 数字
       */
      ceil(x: number): number;

      /**
       * 向下取整
       * @param x 数字
       */
      floor(x: number): number;

      /**
       * 四舍五入
       * @param x 数字
       * @param decimals 保留小数位数
       */
      round(x: number, decimals?: number): number;

      /**
       * 计算平方根
       * @param x 非负数
       */
      sqrt(x: number): number;

      /**
       * 计算幂
       * @param base 底数
       * @param exponent 指数
       */
      pow(base: number, exponent: number): number;

      /**
       * 计算对数
       * @param x 正数
       * @param base 底数，默认为自然对数e
       */
      log(x: number, base?: number): number;
    };

    /**
     * 统计计算功能
     */
    statistics: {
      /**
       * 计算平均值
       * @param data 数据集合
       */
      mean(data: number[]): number;

      /**
       * 计算中位数
       * @param data 数据集合
       */
      median(data: number[]): number;

      /**
       * 计算众数
       * @param data 数据集合
       */
      mode(data: number[]): number[];

      /**
       * 计算方差
       * @param data 数据集合
       */
      variance(data: number[]): number;

      /**
       * 计算标准差
       * @param data 数据集合
       */
      standardDeviation(data: number[]): number;

      /**
       * 计算极差
       * @param data 数据集合
       */
      range(data: number[]): number;

      /**
       * 计算四分位数
       * @param data 数据集合
       */
      quartiles(data: number[]): {
        Q1: number;
        Q2: number;
        Q3: number;
        IQR: number;
      };
    };

    /**
     * 几何计算功能
     */
    geometry: {
      /**
       * 圆形计算
       * @param radius 半径
       */
      circle(radius: number): {
        area: number; // 面积
        perimeter: number; // 周长
        diameter: number; // 直径
      };

      /**
       * 矩形计算
       * @param width 宽度
       * @param height 高度
       */
      rectangle(
        width: number,
        height: number
      ): {
        area: number; // 面积
        perimeter: number; // 周长
        diagonal: number; // 对角线长度
      };

      /**
       * 三角形计算
       * @param a 边长a
       * @param b 边长b
       * @param c 边长c
       */
      triangle(
        a: number,
        b: number,
        c: number
      ): {
        area: number; // 面积
        perimeter: number; // 周长
        angles: {
          // 三个角的度数
          A: number;
          B: number;
          C: number;
        };
        type: string; // 三角形类型
        inradius: number; // 内切圆半径
        circumradius: number; // 外接圆半径
      };
    };

    /**
     * 三角函数功能
     */
    trigonometry: {
      /**
       * 角度转弧度
       * @param degrees 角度
       */
      degreesToRadians(degrees: number): number;

      /**
       * 弧度转角度
       * @param radians 弧度
       */
      radiansToDegrees(radians: number): number;

      /**
       * 正弦函数
       * @param angle 角度
       * @param useRadians 是否使用弧度
       */
      sin(angle: number, useRadians?: boolean): number;

      /**
       * 余弦函数
       * @param angle 角度
       * @param useRadians 是否使用弧度
       */
      cos(angle: number, useRadians?: boolean): number;

      /**
       * 正切函数
       * @param angle 角度
       * @param useRadians 是否使用弧度
       */
      tan(angle: number, useRadians?: boolean): number;

      /**
       * 反正弦函数
       * @param value 正弦值
       * @param returnRadians 是否返回弧度
       */
      asin(value: number, returnRadians?: boolean): number;

      /**
       * 反余弦函数
       * @param value 余弦值
       * @param returnRadians 是否返回弧度
       */
      acos(value: number, returnRadians?: boolean): number;

      /**
       * 反正切函数
       * @param value 正切值
       * @param returnRadians 是否返回弧度
       */
      atan(value: number, returnRadians?: boolean): number;

      /**
       * 双参数反正切函数
       * @param y y坐标
       * @param x x坐标
       * @param returnRadians 是否返回弧度
       */
      atan2(y: number, x: number, returnRadians?: boolean): number;

      /**
       * 双曲正弦函数
       * @param x 输入值
       */
      sinh(x: number): number;

      /**
       * 双曲余弦函数
       * @param x 输入值
       */
      cosh(x: number): number;

      /**
       * 双曲正切函数
       * @param x 输入值
       */
      tanh(x: number): number;
    };

    /**
     * 随机数功能
     */
    random: {
      /**
       * 生成随机数
       * @param min 最小值
       * @param max 最大值
       * @param count 生成数量
       * @param decimals 小数位数
       */
      number(
        min: number,
        max: number,
        count?: number,
        decimals?: number
      ): number | number[];

      /**
       * 生成随机整数
       * @param min 最小值
       * @param max 最大值
       * @param count 生成数量
       */
      integer(min: number, max: number, count?: number): number | number[];
    };

    /**
     * 进制转换功能
     */
    conversion: {
      /**
       * 进制转换
       * @param value 要转换的值
       * @param fromBase 源进制：binary-二进制，octal-八进制，decimal-十进制，hex-十六进制
       * @param toBase 目标进制：binary-二进制，octal-八进制，decimal-十进制，hex-十六进制
       */
      base(
        value: string | number,
        fromBase: "binary" | "octal" | "decimal" | "hex",
        toBase: "binary" | "octal" | "decimal" | "hex"
      ): string;
    };
  };
  audio: {
    /**
     * 语音朗读功能
     */
    speech: {
      /**
       * 朗读文本
       * @param text 要朗读的文本
       * @param options 朗读选项
       * @param options.voice 语音
       * @param options.rate 语速(0.1-10)
       * @param options.pitch 音调(0-2)
       * @param options.volume 音量(0-1)
       */
      speak(
        text: string,
        options?: {
          voice?: string;
          rate?: number;
          pitch?: number;
          volume?: number;
        }
      ): Promise<void>;

      /**
       * 停止朗读
       */
      stop(): void;
    };

    /**
     * 音频媒体功能
     */
    media: {
      /**
       * 播放音频文件
       * @param file 音频文件路径
       * @param volume 音量(0-1)
       * @param loop 是否循环播放
       * @param autoplay 是否自动播放
       */
      play(
        file: string,
        volume?: number,
        loop?: boolean,
        autoplay?: boolean
      ): Promise<void>;

      /**
       * 停止音频播放
       */
      stop(): void;

      /**
       * 播放系统音效
       * @param type 音效类型：beep-提示音，error-错误音，warning-警告音，notification-通知音，complete-完成音，click-点击音
       * @param volume 音量(0-1)
       */
      beep(
        type?:
          | "beep"
          | "error"
          | "warning"
          | "notification"
          | "complete"
          | "click",
        volume?: number
      ): Promise<void>;

      /**
       * 分析音频文件
       * @param file 音频文件路径
       */
      analyze(file: string): Promise<{
        duration: number; // 时长(秒)
        sampleRate: number; // 采样率
        channels: number; // 声道数
        format: string; // 格式
      }>;
    };

    /**
     * 录音功能
     * @param options 录音选项
     * @param options.duration 录制时长(毫秒)
     * @param options.savePath 保存路径
     */
    record(options?: { duration?: number; savePath?: string }): Promise<string>;
  };
  image: {
    /**
     * 分析图片信息
     * @param file 图片文件路径
     */
    analyze(file: string): Promise<{
      width: number; // 宽度(像素)
      height: number; // 高度(像素)
      format: string; // 图片格式
      size: number; // 文件大小(字节)
      exif?: {
        // EXIF信息(仅JPEG格式)
        image?: any; // 图像信息
        thumbnail?: any; // 缩略图信息
        exif?: any; // EXIF信息
        gps?: any; // GPS信息
      };
    }>;

    /**
     * 调整图片大小
     * @param inputFile 输入文件路径
     * @param outputFile 输出文件路径
     * @param width 目标宽度(像素)
     * @param height 目标高度(像素)
     * @param keepAspectRatio 是否保持宽高比
     * @param quality 图片质量(0-1)
     */
    resize(
      inputFile: string,
      outputFile: string,
      width?: number,
      height?: number,
      keepAspectRatio?: boolean,
      quality?: number
    ): Promise<void>;

    /**
     * 旋转图片
     * @param inputFile 输入文件路径
     * @param outputFile 输出文件路径
     * @param angle 旋转角度
     * @param quality 图片质量(0-1)
     */
    rotate(
      inputFile: string,
      outputFile: string,
      angle?: number,
      quality?: number
    ): Promise<void>;

    /**
     * 裁剪图片
     * @param inputFile 输入文件路径
     * @param outputFile 输出文件路径
     * @param x 起始X坐标
     * @param y 起始Y坐标
     * @param width 裁剪宽度
     * @param height 裁剪高度
     * @param quality 图片质量(0-1)
     */
    crop(
      inputFile: string,
      outputFile: string,
      x?: number,
      y?: number,
      width?: number,
      height?: number,
      quality?: number
    ): Promise<void>;

    /**
     * 添加水印
     * @param inputFile 输入文件路径
     * @param outputFile 输出文件路径
     * @param text 水印文字
     * @param font 字体设置
     * @param color 文字颜色
     * @param position 位置(topLeft-左上角，topRight-右上角，bottomLeft-左下角，bottomRight-右下角，center-居中)
     * @param margin 边距
     * @param opacity 不透明度(0-1)
     * @param quality 图片质量(0-1)
     */
    watermark(
      inputFile: string,
      outputFile: string,
      text?: string,
      font?: string,
      color?: string,
      position?:
        | "topLeft"
        | "topRight"
        | "bottomLeft"
        | "bottomRight"
        | "center",
      margin?: number,
      opacity?: number,
      quality?: number
    ): Promise<void>;

    /**
     * 格式转换
     * @param inputFile 输入文件路径
     * @param outputFile 输出文件路径
     * @param format 输出格式(jpeg/png/webp)
     * @param quality 图片质量(0-1)
     */
    convert(
      inputFile: string,
      outputFile: string,
      format?: "jpeg" | "png" | "webp",
      quality?: number
    ): Promise<void>;

    /**
     * PNG转图标
     * @param input PNG文件路径或Base64字符串
     * @param outputDir 输出目录
     * @param type 输出类型(ico/icns)
     */
    pngToIcon(
      input: string | string[],
      outputDir: string,
      type?: "ico" | "icns"
    ): void;
  };
  windows: {
    /**
     * 窗口操作功能
     */
    window: {
      /**
       * 获取窗口信息
       * @param method 查找方式：title-标题，handle-句柄，process-进程名，class-类名，active-活动窗口
       * @param window 窗口标题、句柄、进程名或类名
       */
      getWindowInfo(
        method: "title" | "handle" | "process" | "class" | "active",
        window?: string
      ): Promise<
        {
          handle: string; // 窗口句柄
          title: string; // 窗口标题
          className: string; // 窗口类名
          processId: number; // 进程ID
          processName: string; // 进程名称
          x: number; // 窗口X坐标
          y: number; // 窗口Y坐标
          width: number; // 窗口宽度
          height: number; // 窗口高度
          isVisible: boolean; // 是否可见
          isMinimized: boolean; // 是否最小化
          isMaximized: boolean; // 是否最大化
        }[]
      >;

      /**
       * 设置窗口置顶
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       * @param isTopMost 是否置顶
       */
      setTopMost(
        windowHandle?: string,
        isTopMost?: boolean
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 设置窗口透明度
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       * @param opacity 透明度(0-100)
       */
      setOpacity(
        windowHandle?: string,
        opacity?: number
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 设置窗口位置和大小
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       * @param x X坐标
       * @param y Y坐标
       * @param width 宽度
       * @param height 高度
       */
      setWindowRect(
        windowHandle?: string,
        x?: number,
        y?: number,
        width?: number,
        height?: number
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 设置窗口状态
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       * @param state 窗口状态：maximize-最大化，minimize-最小化，normal-还原
       */
      setWindowState(
        windowHandle?: string,
        state?: "maximize" | "minimize" | "normal"
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 关闭窗口
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       */
      closeWindow(
        windowHandle?: string
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 设置窗口焦点
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       */
      setFocus(
        windowHandle?: string
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 设置窗口边框
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       * @param hasBorder 是否显示边框
       */
      setBorder(
        windowHandle?: string,
        hasBorder?: boolean
      ): Promise<{ success: boolean; error?: string }>;

      /**
       * 设置点击穿透
       * @param windowHandle 窗口句柄，为空时操作当前活动窗口
       * @param isTransparent 是否启用点击穿透
       */
      setClickThrough(
        windowHandle?: string,
        isTransparent?: boolean
      ): Promise<{ success: boolean; error?: string }>;
    };

    /**
     * 资源管理器操作功能
     */
    explorer: {
      /**
       * 获取所有打开的资源管理器窗口信息
       * @returns 资源管理器窗口信息数组
       */
      list(): Promise<
        {
          handle: number; // 窗口句柄
          title: string; // 窗口标题
          path: string; // 当前路径
          class: string; // 窗口类名
        }[]
      >;

      /**
       * 导航到指定路径
       * @param handle 窗口句柄
       * @param path 目标路径
       * @returns 是否成功
       */
      navigate(handle: number, path: string): Promise<boolean>;
    };

    /**
     * 进程管理功能
     */
    process: {
      /**
       * 获取进程列表
       */
      listProcesses(): Promise<
        {
          pid: number; // 进程ID
          name: string; // 进程名称
          title: string; // 进程标题
          path: string; // 进程路径
          memory: number; // 内存使用(字节)
          cpu: number; // CPU使用率
          threads: number; // 线程数
          handles: number; // 句柄数
        }[]
      >;

      /**
       * 结束进程
       * @param pid 进程ID
       */
      killProcess(pid: number): Promise<boolean>;

      /**
       * 启动进程
       * @param path 程序路径
       * @param args 启动参数
       */
      startProcess(path: string, args?: string[]): Promise<number>;
    };

    /**
     * 注册表操作功能
     */
    registry: {
      /**
       * 列出注册表项
       * @param path 注册表路径
       */
      listKeys(path: string): Promise<string[]>;

      /**
       * 获取注册表值
       * @param path 注册表路径
       * @param name 值名称
       */
      getValue(path: string, name?: string): Promise<any>;

      /**
       * 设置注册表值
       * @param path 注册表路径
       * @param name 值名称
       * @param value 值内容
       * @param type 值类型：string-字符串，expandstring-可扩展字符串，binary-二进制，dword-DWORD，qword-QWORD，multistring-多字符串
       */
      setValue(
        path: string,
        name: string,
        value: any,
        type?:
          | "string"
          | "expandstring"
          | "binary"
          | "dword"
          | "qword"
          | "multistring"
      ): Promise<boolean>;
    };

    /**
     * 系统服务管理功能
     */
    service: {
      /**
       * 获取服务列表
       */
      listServices(): Promise<
        {
          name: string; // 服务名称
          displayName: string; // 显示名称
          description: string; // 服务描述
          status: string; // 服务状态
          startType: string; // 启动类型
          account: string; // 登录账户
          canStop: boolean; // 是否可停止
          canPause: boolean; // 是否可暂停
        }[]
      >;

      /**
       * 启动服务
       * @param name 服务名称
       */
      startService(name: string): Promise<boolean>;

      /**
       * 停止服务
       * @param name 服务名称
       */
      stopService(name: string): Promise<boolean>;

      /**
       * 重启服务
       * @param name 服务名称
       */
      restartService(name: string): Promise<boolean>;
    };

    /**
     * 软件管理功能
     */
    software: {
      /**
       * 获取已安装软件列表
       */
      listSoftware(): Promise<
        {
          name: string; // 软件名称
          version: string; // 软件版本
          publisher: string; // 发布者
          installDate: string; // 安装日期
          installLocation: string; // 安装位置
          uninstallString: string; // 卸载命令
        }[]
      >;

      /**
       * 卸载软件
       * @param id 软件ID
       */
      uninstallSoftware(id: string): Promise<boolean>;
    };

    /**
     * 系统工具功能
     */
    utils: {
      /**
       * 设置壁纸
       * @param path 图片路径
       */
      setWallpaper(path: string): Promise<boolean>;

      /**
       * 控制显示器
       * @param action 操作类型：on-开启，off-关闭
       */
      controlMonitor(action: "on" | "off"): Promise<boolean>;

      /**
       * 电源控制
       * @param action 操作类型：sleep-睡眠，hibernate-休眠，awake-保持唤醒，normal-正常
       */
      powerControl(
        action: "sleep" | "hibernate" | "awake" | "normal"
      ): Promise<boolean>;

      /**
       * 配置网络
       * @param adapter 网卡名称
       * @param config 网络配置
       */
      configureNetwork(
        adapter: string,
        config: {
          ip: string; // IP地址
          subnet: string; // 子网掩码
          gateway?: string; // 默认网关
          dns?: string | string[]; // DNS服务器
        }
      ): Promise<boolean>;

      /**
       * 管理开机启动项
       * @param path 程序路径
       * @param name 启动项名称
       * @param remove 是否移除
       */
      manageStartup(
        path: string,
        name: string,
        remove?: boolean
      ): Promise<boolean>;

      /**
       * 创建快捷方式
       * @param target 目标路径
       * @param link 快捷方式路径
       * @param args 启动参数
       */
      createShortcut(
        target: string,
        link: string,
        args?: string
      ): Promise<boolean>;
    };
  };
  macos: {
    /**
     * 应用程序控制功能
     */
    app: {
      /**
       * 获取前台应用信息
       */
      getFrontmost(): Promise<{
        name: string; // 应用名称
        displayedName: string; // 显示名称
        path: string; // 应用路径
        version: string; // 应用版本
        pid: number; // 进程ID
        backgroundOnly: boolean; // 是否后台运行
        visible: boolean; // 是否可见
        frontmost: boolean; // 是否前台
        window?: {
          // 窗口信息
          name: string; // 窗口名称
          title: string; // 窗口标题
          index: number; // 窗口索引
          position: [number, number]; // 窗口位置
          size: [number, number]; // 窗口大小
          minimized: boolean; // 是否最小化
          fullscreen: boolean; // 是否全屏
        };
      }>;

      /**
       * 获取运行中的应用列表
       */
      getRunningApps(): Promise<
        {
          name: string; // 应用名称
          displayedName: string; // 显示名称
          path: string; // // 应用路径
          version: string; // 应用版本
          pid: number; // 进程ID
          backgroundOnly: boolean; // 是否后台运行
          visible: boolean; // 是否可见
          frontmost: boolean; // 是否前台
        }[]
      >;

      /**
       * 启动应用
       * @param appName 应用名称
       */
      launch(appName: string): Promise<void>;

      /**
       * 退出应用
       * @param appName 应用名称
       */
      quit(appName: string): Promise<void>;

      /**
       * 隐藏应用
       * @param appName 应用名称
       */
      hide(appName: string): Promise<void>;

      /**
       * 显示应用
       * @param appName 应用名称
       */
      show(appName: string): Promise<void>;

      /**
       * 最小化窗口
       * @param appName 应用名称
       */
      minimize(appName: string): Promise<void>;

      /**
       * 最大化窗口
       * @param appName 应用名称
       */
      maximize(appName: string): Promise<void>;

      /**
       * 获取窗口信息
       * @param appName 应用名称
       */
      getWindows(appName: string): Promise<
        {
          name: string; // 窗口名称
          title: string; // 窗口标题
          index: number; // 窗口索引
          position: [number, number]; // 窗口位置
          size: [number, number]; // 窗口大小
          minimized: boolean; // 是否最小化
          fullscreen: boolean; // 是否全屏
        }[]
      >;

      /**
       * 获取应用脚本字典
       * @param appName 应用名称
       */
      getScriptDictionary(appName: string): Promise<{
        commands: {
          name: string; // 命令名称
          description: string; // 命令描述
          parameters: {
            // 参数列表
            name: string; // 参数名称
            description: string; // 参数描述
            type: string; // 参数类型
            optional: boolean; // 是否可选
          }[];
          result?: {
            // 返回值
            type: string; // 返回类型
            description: string; // 返回值描述
          };
          usage: string; // 使用示例
        }[];
        properties: {
          name: string; // 属性名称
          description: string; // 属性描述
          access: string; // 访问权限
          type: string; // 属性类型
          usage: string; // 使用示例
        }[];
        summary: {
          totalCommands: number; // 命令总数
          totalProperties: number; // 属性总数
          hasScriptingSupport: boolean; // 是否支持脚本
        };
        error?: string; // 错误信息
      }>;
    };

    /**
     * 系统控制功能
     */
    system: {
      /**
       * 设置系统音量
       * @param volume 音量大小(0-100)
       */
      setVolume(volume: number): Promise<void>;

      /**
       * 锁定屏幕
       */
      lockScreen(): Promise<void>;

      /**
       * 进入睡眠
       */
      sleep(): Promise<void>;

      /**
       * 设置Dock位置
       * @param position 位置：bottom-底部，left-左侧，right-右侧
       */
      setDockPosition(position: "bottom" | "left" | "right"): Promise<void>;

      /**
       * 设置Dock大小
       * @param size 大小(16-128)
       */
      setDockSize(size: number): Promise<void>;

      /**
       * 设置Dock自动隐藏
       * @param enabled 是否启用
       */
      toggleDockAutohide(enabled: boolean): Promise<void>;

      /**
       * 设置菜单栏自动隐藏
       * @param enabled 是否启用
       */
      toggleMenuBarAutohide(enabled: boolean): Promise<void>;

      /**
       * 切换深色模式
       * @param enabled 是否启用
       */
      toggleDarkMode(enabled: boolean): Promise<void>;
    };

    /**
     * 访达操作功能
     */
    finder: {
      /**
       * 获取选中项
       */
      getSelection(): Promise<
        {
          name: string; // 文件名
          path: string; // 文件路径
          kind: string; // 文件类型
          size: number; // 文件大小
          created: string; // 创建时间
          modified: string; // 修改时间
        }[]
      >;

      /**
       * 获取当前文件夹
       */
      getCurrentFolder(): Promise<{
        name: string; // 文件夹名
        path: string; // 文件夹路径
        kind: string; // 类型
        created: string; // 创建时间
        modified: string; // 修改时间
      }>;

      /**
       * 设置显示隐藏文件
       * @param show 是否显示
       */
      setShowHiddenFiles(show: boolean): Promise<void>;

      /**
       * 获取窗口列表
       */
      getWindows(): Promise<
        {
          name: string; // 窗口名称
          index: number; // 窗口索引
          bounds: string; // 窗口边界
          target: string; // 目标路径
        }[]
      >;

      /**
       * 激活指定窗口
       * @param index 窗口索引
       */
      activateWindow(index: number): Promise<void>;
    };
  };
  status: {
    /**
     * 获取选中的文本
     */
    getSelectedText(): Promise<string>;

    /**
     * 获取选中的图片
     */
    getSelectedImage(): Promise<{
      path: string; // 图片路径
      base64: string; // Base64编码
      width: number; // 宽度
      height: number; // 高度
      size: number; // 文件大小
      format: string; // 图片格式
    }>;

    /**
     * 获取选中的文件
     */
    getSelectedFiles(): Promise<
      {
        name: string; // 文件名
        path: string; // 文件路径
        type: string; // 文件类型
        size: number; // 文件大小
        created: string; // 创建时间
        modified: string; // 修改时间
        isDirectory: boolean; // 是否是目录
      }[]
    >;
  };
  browser: {
    /**
     * 浏览器实例管理
     */
    startClient(options: {
      browserType?: "msedge" | "chrome"; // 浏览器类型
      useSingleUserDataDir?: boolean; // 是否使用单独的用户数据目录
      headless?: boolean; // 是否使用无头模式
      incognito?: boolean; // 是否使用隐身模式
    }): Promise<void>;

    /**
     * 关闭浏览器实例
     * @param port 浏览器实例端口
     */
    destroyClientByPort(port?: number): Promise<void>;

    /**
     * 获取所有浏览器实例端口
     */
    getClientPorts(): Promise<number[]>;

    /**
     * 获取当前操控的实例端口
     */
    getCurrentClientPort(): Promise<number>;

    /**
     * 切换要操控的实例
     * @param port 浏览器实例端口
     */
    switchClientByPort(port: number): Promise<void>;

    /**
     * 标签页管理
     */
    getTabs(): Promise<
      {
        url: string; // 标签页URL
        title: string; // 标签页标题
        id: string; // 标签页ID
      }[]
    >;

    /**
     * 激活标签页
     * @param tab 标签页配置
     */
    activateTab(tab: {
      by?: "active" | "url" | "title" | "id"; // 查找方式
      searchValue?: string; // 查找值
    }): Promise<void>;

    /**
     * 获取当前标签页
     */
    getCurrentTab(): Promise<{
      url: string; // 标签页URL
      title: string; // 标签页标题
      id: string; // 标签页ID
    }>;

    /**
     * 创建新标签页
     * @param url 要打开的URL
     */
    createNewTab(url?: string): Promise<{
      url: string; // 标签页URL
      title: string; // 标签页标题
      id: string; // 标签页ID
    }>;

    /**
     * 关闭标签页
     * @param tab 标签页配置
     */
    closeTab(tab: {
      by?: "active" | "url" | "title" | "id"; // 查找方式
      searchValue?: string; // 查找值
    }): Promise<void>;

    /**
     * 设备模拟
     */
    device: {
      /**
       * 使用预设设备
       * @param tab 标签页配置
       * @param deviceName 设备名称
       */
      setDevice(
        tab: {
          by?: "active" | "url" | "title" | "id";
          searchValue?: string;
        },
        deviceName: string
      ): Promise<void>;

      /**
       * 自定义设备
       * @param tab 标签页配置
       * @param config 设备配置
       */
      setCustomDevice(
        tab: {
          by?: "active" | "url" | "title" | "id";
          searchValue?: string;
        },
        config: {
          width: number; // 设备宽度
          height: number; // 设备高度
          deviceScaleFactor: number; // 设备缩放比例
          mobile: boolean; // 是否为移动设备
          userAgent?: string; // User-Agent
        }
      ): Promise<void>;

      /**
       * 清除设备模拟
       * @param tab 标签页配置
       */
      clearDeviceEmulation(tab: {
        by?: "active" | "url" | "title" | "id";
        searchValue?: string;
      }): Promise<void>;
    };

    /**
     * 网络请求拦截
     */
    network: {
      /**
       * 修改请求
       * @param tab 标签页配置
       * @param rules 拦截规则
       */
      setRequestInterception(
        tab: {
          by?: "active" | "url" | "title" | "id";
          searchValue?: string;
        },
        rules: {
          url: string; // 要拦截的URL
          headers?: Record<string, string>; // 要修改的请求头
          method?: string; // 要修改的请求方法
          postData?: string; // 要修改的请求体
        }[]
      ): Promise<void>;

      /**
       * 修改响应
       * @param tab 标签页配置
       * @param rules 拦截规则
       */
      setResponseInterception(
        tab: {
          by?: "active" | "url" | "title" | "id";
          searchValue?: string;
        },
        rules: {
          url: string; // 要拦截的URL
          statusCode?: number; // 要修改的状态码
          pattern?: string; // 要修改的响应内容
          replacement?: string; // 替换内容
        }[]
      ): Promise<void>;

      /**
       * 清除所有拦截规则
       * @param tab 标签页配置
       */
      clearInterception(tab: {
        by?: "active" | "url" | "title" | "id";
        searchValue?: string;
      }): Promise<void>;
    };

    /**
     * 截图功能
     * @param tab 标签页配置
     * @param options 截图选项
     * @param options.format 图片格式
     * @param options.quality 图片质量(仅jpeg)
     * @param options.savePath 保存路径
     * @param options.selector 元素选择器
     */
    captureScreenshot(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      options?: {
        format?: "png" | "jpeg";
        quality?: number;
        savePath?: string;
        selector?: string;
      }
    ): Promise<string>;

    /**
     * 获取当前URL
     * @param tab 标签页配置
     */
    getUrl(tab: {
      by?: "active" | "url" | "title" | "id";
      searchValue?: string;
    }): Promise<string>;

    /**
     * 设置URL
     * @param tab 标签页配置
     * @param url 要设置的URL
     */
    setUrl(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      url: string
    ): Promise<void>;

    /**
     * 执行JavaScript代码
     * @param tab 标签页配置
     * @param script 要执行的JavaScript代码
     * @param args 脚本参数
     */
    executeScript(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      script: string,
      args?: Record<string, any>
    ): Promise<any>;

    /**
     * 点击元素
     * @param tab 标签页配置
     * @param selector CSS选择器
     */
    clickElement(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string
    ): Promise<void>;

    /**
     * 输入文本
     * @param tab 标签页配置
     * @param selector CSS选择器
     * @param text 要输入的文本
     */
    inputText(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string,
      text: string
    ): Promise<void>;

    /**
     * 获取文本内容
     * @param tab 标签页配置
     * @param selector CSS选择器
     */
    getText(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string
    ): Promise<string>;

    /**
     * 获取HTML内容
     * @param tab 标签页配置
     * @param selector CSS选择器
     */
    getHtml(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string
    ): Promise<string>;

    /**
     * 隐藏元素
     * @param tab 标签页配置
     * @param selector CSS选择器
     */
    hideElement(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string
    ): Promise<void>;

    /**
     * 显示元素
     * @param tab 标签页配置
     * @param selector CSS选择器
     */
    showElement(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string
    ): Promise<void>;

    /**
     * 注入CSS样式
     * @param css CSS样式代码
     */
    injectCSS(css: string): Promise<void>;

    /**
     * 设置Cookie
     * @param tab 标签页配置
     * @param cookies Cookie配置数组
     * @param options Cookie选项
     */
    setCookie(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      cookies: Array<{ name: string; value: string }>,
      options?: {
        domain?: string;
        path?: string;
        secure?: boolean;
        expires?: number;
      }
    ): Promise<void>;

    /**
     * 获取Cookie
     * @param tab 标签页配置
     * @param name Cookie名称，不传则返回所有Cookie
     */
    getCookie(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      name?: string
    ): Promise<
      | { name: string; value: string; domain: string; path: string }[]
      | { name: string; value: string; domain: string; path: string }
    >;

    /**
     * 删除Cookie
     * @param tab 标签页配置
     * @param name Cookie名称
     */
    deleteCookie(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      name: string
    ): Promise<void>;

    /**
     * 滚动到指定位置
     * @param tab 标签页配置
     * @param x X坐标
     * @param y Y坐标
     */
    scrollTo(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      x: number,
      y: number
    ): Promise<void>;

    /**
     * 滚动到指定元素
     * @param tab 标签页配置
     * @param selector CSS选择器
     */
    scrollToElement(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string
    ): Promise<void>;

    /**
     * 获取滚动位置
     * @param tab 标签页配置
     */
    getScrollPosition(tab: {
      by?: "active" | "url" | "title" | "id";
      searchValue?: string;
    }): Promise<{ x: number; y: number }>;

    /**
     * 获取页面尺寸
     * @param tab 标签页配置
     */
    getPageSize(tab: {
      by?: "active" | "url" | "title" | "id";
      searchValue?: string;
    }): Promise<{ width: number; height: number }>;

    /**
     * 等待元素出现
     * @param tab 标签页配置
     * @param selector CSS选择器
     * @param timeout 超时时间(毫秒)
     */
    waitForElement(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      selector: string,
      timeout?: number
    ): Promise<void>;

    /**
     * 注入CSS样式
     * @param tab 标签页配置
     * @param css CSS样式代码
     */
    injectCSS(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      css: string
    ): Promise<void>;

    /**
     * 提交表单
     * @param tab 标签页配置
     * @param buttonSelector 提交按钮的CSS选择器
     * @param inputSelectors 输入字段配置数组
     */
    submitForm(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      buttonSelector: string,
      inputSelectors: Array<{ selector: string; value: string }>
    ): Promise<void>;

    /**
     * 注入远程脚本
     * @param tab 标签页配置
     * @param url 脚本URL
     */
    injectRemoteScript(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      url: string
    ): Promise<boolean>;

    /**
     * 注入本地脚本
     * @param tab 标签页配置
     * @param filePath 脚本文件路径
     */
    injectLocalScript(
      tab: { by?: "active" | "url" | "title" | "id"; searchValue?: string },
      filePath: string
    ): Promise<boolean>;
  };
}

/**
 * 创建一个 VariableInput 对象
 * @param {string} type - 变量类型，默认为 "str"
 * @param {string} val - 变量值
 * @returns {Object} VariableInput 对象
 */
export const newVarInputVal = (type = "str", val = "") => {
  if (typeof val !== "string") val = JSON.stringify(val);
  return {
    value: val,
    isString: type === "str",
    __varInputVal__: true,
  };
};

/**
 * 检查一个对象是否是 VariableInput 对象
 * @param {Object} val - 要检查的对象
 * @returns {boolean} 是否是 VariableInput 对象
 */
export const isVarInputVal = (val) => {
  return val && val.__varInputVal__;
};

/**
 * 创建一个空的 VariableInput 对象
 * @param {string} type - 变量类型，默认为 "str"
 * @returns {Object} 空的 VariableInput 对象
 */
export const newEmptyVarInputVal = (type = "str") => {
  return newVarInputVal(type, "");
};

/**
 * 处理带有 __varInputVal__ 属性的对象
 * @param {Object} argv 要处理的对象
 * @returns {string} 处理后的字符串
 */
export const stringifyVarInputVal = (argv) => {
  if (!argv.isString) return argv.value.toString();
  try {
    return JSON.stringify(argv.value);
  } catch (e) {
    return `"${argv.value}"`;
  }
};

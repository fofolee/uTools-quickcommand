/**
 * 快速导入同一目录下的所有脚本
 */

const importAll = context => {
    const map = {}
    for (const key of context.keys()) {
        const keyArr = key.split('/')
        keyArr.shift()
        map[keyArr.join('.').replace(/\.\w+$/g, '')] = context(key)
    }
    return map
}

export default importAll
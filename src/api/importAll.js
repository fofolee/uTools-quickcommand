const importAll = context => {
    const map = {}
    for (const key of context.keys()) {
        const keyArr = key.split('/')
        keyArr.shift()
        map[keyArr.join('.').replace(/\.js$/g, '')] = context(key)
    }
    return map
}

export default importAll

let itemPropCaches = [];

let parseEveryItem = item => {
    if (typeof item === "undefined") return "undefined"
    if (typeof item === "number") return item
    if (typeof item !== "object") return item.toString()
    if (Buffer.isBuffer(item)) {
        var bufferString = `[Buffer ${item.slice(0, 50).toString('hex').match(/\w{1,2}/g).join(" ")}`;
        if (item.length > 50) bufferString += `...${(item.length / 1000).toFixed(2)} kb `;
        return bufferString + ']'
    }
    if (item instanceof ArrayBuffer) return `ArrayBuffer(${item.byteLength})`;
    if (item instanceof Blob) return `Blob { size: ${item.size}, type: "${item.type}" }`;
    try {
        var result = item.constructor();
        for (const key in item) {
            if (typeof item[key] === 'function') result[key] = liteFuntcion(item[key])
            else if (typeof item[key] === 'object') {
                if (itemPropCaches.includes(item[key])) result[key] = `[Circular]`
                else {
                    itemPropCaches.push(item[key]);
                    result[key] = parseEveryItem(item[key])
                }
            } else {
                result[key] = item[key] || 'undefined'
            }
        }
        itemPropCaches = []
        return result
    } catch (error) {
        console.log(error);
        return item.toString()
    }
}

let liteFuntcion = fn => {
    return `[Function: ${fn.name ? fn.name : '(anonymous)'}]`
}

let beautifyLog = item => {
    let result = parseEveryItem(item)
    return typeof result === 'object' ? JSON.stringify(result, null, 2) : result
}

module.exports = beautifyLog;

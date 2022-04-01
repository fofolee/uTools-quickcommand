/**
 * 通过quickcommand的api，快速生成可交互的UI界面
 * UI界面基于quasar
 */

import {
    Dialog,
    Notify
} from 'quasar'
import inputBox from "../components/InputBox"

console.log(Notify);

let showInputBox = (options = [], title = "") => {
    return new Promise((reslove, reject) => {
        let props = {}
        if (!(options instanceof Object)) return reject(new TypeError("必须为数组或对象"))
        if (options instanceof Array) props.labels = options
        else props = options
        if (!props.labels) return reject(new SyntaxError("缺少必须要的参数"))
        if (!props.values) props.values = props.labels.map(() => "")
        if (!props.hints) props.hints = props.labels.map(() => "")
        props.title = title
        Dialog.create({
            component: inputBox,
            componentProps: props
        }).onOk(results => {
            reslove(Array.from(results))
        }).onCancel(() => {
            console.log('取消')
        }).onDismiss(() => {
            console.log('对话框被关闭')
        })
    })
};

let showMessageBox = (message, icon = 'success', time = 3000) => {
    if (icon === 'success') icon = 'positive'
    if (icon === 'error') icon = 'negative'
    Notify.create({
        type: icon,
        message: message,
        timeout: time,
        position: 'top',
    })
}
export default {
    showInputBox,
    showMessageBox
};

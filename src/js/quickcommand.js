/**
 * 通过quickcommand的api，快速生成可交互的UI界面
 * UI界面基于quasar
 */

import {
    Dialog
} from 'quasar'
import inputBox from "../components/InputBox"

let showInputBox = (options = [], title = "") => {
    return new Promise((reslove, reject) => {
        let props = {}
        if (!(options instanceof Object)) return reject(new TypeError("必须为数组或对象"))
        if (options instanceof Array) props.labels = options
        else props = options
        if (!props.values) props.values = options.map(() => "")
        if (!props.hints) props.hints = options.map(() => "")
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
export default {
    showInputBox,
};

/**
 * 通过quickcommand的api，快速生成可交互的UI界面
 * UI界面基于quasar
 */

import {
    Dialog,
    Notify
} from 'quasar'
import inputBox from "../components/quickcommandUI/InputBox"
import buttonBox from "../components/quickcommandUI/ButtonBox"
import TextArea from "../components/quickcommandUI/TextArea"
import SelectList from "../components/quickcommandUI/SelectList"

const quickcommand = {
    showInputBox: (options = ["请输入"], title = "") => new Promise((reslove, reject) => {
        let props = {
            labels: [],
            values: [],
            hints: [],
            title: title
        }
        if (!(options instanceof Object)) return reject(new TypeError("必须为数组或对象"))
        if (options instanceof Array) props.labels = options
        else Object.assign(props, options)
        Dialog.create({
            component: inputBox,
            componentProps: props
        }).onOk(results => {
            reslove(Array.from(results))
        }).onCancel(() => {
            console.log('取消')
        })
    }),

    showButtonBox: (labels = ["确定"], title = "") => new Promise((reslove, reject) => {
        if (!(labels instanceof Array)) return reject(new TypeError("必须为数组"))
        let props = {
            labels: labels,
            title: title
        }
        Dialog.create({
            component: buttonBox,
            componentProps: props
        }).onOk(results => {
            reslove(results)
        }).onCancel(() => {
            console.log('取消')
        })
    }),


    showConfirmBox: (message = "", title = "提示") => new Promise((reslove, reject) => {
        Dialog.create({
            title: title,
            message: message,
            cancel: true,
            persistent: true
        }).onOk(() => {
            reslove(true)
        }).onCancel(() => {
            reslove(false)
        })
    }),

    showMessageBox: (message, icon = 'success', time = 3000) => {
        if (icon === 'success') icon = 'positive'
        if (icon === 'error') icon = 'negative'
        Notify.create({
            type: icon,
            message: message,
            timeout: time,
            position: 'top',
        })
    },

    showTextArea: (placeholder = "", value = "") => new Promise((reslove, reject) => {
        let props = {
            placeholder: placeholder,
            value: value
        }
        Dialog.create({
            component: TextArea,
            componentProps: props
        }).onOk(results => {
            reslove(results)
        }).onCancel(() => {
            console.log('取消')
        })
    }),

    showSelectList: (selects, options = {}) => new Promise((reslove, reject) => {
        if (!options.placeholder) options.placeholder = "输入进行筛选"
        if (!options.optionType) options.optionType = "plaintext"
        let props = {
            items: selects,
            options: options
        }
        Dialog.create({
            component: SelectList,
            componentProps: props
        }).onOk(results => {
            reslove(results)
        }).onCancel(() => {
            console.log('取消')
        })
    }),

    // 更新选项列表
    updateSelectList: (opt, id) => {

    },
}

export default quickcommand

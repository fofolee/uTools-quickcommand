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
import WaitButton from "../components/quickcommandUI/waitButton"

const quickcommand = {
    showInputBox: (options = ["请输入"], title = "") => new Promise((reslove, reject) => {
        let props = {
            labels: [],
            values: [],
            hints: [],
            title: title
        }
        if (!_.isObject(options)) return reject(new TypeError(`应为 Object, 而非 ${typeof options}`))
        if (_.isArray(options)) props.labels = options
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
        if (!_.isArray(labels)) return reject(new TypeError(`应为 Array, 而非 ${typeof labels}`))
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
        if (!_.isArray(selects)) return reject(new TypeError(`应为 Array, 而非 ${typeof selects}`))
        let defaultOptions = {
            placeholder: "输入进行筛选，支持拼音",
            optionType: "plaintext",
            enableSearch: true,
            showCancelButton: false,
            closeOnSelect: true
        }
        Object.assign(defaultOptions, options)
        let props = {
            initItems: selects,
            options: defaultOptions
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

    showWaitButton: (callback, label = "确定") => {
        Dialog.create({
            component: WaitButton,
            componentProps: {
                label
            }
        }).onOk(() => {
            callback()
        }).onCancel(() => {
            console.log('取消')
        })
    }
}

export default quickcommand
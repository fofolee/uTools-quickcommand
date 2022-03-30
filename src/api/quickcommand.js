import { Dialog } from 'quasar'
import inputBox from "../components/InputBox"

let showInputBox = (labels = [], title = "", hints = []) => {
    return new Promise((reslove, reject) => {
        Dialog.create({
            component: inputBox,
            componentProps: {
                labels: labels,
                title: title,
                hints: hints
            }
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

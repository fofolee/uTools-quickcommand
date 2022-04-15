import {
    boot
} from 'quasar/wrappers'
import UTOOLS from "../js/utools.js";
import programmings from '../js/options/programs.js';

// 配置数据存取
let defaultProfile = {
    commandCardStyle: "normal",
    primaryColor: "#009688",
    defaultPrimaryColor: "#009688",
    backgroundImg: null,
    codeHistory: {},
    quickFeatures: {
        favFile: {
            enable: false,
            tag: "文件"
        },
        favUrl: {
            enable: false,
            tag: "网址"
        },
        pluNickName: {
            enable: false,
            tag: "别名"
        },
    }
}
let userProfile = UTOOLS.getDB(
    UTOOLS.DBPRE.CFG + "preferences"
);
Object.assign(defaultProfile, userProfile)

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({
    app
}) => {
    app.config.globalProperties.$utools = UTOOLS
    app.config.globalProperties.$programmings = programmings
    app.config.globalProperties.$profile = defaultProfile
})

import {
    boot
} from 'quasar/wrappers'
import UTOOLS from "../js/utools.js";
import programmings from '../js/options/programs.js';
import defaultProfile from "../js/options/defaultProfile.js"
import Cron from "croner"

// 配置数据存取
let userProfile = UTOOLS.getDB(
    UTOOLS.DBPRE.CFG + "preferences"
);
_.merge(defaultProfile, _.cloneDeep(userProfile))

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async({
    app
}) => {
    app.config.globalProperties.$utools = UTOOLS
    app.config.globalProperties.$programmings = programmings
    app.config.globalProperties.$profile = defaultProfile
    app.config.globalProperties.$Cron = Cron
})
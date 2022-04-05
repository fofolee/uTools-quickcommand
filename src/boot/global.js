import {
    boot
} from 'quasar/wrappers'
import UTOOLS from "../js/utools.js";
import programmings from '../js/programs.js';

// 配置数据存取
let defaultProfile = {
    commandCardStyle: "normal",
    primaryColor: "#009688",
    defaultPrimaryColor: "#009688",
    backgroundImg: null,
}
let userProfile = UTOOLS.getDB(
    UTOOLS.DBPRE.CFG + "preferences"
);
Object.assign(defaultProfile, userProfile)
utools.onPluginOut(() => {
    UTOOLS.putDB(
        defaultProfile,
        UTOOLS.DBPRE.CFG + "preferences"
    );
});

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async({
    app
}) => {
    app.config.globalProperties.$utools = UTOOLS
    app.config.globalProperties.$programmings = programmings
    app.config.globalProperties.$profile = defaultProfile
})
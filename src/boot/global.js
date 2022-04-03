import { boot } from 'quasar/wrappers'
import UTOOLS from "../js/utools.js";
import programmings from '../js/programs.js';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
    app.config.globalProperties.$utools = UTOOLS
    app.config.globalProperties.$programmings = programmings
})

import { defineAsyncComponent } from "vue";

// 模拟操作组件
export const KeyEditor = defineAsyncComponent(() =>
  import("src/components/composer/simulate/KeyEditor.vue")
);
export const ImageSearchEditor = defineAsyncComponent(() =>
  import("components/composer/simulate/ImageSearchEditor.vue")
);
export const KeySequenceEditor = defineAsyncComponent(() =>
  import("src/components/composer/simulate/KeySequenceEditor.vue")
);

// 网络组件
export const UBrowserEditor = defineAsyncComponent(() =>
  import("components/composer/ubrowser/UBrowserEditor.vue")
);
export const AxiosConfigEditor = defineAsyncComponent(() =>
  import("src/components/composer/network/AxiosConfigEditor.vue")
);

// 数据组件
export const RegexEditor = defineAsyncComponent(() =>
  import("components/composer/data/regex/RegexEditor.vue")
);

export const ZlibEditor = defineAsyncComponent(() =>
  import("src/components/composer/data/ZlibEditor.vue")
);

// 加密组件
export const SymmetricCryptoEditor = defineAsyncComponent(() =>
  import("src/components/composer/coding/SymmetricCryptoEditor.vue")
);
export const AsymmetricCryptoEditor = defineAsyncComponent(() =>
  import("src/components/composer/coding/AsymmetricCryptoEditor.vue")
);

// 文件组件
export const FileOperationEditor = defineAsyncComponent(() =>
  import("components/composer/file/FileOperationEditor.vue")
);

// 系统组件
export const SystemCommandEditor = defineAsyncComponent(() =>
  import("components/composer/system/SystemCommandEditor.vue")
);

// UI组件
export const SelectListEditor = defineAsyncComponent(() =>
  import("components/composer/ui/SelectListEditor.vue")
);

// 编程组件
export const ReturnEditor = defineAsyncComponent(() =>
  import("components/composer/script/ReturnEditor.vue")
);

export const ScriptEditor = defineAsyncComponent(() =>
  import("components/composer/script/ScriptEditor.vue")
);

// AI组件
export const AskAIEditor = defineAsyncComponent(() =>
  import("src/components/composer/ai/AskAIEditor.vue")
);

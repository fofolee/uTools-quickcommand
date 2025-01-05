import { defineAsyncComponent } from "vue";

// UI Components
export const KeyEditor = defineAsyncComponent(() =>
  import("components/composer/ui/KeyEditor.vue")
);
export const ImageSearchEditor = defineAsyncComponent(() =>
  import("components/composer/simulate/ImageSearchEditor.vue")
);

// Control Flow Components
export const ConditionalJudgment = defineAsyncComponent(() =>
  import("components/composer/control/ConditionalJudgment.vue")
);
export const LoopControl = defineAsyncComponent(() =>
  import("components/composer/control/LoopControl.vue")
);
export const ForEachControl = defineAsyncComponent(() =>
  import("components/composer/control/ForEachControl.vue")
);
export const ForInControl = defineAsyncComponent(() =>
  import("components/composer/control/ForInControl.vue")
);
export const WhileControl = defineAsyncComponent(() =>
  import("components/composer/control/WhileControl.vue")
);
export const SwitchControl = defineAsyncComponent(() =>
  import("components/composer/control/SwitchControl.vue")
);
export const TryCatchControl = defineAsyncComponent(() =>
  import("components/composer/control/TryCatchControl.vue")
);

// Editor Components
export const UBrowserEditor = defineAsyncComponent(() =>
  import("components/composer/ubrowser/UBrowserEditor.vue")
);
export const AxiosConfigEditor = defineAsyncComponent(() =>
  import("components/composer/http/AxiosConfigEditor.vue")
);
export const RegexEditor = defineAsyncComponent(() =>
  import("components/composer/regex/RegexEditor.vue")
);

// Crypto Components
export const SymmetricCryptoEditor = defineAsyncComponent(() =>
  import("components/composer/crypto/SymmetricCryptoEditor.vue")
);
export const AsymmetricCryptoEditor = defineAsyncComponent(() =>
  import("components/composer/crypto/AsymmetricCryptoEditor.vue")
);

// File Components
export const FileOperationEditor = defineAsyncComponent(() =>
  import("components/composer/file/FileOperationEditor.vue")
);

// System Components
export const SystemCommandEditor = defineAsyncComponent(() =>
  import("components/composer/system/SystemCommandEditor.vue")
);

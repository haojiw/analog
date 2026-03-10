// NativeWind className prop augmentation.
// react-native-css-interop's declare module augmentations don't apply via /// <reference types>
// due to how TS handles module-file augmentations in the reference chain.
// This file re-declares them directly as a module-file augmentation (export {} makes it a module).
export {};

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImagePropsBase {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
}

/// <reference types="vite/client" />

declare module "*?raw" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_MYRIAD_KEY?: string;
  /** R2 桶 myriad 的公共前缀，例如 https://pub-xxxx.r2.dev ，对象在 /assets/vendors/{id}/logo.svg */
  readonly VITE_VENDOR_LOGO_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

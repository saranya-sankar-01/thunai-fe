/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_HTTP_ENCRYPT_KEY: string;
  readonly IS_ENCRYPTION_FLOW: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

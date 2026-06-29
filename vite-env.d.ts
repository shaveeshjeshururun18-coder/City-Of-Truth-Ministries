/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_REBOOT_PASSWORD?: string;
    readonly VITE_ADMIN_PASSWORD_CHANGE_PHRASE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Auto-generated file. Do not edit manually.
// Generated at: 2025-12-12T02:20:50.590Z
// Run: node scripts/generate-translation-types.cjs
// Config: /Users/macbookairm1/Documents/netko_trung/code/nestjs/sync_excel_json_in_fe/i18n-tool/scripts/config.json

export type TranslationKey = 
  | 'about_us'
  | 'contact_us'
  | 'home_title'
  | 'login_button'
  | 'logout_button'
  | 'settings'
  | 'user_profile'
  | 'welcome_message';

// Union type for easier use
export type TranslationKeyUnion = 'about_us' | 'contact_us' | 'home_title' | 'login_button' | 'logout_button' | 'settings' | 'user_profile' | 'welcome_message';

// Module augmentation cho react-i18next (tự động gợi ý khi dùng useTranslation)
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: Record<TranslationKey, string>;
    };
  }
}

// Module augmentation cho next-intl (tự động gợi ý khi dùng useTranslations)
declare module 'next-intl' {
  interface Messages extends Record<TranslationKey, string> {}
}



// Global type declaration (optional)
declare global {
  namespace TranslationKeys {
    type Key = TranslationKey;
  }
}

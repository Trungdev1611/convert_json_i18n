// Utility functions để quản lý localStorage cho 3 file JSON

export type Language = 'en' | 'jp' | 'malay';

export interface TranslationData {
  [key: string]: string;
}

export interface AllTranslations {
  en: TranslationData;
  jp: TranslationData;
  malay: TranslationData;
}

const STORAGE_KEY = 'i18n_translations';

// Lấy tất cả translations từ localStorage
export const getTranslations = (): AllTranslations | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Lưu tất cả translations vào localStorage
export const saveTranslations = (translations: AllTranslations): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
};

// Lưu một language cụ thể
export const saveLanguage = (lang: Language, data: TranslationData): void => {
  const current = getTranslations() || { en: {}, jp: {}, malay: {} };
  current[lang] = data;
  saveTranslations(current);
};

// Lấy một language cụ thể
export const getLanguage = (lang: Language): TranslationData => {
  const translations = getTranslations();
  return translations?.[lang] || {};
};

// Kiểm tra xem đã có data chưa
export const hasInitialData = (): boolean => {
  const translations = getTranslations();
  if (!translations) return false;
  return (
    Object.keys(translations.en).length > 0 ||
    Object.keys(translations.jp).length > 0 ||
    Object.keys(translations.malay).length > 0
  );
};

// Xóa tất cả dữ liệu trong localStorage
export const clearTranslations = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Undo functionality
const UNDO_STORAGE_KEY = 'i18n_translations_undo';

// Lưu snapshot trước khi thay đổi (để undo)
export const saveUndoSnapshot = (translations: AllTranslations): void => {
  localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(translations));
};

// Lấy snapshot để undo
export const getUndoSnapshot = (): AllTranslations | null => {
  const stored = localStorage.getItem(UNDO_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Xóa snapshot sau khi undo
export const clearUndoSnapshot = (): void => {
  localStorage.removeItem(UNDO_STORAGE_KEY);
};

// Kiểm tra có thể undo không
export const canUndo = (): boolean => {
  return getUndoSnapshot() !== null;
};

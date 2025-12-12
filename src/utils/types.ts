// Types cho change tracking

export type ChangeStatus = 'added' | 'updated' | 'unchanged';

export interface ChangeRecord {
  key: string;
  en: string;
  jp: string;
  malay: string;
  status: ChangeStatus;
  // Dữ liệu cũ cho các trường hợp updated
  oldEn?: string;
  oldJp?: string;
  oldMalay?: string;
}

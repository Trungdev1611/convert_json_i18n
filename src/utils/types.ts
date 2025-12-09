// Types cho change tracking

export type ChangeStatus = 'added' | 'updated' | 'unchanged';

export interface ChangeRecord {
  key: string;
  en: string;
  jp: string;
  malay: string;
  status: ChangeStatus;
}


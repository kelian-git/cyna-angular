import type { User } from './user.model';

export interface AdminRole {
  idAdminRole: number;
  label: string; // 'ADMIN' | 'USER'
  users?: User[];
}

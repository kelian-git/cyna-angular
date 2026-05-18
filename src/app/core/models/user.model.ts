import type { AdminRole } from './admin-role.model';

export interface User {
  idUser: number;
  email: string;
  name: string;
  createdAt?: string;
  /** ⚠️ Le hash BCrypt est exposé par le back — ne JAMAIS l'afficher. */
  password?: string;
  adminRole?: AdminRole | null;
}

/** Payload de création d'un compte (POST /api/users). */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

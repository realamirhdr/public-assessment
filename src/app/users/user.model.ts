export type UserRole = 'admin' | 'dispatcher' | 'viewer';

export type PermissionScope = 'full' | 'limited' | 'none';

export interface User {
  id: string;
  email: string;
  name: string;
  account_id: string;
  role: UserRole;
  last_login_at: string;
}

export interface Permission {
  user_id: string;
  account_id: string;
  scope: PermissionScope;
}

export interface UserWithPermission extends User {
  scope: PermissionScope | null;
}

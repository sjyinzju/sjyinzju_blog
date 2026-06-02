export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string;
  bio: string | null;
  website: string | null;
  created_at: string;
  last_login_at: string | null;
  is_admin: boolean;
}

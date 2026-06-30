export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshPayload {
  refreshToken: string;
}

/** Admin's `brgy_users` record from GET /profile */
export interface AuthUser {
  accountId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  accountType?: string;
  brgyId?: string;
  regionId?: string;
  provinceId?: string;
  cityId?: string;
  cityDesc?: string;
  brgyDesc?: string;
  regionDesc?: string;
  provinceDesc?: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
